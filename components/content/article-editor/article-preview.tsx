import type { ArticleInput } from "@/lib/content/types";
import { Modal } from "@/components/ui/modal";

export function ArticlePreview({ article, onClose }: { article: ArticleInput; onClose: () => void }) {
  return (
    <Modal title={article.title || "Статья без названия"} onClose={onClose}>
      <div className="space-y-5">
        {article.blocks.map((block, index) => <div key={index} className={block.type === "callout" ? "rounded-xl bg-indigo-50 p-4" : ""}>{block.title && <h3 className="mb-2 text-xl font-semibold">{block.title}</h3>}{block.text && <p className="whitespace-pre-wrap leading-7 text-slate-700">{block.text}</p>}{block.url && <p className="break-all text-sm text-indigo-700">{block.type}: {block.url}</p>}{block.exerciseId && <p className="rounded-lg bg-slate-100 p-3 text-sm">Упражнение: {block.exerciseId}</p>}</div>)}
      </div>
    </Modal>
  );
}
