// Minimal, safe markdown renderer for trusted payload markdown.
// Only supports headings, lists, bold/italic, inline code, code fences, links, paragraphs.
import React from "react";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="rounded bg-accent px-1 py-0.5 font-mono text-sm">
          {escapeHtml(part.slice(1, -1))}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{renderInline(part.slice(2, -2))}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={i}>{renderInline(part.slice(1, -1))}</em>;
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return (
        <a key={i} href={link[2]} target="_blank" rel="noreferrer" className="text-primary underline">
          {link[1]}
        </a>
      );
    }
    return <React.Fragment key={i}>{escapeHtml(part)}</React.Fragment>;
  });
}

export default function Markdown({ source }: { source: string }) {
  const lines = source.split("\n");
  const blocks: React.ReactNode[] = [];
  let inCode = false;
  let codeBuf: string[] = [];
  let listBuf: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listBuf.length === 0) return;
    blocks.push(
      <ul key={key++} className="my-2 list-disc space-y-1 pl-5">
        {listBuf.map((li, i) => (
          <li key={i}>{renderInline(li.replace(/^[-*]\s+/, ""))}</li>
        ))}
      </ul>
    );
    listBuf = [];
  };

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (!inCode) {
        flushList();
        inCode = true;
        codeBuf = [];
      } else {
        blocks.push(
          <pre key={key++} className="my-3 overflow-x-auto rounded-md bg-foreground p-3 font-mono text-sm text-background">
            {codeBuf.join("\n")}
          </pre>
        );
        inCode = false;
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      continue;
    }
    const trimmed = line.trim();
    if (trimmed.startsWith("# ")) {
      flushList();
      blocks.push(<h2 key={key++} className="mb-2 mt-4 text-lg font-semibold">{renderInline(trimmed.slice(2))}</h2>);
    } else if (trimmed.startsWith("## ")) {
      flushList();
      blocks.push(<h3 key={key++} className="mb-2 mt-4 text-base font-semibold">{renderInline(trimmed.slice(3))}</h3>);
    } else if (trimmed.startsWith("### ")) {
      flushList();
      blocks.push(<h4 key={key++} className="mb-2 mt-3 text-sm font-semibold">{renderInline(trimmed.slice(4))}</h4>);
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      listBuf.push(trimmed);
    } else if (trimmed === "") {
      flushList();
    } else {
      flushList();
      blocks.push(<p key={key++} className="my-2">{renderInline(line)}</p>);
    }
  }
  if (inCode) {
    blocks.push(
      <pre key={key++} className="my-3 overflow-x-auto rounded-md bg-foreground p-3 font-mono text-sm text-background">
        {codeBuf.join("\n")}
      </pre>
    );
  }
  flushList();

  return <div className="prose-sm max-w-none text-sm leading-6 text-foreground">{blocks}</div>;
}
