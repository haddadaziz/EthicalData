"use client";

import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Rédigez le contenu détaillé ici...",
  className,
  minHeight = "220px",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<{ [key: string]: boolean }>({});
  const isUpdatingRef = useRef(false);

  // Initialize and sync content without breaking cursor position
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      if (editorRef.current.innerHTML !== (value || "")) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value]);

  const handleInput = () => {
    if (!editorRef.current) return;
    isUpdatingRef.current = true;
    const html = editorRef.current.innerHTML;
    onChange(html === "<br>" ? "" : html);
    updateActiveFormats();
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 50);
  };

  const updateActiveFormats = () => {
    try {
      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strikeThrough: document.queryCommandState("strikeThrough"),
        insertUnorderedList: document.queryCommandState("insertUnorderedList"),
        insertOrderedList: document.queryCommandState("insertOrderedList"),
        justifyLeft: document.queryCommandState("justifyLeft"),
        justifyCenter: document.queryCommandState("justifyCenter"),
        justifyRight: document.queryCommandState("justifyRight"),
      });
    } catch {
      // Command state query fallback
    }
  };

  const executeCommand = (command: string, valueArgument: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, valueArgument);
    handleInput();
  };

  const handleInsertLink = () => {
    const url = prompt("Entrez l'URL du lien :", "https://");
    if (url) {
      executeCommand("createLink", url);
    }
  };

  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-slate-800 bg-[#080d1a] overflow-hidden flex flex-col transition-all focus-within:border-cyan-500/50 focus-within:ring-4 focus-within:ring-cyan-500/10 shadow-lg",
        className
      )}
    >
      {/* Google Docs style Formatting Toolbar */}
      <div className="bg-[#020617] border-b border-slate-800/80 px-3 py-2 flex flex-wrap items-center gap-1 text-slate-300 select-none sticky top-0 z-20">
        {/* Headings */}
        <select
          onChange={(e) => executeCommand("formatBlock", e.target.value)}
          className="bg-[#080d1a] border border-slate-800 text-xs font-bold text-slate-200 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer hover:border-slate-700 transition-colors mr-1"
          defaultValue="P"
        >
          <option value="P">Paragraphe</option>
          <option value="H1">Titre Principal (H1)</option>
          <option value="H2">Sous-Titre (H2)</option>
          <option value="H3">Titre de Section (H3)</option>
          <option value="BLOCKQUOTE">Citation</option>
          <option value="PRE">Bloc de Code</option>
        </select>

        <div className="w-px h-5 bg-slate-800 mx-1" />

        {/* Text Style Controls */}
        <button
          type="button"
          onClick={() => executeCommand("bold")}
          className={cn(
            "w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center transition-all cursor-pointer",
            activeFormats.bold
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
              : "hover:bg-slate-900 text-slate-300 hover:text-white"
          )}
          title="Gras (Ctrl+B)"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => executeCommand("italic")}
          className={cn(
            "w-7 h-7 rounded-lg text-xs font-serif italic flex items-center justify-center transition-all cursor-pointer",
            activeFormats.italic
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
              : "hover:bg-slate-900 text-slate-300 hover:text-white"
          )}
          title="Italique (Ctrl+I)"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => executeCommand("underline")}
          className={cn(
            "w-7 h-7 rounded-lg text-xs underline flex items-center justify-center transition-all cursor-pointer",
            activeFormats.underline
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
              : "hover:bg-slate-900 text-slate-300 hover:text-white"
          )}
          title="Souligné (Ctrl+U)"
        >
          U
        </button>
        <button
          type="button"
          onClick={() => executeCommand("strikeThrough")}
          className={cn(
            "w-7 h-7 rounded-lg text-xs line-through flex items-center justify-center transition-all cursor-pointer",
            activeFormats.strikeThrough
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
              : "hover:bg-slate-900 text-slate-300 hover:text-white"
          )}
          title="Barré"
        >
          S
        </button>

        <div className="w-px h-5 bg-slate-800 mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => executeCommand("insertUnorderedList")}
          className={cn(
            "px-2 h-7 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer",
            activeFormats.insertUnorderedList
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
              : "hover:bg-slate-900 text-slate-300 hover:text-white"
          )}
          title="Liste à puces"
        >
          • Puces
        </button>
        <button
          type="button"
          onClick={() => executeCommand("insertOrderedList")}
          className={cn(
            "px-2 h-7 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer",
            activeFormats.insertOrderedList
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
              : "hover:bg-slate-900 text-slate-300 hover:text-white"
          )}
          title="Liste numérotée"
        >
          1. Numéros
        </button>

        <div className="w-px h-5 bg-slate-800 mx-1" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => executeCommand("justifyLeft")}
          className={cn(
            "w-7 h-7 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer",
            activeFormats.justifyLeft
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
              : "hover:bg-slate-900 text-slate-300 hover:text-white"
          )}
          title="Aligner à gauche"
        >
          ◀
        </button>
        <button
          type="button"
          onClick={() => executeCommand("justifyCenter")}
          className={cn(
            "w-7 h-7 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer",
            activeFormats.justifyCenter
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
              : "hover:bg-slate-900 text-slate-300 hover:text-white"
          )}
          title="Centrer"
        >
          ▲
        </button>
        <button
          type="button"
          onClick={() => executeCommand("justifyRight")}
          className={cn(
            "w-7 h-7 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer",
            activeFormats.justifyRight
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
              : "hover:bg-slate-900 text-slate-300 hover:text-white"
          )}
          title="Aligner à droite"
        >
          ▶
        </button>

        <div className="w-px h-5 bg-slate-800 mx-1" />

        {/* Link & Clear */}
        <button
          type="button"
          onClick={handleInsertLink}
          className="px-2 h-7 rounded-lg text-xs font-bold hover:bg-slate-900 text-slate-300 hover:text-cyan-400 transition-all cursor-pointer"
          title="Insérer un lien"
        >
          🔗 Lien
        </button>
        <button
          type="button"
          onClick={() => executeCommand("removeFormat")}
          className="px-2 h-7 rounded-lg text-xs font-bold hover:bg-slate-900 text-slate-400 hover:text-rose-400 transition-all cursor-pointer ml-auto"
          title="Effacer le formatage"
        >
          🧹 Effacer
        </button>
      </div>

      {/* Editable Area */}
      <div className="relative flex-1 p-4 bg-[#080d1a]">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyUp={updateActiveFormats}
          onMouseUp={updateActiveFormats}
          style={{ minHeight }}
          className="outline-none text-slate-200 text-xs md:text-sm leading-relaxed font-normal prose prose-invert max-w-none focus:outline-none"
        />
        {!value && (
          <div className="absolute top-4 left-4 text-xs md:text-sm text-slate-600 pointer-events-none font-medium">
            {placeholder}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #475569;
        }
        [contenteditable] h1 { font-size: 1.25rem; font-weight: 800; color: #ffffff; margin-top: 0.75rem; margin-bottom: 0.5rem; }
        [contenteditable] h2 { font-size: 1.1rem; font-weight: 700; color: #38bdf8; margin-top: 0.75rem; margin-bottom: 0.5rem; }
        [contenteditable] h3 { font-size: 0.95rem; font-weight: 700; color: #06b6d4; margin-top: 0.5rem; margin-bottom: 0.25rem; }
        [contenteditable] ul { list-style-type: disc; padding-left: 1.25rem; margin-top: 0.5rem; margin-bottom: 0.5rem; }
        [contenteditable] ol { list-style-type: decimal; padding-left: 1.25rem; margin-top: 0.5rem; margin-bottom: 0.5rem; }
        [contenteditable] blockquote { border-left: 3px solid #06b6d4; padding-left: 0.75rem; color: #94a3b8; font-style: italic; margin: 0.5rem 0; }
        [contenteditable] pre { background-color: #020617; border: 1px solid #1e293b; padding: 0.75rem; border-radius: 0.5rem; font-family: monospace; font-size: 0.75rem; color: #38bdf8; margin: 0.5rem 0; }
        [contenteditable] a { color: #38bdf8; text-decoration: underline; }
      `}} />
    </div>
  );
}
