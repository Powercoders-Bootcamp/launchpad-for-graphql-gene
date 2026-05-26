const scenarios = {
  schema: {
    pillar: "schema",
    pillarLabel: "Pillar I",
    menuTitle: "Model to Schema",
    menuMeta: "Expose types and fields from ORM-shaped models.",
    label: "Pillar I",
    title: "Model to Schema",
    intro: "This scenario reflects the core product promise: define backend structure once and derive a GraphQL surface that stays readable, typed, and consistent.",
    inputChip: "model config",
    outputChip: "SDL",
    controls: [
      { type: "text", key: "modelName", label: "Primary model name", value: "User" },
      { type: "checkbox", key: "includeEmail", label: "Expose email field", value: true },
      { type: "checkbox", key: "includeOrders", label: "Expose orders relation", value: true },
      { type: "checkbox", key: "includeAddress", label: "Expose address relation", value: false },
      { type: "checkbox", key: "includeViewerAlias", label: "Generate Authenticated alias", value: true }
    ],
    compute(state) {
      const modelName = state.modelName || "User";
      const fields = ["  id: ID!", "  username: String"];
      const summary = [`- ${modelName} exposes stable object identity`];

      if (state.includeEmail) {
        fields.push("  email: String");
        summary.push("- email is included on the generated type");
      }
      if (state.includeOrders) {
        fields.push("  orders(skip: Int, limit: Int): [Order!]");
        summary.push("- orders relation is available for query-shaped loading");
      }
      if (state.includeAddress) {
        fields.push("  address: Address");
        summary.push("- address is part of the exposed graph");
      }

      const aliasBlock = state.includeViewerAlias
        ? `\ntype Authenticated${modelName} {\n  id: ID!\n  email: String!\n${state.includeOrders ? "  orders(skip: Int, limit: Int): [Order!]\n" : ""}}`
        : "";

      return {
        input: `@Table\nexport class ${modelName} extends Model {\n  @Column(DataType.STRING)\n  declare username: string\n${state.includeEmail ? "\n  @Column(DataType.STRING)\n  declare email: string\n" : ""}${state.includeOrders ? "\n  @HasMany(() => Order)\n  declare orders: Order[] | null\n" : ""}${state.includeAddress ? "\n  @BelongsTo(() => Address)\n  declare address: Address | null\n" : ""}}`,
        output: `type Query {\n  ${modelName.charAt(0).toLowerCase() + modelName.slice(1)}(id: ID!): ${modelName}\n${state.includeViewerAlias ? `  me: Authenticated${modelName}\n` : ""}}\n\ntype ${modelName} {\n${fields.join("\n")}\n}${aliasBlock}${state.includeOrders ? `\n\ntype Order {\n  id: ID!\n  status: String\n}` : ""}${state.includeAddress ? `\n\ntype Address {\n  id: ID!\n  city: String\n}` : ""}\n\n# Type summary\n${summary.join("\n")}`,
        diagnostics: [
          "Generated schema stays compact because exposure remains model-driven.",
          state.includeViewerAlias
            ? "Alias-based access scope is visible in the type graph."
            : "No auth alias is generated in this configuration."
        ],
        notes: [
          "This is the clearest entry point for the define once, generate everything story.",
          "The real product demo should allow bounded model edits, not arbitrary execution."
        ]
      };
    }
  },

  lookahead: {
    pillar: "runtime",
    pillarLabel: "Pillar II",
    menuTitle: "Query to Include Graph",
    menuMeta: "Show selection-driven loading behavior.",
    label: "Pillar II",
    title: "Query to Include Graph",
    intro: "This scenario demonstrates the runtime discipline that makes graphql-gene stronger than a generic code generator. The query shape controls relation loading.",
    inputChip: "query",
    outputChip: "include graph",
    controls: [
      { type: "checkbox", key: "selectEmail", label: "Select email", value: true },
      { type: "checkbox", key: "selectRole", label: "Select role", value: false },
      { type: "checkbox", key: "selectOrders", label: "Select orders", value: true },
      { type: "checkbox", key: "selectAddress", label: "Select address", value: false },
      {
        type: "select",
        key: "viewerScope",
        label: "Viewer scope",
        value: "authenticated",
        options: [
          { value: "authenticated", label: "Authenticated user" },
          { value: "public", label: "Public user" }
        ]
      }
    ],
    compute(state) {
      const rootType = state.viewerScope === "authenticated" ? "AuthenticatedUser" : "User";
      const selectedFields = ["    id"];
      const includeGraph = [];
      const notes = [];

      if (state.selectEmail) selectedFields.push("    email");
      if (state.selectRole) selectedFields.push("    role");
      if (state.selectOrders) {
        selectedFields.push("    orders {\n      id\n      status\n    }");
        includeGraph.push("orders");
        notes.push("orders was included because it appeared in the selection set.");
      }
      if (state.selectAddress) {
        selectedFields.push("    address {\n      id\n      city\n    }");
        includeGraph.push("address");
        notes.push("address was included because it appeared in the selection set.");
      }
      if (includeGraph.length === 0) {
        notes.push("No nested relations were included because the query only requested scalar fields.");
      }

      const selectParts = ['"User"."id"'];
      if (state.selectEmail) selectParts.push('"User"."email"');
      if (state.selectRole) selectParts.push('"User"."role"');
      const joinParts = [];
      if (state.selectOrders) {
        selectParts.push('"orders"."id" AS "orders.id"', '"orders"."status" AS "orders.status"');
        joinParts.push('LEFT OUTER JOIN "Orders" AS "orders"\n  ON "User"."id" = "orders"."userId"');
      }
      if (state.selectAddress) {
        selectParts.push('"address"."id" AS "address.id"', '"address"."city" AS "address.city"');
        joinParts.push('LEFT OUTER JOIN "Addresses" AS "address"\n  ON "User"."id" = "address"."userId"');
      }
      const whereClause = state.viewerScope === "authenticated"
        ? 'WHERE "User"."id" = $viewer_id'
        : 'WHERE "User"."id" = $1';
      const sql = [
        "SELECT " + selectParts.join(",\n       "),
        'FROM "Users" AS "User"',
        ...joinParts,
        whereClause + ";"
      ].join("\n");

      return {
        input: `query ${state.viewerScope === "authenticated" ? "MeForAccount" : "PublicUser"} {\n  ${state.viewerScope === "authenticated" ? "me" : "user(id: 1)"} {\n${selectedFields.join("\n")}\n  }\n}`,
        output: `includeGraph\n${rootType}\n${includeGraph.length ? includeGraph.map((item) => `  -> ${item}`).join("\n") : "  -> none"}\n\nresult.data.${state.viewerScope === "authenticated" ? "me" : "user"} = {\n  id: "1",\n${state.selectEmail ? '  email: "dev@graphql-gene.io",\n' : ""}${state.selectRole ? '  role: "admin",\n' : ""}${state.selectOrders ? '  orders: [{ id: "10", status: "PAID" }],\n' : ""}${state.selectAddress ? '  address: { id: "3", city: "Berlin" },\n' : ""}}`,
        diagnostics: [
          "The preview keeps loading decisions tied to the requested fields.",
          includeGraph.length
            ? "Nested relations are only present when explicitly selected."
            : "Scalar-only queries stay light."
        ],
        notes,
        sql
      };
    }
  },

  directive: {
    pillar: "runtime",
    pillarLabel: "Pillar II",
    menuTitle: "Directive Behavior",
    menuMeta: "Inspect runtime middleware and SDL impact.",
    label: "Pillar II",
    title: "Directive Behavior",
    intro: "graphql-gene directives are compelling because they make runtime behavior explicit in the graph instead of scattering access rules across hand-written resolver logic.",
    inputChip: "directive",
    outputChip: "runtime",
    controls: [
      { type: "text", key: "directiveName", label: "Directive name", value: "userAuth" },
      {
        type: "select",
        key: "mode",
        label: "Directive mode",
        value: "named",
        options: [
          { value: "named", label: "Print to schema" },
          { value: "handler-only", label: "Runtime only" }
        ]
      },
      {
        type: "select",
        key: "target",
        label: "Target field",
        value: "me",
        options: [
          { value: "me", label: "Query.me" },
          { value: "orders", label: "AuthenticatedUser.orders" }
        ]
      },
      {
        type: "select",
        key: "role",
        label: "Required role",
        value: "member",
        options: [
          { value: "member", label: "member" },
          { value: "admin", label: "admin" },
          { value: "superAdmin", label: "superAdmin" }
        ]
      }
    ],
    compute(state) {
      const named = state.mode === "named" && state.directiveName.trim().length > 0;
      const targetField = state.target === "me" ? "me: AuthenticatedUser" : "orders: [Order!]";
      const directiveSuffix = named ? ` @${state.directiveName}` : "";

      return {
        input: `defineDirective({\n  name: ${named ? `"${state.directiveName}"` : '""'},\n  args: { roles: ["${state.role}"] },\n  handler: ({ context, resolve }) => {\n    context.viewer = loadViewer("${state.role}")\n    return resolve()\n  },\n})`,
        output: `${named ? `directive ${state.directiveName} on FIELD_DEFINITION\n\n` : ""}${state.target === "me" ? `type Query {\n  ${targetField}${directiveSuffix}\n}` : `type AuthenticatedUser {\n  ${targetField}${directiveSuffix}\n}`}\n\nruntimeBehaviorSummary\n- loads viewer context before field resolution\n- enforces ${state.role} visibility at runtime\n- ${named ? "prints SDL annotation for the selected field" : "runs without emitting SDL annotation"}`,
        diagnostics: [
          named
            ? "Directive is visible both in runtime behavior and generated SDL."
            : "Directive is configured as runtime-only middleware.",
          "This pattern keeps access scope visible at the graph level."
        ],
        notes: [
          "Directive behavior is one of the cleanest ways to demonstrate explicit architecture in graphql-gene.",
          "Runtime-only mode is useful when SDL emission would be awkward or invalid for the target shape."
        ]
      };
    }
  },

  polymorphic: {
    pillar: "polymorphic",
    pillarLabel: "Pillar III",
    menuTitle: "Polymorphic Blocks",
    menuMeta: "Fragments and heterogeneous content in one query.",
    label: "Pillar III",
    title: "Polymorphic Blocks",
    intro: "This is the strongest frontend-facing proof point. One ordered list can resolve to heterogeneous block types while staying easy to consume with __typename and inline fragments.",
    inputChip: "fragments",
    outputChip: "result json",
    controls: [
      { type: "text", key: "path", label: "Page path", value: "/platform" },
      { type: "checkbox", key: "includeHero", label: "Include HeroBlock", value: true },
      { type: "checkbox", key: "includeText", label: "Include TextBlock", value: true },
      { type: "checkbox", key: "includeGallery", label: "Include GalleryBlock", value: false },
      { type: "checkbox", key: "requestSubtitle", label: "Request hero subtitle", value: true }
    ],
    compute(state) {
      const blockSelections = [];
      const responseBlocks = [];
      const diagnostics = [];

      if (state.includeHero) {
        blockSelections.push(`    ... on HeroBlock {\n      title${state.requestSubtitle ? "\n      subtitle" : ""}\n    }`);
        responseBlocks.push(`        {\n          "id": 101,\n          "__typename": "HeroBlock",\n          "title": "Define once."${state.requestSubtitle ? ',\n          "subtitle": "Generate everything."' : ""}\n        }`);
      }
      if (state.includeText) {
        blockSelections.push(`    ... on TextBlock {\n      body\n    }`);
        responseBlocks.push(`        {\n          "id": 102,\n          "__typename": "TextBlock",\n          "body": "One query can drive a heterogeneous component tree."\n        }`);
      }
      if (state.includeGallery) {
        blockSelections.push(`    ... on GalleryBlock {\n      images\n    }`);
        responseBlocks.push(`        {\n          "id": 103,\n          "__typename": "GalleryBlock",\n          "images": ["schema.png", "runtime.png"]\n        }`);
      }

      if (!blockSelections.length) {
        diagnostics.push("No concrete block fragments were selected. The query can only return shared interface identity.");
      } else {
        diagnostics.push("Only the queried block branches contribute to nested loading.");
      }
      diagnostics.push("The shared interface stays intentionally minimal so concrete block types keep ownership of their fields.");

      const mainSelectParts = [
        '"Page"."id"', '"Page"."path"',
        '"blocks"."id" AS "blocks.id"',
        '"blocks"."blockType" AS "blocks.blockType"'
      ];
      const sqlParts = [
        '-- Page and block hub (always fetched)\nSELECT ' + mainSelectParts.join(", ") +
        '\nFROM "Pages" AS "Page"\nLEFT OUTER JOIN "PageBlocks" AS "blocks"\n  ON "Page"."id" = "blocks"."pageId"\nWHERE "Page"."path" = \'' + (state.path || "/platform") + '\';'
      ];
      if (state.includeHero) {
        const heroFields = ['"HeroBlock"."id"', '"HeroBlock"."title"'];
        if (state.requestSubtitle) heroFields.push('"HeroBlock"."subtitle"');
        sqlParts.push('\n\n-- HeroBlock sub-query (selection-driven)\nSELECT ' + heroFields.join(", ") + '\nFROM "HeroBlocks" AS "HeroBlock"\nWHERE "HeroBlock"."id" IN (101);');
      }
      if (state.includeText) {
        sqlParts.push('\n\n-- TextBlock sub-query (selection-driven)\nSELECT "TextBlock"."id", "TextBlock"."body"\nFROM "TextBlocks" AS "TextBlock"\nWHERE "TextBlock"."id" IN (102);');
      }
      if (state.includeGallery) {
        sqlParts.push('\n\n-- GalleryBlock sub-query (selection-driven)\nSELECT "GalleryBlock"."id", "GalleryBlock"."images"\nFROM "GalleryBlocks" AS "GalleryBlock"\nWHERE "GalleryBlock"."id" IN (103);');
      }
      if (!state.includeHero && !state.includeText && !state.includeGallery) {
        sqlParts.push('\n\n-- No block fragments selected\n-- No concrete sub-queries generated');
      }
      const sql = sqlParts.join("");

      return {
        input: `query PagePolymorphicBlocks($path: String!) {\n  pageByPath(where: { path: { eq: $path } }) {\n    id\n    path\n    blocks {\n      id\n      __typename\n${blockSelections.join("\n")}\n    }\n  }\n}\n\nvariables = {\n  "path": "${state.path}"\n}`,
        output: `{\n  "data": {\n    "pageByPath": {\n      "id": 1,\n      "path": "${state.path}",\n      "blocks": [\n${responseBlocks.join(",\n")}\n      ]\n    }\n  }\n}`,
        diagnostics,
        notes: [
          "This is where graphql-gene feels especially relevant to frontend teams consuming fragment-based APIs.",
          "The public website should keep this scenario highly visible because it explains both the backend and client value."
        ],
        sql
      };
    }
  }
};

