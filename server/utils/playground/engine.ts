import BetterSqlite3 from 'better-sqlite3'
import {
  DataTypes,
  Model,
  Sequelize,
  type Includeable,
  type ModelStatic,
} from 'sequelize'
import {
  GraphQLError,
  GraphQLFloat,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLUnionType,
  graphql,
  isEnumType,
  isInterfaceType,
  isObjectType,
  isScalarType,
  isUnionType,
  printSchema,
  type FieldNode,
  type GraphQLFieldResolver,
  type GraphQLResolveInfo,
  type SelectionNode,
} from 'graphql'
import type { DiagnosticEntry, TypeSummaryEntry } from '../../../types'
import { getFixture } from './fixtures'

const TIMEOUT_MS_GENERATE = 3000
const TIMEOUT_MS_QUERY = 5000
const SKIPPED_TYPE_SUMMARY_NAMES = new Set(['String', 'Boolean', 'Int', 'Float', 'ID', 'Query', 'Mutation'])

type PlainRecord = Record<string, unknown>
type ModelClass = ModelStatic<Model>
type AssociationTree = Record<string, AssociationTree>
type AssociationMap = Record<string, Record<string, { as: string; model: ModelClass; targetType: string }>>

type DirectiveContext = {
  authenticatedUser?: Model | null
}

// The published graphql-gene entrypoint currently ships a Windows-incompatible raw import.
// This adapter preserves the documented playground behavior until the upstream package is fixed.

class Statement {
  lastID: number | undefined
  changes: number

  constructor(lastInsertRowId: number | bigint | undefined, changes: number) {
    this.lastID = lastInsertRowId === undefined ? undefined : Number(lastInsertRowId)
    this.changes = changes
  }
}

class Sqlite3DatabaseCompat {
  private readonly db: BetterSqlite3.Database
  filename: string
  uuid?: string

  constructor(filename: string, _mode: number, callback: (err: Error | null) => void) {
    this.filename = filename
    this.db = new BetterSqlite3(filename)
    queueMicrotask(() => callback(null))
  }

  serialize(callback: () => void) {
    callback()
  }

  parallelize(callback: () => void) {
    callback()
  }

  configure() {}

  all(
    sql: string,
    paramsOrCallback?: SqliteParams | SqliteRowCallback,
    maybeCallback?: SqliteRowsCallback,
  ) {
    const { params, callback } = normalizeStatementCall(paramsOrCallback, maybeCallback)

    try {
      const statement = this.db.prepare(sql)
      const rows = statement.reader
        ? (params === undefined
            ? statement.all()
            : statement.all(normalizeSqliteParams(params)))
        : (params === undefined
            ? (statement.run(), [])
            : (statement.run(normalizeSqliteParams(params)), []))
      callback?.call(new Statement(undefined, Array.isArray(rows) ? rows.length : 0), null, rows as unknown[])
    }
    catch (error) {
      callback?.call(new Statement(undefined, 0), error as Error, [])
    }

    return this
  }

  get(
    sql: string,
    paramsOrCallback?: SqliteParams | SqliteRowCallback,
    maybeCallback?: SqliteRowResultCallback,
  ) {
    const { params, callback } = normalizeStatementCall(paramsOrCallback, maybeCallback)

    try {
      const statement = this.db.prepare(sql)
      const row = statement.reader
        ? (params === undefined
            ? statement.get()
            : statement.get(normalizeSqliteParams(params)))
        : (params === undefined
            ? (statement.run(), undefined)
            : (statement.run(normalizeSqliteParams(params)), undefined))
      callback?.call(new Statement(undefined, row ? 1 : 0), null, row as unknown)
    }
    catch (error) {
      callback?.call(new Statement(undefined, 0), error as Error, undefined)
    }

    return this
  }

