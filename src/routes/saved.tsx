import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, Copy, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader, ResponsibleAiNotice } from "@/components/AppShell";
import { copyText } from "@/components/OutputPanel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { kindLabel, outputStore, timeAgo, type SavedOutput } from "@/lib/store";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved Outputs — Pure Productivity AI" },
      {
        name: "description",
        content:
          "Review, edit, copy and delete the drafts you saved from the email, research and workplace assistant tools.",
      },
      { property: "og:title", content: "Saved Outputs — Pure Productivity AI" },
      {
        property: "og:description",
        content: "Your saved AI drafts, stored locally in this browser.",
      },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const [items, setItems] = useState<SavedOutput[]>([]);

  useEffect(() => {
    const sync = () => setItems(outputStore.list());
    sync();
    window.addEventListener("ppai:outputs", sync);
    return () => window.removeEventListener("ppai:outputs", sync);
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          icon={Bookmark}
          title="Saved Outputs"
          description="Drafts you saved from any tool. They're stored only in this browser and never leave your device."
        />
        <ResponsibleAiNotice />

        {items.length === 0 ? (
          <div className="surface-card p-10 text-center">
            <p className="text-sm text-muted-foreground">
              No saved outputs yet. Generate something in the{" "}
              <Link to="/email" className="font-medium text-primary hover:underline">
                Email Generator
              </Link>{" "}
              and hit Save.
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  outputStore.clear();
                  toast.success("All saved outputs cleared");
                }}
              >
                <Trash2 className="size-4" /> Clear all
              </Button>
            </div>
            <div className="space-y-4">
              {items.map((o) => (
                <article key={o.id} className="surface-card rise-in p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold">{o.title}</h2>
                      <p className="text-xs text-muted-foreground">
                        {kindLabel[o.kind]} · {timeAgo(o.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => copyText(o.content)}>
                        <Copy className="size-4" /> Copy
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          outputStore.remove(o.id);
                          toast.success("Deleted");
                        }}
                      >
                        <Trash2 className="size-4" /> Delete
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    rows={10}
                    value={o.content}
                    onChange={(e) => outputStore.update(o.id, e.target.value)}
                    className="mt-4 resize-y bg-secondary/40 text-sm leading-relaxed"
                    aria-label={`Saved output: ${o.title}`}
                  />
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
