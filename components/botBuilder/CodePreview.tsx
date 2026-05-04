"use client";

import { useEffect, useRef } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/themes/prism-tomorrow.css";

interface CodePreviewProps {
  code: string;
}

export function CodePreview({ code }: CodePreviewProps) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-gradient-to-b from-slate-800/40 to-slate-900/40 rounded-xl backdrop-blur-sm border border-slate-700/50 h-full">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-100">
          Generated Python Code
        </h2>
        <button
          onClick={handleCopy}
          className="px-3 py-1 bg-indigo-600/30 hover:bg-indigo-500/40 text-indigo-300 rounded border border-indigo-400/30 text-sm transition-colors"
        >
          Copy
        </button>
      </div>

      <div className="flex-1 overflow-auto rounded-lg bg-slate-950/60 p-4 border border-slate-700/30">
        <pre className="text-sm">
          <code ref={codeRef} className="language-python">
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}