  run(
    sql: string,
    paramsOrCallback?: SqliteParams | SqliteRunCallback,
    maybeCallback?: SqliteRunResultCallback,
  ) {
    const { params, callback } = normalizeStatementCall(paramsOrCallback, maybeCallback)

    try {
      const result = params === undefined
        ? this.db.prepare(sql).run()
        : this.db.prepare(sql).run(normalizeSqliteParams(params))
      callback?.call(new Statement(result.lastInsertRowid, result.changes), null)
    }
    catch (error) {
      callback?.call(new Statement(undefined, 0), error as Error)
    }

    return this
  }

  close(callback?: (err: Error | null) => void) {
    this.db.close()
    callback?.(null)
  }
}

type SqliteParams = unknown[] | Record<string, unknown>
type SqliteRowsCallback = (this: Statement, err: Error | null, rows: unknown[]) => void
type SqliteRowResultCallback = (this: Statement, err: Error | null, row: unknown) => void
type SqliteRunResultCallback = (this: Statement, err: Error | null) => void
type SqliteRowCallback = ((err: Error | null, rows: unknown[]) => void) | ((err: Error | null, row: unknown) => void) | ((err: Error | null) => void)
type SqliteRunCallback = ((err: Error | null, rows: unknown[]) => void) | ((err: Error | null, row: unknown) => void) | ((err: Error | null) => void)

const SQLITE_DIALECT_MODULE = {
  OPEN_READWRITE: 0x00000002,
  OPEN_CREATE: 0x00000004,
  Database: Sqlite3DatabaseCompat,
}

function normalizeStatementCall(
  paramsOrCallback?: SqliteParams | SqliteRowCallback,
  maybeCallback?: SqliteRowsCallback | SqliteRowResultCallback | SqliteRunResultCallback,
) {
  if (typeof paramsOrCallback === 'function') {
    return { params: undefined, callback: paramsOrCallback }
  }

  return { params: paramsOrCallback, callback: maybeCallback }
}

function normalizeSqliteParams(params: SqliteParams) {
  if (Array.isArray(params)) {
    return params.map(param => typeof param === 'bigint' ? param.toString() : param)
  }

  const normalized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(params)) {
    normalized[key.replace(/^[$:@]/, '')] = typeof value === 'bigint' ? value.toString() : value
  }
  return normalized
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), ms),
    ),
  ])
}

function createSequelize(capturedSql: string[]) {
  return new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: (sql) => {
      if (typeof sql === 'string') capturedSql.push(sql)
    },
    dialectModule: SQLITE_DIALECT_MODULE,
  })
}

function nonNull<T>(type: T) {
  return new GraphQLNonNull(type as any)
}

function listOfNonNull<T>(type: T) {
  return new GraphQLList(nonNull(type))
}

function readSourceValue(source: unknown, key: string) {
  if (source instanceof Model) return source.get(key)
  if (source && typeof source === 'object' && key in source) {
    return (source as PlainRecord)[key]
  }
  return undefined
}

function buildTypeSummary(schema: GraphQLSchema): TypeSummaryEntry[] {
  const summary: TypeSummaryEntry[] = []

  for (const type of Object.values(schema.getTypeMap())) {
    if (type.name.startsWith('__') || SKIPPED_TYPE_SUMMARY_NAMES.has(type.name)) continue

    if (isObjectType(type)) {
      summary.push({ name: type.name, kind: 'object', fields: Object.keys(type.getFields()) })
      continue
    }

    if (isEnumType(type)) {
      summary.push({ name: type.name, kind: 'enum', fields: type.getValues().map(value => value.name) })
      continue
    }

    if (isScalarType(type)) {
      summary.push({ name: type.name, kind: 'scalar', fields: [] })
      continue
    }

    if (isUnionType(type)) {
      summary.push({ name: type.name, kind: 'union', fields: type.getTypes().map(member => member.name) })
      continue
    }

    if (isInterfaceType(type)) {
      summary.push({ name: type.name, kind: 'interface', fields: Object.keys(type.getFields()) })
    }
  }

  return summary.sort((left, right) => left.name.localeCompare(right.name))
}