const state = {};
let activeScenario = "schema";
let activePillar = "schema";
let activeOutputTab = "main";

function encodeStateToHash() {
  return "#scenario=" + encodeURIComponent(activeScenario);
}

function decodeHashToState() {
  try {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const scenario = params.get("scenario");
    if (scenario && scenarios[scenario]) {
      activeScenario = scenario;
      activePillar = scenarios[scenario].pillar;
    }
  } catch (_) {}
}

function updateHash() {
  window.history.replaceState(null, "", encodeStateToHash());
}

function switchOutputTab(tab) {
  activeOutputTab = tab;
  document.querySelectorAll(".output-tab").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.output === tab);
  });
  if (generatedOutput) generatedOutput.hidden = tab === "sql";
  if (sqlEditorSurface) sqlEditorSurface.hidden = tab !== "sql";
  if (tab === "sql" && window.playgroundEditors && typeof window.playgroundEditors.layoutSql === "function") {
    window.setTimeout(() => window.playgroundEditors.layoutSql(), 10);
  } else if (tab === "main" && window.playgroundEditors && typeof window.playgroundEditors.layoutOutput === "function") {
    window.setTimeout(() => window.playgroundEditors.layoutOutput(), 10);
  }
}

const scenarioList = document.getElementById("scenarioList");
const scenarioLabel = document.getElementById("scenarioLabel");
const scenarioTitle = document.getElementById("scenarioTitle");
const scenarioIntro = document.getElementById("scenarioIntro");
const scenarioControls = document.getElementById("scenarioControls");
const generatedInput = document.getElementById("generatedInput");
const generatedOutput = document.getElementById("generatedOutput");
const sqlEditorSurface = document.getElementById("sqlEditorSurface");
const sqlTabBtn = document.getElementById("sqlTabBtn");
const diagnosticsList = document.getElementById("diagnosticsList");
const notesList = document.getElementById("notesList");
const inputChip = document.getElementById("inputChip");
const outputChip = document.getElementById("outputChip");
const statusChip = document.getElementById("statusChip");
const generateButton = document.getElementById("generateButton");
const shareButton = document.getElementById("shareButton");

