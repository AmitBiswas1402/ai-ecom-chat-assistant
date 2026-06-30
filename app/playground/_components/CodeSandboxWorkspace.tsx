"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  SandpackCodeEditor,
  SandpackFileExplorer,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import type { SandpackTheme } from "@codesandbox/sandpack-react";
import { nightOwl } from "@codesandbox/sandpack-themes";
import { toast } from "sonner";
import { OnSaveContext } from "@/context/OnSaveContext";
import { useIsMobile } from "@/hooks/use-mobile";
import WebPageTools from "./WebPageTools";
import ImageSettingSection from "./ImageSettingsSection";
import WebSettings from "./WebSettingsSection";
import { Code2, Eye, FolderOpen, Loader2 } from "lucide-react";

type Props = { generatedCode: string };

const IFRAME_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>AI Website Builder</title>
<script src="https://cdn.tailwindcss.com" defer><\/script>
<link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.css" rel="stylesheet"/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js" defer><\/script>
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js" defer><\/script>
<script src="https://cdn.jsdelivr.net/npm/chart.js" defer><\/script>
<link href="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css" rel="stylesheet"/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js" defer><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js" defer><\/script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css"/>
<script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js" defer><\/script>
<link rel="stylesheet" href="https://unpkg.com/tippy.js@6/dist/tippy.css"/>
<script src="https://unpkg.com/@popperjs/core@2" defer><\/script>
<script src="https://unpkg.com/tippy.js@6" defer><\/script>
<style>body{margin:0;overflow-x:hidden}*{transition:outline 0.15s ease}</style>
<script>window.__scriptsLoaded = 0; window.__totalScripts = 8; window.onScriptLoaded = function(){window.__scriptsLoaded++; if(window.__scriptsLoaded >= window.__totalScripts){window.__allLoaded = true; window.dispatchEvent(new Event('scripts-ready'))}};<\/script>
</head>
<body id="root"></body>
</html>`;

const DEFAULT_BODY = `<main style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0f0f11;font-family:system-ui,sans-serif;"><div style="text-align:center;padding:48px 32px;border:1px dashed rgba(139,92,246,0.25);border-radius:20px;background:rgba(139,92,246,0.05);"><div style="width:48px;height:48px;border-radius:12px;background:rgba(139,92,246,0.15);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></div><p style="color:rgba(255,255,255,0.5);font-size:14px;margin:0;">Your generated website will appear here.</p><p style="color:rgba(139,92,246,0.6);font-size:12px;margin-top:8px;">Describe a design in the chat to get started.</p></div></main>`;

const normalizeCode = (code: string) =>
  (code || "").replace(/```html/g, "").replace(/```/g, "").replace(/^\s*html\s*\n/gm, "").trim();

const buildSandpackFiles = (code: string) => {
  const files: Record<string, string> = {};
  const body = normalizeCode(code);
  const fullHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>AI Website Builder</title><script src="https://cdn.tailwindcss.com"><\/script><link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.css" rel="stylesheet"/><script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"><\/script></head><body id="root">${body || DEFAULT_BODY}</body></html>`;
  files["/index.html"] = fullHtml;
  if (body.includes("class=") || body.includes("style=") || body.includes("<style")) {
    files["/styles.css"] = `:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;min-height:100vh}img{max-width:100%;display:block}a{color:inherit;text-decoration:none}`;
  }
  return files;
};

type PanelView = "preview" | "code";

const playgroundTheme: SandpackTheme = {
  ...nightOwl,
  colors: { ...nightOwl.colors, surface1: "#0d1117", surface2: "#161b22", surface3: "#1c2333", clickable: "#8b949e", base: "#e6edf3", disabled: "#484f58", hover: "#1f6feb22", accent: "#7c3aed", error: "#f85149", errorSurface: "#f8514922" },
  font: { ...nightOwl.font, mono: "'Geist Mono','Fira Code',monospace", size: "13px", lineHeight: "1.6" },
  syntax: { ...nightOwl.syntax, plain: "#e6edf3", comment: { color: "#8b949e", fontStyle: "italic" }, keyword: "#ff7b72", tag: "#7ee787", punctuation: "#8b949e", definition: "#79c0ff", property: "#79c0ff", static: "#ffa657", string: "#a5d6ff" },
};

