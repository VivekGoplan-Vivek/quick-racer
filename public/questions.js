const QUESTIONS = [
  {
    question: "In our CDP world, what is the primary superpower of the Data Dictionary Service (DDS)?",
    options: [
      "Running ETL jobs on raw InsuranceSuite data",
      "Providing a searchable catalog of datasets, tables, and metadata",
      "Managing Redshift clusters and S3 buckets",
      "Acting as a monitoring dashboard for CDP microservices"
    ],
    correct: 1
  },
  {
    question: "When you land on the Data Dictionary home page and it remembers where you wandered last time, what is most likely helping under the hood?",
    options: [
      "A browser cookie set by Data Studio",
      "A DynamoDB table like data-dictionary-navigation-history-<envName>",
      "A Kafka topic that replays your clicks",
      "A nightly batch job rebuilding your session"
    ],
    correct: 1
  },
  {
    question: "For internal Guidewire users, how does the Data Dictionary UI typically decide who can see what?",
    options: [
      "Hard-coded email allowlists in the frontend",
      "Feature flags stored in localStorage",
      "AD group–based role-based access control (RBAC)",
      "A manual approval from the pod’s Tech Lead every login"
    ],
    correct: 2
  },
  {
    question: "The Real Time Search feature for Data Dictionary is being built so that users can…",
    options: [
      "Search only by dataset business name, just faster",
      "Search by richer metadata like technical names and descriptions in near real time",
      "Search only in production environments for safety",
      "Search log lines from all CDP microservices"
    ],
    correct: 1
  },
  {
    question: "Clavis is being built mainly to help with what kind of task?",
    options: [
      "Deploying InsuranceSuite core applications to GCC",
      "Orchestrating self-service provisioning of infra and content for Data Studio and Explore",
      "Managing AI model versions for Cortex",
      "Scheduling nightly backups for Virtuoso"
    ],
    correct: 1
  },
  {
    question: "Which trio best describes the external systems that Clavis backend talks to for metadata and orchestration?",
    options: [
      "Nova, Jutro, and Kafka",
      "Virtuoso, Designer, and CDPO",
      "AI Connect, AIKB, and Merlin",
      "Helios, Cosmos, and GCC"
    ],
    correct: 1
  },
  {
    question: "On the Clavis content provisioning side, the user flow is split into four main steps. Which ordering matches the Figma-inspired flow?",
    options: [
      "Content → Review → Onboarding → Source Application",
      "Onboarding → Source Application & Provisioning → Content → Review",
      "Source Application → Onboarding → Review → Content",
      "Onboarding → Review → Content → Source Application"
    ],
    correct: 1
  },
  {
    question: "In the Clavis UI, the “Manage Environments” tab is intended to let users…",
    options: [
      "Tune JVM memory for all microservices",
      "Browse and manage existing provisioned environments and their status",
      "Edit Helm charts for CDP services",
      "Trigger full re-index of Data Dictionary"
    ],
    correct: 1
  },
  {
    question: "Project Cortex (DataGPT) is primarily designed to help users…",
    options: [
      "Run large-scale batch exports from Redshift to S3",
      "Explore metadata, get SQL assistance, and analyze lineage and impact for entities",
      "Provision new CDP clusters on demand",
      "Rotate credentials for all Atmos microservices"
    ],
    correct: 1
  },
  {
    question: "Under the hood, the Cortex agent is implemented using which style and platform combo?",
    options: [
      "Rule-based engine running on Nova",
      "Agentic RAG pattern using Merlin agents and Guidewire AI Platform",
      "Monolithic Java service with hand-written prompts",
      "Kafka Streams pipeline with embedded LLM"
    ],
    correct: 1
  },
  {
    question: "In the Cortex AI Chat POC inside Data Studio, responses are delivered using Server-Sent Events (SSE). For the user, this mainly means…",
    options: [
      "Results arrive only after the entire answer is ready",
      "Responses stream token by token, giving immediate feedback while the answer is generated",
      "Only system metrics are streamed, not answers",
      "The UI must be manually refreshed to see updates"
    ],
    correct: 1
  },
  {
    question: "Which deployment pattern best describes Cortex AI Chat in the current POC?",
    options: [
      "Only a backend API, no UI yet",
      "Standalone app only; embedding is not supported",
      "A standalone app and also a microfrontend embedded in Data Studio",
      "A browser extension that injects itself into GCC"
    ],
    correct: 2
  },
  {
    question: "What type of product is Data Studio positioned as for customers?",
    options: [
      "A generic logging and monitoring solution",
      "A ticketing system for SRE workflows",
      "A dataset preparation and business intelligence application for InsuranceSuite data",
      "A replacement for GCC for all operations"
    ],
    correct: 2
  },
  {
    question: "From a user’s perspective, which capability is central to Data Studio?",
    options: [
      "Authoring policy forms directly in InsuranceSuite",
      "Running SQL over raw and curated datasets, then publishing them to downstream tools",
      "Managing AWS IAM roles for the entire tenant",
      "Configuring Okta identity providers"
    ],
    correct: 1
  },
  {
    question: "How does Data Studio relate to Cloud Data Access (CDA)?",
    options: [
      "Data Studio cannot run unless CDA is enabled for the tenant",
      "CDA is a plugin inside Data Studio used for visualization",
      "They share some data sources, but Data Studio does not require CDA to be enabled",
      "CDA is being deprecated and replaced by Data Studio"
    ],
    correct: 2
  },
  {
    question: "Imagine a new customer wants a fresh Data Studio environment with curated content, provisioned in a self-service way. Which combo best matches the target architecture?",
    options: [
      "Clavis orchestrates Virtuoso and Designer to provision infra and content; Data Studio then uses that environment for curation",
      "Cortex provisions infra, and Clavis only shows dashboards",
      "Data Dictionary directly spins up Redshift clusters and Data Studio workspaces",
      "GCC alone provisions everything; Clavis is just a read-only viewer"
    ],
    correct: 0
  },
  {
    question: "A spike explored navigating from a Data Dictionary SQL tab into Data Studio with a pre-loaded query. Which approach was considered for wiring this up?",
    options: [
      "Embedding Data Studio inside an iframe in Data Dictionary with no routing changes",
      "Using window.history to push a /env/{envId}/tabs/{encodedId} route and manually dispatch popstate",
      "Passing plain text SQL through URL query parameters only",
      "Polling a shared Redis cache until Data Studio notices a new query"
    ],
    correct: 1
  },
  {
    question: "For the upcoming Dev Summit, one of the goals for Cortex backend is to handle concurrent traffic. What target was set in the load testing stories?",
    options: [
      "5 concurrent requests with zero latency",
      "500 concurrent requests on a single pod",
      "50 concurrent requests with acceptable degradation and proper async handling",
      "Unlimited concurrent requests as long as CPU is below 90%"
    ],
    correct: 2
  },
  {
    question: "The initial Clavis POC focused heavily on connectivity. What was it primarily validating?",
    options: [
      "That Jutro components render correctly in all browsers",
      "Network and API connectivity from CDP VPC to CDPO and Planet App in LHS Cloud",
      "Whether Data Studio dashboards can be embedded inside GCC",
      "That AI Connect can directly call Virtuoso without Clavis"
    ],
    correct: 1
  },
  {
    question: "You are doing a live Dev Summit demo: you spin up a new curated environment, explore its metadata, then ask natural language questions and get SQL back. Which tool chain best fits this story end-to-end?",
    options: [
      "GCC → CDA → Nova → Helios",
      "Clavis for provisioning → Data Studio for curation → Data Dictionary for metadata → Cortex for conversational SQL assistance",
      "Virtuoso only, no other tools needed",
      "Cosmos → PagerDuty → Explore only"
    ],
    correct: 1
  }
];