function ensureScenarioState(key) {
  if (state[key]) return;
  state[key] = {};
  scenarios[key].controls.forEach((control) => {
    state[key][control.key] = control.value;
  });
}

function renderScenarioButtons() {
  scenarioList.innerHTML = "";
  Object.entries(scenarios)
    .filter(([, scenario]) => scenario.pillar === activePillar)
    .forEach(([key, scenario]) => {
      const button = document.createElement("button");
      button.className = `scenario-button${key === activeScenario ? " is-active" : ""}`;
      button.type = "button";
      button.innerHTML = `
        <span class="scenario-button__eyebrow">${scenario.pillarLabel}</span>
        <span class="scenario-button__title">${scenario.menuTitle}</span>
        <span class="scenario-button__meta">${scenario.menuMeta}</span>
      `;
      button.addEventListener("click", () => {
        activeScenario = key;
        renderActiveScenario();
      });
      scenarioList.appendChild(button);
    });
}

function createCheckbox(control, value) {
  const wrapper = document.createElement("label");
  wrapper.className = "toggle-pill";
  wrapper.innerHTML = `<input type="checkbox" ${value ? "checked" : ""} /><span>${control.label}</span>`;
  const input = wrapper.querySelector("input");
  input.addEventListener("change", () => {
    state[activeScenario][control.key] = input.checked;
    updateOutputs();
  });
  return wrapper;
}