const CodeSandboxWorkspace = ({ generatedCode }: Props) => {
  const isMobile = useIsMobile();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedScreenSize, setSelectedScreenSize] = useState("web");
  const [activeView, setActiveView] = useState<PanelView>("preview");
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const { onSaveDate } = useContext(OnSaveContext);
  const { projectId } = useParams();
  const params = useSearchParams();
  const frameId = params.get("frameId");

  const sandboxFiles = buildSandpackFiles(generatedCode);
  const visibleFiles = Object.keys(sandboxFiles);

  useEffect(() => {
    if (onSaveDate) onSaveCode();
  }, [onSaveDate]);

  const onSaveCode = async () => {
    if (!iframeRef.current) return;
    try {
      const doc = iframeRef.current.contentDocument;
      if (!doc) return;
      const cloneDoc = doc.documentElement.cloneNode(true) as HTMLElement;
      cloneDoc.querySelectorAll<HTMLElement>("*").forEach((el) => {
        el.style.outline = "";
        el.style.cursor = "";
      });
      await axios.put("/api/frames", { designCode: cloneDoc.outerHTML, frameId, projectId });
      toast.success("Saved!");
    } catch (error) {
      toast.error("Save failed.");
    }
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(IFRAME_HTML);
    doc.close();

    let injected = false;
    const injectContent = () => {
      if (injected) return;
      injected = true;
      const root = doc.getElementById("root");
      if (!root) return;
      root.innerHTML = normalizeCode(generatedCode) || DEFAULT_BODY;
      setIframeLoading(false);
      attachSelectionHandlers(doc, root);
    };

    const onLoad = () => {
      const timer = setTimeout(injectContent, 50);
      return () => clearTimeout(timer);
    };

    iframe.addEventListener("load", onLoad, { once: true });

    const fallbackTimer = setTimeout(injectContent, 2000);

    return () => {
      iframe.removeEventListener("load", onLoad);
      clearTimeout(fallbackTimer);
    };
  }, []);

  // Update content when generatedCode changes
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    const root = doc.getElementById("root");
    if (!root) return;

    root.innerHTML = normalizeCode(generatedCode) || DEFAULT_BODY;
    attachSelectionHandlers(doc, root);
  }, [generatedCode]);

  function attachSelectionHandlers(doc: Document, root: HTMLElement) {
    let hoverEl: HTMLElement | null = null;
    let selectedEl: HTMLElement | null = null;

    const handleMouseOver = (e: MouseEvent) => {
      if (selectedEl) return;
      const target = e.target as HTMLElement;
      if (target === root || target === doc.body) return;
      if (hoverEl && hoverEl !== target) hoverEl.style.outline = "";
      hoverEl = target;
      hoverEl.style.outline = "2px dotted #3b82f6";
      hoverEl.style.cursor = "pointer";
    };

    const handleMouseOut = (e: MouseEvent) => {
      if (selectedEl) return;
      const related = e.relatedTarget as HTMLElement;
      if (hoverEl && hoverEl !== related) {
        hoverEl.style.outline = "";
        hoverEl.style.cursor = "";
        hoverEl = null;
      }
    };

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.target as HTMLElement;
      if (target === root || target === doc.body) {
        if (selectedEl) {
          selectedEl.style.outline = "";
          selectedEl.removeAttribute("contenteditable");
          selectedEl = null;
          setSelectedElement(null);
        }
        return;
      }
      if (selectedEl && selectedEl !== target) {
        selectedEl.style.outline = "";
        selectedEl.removeAttribute("contenteditable");
      }
      selectedEl = target;
      selectedEl.style.outline = "2px solid #a855f7";
      selectedEl.setAttribute("contenteditable", "true");
      selectedEl.focus();
      setSelectedElement(selectedEl);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedEl) {
        selectedEl.style.outline = "";
        selectedEl.removeAttribute("contenteditable");
        selectedEl = null;
        setSelectedElement(null);
      }
    };

    // Remove old listeners by replacing the root content
    const oldRoot = root;
    const newRoot = oldRoot.cloneNode(true);
    oldRoot.parentNode?.replaceChild(newRoot, oldRoot);

    // Re-find root after replacement
    const freshRoot = doc.getElementById("root");
    if (!freshRoot) return;

    doc.addEventListener("mouseover", handleMouseOver);
    doc.addEventListener("mouseout", handleMouseOut);
    doc.addEventListener("click", handleClick);
    doc.addEventListener("keydown", handleKeyDown);
  }

  const refreshPreview = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    const root = doc.getElementById("root");
    if (!root) return;
    root.innerHTML = normalizeCode(generatedCode) || DEFAULT_BODY;
    attachSelectionHandlers(doc, root);
  };

  const clearSelection = () => {
    if (selectedElement) {
      selectedElement.style.outline = "";
      selectedElement.removeAttribute("contenteditable");
    }
    setSelectedElement(null);
  };

  const previewSizeClass =
    selectedScreenSize === "web" ? "w-full"
    : selectedScreenSize === "tablet" ? "w-[768px] max-w-full"
    : "w-[390px] max-w-full";

  const viewBtn = (view: PanelView, Icon: any, label: string) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
        activeView === view
          ? "bg-primary/15 text-primary border border-primary/25 shadow-sm shadow-primary/10"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/40 border border-transparent"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="flex h-full min-h-0 w-full gap-2 p-3">
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <WebPageTools
          selectedScreenSize={selectedScreenSize}
          setSelectedScreenSize={setSelectedScreenSize}
          generatedCode={generatedCode}
        />

        <div className="flex-1 min-h-0 overflow-hidden rounded-2xl border border-border/40 bg-[#0d1117] flex flex-col">
          {/* Tabs */}
          <div className="shrink-0 flex items-center gap-1 px-3 py-2 border-b border-white/[0.06] bg-[#161b22]/80 backdrop-blur-sm">
            {viewBtn("preview", Eye, "Preview")}
            {viewBtn("code", Code2, "Code")}
            <div className="ml-auto text-[10px] text-muted-foreground/40 font-mono hidden md:flex items-center gap-2">
              {generatedCode && (
                <span className="bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.06]">
                  {generatedCode.length.toLocaleString()} chars
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 flex overflow-hidden">
            {/* Preview */}
            {activeView === "preview" && (
              <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0e14] relative">
                {/* URL bar */}
                <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 border-b border-white/[0.06] bg-[#161b22]/50">
                  <div className="flex-1 flex items-center bg-white/[0.04] rounded-md px-2.5 py-1 border border-white/[0.06] gap-2">
                    <span className="text-[11px] text-muted-foreground/50 font-mono truncate flex-1">localhost:3000</span>
                    <button onClick={refreshPreview} className="text-muted-foreground/50 hover:text-foreground transition-colors" title="Refresh">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                        <path d="M8 16H3v5" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Iframe */}
                <div className="flex-1 min-h-0 overflow-auto flex items-start justify-center p-4">
                  <div className={`${previewSizeClass} min-h-full overflow-hidden rounded-xl border border-white/[0.08] shadow-2xl bg-white transition-all duration-300 relative`} style={{ minHeight: "480px" }}>
                    {iframeLoading && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0d1117]/80 rounded-xl">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-6 h-6 text-primary animate-spin" />
                          <span className="text-xs text-muted-foreground/70">Loading preview...</span>
                        </div>
                      </div>
                    )}
                    <iframe
                      ref={iframeRef}
                      className="w-full h-full border-0"
                      style={{ minHeight: "480px" }}
                      sandbox="allow-same-origin allow-scripts allow-pointer-lock allow-forms"
                      onLoad={() => {
                        // Iframe finished loading, but content is injected via effect
                      }}
                    />
                  </div>
                </div>

                {/* Edit hint */}
                {activeView === "preview" && (
                  <div className="shrink-0 flex items-center justify-center py-1.5 border-t border-white/[0.06] bg-[#161b22]/30">
                    <span className="text-[10px] text-muted-foreground/30">Click any element to customize</span>
                  </div>
                )}
              </div>
            )}

            {/* Code */}
            {activeView === "code" && (
              <SandpackProvider
                template="static"
                files={sandboxFiles}
                theme={playgroundTheme}
                options={{ activeFile: "/index.html", visibleFiles, recompileMode: "delayed", recompileDelay: 300, externalResources: [] }}
                customSetup={{ entry: "/index.html" }}
              >
                <div className="flex flex-1 overflow-hidden">
                  {!isMobile && (
                    <div className="w-48 shrink-0 border-r border-white/[0.06] bg-[#0d1117] flex flex-col">
                      <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-white/[0.06]">
                        <FolderOpen className="w-3.5 h-3.5 text-primary/70" />
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">Explorer</span>
                      </div>
                      <div className="flex-1 overflow-auto p-2">
                        <SandpackFileExplorer autoHiddenFiles={false} initialCollapsedFolder={[]} />
                      </div>
                    </div>
                  )}
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <SandpackCodeEditor showTabs={false} showLineNumbers showInlineErrors wrapContent className="h-full w-full" style={{ height: "100%", fontSize: "13px" }} />
                  </div>
                </div>
              </SandpackProvider>
            )}
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      {selectedElement?.tagName === "IMG" ? (
        <ImageSettingSection selectedEl={selectedElement as HTMLImageElement} clearSelection={clearSelection} />
      ) : selectedElement ? (
        <WebSettings selectedEl={selectedElement} clearSelection={clearSelection} />
      ) : null}
    </div>
  );
};

export default CodeSandboxWorkspace;
