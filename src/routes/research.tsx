import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Search, Wand2, AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader, ResponsibleAiNotice } from "@/components/AppShell";
import { OutputPanel } from "@/components/OutputPanel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateResearchAi } from "@/lib/ai.functions";
import { outputStore } from "@/lib/store";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Pure Productivity AI" },
      {
        name: "description",
        content:
          "Turn a topic, question or article into an editable summary with key findings, insights and recommendations.",
      },
      { property: "og:title", content: "AI Research Assistant — Pure Productivity AI" },
      {
        property: "og:description",
        content: "Summarise topics and articles into findings, insights and recommendations.",
      },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const [topic, setTopic] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const generate = useServerFn(generateResearchAi);

  const run = async () => {
    if (topic.trim().length < 4) {
      toast.error("Enter a topic, question or some article text");
      return;
    }
    setLoading(true);
    try {
      setOutput(await generate({ data: { topic } }));
    } catch (err) {
      toast.error((err as Error).message || "Could not generate the brief");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          icon={Search}
          title="AI Research Assistant"
          description="Paste a topic, a question or a block of article text. You'll get a summary plus separated findings, insights and recommendations."
        />
        <ResponsibleAiNotice />

        <section className="surface-card space-y-4 p-5 sm:p-6">
          <label htmlFor="topic" className="block text-sm font-medium">
            Topic, question or article text
          </label>
          <Textarea
            id="topic"
            rows={7}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. What should we consider before moving our team to a four-day week?"
          />
          <div className="flex items-start gap-2 rounded-lg bg-secondary px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            <span>
              This assistant works from the text you provide and cannot browse the web. Always
              verify dates, figures, regulations and any time-sensitive claims against a current
              authoritative source.
            </span>
          </div>
          <Button onClick={() => void run()} disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Generating…
              </>
            ) : (
              <>
                <Wand2 className="size-4" /> Generate research brief
              </>
            )}
          </Button>
        </section>

        {output && (
          <OutputPanel
            title="Research brief"
            value={output}
            onChange={setOutput}
            rows={22}
            onRegenerate={() => run(variant + 1)}
            onClear={() => setOutput("")}
            onSave={() => {
              outputStore.add({
                kind: "research",
                title: topic.trim().slice(0, 70) || "Research brief",
                content: output,
              });
              toast.success("Saved to Saved Outputs");
            }}
          />
        )}
      </div>
    </AppShell>
  );
}