function createText(control, value, multiline = false) {
  const group = document.createElement("div");
  group.className = "control-group";
  const label = document.createElement("label");
  label.textContent = control.label;
  group.appendChild(label);
  const field = document.createElement(multiline ? "textarea" : "input");
  field.className = multiline ? "control-textarea" : "control-input";
  if (!multiline) field.type = "text";
  field.value = value;
  field.addEventListener("input", () => {
    state[activeScenario][control.key] = field.value;
    updateOutputs();
  });
  group.appendChild(field);
  return group;
}

function createSelect(control, value) {
  const group = document.createElement("div");
  group.className = "control-group";
  const label = document.createElement("label");
  label.textContent = control.label;
  const select = document.createElement("select");
  select.className = "control-select";
  control.options.forEach((option) => {
    const element = document.createElement("option");
    element.value = option.value;
    element.textContent = option.label;
    if (option.value === value) element.selected = true;
    select.appendChild(element);
  });
  select.addEventListener("change", () => {
    state[activeScenario][control.key] = select.value;
    updateOutputs();
  });
  group.appendChild(label);
  group.appendChild(select);
  return group;
}

function renderControls() {
  const scenario = scenarios[activeScenario];
  ensureScenarioState(activeScenario);
  scenarioControls.innerHTML = "";
  const groupedControls = [];
  const ungroupedControls = [];

  scenario.controls.forEach((control) => {
    if (control.type === "checkbox") groupedControls.push(control);
    else ungroupedControls.push(control);
  });

  if (ungroupedControls.length) {
    const group = document.createElement("section");
    group.className = "control-group-block";
    group.innerHTML = `
      <div class="control-group-block__header">
        <div class="control-group-block__title">Scenario inputs</div>
        <p>Adjust the core parameters that shape this example.</p>
      </div>
    `;
    const body = document.createElement("div");
    body.className = "control-group-block__body";
    ungroupedControls.forEach((control) => {
      const currentValue = state[activeScenario][control.key];
      const element = control.type === "select"
        ? createSelect(control, currentValue)
        : createText(control, currentValue, control.type === "textarea");
      body.appendChild(element);
    });
    group.appendChild(body);
    scenarioControls.appendChild(group);
  }

  if (groupedControls.length) {
    const group = document.createElement("section");
    group.className = "control-group-block";
    group.innerHTML = `
      <div class="control-group-block__header">
        <div class="control-group-block__title">Feature toggles</div>
        <p>Turn related branches on or off to inspect how the graph changes.</p>
      </div>
    `;
    const body = document.createElement("div");
    body.className = "control-group-block__body control-group-block__body--toggles";
    groupedControls.forEach((control) => {
      body.appendChild(createCheckbox(control, state[activeScenario][control.key]));
    });
    group.appendChild(body);
    scenarioControls.appendChild(group);
  }
}

