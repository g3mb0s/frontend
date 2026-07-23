import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownMessage({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children: content }) => <h1 className="mb-3 mt-6 text-2xl font-bold tracking-tight first:mt-0">{content}</h1>,
        h2: ({ children: content }) => <h2 className="mb-2 mt-6 text-xl font-bold tracking-tight first:mt-0">{content}</h2>,
        h3: ({ children: content }) => <h3 className="mb-2 mt-5 text-lg font-semibold first:mt-0">{content}</h3>,
        p: ({ children: content }) => <p className="my-3 first:mt-0 last:mb-0">{content}</p>,
        ul: ({ children: content }) => <ul className="my-3 list-disc space-y-1 pl-6">{content}</ul>,
        ol: ({ children: content }) => <ol className="my-3 list-decimal space-y-1 pl-6">{content}</ol>,
        li: ({ children: content }) => <li className="pl-1">{content}</li>,
        strong: ({ children: content }) => <strong className="font-semibold text-slate-950">{content}</strong>,
        em: ({ children: content }) => <em className="italic">{content}</em>,
        blockquote: ({ children: content }) => <blockquote className="my-4 border-l-4 border-indigo-300 bg-indigo-50/70 px-4 py-2 text-slate-600">{content}</blockquote>,
        code: ({ children: content, className }) => (
          <code className={`rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-indigo-800 ${className ?? ""}`}>
            {content}
          </code>
        ),
        pre: ({ children: content }) => (
          <pre className="my-4 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-slate-100 [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-inherit">
            {content}
          </pre>
        ),
        a: MarkdownLink,
        hr: () => <hr className="my-6 border-slate-200" />,
        table: ({ children: content }) => (
          <div className="my-4 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">{content}</table>
          </div>
        ),
        thead: ({ children: content }) => <thead className="bg-slate-100">{content}</thead>,
        th: ({ children: content }) => <th className="border border-slate-200 px-3 py-2 font-semibold">{content}</th>,
        td: ({ children: content }) => <td className="border border-slate-200 px-3 py-2 align-top">{content}</td>,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

function MarkdownLink({ children, ...props }: ComponentPropsWithoutRef<"a">) {
  return (
    <a
      {...props}
      className="font-medium text-indigo-700 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-900"
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}
