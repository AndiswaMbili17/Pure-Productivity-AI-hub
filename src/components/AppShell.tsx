import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Mail,
  Search,
  MessageSquare,
  Bookmark,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Email Generator", icon: Mail },
  { to: "/research", label: "Research Assistant", icon: Search },
  { to: "/assistant", label: "Workplace Assistant", icon: MessageSquare },
  { to: "/saved", label: "Saved Outputs", icon: Bookmark },
] as const;

export function ResponsibleAiNotice({ className = "" }: { className?: string }) {
  return (
    <p
      className={`rounded-xl border border-warning/30 bg-warning-soft px-4 py-3 text-xs leading-relaxed text-warning-foreground ${className}`}
      role="note"
    >
      <strong className="font-semibold">Responsible AI:</strong> AI-generated content may contain
      inaccuracies or outdated information. Review and verify important information before using it
      for workplace decisions or communications.
    </p>
  );
}

export function PageHeader({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <header className="flex items-start gap-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
        <Icon className="size-5" />
      </span>
      <div>
        <h1 className="text-2xl font-semibold text-foreground sm:text-[1.75rem]">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
    </header>
  );
}

function SidebarLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1" aria-label="Main">
      {nav.map(({ to, label, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Sparkles className="size-4.5" />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-sm font-semibold text-foreground">
          Pure Productivity
        </span>
        <span className="block text-[0.7rem] font-medium tracking-wide text-muted-foreground">
          AI WORKPLACE SUITE
        </span>
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="min-h-screen lg:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 border-r border-sidebar-border bg-sidebar px-4 py-6 lg:flex">
        <Brand />
        <SidebarLinks />
        <div className="mt-auto rounded-xl bg-secondary p-3 text-xs leading-relaxed text-muted-foreground">
          No account needed. Your drafts stay in this browser only.
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-card/90 px-4 py-3 backdrop-blur lg:hidden">
          <Brand />
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            className="grid size-10 place-items-center rounded-lg border border-border text-foreground transition-colors hover:bg-secondary"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        {open && (
          <div className="rise-in border-b border-border bg-card px-4 py-3 lg:hidden">
            <SidebarLinks onNavigate={() => setOpen(false)} />
          </div>
        )}

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-10">
          {children}
        </main>

        <footer className="border-t border-border px-4 py-5 sm:px-6 lg:px-10">
          <ResponsibleAiNotice />
        </footer>
      </div>
    </div>
  );
}
