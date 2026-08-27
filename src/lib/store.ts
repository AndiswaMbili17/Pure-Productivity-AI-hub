export type OutputKind = "email" | "research" | "assistant";

export type SavedOutput = {
  id: string;
  kind: OutputKind;
  title: string;
  content: string;
  createdAt: number;
};

const KEY = "ppai.saved-outputs.v1";

function read(): SavedOutput[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedOutput[]) : [];
  } catch {
    return [];
  }
}

function write(items: SavedOutput[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items.slice(0, 100)));
  window.dispatchEvent(new Event("ppai:outputs"));
}

export const outputStore = {
  list: read,
  add(item: Omit<SavedOutput, "id" | "createdAt">): SavedOutput {
    const saved: SavedOutput = {
      ...item,
      id: Math.random().toString(36).slice(2),
      createdAt: Date.now(),
    };
    write([saved, ...read()]);
    return saved;
  },
  update(id: string, content: string) {
    write(read().map((o) => (o.id === id ? { ...o, content } : o)));
  },
  remove(id: string) {
    write(read().filter((o) => o.id !== id));
  },
  clear() {
    write([]);
  },
};

export const kindLabel: Record<OutputKind, string> = {
  email: "Email Generator",
  research: "Research Assistant",
  assistant: "Workplace Assistant",
};

export function timeAgo(ts: number) {
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}
