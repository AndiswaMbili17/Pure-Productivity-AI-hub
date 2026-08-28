import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { MessageSquare, Send, Copy, Pencil, Bookmark, Check, Trash2, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader, ResponsibleAiNotice } from "@/components/AppShell";
import { copyText } from "@/components/OutputPanel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateAssistantAi } from "@/lib/ai.functions";
import { suggestedPrompts } from "@/lib/generate";
import { outputStore } from "@/lib/store";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Workplace Assistant — Pure Productivity AI" },
      {
        name: "description",
        content:
          "A clean chat assistant for everyday workplace questions, with suggested prompts and editable, copyable answers.",
      },
      { property: "og:title", content: "AI Workplace Assistant — Pure Productivity AI" },
      {
        property: "og:description",
        content: "Chat through everyday workplace questions and get structured, editable answers.",
      },
    ],
  }),
  component: AssistantPage,
});

type Msg = { id: string; role: "user" | "assistant"; text: string };

function AssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const ask = useServerFn(generateAssistantAi);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const prompt = text.trim();
    if (!prompt || loading) return;
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", text: prompt };
    const history = messages.map((m) => ({ role: m.role, text: m.text }));
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const reply = await ask({ data: { prompt, history } });
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", text: reply }]);
    } catch (err) {
      toast.error((err as Error).message || "Could not get a reply");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          icon={MessageSquare}
          title="AI Workplace Assistant"
          description="Ask about meetings, feedback, planning or day-to-day work situations. Every answer can be edited or copied."
        />
        <ResponsibleAiNotice />

        <section className="surface-card flex min-h-[26rem] flex-col p-4 sm:p-6">
          <div className="flex-1 space-y-4" role="log" aria-live="polite">
            {messages.length === 0 ? (
              <div className="py-6">
                <p className="text-sm font-medium">Try one of these to get started</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {suggestedPrompts.map((p) => (
                    <button
                      key={p}
                      onClick={() => void send(p)}
                      className="rounded-full border border-border bg-secondary px-3.5 py-2 text-left text-xs font-medium text-secondary-foreground transition-colors hover:border-primary hover:bg-primary-soft"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="rise-in flex justify-end">
                    <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                      {m.text}
                    </p>
                  </div>
                ) : (
                  <div key={m.id} className="rise-in max-w-[92%]">
                    {editingId === m.id ? (
                      <Textarea
                        autoFocus
                        rows={10}
                        value={m.text}
                        onChange={(e) =>
                          setMessages((all) =>
                            all.map((x) => (x.id === m.id ? { ...x, text: e.target.value } : x)),
                          )
                        }
                        className="bg-secondary/40 text-sm"
                      />
                    ) : (
                      <p className="whitespace-pre-wrap rounded-2xl rounded-bl-sm border border-border bg-secondary/50 px-4 py-3 text-sm leading-relaxed">
                        {m.text}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Button variant="ghost" size="sm" onClick={() => copyText(m.text)}>
                        <Copy className="size-3.5" /> Copy
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(editingId === m.id ? null : m.id)}
                      >
                        {editingId === m.id ? (
                          <>
                            <Check className="size-3.5" /> Done
                          </>
                        ) : (
                          <>
                            <Pencil className="size-3.5" /> Edit
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          outputStore.add({
                            kind: "assistant",
                            title: "Assistant answer",
                            content: m.text,
                          });
                          toast.success("Saved to Saved Outputs");
                        }}
                      >
                        <Bookmark className="size-3.5" /> Save
                      </Button>
                    </div>
                  </div>
                ),
              )
            )}
            {loading && (
              <p className="text-sm text-muted-foreground" aria-live="polite">
                Thinking…
              </p>
            )}
            <div ref={endRef} />
          </div>

          <form
            className="mt-5 flex items-end gap-2 border-t border-border pt-4"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <Textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder="Ask a workplace question…"
              aria-label="Message"
              className="min-h-[3rem] resize-none"
            />
            <Button
              type="submit"
              size="icon"
              aria-label="Send"
              disabled={loading}
              className="size-11 shrink-0"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </form>
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="mt-3 inline-flex items-center gap-1.5 self-start text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="size-3.5" /> Clear conversation
            </button>
          )}
        </section>
      </div>
    </AppShell>
  );
}
