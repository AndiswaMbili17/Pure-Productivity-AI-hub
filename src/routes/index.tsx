import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Search, MessageSquare, ArrowRight, Sparkles, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { kindLabel, outputStore, timeAgo, type SavedOutput } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pure Productivity AI — Workplace AI Dashboard" },
      {
        name: "description",
        content:
          "Draft emails, research topics and get workplace guidance in one lightweight AI productivity dashboard. No account required.",
      },
      { property: "og:title", content: "Pure Productivity AI — Workplace AI Dashboard" },
      {
        property: "og:description",
        content:
          "Draft emails, research topics and get workplace guidance in one lightweight AI productivity dashboard.",
      },
    ],
  }),
  component: Dashboard,
});

const tools = [
  {
    to: "/email",
    icon: Mail,
    title: "Smart Email Generator",
    desc: "Structured, professional workplace emails in a formal, friendly or persuasive tone.",
  },
  {
    to: "/research",
    icon: Search,
    title: "AI Research Assistant",
    desc: "Turn a topic, question or article into a summary with findings, insights and next steps.",
  },
  {
    to: "/assistant",
    icon: MessageSquare,
    title: "AI Workplace Assistant",
    desc: "A chat companion for day-to-day work questions, with suggested prompts to start.",
  },
] as const;

function Dashboard() {
  const [items, setItems] = useState<SavedOutput[]>([]);

  useEffect(() => {
    const sync = () => setItems(outputStore.list());
    sync();
    window.addEventListener("ppai:outputs", sync);
    return () => window.removeEventListener("ppai:outputs", sync);
  }, []);

  return (
    <AppShell>
      <div className="space-y-8">
        <section className="surface-card rise-in overflow-hidden bg-primary p-6 text-primary-foreground sm:p-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/12 px-3 py-1 text-xs font-medium">
            <Sparkles className="size-3.5" /> No account. No setup.
          </span>
          <h1 className="mt-4 text-2xl font-semibold sm:text-3xl">
            Your workplace AI productivity suite
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-primary-foreground/80">
            Three focused tools for the writing, research and thinking work that fills your day.
            Everything runs in your browser and every draft stays fully editable.
          </p>
          <Link
            to="/email"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-card px-4 py-2.5 text-sm font-semibold text-primary transition-transform hover:-translate-y-0.5"
          >
            Start with an email <ArrowRight className="size-4" />
          </Link>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">Quick access</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map(({ to, icon: Icon, title, desc }) => (
              <Link
                key={to}
                to={to}
                className="surface-card group flex flex-col p-5 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{title}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  Open tool
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent activity</h2>
            <Link to="/saved" className="text-sm font-medium text-primary hover:underline">
              View saved outputs
            </Link>
          </div>
          <div className="surface-card divide-y divide-border">
            {items.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">
                Nothing yet. Saved drafts from any tool will show up here.
              </p>
            ) : (
              items.slice(0, 5).map((o) => (
                <div key={o.id} className="flex items-center gap-3 p-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground">
                    <Clock className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{o.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {kindLabel[o.kind]} · {timeAgo(o.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