function renderList(target, items) {
  target.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    target.appendChild(li);
  });
}

function setCodeContent(target, value, kind) {
  if (window.playgroundEditors) {
    if (kind === "input" && typeof window.playgroundEditors.setInputValue === "function") {
      window.playgroundEditors.setInputValue(value);
      return;
    }
    if (kind === "output" && typeof window.playgroundEditors.setOutputValue === "function") {
      window.playgroundEditors.setOutputValue(value);
      return;
    }
    if (kind === "sql" && typeof window.playgroundEditors.setSqlValue === "function") {
      window.playgroundEditors.setSqlValue(value);
      return;
    }
  }
  if (target) target.textContent = value;
}

function updateOutputs() {
  const scenario = scenarios[activeScenario];
  const result = scenario.compute(state[activeScenario]);

  inputChip.textContent = scenario.inputChip;
  outputChip.textContent = scenario.outputChip;
  setCodeContent(generatedInput, result.input, "input");
  setCodeContent(generatedOutput, result.output, "output");
  renderList(diagnosticsList, result.diagnostics);
  renderList(notesList, result.notes);

  const hasSql = Boolean(result.sql);
  if (sqlTabBtn) sqlTabBtn.classList.toggle("is-hidden", !hasSql);
  if (!hasSql && activeOutputTab === "sql") switchOutputTab("main");
  if (hasSql && sqlEditorSurface) setCodeContent(sqlEditorSurface, result.sql, "sql");
}