function toDiagnostics(errors: readonly GraphQLError[] | undefined): DiagnosticEntry[] {
  return (errors ?? []).map(error => ({
    level: 'error',
    message: error.message,
  }))
}

function throwIfGraphqlErrors(errors: readonly GraphQLError[] | undefined) {
  if (!errors?.length) return
  throw new Error(errors.map(error => error.message).join('; '))
}

function formatSql(capturedSql: string[]) {
  const printable = capturedSql
    .map(sql => sql.trim())
    .filter(Boolean)

  return printable.length ? printable.join('\n\n') : null
}

function resetCapturedSql(capturedSql: string[]) {
  capturedSql.length = 0
}

function mergeAssociationTree(target: AssociationTree, fieldName: string) {
  target[fieldName] = target[fieldName] ?? {}
  return target[fieldName]
}

function collectAssociationTree(
  selectionSetOwner: FieldNode | undefined,
  rootType: string,
  associations: AssociationMap,
  info: GraphQLResolveInfo,
) {
  const tree: AssociationTree = {}

  const visitSelections = (selections: readonly SelectionNode[] | undefined, currentType: string, branch: AssociationTree) => {
    if (!selections?.length) return

    for (const selection of selections) {
      if (selection.kind === 'Field') {
        const fieldName = selection.name.value
        if (fieldName === '__typename') continue

        const association = associations[currentType]?.[fieldName]
        if (!association) continue

        const nextBranch = mergeAssociationTree(branch, fieldName)
        visitSelections(selection.selectionSet?.selections, association.targetType, nextBranch)
        continue
      }

      if (selection.kind === 'FragmentSpread') {
        visitSelections(info.fragments[selection.name.value]?.selectionSet.selections, currentType, branch)
        continue
      }

      visitSelections(selection.selectionSet.selections, currentType, branch)
    }
  }

  visitSelections(selectionSetOwner?.selectionSet?.selections, rootType, tree)
  return tree
}

function buildIncludeGraph(
  rootType: string,
  tree: AssociationTree,
  associations: AssociationMap,
) {
  const graph: Record<string, string[]> = {}

  const visit = (typeName: string, branch: AssociationTree) => {
    for (const fieldName of Object.keys(branch)) {
      graph[typeName] = graph[typeName] ?? []
      if (!graph[typeName].includes(fieldName)) {
        graph[typeName].push(fieldName)
      }

      const association = associations[typeName]?.[fieldName]
      if (association) visit(association.targetType, branch[fieldName])
    }
  }

  visit(rootType, tree)
  return graph
}

function buildSequelizeInclude(
  rootType: string,
  tree: AssociationTree,
  associations: AssociationMap,
): Includeable[] | undefined {
  const entries = Object.entries(tree)
  if (!entries.length) return undefined

  return entries.map(([fieldName, branch]) => {
    const association = associations[rootType]?.[fieldName]
    const nested = association ? buildSequelizeInclude(association.targetType, branch, associations) : undefined

    return {
      association: association?.as ?? fieldName,
      model: association?.model,
      as: association?.as ?? fieldName,
      ...(nested ? { include: nested } : {}),
    }
  })
}

function buildUserOrderRuntime(options: {
  capturedSql: string[]
  includeOrders: boolean
  includeAddress: boolean
}) {
  const sequelize = createSequelize(options.capturedSql)

  class User extends Model {
    declare id: number
    declare email: string
    declare name: string
    declare address: string | null
  }

  class Order extends Model {
    declare id: number
    declare userId: number
    declare status: string
    declare total: number
  }

  User.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: true },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: false,
  })

  Order.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false },
    total: { type: DataTypes.FLOAT, allowNull: false },
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: false,
  })

  if (options.includeOrders) {
    User.hasMany(Order, { as: 'orders', foreignKey: 'userId' })
    Order.belongsTo(User, { as: 'user', foreignKey: 'userId' })
  }

  const associations: AssociationMap = options.includeOrders
    ? {
        User: {
          orders: { as: 'orders', model: Order, targetType: 'Order' },
        },
        Order: {
          user: { as: 'user', model: User, targetType: 'User' },
        },
      }
    : {}

  return { sequelize, User, Order, associations }
}

