"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { DEFAULT_PORTFOLIO_CONTENT, type PortfolioContent } from "../lib/portfolio-content";

const stats = [
  { value: "4+ yrs", label: "Building production software" },
  { value: "3 companies", label: "Backend engineer to engineering lead" },
  { value: "US team", label: "Remote with a Seattle-based startup" },
  { value: "Full stack", label: "React to AWS, APIs to pipelines" },
];

const experience = [
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
];

const projects = [
  {
    badge: "Personal build · AI automation · in progress",
    title: "Ops Agent: inbox to CRM with a human in the loop",
    problem:
      "Operations teams read every inbound email and message by hand, then retype the details into their CRM.",
    build:
      "Messages land in a queue. An LLM classifies each one and extracts fields against a schema. Low-confidence results go to a person for approval, and approved records sync with an audit log.",
    tags: ["Python", "FastAPI", "SQS", "Postgres", "LLM APIs"],
  },
  {
    badge: "Personal build · Reliability · in progress",
    title: "Rebuilding an n8n workflow so it stops dropping runs",
    problem:
      "A popular lead-enrichment template fails silently under load. External APIs rate-limit it, and reruns create duplicate records.",
    build:
      "A worker service with idempotency keys, exponential backoff, a dead-letter queue, structured logs and alerts, benchmarked against the original template.",
    tags: ["Node.js", "Redis", "BullMQ", "Docker"],
  },
  {
    badge: "Personal build · Performance · in progress",
    title: "Keeping an API fast while its data grows 50x",
    problem:
      "Response times climb as the main table grows, because every request runs the same heavy queries.",
    build:
      "Indexes from query plans, read-through caching, cursor pagination, connection pooling and async jobs. I load-tested every change with k6 and published the results with the repo.",
    tags: ["Node.js", "Postgres", "Redis", "k6", "AWS"],
  },
];

const skills = [
  {
    title: "Backend & APIs",
    description: "Services, REST APIs and business logic that stay maintainable.",
    tags: ["Node.js", "Python", "TypeScript", "Express", "FastAPI"],
  },
  {
    title: "Distributed systems",
    description: "Asynchronous processing, consumers and workers that scale out.",
    tags: ["SQS", "RabbitMQ", "Redis / MemoryDB", "BullMQ"],
  },
  {
    title: "Data pipelines",
    description: "Scheduled workflows, web data collection and large-scale processing.",
    tags: ["Airflow", "Scraping", "ETL", "MongoDB", "Postgres"],
  },
  {
    title: "Cloud & DevOps",
    description: "Infrastructure that deploys cleanly and stays up.",
    tags: ["AWS EC2", "Lambda", "S3", "Route 53", "Docker", "CI/CD"],
  },
  {
    title: "AI automation",
    description: "LLM workflows with guardrails, evaluation and human review.",
    tags: ["LLM APIs", "Agents", "RAG", "Evals"],
  },
  {
    title: "Frontend",
    description: "Dashboards and product interfaces when the system needs a face.",
    tags: ["React", "Next.js", "JavaScript"],
  },
];

const themeChangeEvent = "portfolio-theme-change";

function subscribeToTheme(onChange: () => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  window.addEventListener("storage", onChange);
  window.addEventListener(themeChangeEvent, onChange);
  mediaQuery.addEventListener("change", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(themeChangeEvent, onChange);
    mediaQuery.removeEventListener("change", onChange);
  };
}

