import { Copy, RefreshCw, Trash2, Bookmark } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  } catch {
    toast.error("Copy failed — select the text and copy manually");
  }
}

export function OutputPanel({
  title,
  value,
  onChange,
  onRegenerate,
  onClear,
  onSave,
  rows = 16,
  placeholder,
}: {
  title: string;
  value: string;
  onChange: (v: string) => void;
  onRegenerate?: () => void;
  onClear?: () => void;
  onSave?: () => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <section className="surface-card rise-in p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => copyText(value)} disabled={!value}>
            <Copy className="size-4" /> Copy
          </Button>
          {onSave && (
            <Button variant="outline" size="sm" onClick={onSave} disabled={!value}>
              <Bookmark className="size-4" /> Save
            </Button>
          )}
          {onRegenerate && (
            <Button variant="outline" size="sm" onClick={onRegenerate}>
              <RefreshCw className="size-4" /> Regenerate
            </Button>
          )}
          {onClear && (
            <Button variant="ghost" size="sm" onClick={onClear} disabled={!value}>
              <Trash2 className="size-4" /> Clear
            </Button>
          )}
        </div>
      </div>
      <Textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Your generated draft will appear here — fully editable."}
        className="resize-y bg-secondary/40 font-sans text-sm leading-relaxed"
        aria-label={title}
      />
    </section>
  );
}