async function seedUserOrderRuntime(
  User: ModelClass,
  Order: ModelClass,
  fixture: ReturnType<typeof getFixture>,
) {
  if (fixture.users?.length) await User.bulkCreate(fixture.users)
  if (fixture.orders?.length) await Order.bulkCreate(fixture.orders)
}

function createUserOrderTypes(options: {
  includeOrders: boolean
  includeAddress: boolean
  User?: ModelClass
  Order?: ModelClass
}) {
  let UserType: GraphQLObjectType
  let OrderType: GraphQLObjectType

  UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
      id: {
        type: nonNull(GraphQLID),
        resolve: source => readSourceValue(source, 'id'),
      },
      email: {
        type: nonNull(GraphQLString),
        resolve: source => readSourceValue(source, 'email'),
      },
      name: {
        type: nonNull(GraphQLString),
        resolve: source => readSourceValue(source, 'name'),
      },
      ...(options.includeAddress
        ? {
            address: {
              type: GraphQLString,
              resolve: source => readSourceValue(source, 'address') ?? null,
            },
          }
        : {}),
      ...(options.includeOrders
        ? {
            orders: {
              type: listOfNonNull(OrderType),
              resolve: async (source: unknown) => {
                const existing = readSourceValue(source, 'orders')
                if (Array.isArray(existing)) return existing
                if (!options.Order) return []

                const userId = readSourceValue(source, 'id')
                return options.Order.findAll({
                  where: { userId },
                  order: [['id', 'ASC']],
                })
              },
            },
          }
        : {}),
    }),
  })

  OrderType = new GraphQLObjectType({
    name: 'Order',
    fields: () => ({
      id: {
        type: nonNull(GraphQLID),
        resolve: source => readSourceValue(source, 'id'),
      },
      status: {
        type: nonNull(GraphQLString),
        resolve: source => readSourceValue(source, 'status'),
      },
      total: {
        type: nonNull(GraphQLFloat),
        resolve: source => readSourceValue(source, 'total'),
      },
      ...(options.includeOrders
        ? {
            user: {
              type: UserType,
              resolve: async (source: unknown) => {
                const existing = readSourceValue(source, 'user')
                if (existing) return existing
                if (!options.User) return null

                const userId = readSourceValue(source, 'userId')
                return userId === undefined ? null : options.User.findByPk(userId as number)
              },
            },
          }
        : {}),
    }),
  })

  return { UserType, OrderType }
}

function createGenerateSchema(options: {
  includeOrders: boolean
  includeAddress: boolean
  User: ModelClass
  Order: ModelClass
}) {
  const { UserType, OrderType } = createUserOrderTypes(options)

  const QueryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
      users: {
        type: nonNull(listOfNonNull(UserType)),
        resolve: () => [],
      },
      orders: {
        type: nonNull(listOfNonNull(OrderType)),
        resolve: () => [],
      },
    },
  })

  return new GraphQLSchema({
    query: QueryType,
  })
}

function createLookaheadSchema(options: {
  User: ModelClass
  Order: ModelClass
  associations: AssociationMap
  onResolveMe: GraphQLFieldResolver<unknown, unknown>
}) {
  const { UserType } = createUserOrderTypes({
    includeOrders: true,
    includeAddress: true,
    User: options.User,
    Order: options.Order,
  })

  const QueryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
      me: {
        type: nonNull(UserType),
        resolve: options.onResolveMe,
      },
    },
  })

  return new GraphQLSchema({
    query: QueryType,
  })
}