function renderActiveScenario() {
  const scenario = scenarios[activeScenario];
  ensureScenarioState(activeScenario);
  activePillar = scenario.pillar;
  renderScenarioButtons();
  renderControls();
  scenarioLabel.textContent = scenario.label;
  scenarioTitle.textContent = scenario.title;
  scenarioIntro.textContent = scenario.intro;
  statusChip.textContent = "ready";
  updateHash();
  document.querySelectorAll("[data-pillar-card]").forEach((card) => {
    card.classList.toggle("is-active", card.dataset.pillarCard === activePillar);
  });
  updateOutputs();
}

document.querySelectorAll(".output-tab").forEach((tab) => {
  tab.addEventListener("click", () => switchOutputTab(tab.dataset.output));
});

document.querySelectorAll("[data-pillar-card]").forEach((card) => {
  card.addEventListener("click", () => {
    const pillar = card.dataset.pillarCard;
    activePillar = pillar;
    const firstScenario = Object.keys(scenarios).find((key) => scenarios[key].pillar === pillar);
    if (firstScenario) {
      activeScenario = firstScenario;
      renderActiveScenario();
    }
  });
});

generateButton.addEventListener("click", () => {
  statusChip.textContent = "running";
  generateButton.textContent = "Generating...";
  window.setTimeout(() => {
    updateOutputs();
    statusChip.textContent = "ready";
    generateButton.textContent = "Generate output";
  }, 320);
});

if (shareButton) {
  shareButton.addEventListener("click", () => {
    const url = window.location.origin + window.location.pathname + encodeStateToHash();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(() => {
          shareButton.textContent = "Copied!";
          window.setTimeout(() => { shareButton.textContent = "Share"; }, 1800);
        })
        .catch(() => window.prompt("Copy this URL:", url));
    } else {
      window.prompt("Copy this URL:", url);
    }
  });
}

decodeHashToState();
renderActiveScenario();
