export type PortfolioContent = {
  profile: {
    name: string;
    role: string;
    intro: string;
    portrait: string;
    portraitPosition: string;
    current: string;
    focus: string;
    basedIn: string;
    status: string;
  };
  stats: { value: string; label: string }[];
  about: { title: string; image: string; paragraphs: string[] };
  experience: {
    period: string;
    role: string;
    company: string;
    type?: string;
    bullets: string[];
    tags: string[];
  }[];
  projects: {
    badge: string;
    title: string;
    problem: string;
    build: string;
    tags: string[];
    metrics: { label: string; value: string }[];
  }[];
  skills: { title: string; description: string; tags: string[] }[];
  contact: {
    heading: string;
    description: string;
    email: string;
    linkedin: string;
    github: string;
    interests: string[];
  };
  layout: {
    textAlignment: "left" | "center";
    sectionOrder: string[];
  };
  customSections: {
    id: string;
    title: string;
    body: string;
    image: string;
    alignment: "left" | "center";
  }[];
};

export const DEFAULT_PORTFOLIO_CONTENT: PortfolioContent = {
  profile: {
    name: "Aflah Backer",
    role: "Software engineer & engineering lead.",
    intro: "I build the systems behind products: backend services, data pipelines, cloud infrastructure and AI automation. I care about the parts users never see but always feel: reliability, speed and systems that keep working as they grow.",
    portrait: "/assets/aflah-portrait.jpg",
    portraitPosition: "center 35%",
    current: "SDE 2 & Engineering Lead at Loti (HQ Seattle)",
    focus: "Backend architecture, data pipelines, AWS, AI automation",
    basedIn: "Kozhikode, Kerala · works across time zones",
    status: "Open to select freelance & consulting work",
  },
  stats: [
    { value: "4+ yrs", label: "Building production software" },
    { value: "3 companies", label: "Backend engineer to engineering lead" },
    { value: "US team", label: "Remote with a Seattle-based startup" },
    { value: "Full stack", label: "React to AWS, APIs to pipelines" },
  ],
  about: {
    title: "Engineering beyond the feature.",
    image: "/assets/aflah-candid.jpg",
    paragraphs: [
      "I'm a self-taught engineer from Kozhikode. I started in 2022 as a backend engineer and moved into full-stack MERN work. Since 2024 I'm an SDE 2 and engineering lead at Loti, a Seattle-based AI startup.",
      "Today I spend most of my time on backend architecture: queue-based processing with SQS and RabbitMQ, scheduled pipelines on Airflow, web data collection at scale, and AWS infrastructure that stays up. I've load-tested systems, chased down performance problems, fixed security issues and debugged production at bad hours.",
      "As an engineering lead I also plan technical work, make architecture decisions and help a team ship. The part I enjoy most is taking a messy, real problem and turning it into a system that is simple to run.",
      "Lately I'm focused on AI automation, and specifically on getting LLM workflows out of the demo stage and into software people rely on every day.",
    ],
  },
  experience: [
    {
      period: "2024 – present",
      role: "SDE 2 · Engineering Lead",
      company: "Loti · AI startup",
      type: "Current",
      bullets: [
        "Design and build distributed data collection and processing systems on AWS, using queues, workers and scheduled Airflow pipelines.",
        "Lead a team of engineers: technical planning, architecture decisions, code review and delivery.",
        "Own production reliability, including monitoring, load testing, performance tuning and security fixes.",
        "Build web automation and scraping systems that run continuously across many sources.",
      ],
      tags: ["Python", "Node.js", "AWS", "Airflow", "SQS", "Redis", "MongoDB", "Docker"],
    },
    {
      period: "2023 – 2024",
      role: "Full Stack Developer (MERN)",
      company: "Xcitech Technologies",
      bullets: [
        "Built full-stack web applications with React, Node.js, Express and MongoDB, from database design to deployment.",
        "Developed REST APIs, admin dashboards and client-facing features.",
      ],
      tags: ["React", "Node.js", "Express", "MongoDB", "JavaScript"],
    },
    {
      period: "2022 – 2023",
      role: "Back End Engineer",
      company: "DigitechSolution",
      bullets: [
        "Built backend services and REST APIs with Node.js, Express and SQL and NoSQL databases.",
        "Handled authentication, third-party integrations and deployments to cloud servers.",
      ],
      tags: ["Node.js", "Express", "MySQL", "MongoDB", "JWT", "Nginx"],
    },
  ],
  projects: [
    {
      badge: "Personal build · AI automation · in progress",
      title: "Ops Agent: inbox to CRM with a human in the loop",
      problem: "Operations teams read every inbound email and message by hand, then retype the details into their CRM.",
      build: "Messages land in a queue. An LLM classifies each one and extracts fields against a schema. Low-confidence results go to a person for approval, and approved records sync with an audit log.",
      tags: ["Python", "FastAPI", "SQS", "Postgres", "LLM APIs"],
      metrics: [
        { label: "Messages processed", value: "[fill in]" },
        { label: "Accuracy", value: "[fill in]" },
        { label: "Cost / message", value: "[fill in]" },
      ],
    },
    {
      badge: "Personal build · Reliability · in progress",
      title: "Rebuilding an n8n workflow so it stops dropping runs",
      problem: "A popular lead-enrichment template fails silently under load. External APIs rate-limit it, and reruns create duplicate records.",
      build: "A worker service with idempotency keys, exponential backoff, a dead-letter queue, structured logs and alerts, benchmarked against the original template.",
      tags: ["Node.js", "Redis", "BullMQ", "Docker"],
      metrics: [],
    },
    {
      badge: "Personal build · Performance · in progress",
      title: "Keeping an API fast while its data grows 50x",
      problem: "Response times climb as the main table grows, because every request runs the same heavy queries.",
      build: "Indexes from query plans, read-through caching, cursor pagination, connection pooling and async jobs. I load-tested every change with k6 and published the results with the repo.",
      tags: ["Node.js", "Postgres", "Redis", "k6", "AWS"],
      metrics: [],
    },
  ],
  skills: [
    { title: "Backend & APIs", description: "Services, REST APIs and business logic that stay maintainable.", tags: ["Node.js", "Python", "TypeScript", "Express", "FastAPI"] },
    { title: "Distributed systems", description: "Asynchronous processing, consumers and workers that scale out.", tags: ["SQS", "RabbitMQ", "Redis / MemoryDB", "BullMQ"] },
    { title: "Data pipelines", description: "Scheduled workflows, web data collection and large-scale processing.", tags: ["Airflow", "Scraping", "ETL", "MongoDB", "Postgres"] },
    { title: "Cloud & DevOps", description: "Infrastructure that deploys cleanly and stays up.", tags: ["AWS EC2", "Lambda", "S3", "Route 53", "Docker", "CI/CD"] },
    { title: "AI automation", description: "LLM workflows with guardrails, evaluation and human review.", tags: ["LLM APIs", "Agents", "RAG", "Evals"] },
    { title: "Frontend", description: "Dashboards and product interfaces when the system needs a face.", tags: ["React", "Next.js", "JavaScript"] },
  ],
  contact: {
    heading: "Let's talk.",
    description: "Whether you have a system to build, a pipeline that keeps breaking or just want to compare notes on architecture, I'd like to hear from you.",
    email: "aflahbacker2000@gmail.com",
    linkedin: "https://www.linkedin.com/in/aflahbacker",
    github: "https://github.com/Aflah-backer",
    interests: ["Freelance projects", "Consulting", "Architecture reviews", "Collaborations"],
  },
  layout: {
    textAlignment: "left",
    sectionOrder: ["top", "about", "experience", "projects", "skills", "contact"],
  },
  customSections: [],
};