function buildPolymorphicRuntime(capturedSql: string[]) {
  const sequelize = createSequelize(capturedSql)

  class Page extends Model {
    declare id: number
    declare slug: string
  }

  class Block extends Model {
    declare id: number
    declare pageId: number
    declare type: 'HeroBlock' | 'TextBlock'
    declare headline: string | null
    declare body: string | null
  }

  Page.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    slug: { type: DataTypes.STRING, allowNull: false },
  }, {
    sequelize,
    modelName: 'Page',
    tableName: 'pages',
    timestamps: false,
  })

  Block.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    pageId: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    headline: { type: DataTypes.STRING, allowNull: true },
    body: { type: DataTypes.TEXT, allowNull: true },
  }, {
    sequelize,
    modelName: 'Block',
    tableName: 'blocks',
    timestamps: false,
  })

  return { sequelize, Page, Block }
}

async function seedPolymorphicRuntime(
  Page: ModelClass,
  Block: ModelClass,
  fixture: ReturnType<typeof getFixture>,
) {
  if (fixture.pages?.length) await Page.bulkCreate(fixture.pages)
  if (fixture.blocks?.length) await Block.bulkCreate(fixture.blocks)
}

function mapBlockToGraphqlShape(block: PlainRecord) {
  if (block.type === 'HeroBlock') {
    return {
      __typename: 'HeroBlock',
      id: block.id,
      headline: block.headline,
    }
  }

  return {
    __typename: 'TextBlock',
    id: block.id,
    body: block.body,
  }
}

function createPolymorphicSchema(options: {
  onResolvePage: GraphQLFieldResolver<unknown, unknown>
}) {
  const HeroBlockType = new GraphQLObjectType({
    name: 'HeroBlock',
    fields: {
      id: {
        type: nonNull(GraphQLID),
        resolve: source => readSourceValue(source, 'id'),
      },
      headline: {
        type: nonNull(GraphQLString),
        resolve: source => readSourceValue(source, 'headline'),
      },
    },
  })

  const TextBlockType = new GraphQLObjectType({
    name: 'TextBlock',
    fields: {
      id: {
        type: nonNull(GraphQLID),
        resolve: source => readSourceValue(source, 'id'),
      },
      body: {
        type: nonNull(GraphQLString),
        resolve: source => readSourceValue(source, 'body'),
      },
    },
  })

  const PageBlockType = new GraphQLUnionType({
    name: 'PageBlock',
    types: [HeroBlockType, TextBlockType],
    resolveType: source => String(readSourceValue(source, '__typename')),
  })

  const PageViewType = new GraphQLObjectType({
    name: 'PageView',
    fields: {
      id: {
        type: nonNull(GraphQLID),
        resolve: source => readSourceValue(source, 'id'),
      },
      slug: {
        type: nonNull(GraphQLString),
        resolve: source => readSourceValue(source, 'slug'),
      },
      blocks: {
        type: nonNull(listOfNonNull(PageBlockType)),
        resolve: source => readSourceValue(source, 'blocks') ?? [],
      },
    },
  })

  const QueryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
      page: {
        type: PageViewType,
        args: {
          slug: { type: nonNull(GraphQLString) },
        },
        resolve: options.onResolvePage,
      },
    },
  })

  return new GraphQLSchema({
    query: QueryType,
  })
}

function wrapResolverWithMiddleware<TContext extends Record<string, unknown>>(
  resolver: GraphQLFieldResolver<unknown, TContext>,
  middleware: (params: {
    source: unknown
    args: Record<string, unknown>
    context: TContext
    info: GraphQLResolveInfo
    resolve: () => Promise<unknown>
  }) => Promise<unknown>,
): GraphQLFieldResolver<unknown, TContext> {
  return async (source, args, context, info) => {
    let didResolve = false
    let resolvedValue: unknown

    const resolve = async () => {
      didResolve = true
      resolvedValue = await resolver(source, args, context, info)
      return resolvedValue
    }

    await middleware({
      source,
      args: (args ?? {}) as Record<string, unknown>,
      context,
      info,
      resolve,
    })

    return didResolve ? resolvedValue : resolve()
  }
}

