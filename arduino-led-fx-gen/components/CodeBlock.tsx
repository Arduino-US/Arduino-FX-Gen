import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'cpp' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden border border-slate-700 bg-[#0d1117]">
      <div className="flex justify-between items-center px-4 py-2 bg-slate-800 border-b border-slate-700">
        <span className="text-xs font-mono text-slate-400 uppercase">{language}</span>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Copy code"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto max-h-[400px] overflow-y-auto">
        <pre className="text-xs md:text-sm font-mono leading-relaxed text-slate-300 whitespace-pre">
            {code}
        </pre>
      </div>
    </div>
  );
};