function getThemeSnapshot(): "light" | "dark" {
  const savedTheme = localStorage.getItem("portfolio-theme");
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function Home() {
  const [content, setContent] = useState<PortfolioContent>(() => ({
    ...DEFAULT_PORTFOLIO_CONTENT,
    stats,
    experience,
    projects: projects.map((project, index) => ({
      ...project,
      metrics: DEFAULT_PORTFOLIO_CONTENT.projects[index]?.metrics ?? [],
    })),
    skills,
  }));
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => "light");
  const [formStatus, setFormStatus] = useState<{ type: "error" | "success" | "info"; text: string }>({
    type: "info",
    text: "",
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/content", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const result = await response.json() as { content?: unknown };
        if (result.content && typeof result.content === "object" && !Array.isArray(result.content)) {
          setContent((current) => ({ ...current, ...(result.content as Partial<PortfolioContent>) }));
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    localStorage.setItem("portfolio-theme", nextTheme);
    window.dispatchEvent(new Event(themeChangeEvent));
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();
    setSending(true);
    setFormStatus({ type: "info", text: "Sending your message…" });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          website: String(formData.get("website") || ""),
        }),
      });
      const result = await response.json() as { error?: string; sent?: boolean };
      if (!response.ok || !result.sent) throw new Error(result.error || "Message could not be sent. Please try again.");
      form.reset();
      setFormStatus({ type: "success", text: "Thanks, your message has been sent." });
    } catch (error) {
      setFormStatus({ type: "error", text: error instanceof Error ? error.message : "Message could not be sent. Please try again." });
    } finally {
      setSending(false);
    }
  };

  const orderOf = (sectionId: string) => {
    const index = content.layout.sectionOrder.indexOf(sectionId);
    return index < 0 ? 99 : index + 1;
  };

  return (
    <main data-content-alignment={content.layout.textAlignment} className="flex min-h-screen flex-col bg-[#F4F5F2] text-[#141A17] transition-colors duration-300 dark:bg-[#0F1216] dark:text-[#E7EAEE]">
      <header style={{ order: 0 }} className="sticky top-0 z-50 border-b border-[#D6DAD4] bg-[#F4F5F2]/80 backdrop-blur-md dark:border-[#2A313B] dark:bg-[#0F1216]/80">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-3 text-lg font-extrabold tracking-tight text-[#141A17] dark:text-[#E7EAEE]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#1C7A50] shadow-[0_0_0_6px_rgba(28,122,80,0.15)]" />
            Aflah Backer
          </a>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden items-center gap-5 text-sm text-[#56605B] md:flex dark:text-[#9AA3AE]">
              <a href="#about" className="transition hover:text-[#141A17] dark:hover:text-[#E7EAEE]">About</a>
              <a href="#experience" className="transition hover:text-[#141A17] dark:hover:text-[#E7EAEE]">Experience</a>
              <a href="#projects" className="transition hover:text-[#141A17] dark:hover:text-[#E7EAEE]">Projects</a>
              <a href="#skills" className="transition hover:text-[#141A17] dark:hover:text-[#E7EAEE]">Skills</a>
            </div>

            <button
              type="button"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              onClick={toggleTheme}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#D6DAD4] bg-white text-[#141A17] transition hover:border-[#c7ccc5] hover:bg-[#ECEEEA] dark:border-[#2A313B] dark:bg-[#161A20] dark:text-[#E7EAEE] dark:hover:border-[#3a4451] dark:hover:bg-[#1C2129]"
            >
              {theme === "dark" ? (
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              ) : (
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            <a
              href="#contact"
              className="inline-flex items-center rounded-lg bg-[#2B45C8] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#213bb3]"
            >
              Get in touch
            </a>
          </div>
        </nav>
      </header>

      <section id="top" style={{ order: orderOf("top") }} className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid items-start gap-10 lg:grid-cols-[1.35fr_0.9fr]">
          <div>
            <p className="font-mono text-sm text-[#56605B] dark:text-[#9AA3AE]">Hi, I&apos;m</p>
            <h1 className="mt-4 text-5xl font-black tracking-[-0.06em] text-[#141A17] dark:text-[#E7EAEE] sm:text-6xl lg:text-8xl">
              {content.profile.name}.
            </h1>
            <p className="mt-4 text-2xl font-semibold text-[#2B45C8] dark:text-[#8A9CFF]">
              {content.profile.role}
            </p>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#56605B] dark:text-[#9AA3AE]">
              {content.profile.intro}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#projects" className="inline-flex items-center rounded-xl bg-[#2B45C8] px-5 py-3 font-medium text-white shadow-sm transition hover:bg-[#213bb3]">See my work</a>
              <a href="#contact" className="inline-flex items-center rounded-xl border border-[#D6DAD4] bg-white px-5 py-3 font-medium text-[#141A17] transition hover:border-[#c7ccc5] hover:bg-[#ECEEEA] dark:border-[#2A313B] dark:bg-[#161A20] dark:text-[#E7EAEE] dark:hover:bg-[#1C2129]">Get in touch</a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs text-[#56605B] dark:text-[#9AA3AE]">
              <a href="https://github.com/Aflah-backer" target="_blank" rel="noreferrer" className="border-b border-[#D6DAD4] pb-0.5 hover:border-[#141A17] hover:text-[#141A17] dark:border-[#2A313B] dark:hover:border-[#9AA3AE] dark:hover:text-[#E7EAEE]">GitHub ↗</a>
              <a href="https://www.linkedin.com/in/aflahbacker" target="_blank" rel="noreferrer" className="border-b border-[#D6DAD4] pb-0.5 hover:border-[#141A17] hover:text-[#141A17] dark:border-[#2A313B] dark:hover:border-[#9AA3AE] dark:hover:text-[#E7EAEE]">LinkedIn ↗</a>
              <a href="#contact" className="border-b border-[#D6DAD4] pb-0.5 hover:border-[#141A17] hover:text-[#141A17] dark:border-[#2A313B] dark:hover:border-[#9AA3AE] dark:hover:text-[#E7EAEE]">Résumé on request</a>
            </div>
          </div>

          <aside className="overflow-hidden rounded-2xl border border-[#D6DAD4] bg-white shadow-[0_30px_60px_-40px_rgba(20,26,23,0.35)] dark:border-[#2A313B] dark:bg-[#161A20]">
            <div className="relative h-[22rem] w-full overflow-hidden bg-[#ECEEEA] dark:bg-[#1C2129]">
              <Image
                src={content.profile.portrait}
                alt={`Portrait of ${content.profile.name}`}
                fill
                priority
                unoptimized
                sizes="(max-width: 768px) 100vw, 50vw"
                className="h-full w-full object-cover object-center"
                style={{ objectPosition: content.profile.portraitPosition }}
              />
            </div>

            <ul className="divide-y divide-[#D6DAD4] px-5 dark:divide-[#2A313B]">
              <li className="grid grid-cols-[5.5rem_1fr] gap-4 py-4 text-sm">
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#56605B] dark:text-[#9AA3AE]">Now</span>
                <span>{content.profile.current}</span>
              </li>
              <li className="grid grid-cols-[5.5rem_1fr] gap-4 py-4 text-sm">
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#56605B] dark:text-[#9AA3AE]">Focus</span>
                <span>{content.profile.focus}</span>
              </li>
              <li className="grid grid-cols-[5.5rem_1fr] gap-4 py-4 text-sm">
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#56605B] dark:text-[#9AA3AE]">Based in</span>
                <span>{content.profile.basedIn}</span>
              </li>
              <li className="grid grid-cols-[5.5rem_1fr] gap-4 py-4 text-sm">
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#56605B] dark:text-[#9AA3AE]">Status</span>
                <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#1C7A50]" />{content.profile.status}</span>
              </li>
            </ul>
          </aside>
        </div>

        <div className="mt-12 grid gap-4 rounded-2xl border border-[#D6DAD4] bg-white p-2 shadow-sm dark:border-[#2A313B] dark:bg-[#161A20] sm:grid-cols-2 lg:grid-cols-4">
          {content.stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-[#D6DAD4] bg-[#ECEEEA] p-5 dark:border-[#2A313B] dark:bg-[#1C2129]">
              <div className="text-3xl font-black tracking-[-0.05em] text-[#141A17] dark:text-[#E7EAEE]">{stat.value}</div>
              <div className="mt-2 text-sm text-[#56605B] dark:text-[#9AA3AE]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="about" style={{ order: orderOf("about") }} className="w-full border-t border-[#D6DAD4] bg-[#F8F9F6] dark:border-[#2A313B] dark:bg-[#161A20]">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#56605B] dark:text-[#9AA3AE]">About</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-[#141A17] dark:text-[#E7EAEE]">{content.about.title}</h2>
            <div className="relative mt-8 overflow-hidden rounded-2xl border border-[#D6DAD4] dark:border-[#2A313B]">
              <div className="relative aspect-[5/4] w-full">
                <Image
                  src={content.about.image}
                  alt="Aflah sitting at a table, looking to the side"
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="h-full w-full object-cover object-center"
                />
              </div>
            </div>
          </div>

          <div className="space-y-5 text-lg leading-8 text-[#56605B] dark:text-[#9AA3AE]">
            {content.about.paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph}`} className={index === 0 ? "text-xl text-[#141A17] dark:text-[#E7EAEE]" : undefined}>{paragraph}</p>)}
          </div>
        </div>
      </section>

      <section id="experience" style={{ order: orderOf("experience") }} className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#56605B] dark:text-[#9AA3AE]">Experience</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-[#141A17] dark:text-[#E7EAEE]">Where I&apos;ve worked</h2>
        </div>

        <div className="divide-y divide-[#D6DAD4] dark:divide-[#2A313B]">
          {content.experience.map((job) => (
            <article key={job.role} className="grid gap-8 py-8 lg:grid-cols-[220px_1fr]">
              <div className="font-mono text-sm text-[#56605B] dark:text-[#9AA3AE]">
                <div className="mb-2 flex items-center gap-2 text-[#1C7A50] dark:text-[#5CC98E]">
                  {job.type && <span className="h-2.5 w-2.5 rounded-full bg-[#1C7A50]" />}
                  {job.type || ""}
                </div>
                <div>{job.period}</div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-[#141A17] dark:text-[#E7EAEE]">{job.role}</h3>
                <div className="mt-1 text-[#56605B] dark:text-[#9AA3AE]">{job.company}</div>

                <ul className="mt-5 space-y-3 text-[#56605B] dark:text-[#9AA3AE]">
                  {job.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3">
                      <span className="mt-2.5 h-2 w-2 rounded-sm border border-[#2B45C8]" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <span key={tag} className="rounded-md bg-[#ECEEEA] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#56605B] dark:bg-[#1C2129] dark:text-[#9AA3AE]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="projects" style={{ order: orderOf("projects") }} className="w-full border-t border-[#D6DAD4] bg-[#F8F9F6] dark:border-[#2A313B] dark:bg-[#161A20]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#56605B] dark:text-[#9AA3AE]">Selected projects</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-[#141A17] dark:text-[#E7EAEE]">Things I&apos;ve built, and what I measured.</h2>
            <p className="mt-4 text-lg text-[#56605B] dark:text-[#9AA3AE]">Each project covers the problem, the architecture, and numbers from real runs. Results are added as each build is benchmarked.</p>
          </div>

          <div className="space-y-8">
            {content.projects.map((project) => (
              <article key={project.title} className="overflow-hidden rounded-2xl border border-[#D6DAD4] bg-white shadow-sm dark:border-[#2A313B] dark:bg-[#161A20]">
                <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="p-7 lg:p-9">
                    <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#2B45C8] dark:text-[#8A9CFF]">{project.badge}</div>
                    <h3 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-[#141A17] dark:text-[#E7EAEE]">{project.title}</h3>

                    <dl className="mt-6 space-y-5">
                      <div>
                        <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#56605B] dark:text-[#9AA3AE]">Problem</dt>
                        <dd className="mt-2 text-[#56605B] dark:text-[#9AA3AE]">{project.problem}</dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#56605B] dark:text-[#9AA3AE]">What I built</dt>
                        <dd className="mt-2 text-[#56605B] dark:text-[#9AA3AE]">{project.build}</dd>
                      </div>
                    </dl>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span key={tag} className="rounded-md bg-[#ECEEEA] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#56605B] dark:bg-[#1C2129] dark:text-[#9AA3AE]">{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-[#D6DAD4] bg-[#F4F5F2] p-7 dark:border-[#2A313B] dark:bg-[#0F1216] lg:border-l lg:border-t-0">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-[#56605B] dark:text-[#9AA3AE]">
                      <span className="rounded-full border border-[#D6DAD4] bg-white px-3 py-1 dark:border-[#2A313B] dark:bg-[#161A20]">Inbox</span>
                      <span>→</span>
                      <span className="rounded-full border border-[#BFCBFF] bg-[#E4E8FA] px-3 py-1 text-[#2B45C8] dark:border-[#2B45C8] dark:bg-[#1E2542] dark:text-[#8A9CFF]">Queue</span>
                      <span>→</span>
                      <span className="rounded-full border border-[#D6DAD4] bg-white px-3 py-1 dark:border-[#2A313B] dark:bg-[#161A20]">Workers</span>
                    </div>

                    <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                      {project.metrics.map((metric) => (
                        <div key={metric.label} className="rounded-xl border border-[#D6DAD4] bg-white p-4 dark:border-[#2A313B] dark:bg-[#161A20]">
                          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#56605B] dark:text-[#9AA3AE]">{metric.label}</div>
                          <div className="mt-2 text-xl font-bold text-[#141A17] dark:text-[#E7EAEE]">{metric.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="skills" style={{ order: orderOf("skills") }} className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#56605B] dark:text-[#9AA3AE]">Skills</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-[#141A17] dark:text-[#E7EAEE]">What I work with</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {content.skills.map((skill) => (
            <div key={skill.title} className="rounded-2xl border border-[#D6DAD4] bg-white p-6 shadow-sm dark:border-[#2A313B] dark:bg-[#161A20]">
              <h3 className="text-xl font-bold text-[#141A17] dark:text-[#E7EAEE]">{skill.title}</h3>
              <p className="mt-3 text-[#56605B] dark:text-[#9AA3AE]">{skill.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {skill.tags.map((tag) => (
                  <span key={tag} className="rounded-md bg-[#ECEEEA] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#56605B] dark:bg-[#1C2129] dark:text-[#9AA3AE]">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {content.customSections.map((section) => (
        <section key={section.id} id={section.id} style={{ order: orderOf(`custom:${section.id}`) }} className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className={section.alignment === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
            <h2 className="text-4xl font-black text-[#141A17] dark:text-[#E7EAEE]">{section.title}</h2>
            <p className="mt-5 whitespace-pre-wrap text-lg leading-8 text-[#56605B] dark:text-[#9AA3AE]">{section.body}</p>
            {section.image && <Image src={section.image} alt="" width={1200} height={800} unoptimized className="mt-8 max-h-[32rem] w-full object-cover" />}
          </div>
        </section>
      ))}

      <section id="contact" style={{ order: orderOf("contact") }} className="w-full px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[32px] bg-[#15171B] p-8 text-[#E7EAEE] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] sm:p-10 lg:p-14 dark:bg-[#15171B]">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#9AA3AE]">Contact</p>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">{content.contact.heading}</h2>
              <p className="mt-5 max-w-xl text-lg text-[#D7DEE5]">{content.contact.description}</p>

              <div className="mt-8 flex flex-wrap gap-2 text-xs text-[#D7DEE5]">
                {content.contact.interests.map((interest) => <span key={interest} className="rounded-full border border-[#2A313B] px-3 py-1.5">{interest}</span>)}
              </div>

              <div className="mt-10 space-y-3 text-sm text-[#D7DEE5]">
                <div className="flex items-center gap-3">
                  <span>Email</span>
                  <a href={`mailto:${content.contact.email}`} className="font-mono text-[#E7EAEE]">{content.contact.email}</a>
                </div>
                <div>
                  LinkedIn: <a href={content.contact.linkedin} target="_blank" rel="noreferrer" className="text-[#8A9CFF]">{content.contact.linkedin.replace(/^https?:\/\//, "")}</a>
                </div>
                <div>
                  GitHub: <a href={content.contact.github} target="_blank" rel="noreferrer" className="text-[#8A9CFF]">{content.contact.github.replace(/^https?:\/\//, "")}</a>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#2A313B] bg-[#161A20] p-5">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
                <div>
                  <label htmlFor="name" className="mb-2 block font-mono text-[11px] uppercase tracking-[0.12em] text-[#9AA3AE]">Name</label>
                  <input id="name" name="name" type="text" required placeholder="Priya Shah" className="w-full rounded-xl border border-[#2A313B] bg-[#0F1216] px-3 py-3 text-[#E7EAEE] placeholder:text-[#9AA3AE] focus:border-[#2B45C8] focus:outline-none" />
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block font-mono text-[11px] uppercase tracking-[0.12em] text-[#9AA3AE]">Email</label>
                  <input id="email" name="email" type="email" required placeholder="priya@company.com" className="w-full rounded-xl border border-[#2A313B] bg-[#0F1216] px-3 py-3 text-[#E7EAEE] placeholder:text-[#9AA3AE] focus:border-[#2B45C8] focus:outline-none" />
                </div>
                <div>
                  <label htmlFor="message" className="mb-2 block font-mono text-[11px] uppercase tracking-[0.12em] text-[#9AA3AE]">Message</label>
                  <textarea id="message" name="message" required placeholder="Tell me a little about what you're working on…" className="min-h-32 w-full rounded-xl border border-[#2A313B] bg-[#0F1216] px-3 py-3 text-[#E7EAEE] placeholder:text-[#9AA3AE] focus:border-[#2B45C8] focus:outline-none" />
                </div>
                <button type="submit" disabled={sending} className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-[#3A4250] bg-[#0B0C0E] px-5 py-3 font-medium text-white transition hover:border-[#4B5563] hover:bg-[#1C2129] disabled:cursor-wait disabled:opacity-70">
                  {sending && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
                  {sending ? "Sending…" : "Send message"}
                </button>
                <p aria-live="polite" className={`min-h-5 text-sm ${formStatus.type === "error" ? "text-[#F2877C]" : formStatus.type === "success" ? "text-[#5CC98E]" : "text-[#D7DEE5]"}`}>
                  {formStatus.text}
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ order: 1000 }} className="border-t border-[#D6DAD4] bg-white py-8 text-sm text-[#56605B] dark:border-[#2A313B] dark:bg-[#0F1216] dark:text-[#9AA3AE]">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <span>© 2026 Aflah Backer</span>
          <span>Software engineer · Kozhikode, India</span>
        </div>
      </footer>
    </main>
  );
}