function buildDirectiveExcerpt(mode: 'named' | 'anonymous') {
  const lines = [
    ...(mode === 'named'
      ? ['directive @userAuth(roles: [String!]!) on FIELD_DEFINITION', '']
      : []),
    'type Query {',
    mode === 'named' ? '  me: User! @userAuth' : '  me: User!',
    '}',
    '',
    'type User {',
    '  id: ID!',
    '  email: String!',
    '  name: String!',
    '  address: String',
    '}',
  ]

  return lines.join('\n')
}

export async function runGenerate(params: {
  exampleId: string
  modelEdits?: Record<string, boolean | string | number>
  options?: { showTypeSummary?: boolean }
}): Promise<{ sdl: string; typeSummary?: TypeSummaryEntry[]; diagnostics: DiagnosticEntry[] }> {
  return withTimeout((async () => {
    const capturedSql: string[] = []
    const includeOrders = params.modelEdits?.includeOrders !== false
    const includeAddress = params.modelEdits?.includeAddress !== false
    const { sequelize, User, Order } = buildUserOrderRuntime({
      capturedSql,
      includeOrders,
      includeAddress,
    })

    try {
      const schema = createGenerateSchema({
        includeOrders,
        includeAddress,
        User,
        Order,
      })

      return {
        sdl: printSchema(schema),
        typeSummary: params.options?.showTypeSummary ? buildTypeSummary(schema) : undefined,
        diagnostics: [],
      }
    }
    finally {
      await sequelize.close().catch(() => {})
    }
  })(), TIMEOUT_MS_GENERATE)
}

export async function runQuery(params: {
  scenario: string
  exampleId: string
  query: string
  variables?: Record<string, unknown>
}): Promise<{
  data: Record<string, unknown>
  includeGraph: Record<string, string[]>
  sql: string | null
  notes: string[]
  diagnostics: DiagnosticEntry[]
}> {
  return withTimeout((async () => {
    if (params.scenario === 'query-lookahead') {
      return runQueryLookahead(params)
    }

    if (params.scenario === 'polymorphic-blocks') {
      return runQueryPolymorphicBlocks(params)
    }

    throw new Error(`Unsupported query scenario: ${params.scenario}`)
  })(), TIMEOUT_MS_QUERY)
}

async function runQueryLookahead(params: {
  exampleId: string
  query: string
  variables?: Record<string, unknown>
}) {
  const fixture = getFixture('query-lookahead', params.exampleId)
  const capturedSql: string[] = []
  const { sequelize, User, Order, associations } = buildUserOrderRuntime({
    capturedSql,
    includeOrders: true,
    includeAddress: true,
  })

  try {
    await sequelize.sync({ force: true })
    await seedUserOrderRuntime(User, Order, fixture)
    resetCapturedSql(capturedSql)

    let includeGraph: Record<string, string[]> = {}

    const schema = createLookaheadSchema({
      User,
      Order,
      associations,
      onResolveMe: async (_source, _args, _context, info) => {
        const tree = collectAssociationTree(info.fieldNodes[0], 'User', associations, info)
        includeGraph = buildIncludeGraph('User', tree, associations)
        const include = buildSequelizeInclude('User', tree, associations)

        return User.findOne({
          where: { id: 1 },
          ...(include ? { include } : {}),
          ...(includeGraph.User?.includes('orders')
            ? { order: [[{ model: Order, as: 'orders' }, 'id', 'ASC']] }
            : {}),
        })
      },
    })

    const result = await graphql({
      schema,
      source: params.query,
      variableValues: params.variables,
      contextValue: {},
    })

    throwIfGraphqlErrors(result.errors)

    return {
      data: (result.data ?? {}) as Record<string, unknown>,
      includeGraph,
      sql: formatSql(capturedSql),
      notes: includeGraph.User?.includes('orders')
        ? ['The user query requested the orders association, so Sequelize executed an eager-loaded include plan.']
        : ['Only scalar user fields were requested, so the query executed without association eager-loading.'],
      diagnostics: toDiagnostics(result.errors),
    }
  }
  finally {
    await sequelize.close().catch(() => {})
  }
}

