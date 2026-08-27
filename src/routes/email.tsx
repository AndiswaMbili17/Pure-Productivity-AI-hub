import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Mail, Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader, ResponsibleAiNotice } from "@/components/AppShell";
import { OutputPanel } from "@/components/OutputPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateEmailAi } from "@/lib/ai.functions";
import { type Tone } from "@/lib/generate";
import { outputStore } from "@/lib/store";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Pure Productivity AI" },
      {
        name: "description",
        content:
          "Generate professional workplace emails in a formal, friendly or persuasive tone from a purpose, recipient and key points.",
      },
      { property: "og:title", content: "Smart Email Generator — Pure Productivity AI" },
      {
        property: "og:description",
        content: "Generate professional workplace emails in seconds, fully editable.",
      },
    ],
  }),
  component: EmailPage,
});

const tones: { value: Tone; label: string; hint: string }[] = [
  { value: "formal", label: "Formal", hint: "Measured and professional" },
  { value: "friendly", label: "Friendly", hint: "Warm and approachable" },
  { value: "persuasive", label: "Persuasive", hint: "Confident and convincing" },
];

function EmailPage() {
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [senderName, setSenderName] = useState("");
  const [tone, setTone] = useState<Tone>("formal");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const generate = useServerFn(generateEmailAi);

  const run = async () => {
    if (!purpose.trim() && !keyPoints.trim()) {
      toast.error("Add a purpose or some key points first");
      return;
    }
    setLoading(true);
    try {
      const text = await generate({ data: { purpose, recipient, keyPoints, tone, senderName } });
      setOutput(text);
    } catch (err) {
      toast.error((err as Error).message || "Could not generate the email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          icon={Mail}
          title="Smart Email Generator"
          description="Describe the purpose, who it's for and the points you need to land. You'll get a structured draft you can edit before sending."
        />
        <ResponsibleAiNotice />

        <section className="surface-card space-y-5 p-5 sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose of the email</Label>
              <Input
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. requesting a deadline extension"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient / context</Label>
              <Input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. Thandi, project sponsor"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="points">Key points (one per line)</Label>
            <Textarea
              id="points"
              rows={5}
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              placeholder={"Two extra days needed for QA\nNo impact on the launch date\nHappy to share a revised plan"}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <fieldset className="space-y-2">
              <legend className="mb-2 text-sm font-medium">Tone</legend>
              <div className="flex flex-wrap gap-2">
                {tones.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTone(t.value)}
                    aria-pressed={tone === t.value}
                    title={t.hint}
                    className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
                      tone === t.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:bg-secondary"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="space-y-2">
              <Label htmlFor="sender">Your name (optional)</Label>
              <Input
                id="sender"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="e.g. Andiswa"
              />
            </div>
          </div>

          <Button onClick={() => void run()} disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Generating…
              </>
            ) : (
              <>
                <Wand2 className="size-4" /> Generate email
              </>
            )}
          </Button>
        </section>

        {output && (
          <OutputPanel
            title="Generated email"
            value={output}
            onChange={setOutput}
            onRegenerate={() => run(variant + 1)}
            onClear={() => setOutput("")}
            onSave={() => {
              outputStore.add({
                kind: "email",
                title: purpose.trim() || "Untitled email",
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
