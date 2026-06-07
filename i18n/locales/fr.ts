export default {
  common: {
    locales: {
      en: 'EN',
      fr: 'FR',
    },
  },
  nav: {
    playground: 'Playground',
    docs: 'Docs',
    github: 'GitHub',
    language: 'Langue',
    switchTheme: 'Passer en mode {mode}',
    light: 'clair',
    dark: 'sombre',
  },
  footer: {
    tagline:
      'Generation GraphQL native a l ORM pour les equipes TypeScript qui veulent garder visibles le schema, l execution des requetes et le comportement SQL au meme endroit.',
    product: 'Produit',
    scenarios: 'Scenarios',
    resources: 'Ressources',
    livePlayground: 'Playground live',
    documentation: 'Documentation',
    schemaDesign: 'Conception du schema',
    modelToSchema: 'Modele vers schema',
    queryLookahead: 'Query lookahead',
    directiveMiddleware: 'Directive middleware',
    github: 'GitHub',
    npm: 'npm',
    license: 'Licence MIT',
    builtWith: 'Construit avec Nuxt. Le playground utilise graphql-gene, Sequelize et SQLite.',
  },
  home: {
    seo: {
      title: 'graphql-gene - generation GraphQL native a l ORM',
      description:
        'Generez des schemas GraphQL prets pour la production a partir de vos modeles Sequelize. Query lookahead, directive middleware et support TypeScript complet.',
    },
    hero: {
      badge: 'TypeScript · Sequelize · GraphQL',
      titleLead: 'Le generateur',
      titleAccent: 'GraphQL natif ORM',
      description:
        'Arretez d ecrire vos resolvers a la main. graphql-gene lit vos modeles Sequelize, genere un schema GraphQL pret pour la production et garde les blocs de page polymorphes interrogeables avec des fragments types.',
      primaryCta: 'Essayer le Playground',
      secondaryCta: 'Lire la doc ->',
      install: 'npm install graphql-gene',
    },
    features: {
      title: "Tout ce qu il faut, rien de plus",
      subtitle: 'graphql-gene gere la couche schema pour vous laisser vous concentrer sur la logique produit.',
      ormNativeTitle: 'Natif ORM',
      ormNativeDescription:
        'Definissez vos modeles Sequelize une seule fois. graphql-gene genere automatiquement types, requetes et mutations sans resolvers manuels.',
      lookaheadTitle: 'Query Lookahead',
      lookaheadDescription:
        'Vos resolvers savent exactement quelles relations la requete demande. Sequelize construit des JOIN optimises sans probleme N+1.',
      directivesTitle: 'Directive Middleware',
      directivesDescription:
        'Attachez un comportement runtime a n importe quel champ avec un decorateur. Auth, validation et rate limiting deviennent des citoyens de premiere classe du schema.',
      typesTitle: 'TypeScript First',
      typesDescription:
        'Une securite de type complete du modele au resolver. Votre IDE connait le schema avant meme le demarrage du serveur.',
      polymorphicTitle: 'Blocs polymorphes',
      polymorphicDescription:
        'Modelez des pages CMS comme une seule liste ordonnee de blocs. Interrogez HeroBlock, TextBlock et les variantes futures dans une seule operation typee.',
      pluginsTitle: 'Ecosysteme de plugins',
      pluginsDescription:
        'Ajoutez le package plugin-sequelize et obtenez le support Sequelize immediatement. D autres adaptateurs arrivent.',
      playgroundTitle: 'Playground interactif',
      playgroundDescription:
        'Essayez chaque scenario en direct : generation du schema, execution de requetes, capture SQL et directive middleware dans votre navigateur.',
    },
    showcase: {
      title: 'Blocs polymorphes, rendus proprement',
      subtitle:
        'Interrogez un contenu de page heterogene en une seule operation et donnez au frontend un payload deja forme pour le rendu.',
      queryLabel: 'Requete unique',
      resultLabel: 'Resultat type',
      cta: 'Ouvrir la demo de blocs polymorphes',
    },
    getStarted: {
      title: 'Pret a livrer votre API GraphQL ?',
      subtitle:
        'Ajoutez graphql-gene a votre projet Sequelize existant et generez un schema pret pour la production en quelques minutes.',
      primaryCta: 'Ouvrir le Playground',
      secondaryCta: 'Lire la doc',
      install: 'npm install graphql-gene plus le package plugin-sequelize',
    },
  },
  docs: {
    seo: {
      title: 'Documentation - graphql-gene',
      description:
        'Documentation officielle de graphql-gene - generez des schemas GraphQL executables a partir de vos modeles ORM.',
    },
    home: 'Documentation',
    searchLabel: 'Rechercher dans la doc',
    searchPlaceholder: 'Rechercher dans la doc',
    noResults: 'Aucun resultat pour "{query}".',
    onThisPage: 'Sur cette page',
    editOnGitHub: 'Modifier sur GitHub',
    notFound: 'Page introuvable.',
    tryInPlayground: 'Essayer dans le Playground',
    runExample: 'Executer cet exemple de facon interactive.',
    openPlayground: 'Essayer dans le Playground',
    statuses: {
      experimental: 'experimental',
      planned: 'prevu',
      deprecated: 'obsolete',
    },
    sections: {
      concepts: {
        title: 'Concepts',
      },
      guides: {
        title: 'Guides',
      },
      reference: {
        title: 'Reference',
      },
      examples: {
        title: 'Exemples',
      },
      tutorials: {
        title: 'Tutoriels',
      },
    },
    landing: {
      heroSubtitle:
        'Generez automatiquement un schema GraphQL executable a partir de vos modeles ORM. Definissez vos types une seule fois et GraphQL comme TypeScript restent synchronises.',
      getStarted: 'Commencer',
      tryPlayground: 'Essayer le Playground',
      snippetLabel: 'Installation rapide',
      featureOneTitle: 'Performant',
      featureOneDescription:
        'Le query lookahead evite de charger des associations jamais demandees par le client. Aucun travail SQL inutile.',
      featureTwoTitle: 'Type-safe',
      featureTwoDescription:
        'Les arguments et types de retour des resolvers sont inferes depuis vos modeles. Une seule source de verite.',
      featureThreeTitle: 'Extensible',
      featureThreeDescription:
        'Le systeme de plugins peut supporter n importe quel ORM Node.js. Ajoutez des directives, alias et resolvers personnalises facilement.',
      conceptsTitle: 'Concepts',
      conceptsDescription: 'Modeles mentaux, architecture et fonctionnement interne de graphql-gene.',
      guidesTitle: 'Guides',
      guidesDescription:
        'Conception du schema, directives et blocs polymorphes au travers de guides pratiques.',
      referenceTitle: 'Reference',
      referenceDescription: 'API des plugins, options de configuration et documentation de consultation precise.',
    },
  },
  playground: {
    seo: {
      title: 'Playground - graphql-gene',
      description:
        'Inspectez le SDL, le SQL, les payloads de resultat et le comportement des directives avec le playground graphql-gene.',
    },
    eyebrow: 'Playground interactif',
    defaultLead: 'Lancez un scenario et inspectez les sorties generees.',
    resetQuery: 'Reinitialiser la requete',
    refreshNow: 'Rafraichir',
    refreshing: 'Rafraichissement...',
    copy: 'Copier',
    copied: 'Copie',
    scenariosAria: 'Scenarios',
    exampleAria: 'Exemple',
    directiveModeAria: 'Mode de directive',
    executionNotes: 'Notes d execution',
    executionFallback: 'Modifiez la requete pour inspecter les notes runtime.',
    scenarioTitles: {
      'model-to-schema': 'Modele vers schema',
      'query-lookahead': 'Query lookahead',
      'polymorphic-blocks': 'Blocs polymorphes',
      'directive-middleware': 'Directive middleware',
    },
    scenarioOverview: {
      'model-to-schema': {
        title: 'Modifiez la forme du modele et inspectez instantanement le schema genere.',
        description:
          'Ce scenario edite la definition du modele d exemple, regenere le SDL et vous permet de comparer la carte structurelle des types cote a cote.',
      },
      'query-lookahead': {
        title: 'Editez une vraie requete et regardez comment le chemin de donnees, le plan d include et le SQL restent synchronises.',
        description:
          'Ce scenario execute la requete sur le runtime d exemple et montre comment graphql-gene structure la reponse GraphQL, le graphe d associations et les statements Sequelize finaux.',
      },
      'polymorphic-blocks': {
        title: 'Inspectez une requete de page polymorphe depuis les blocs types jusqu au plan d include.',
        description:
          'Ce scenario montre comment une requete avec unions et variantes de blocs se transforme en payload, statements SQL et plan d include lisible.',
      },
      'directive-middleware': {
        title: 'Comparez la facon dont le middleware de directive apparait dans le schema imprime.',
        description:
          'Ce scenario alterne entre middleware nomme et anonyme pour inspecter l extrait SDL emis par graphql-gene selon chaque contrat runtime.',
      },
    },
    examples: {
      'user-orders-basic': {
        title: 'Utilisateur avec commandes',
        description: 'Generez un schema a partir des modeles User et Order avec une association hasMany.',
      },
      'me-with-orders': {
        title: 'Moi avec commandes',
        description: 'Interrogez l utilisateur courant avec ses commandes. Observez le JOIN dans le panneau SQL.',
      },
      'page-blocks-basic': {
        title: 'Blocs de page polymorphes',
        description: 'Interrogez des blocs CMS heterogenes avec des fragments inline.',
      },
      'user-auth-directive': {
        title: 'Directive d authentification',
        description: 'Attachez la directive userAuth a un champ et inspectez le schema ainsi que le comportement runtime.',
      },
    },
    panels: {
      query: 'Requete',
      options: 'Options',
      editableRequestInput: 'Entree de requete editable',
      scenarioConfiguration: 'Configuration du scenario',
      sdl: 'SDL',
      generatedSchema: 'Schema genere',
      result: 'Resultat',
      responsePayload: 'Payload de reponse GraphQL',
      directiveSdl: 'Directive SDL',
      schemaExcerpt: 'Extrait du schema',
      typeSummary: 'Resume des types',
      generatedTypeMap: 'Carte des types generee',
      sql: 'SQL',
      capturedSql: 'Statements Sequelize captures',
      includeGraph: 'Graphe d include',
      associationPlan: 'Plan d associations demande',
      diagnostics: 'Diagnostics',
    },
    placeholder: 'Entrez votre requete GraphQL ici...',
    toggles: {
      includeOrdersTitle: 'Inclure les commandes',
      includeOrdersDescription: 'Ajoute l association `orders` au schema genere.',
      includeAddressTitle: 'Inclure l adresse',
      includeAddressDescription: 'Expose le champ `address` dans le type genere.',
      showTypeSummaryTitle: 'Afficher le resume des types',
      showTypeSummaryDescription: 'Garder la carte structurelle des types visible a cote du SDL.',
    },
    directiveModes: {
      named: 'Directive nommee',
      anonymous: 'Middleware runtime anonyme',
    },
    directiveHelp:
      'Comparez la sortie du schema lorsque le middleware est represente comme une directive nommee ou comme un comportement runtime anonyme.',
    errors: {
      loadExamples: 'Impossible de charger les exemples.',
      generate: 'La generation du schema a echoue. Veuillez reessayer.',
      query: 'L execution de la requete a echoue. Veuillez reessayer.',
      directives: 'Le scenario de directive a echoue. Veuillez reessayer.',
    },
  },
}