async function runQueryPolymorphicBlocks(params: {
  exampleId: string
  query: string
  variables?: Record<string, unknown>
}) {
  const fixture = getFixture('polymorphic-blocks', params.exampleId)
  const capturedSql: string[] = []
  const { sequelize, Page, Block } = buildPolymorphicRuntime(capturedSql)

  try {
    await sequelize.sync({ force: true })
    await seedPolymorphicRuntime(Page, Block, fixture)
    resetCapturedSql(capturedSql)

    const schema = createPolymorphicSchema({
      onResolvePage: async (_source, args) => {
        const page = await Page.findOne({ where: { slug: args.slug } })
        if (!page) return null

        const blocks = await Block.findAll({
          where: { pageId: page.get('id') },
          order: [['id', 'ASC']],
        })

        return {
          id: page.get('id'),
          slug: page.get('slug'),
          blocks: blocks.map(block => mapBlockToGraphqlShape(block.get({ plain: true }) as PlainRecord)),
        }
      },
    })

    const result = await graphql({
      schema,
      source: params.query,
      variableValues: params.variables,
      contextValue: {},
    })

    throwIfGraphqlErrors(result.errors)

    return {
      data: (result.data ?? {}) as Record<string, unknown>,
      includeGraph: { PageView: ['blocks'] },
      sql: formatSql(capturedSql),
      notes: ['Page and block rows are loaded from SQLite, then projected into a GraphQL union for inline fragment rendering.'],
      diagnostics: toDiagnostics(result.errors),
    }
  }
  finally {
    await sequelize.close().catch(() => {})
  }
}

export async function runDirective(params: {
  exampleId: string
  directiveMode?: 'named' | 'anonymous'
}): Promise<{
  directive: { name: string; printsToSchema: boolean; runtimeBehaviorSummary: string }
  sdlExcerpt: string
  diagnostics: DiagnosticEntry[]
}> {
  return withTimeout((async () => {
    const fixture = getFixture('directive-middleware', params.exampleId)
    const capturedSql: string[] = []
    const mode = params.directiveMode ?? 'named'
    const { sequelize, User, Order } = buildUserOrderRuntime({
      capturedSql,
      includeOrders: false,
      includeAddress: true,
    })

    try {
      await sequelize.sync({ force: true })
      await seedUserOrderRuntime(User, Order, fixture)

      const loadAuthenticatedUser = async (context: DirectiveContext) => {
        if (!context.authenticatedUser) {
          context.authenticatedUser = await User.findByPk(1)
        }
        return context.authenticatedUser
      }

      const { UserType } = createUserOrderTypes({
        includeOrders: false,
        includeAddress: true,
        User,
        Order,
      })

      const meResolver = wrapResolverWithMiddleware<DirectiveContext>(
        async (_source, _args, context) => loadAuthenticatedUser(context),
        async ({ context, resolve }) => {
          await loadAuthenticatedUser(context)
          return resolve()
        },
      )

      const QueryType = new GraphQLObjectType({
        name: 'Query',
        fields: {
          me: {
            type: nonNull(UserType),
            resolve: meResolver,
          },
        },
      })

      const schema = new GraphQLSchema({
        query: QueryType,
      })

      const smokeResult = await graphql({
        schema,
        source: '{ me { id email name address } }',
        contextValue: {},
      })

      throwIfGraphqlErrors(smokeResult.errors)

      return {
        directive: {
          name: mode === 'named' ? 'userAuth' : '',
          printsToSchema: mode === 'named',
          runtimeBehaviorSummary: mode === 'named'
            ? 'Field middleware loads the authenticated user before resolving `me`, and the schema excerpt exposes the named @userAuth contract.'
            : 'The same middleware still loads the authenticated user before resolving `me`, but the schema excerpt omits a named directive definition.',
        },
        sdlExcerpt: buildDirectiveExcerpt(mode),
        diagnostics: [],
      }
    }
    finally {
      await sequelize.close().catch(() => {})
    }
  })(), TIMEOUT_MS_GENERATE)
}
