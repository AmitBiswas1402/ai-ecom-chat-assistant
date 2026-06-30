"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, Copy, Download, X } from "lucide-react";
import hljs from "highlight.js/lib/core";

import javascript from "highlight.js/lib/languages/javascript";
import html from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import { toast } from "sonner";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("html", html);
hljs.registerLanguage("css", css);

const ViewCode = ({ children, code }: any) => {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (codeRef.current && open) {
      hljs.highlightElement(codeRef.current);
    }
  }, [code, open]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code || "");
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!code) return;
    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "index.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  };

  const lineCount = (code || "").split("\n").length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="w-[92vw] max-w-[1100px] max-h-[85vh] p-0 gap-0 overflow-hidden border-border/40 bg-[#0d1117]">
        <DialogHeader className="flex flex-row items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#161b22]/80">
          <DialogTitle className="flex items-center gap-3 text-sm font-medium">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500/60" />
              <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
              <div className="w-2 h-2 rounded-full bg-green-500/60" />
            </div>
            <span className="text-foreground/80">Source Code</span>
            <span className="text-[10px] text-muted-foreground/40 font-mono bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.06]">
              {lineCount} lines
            </span>
          </DialogTitle>
          <div className="flex items-center gap-1.5">
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.06]"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{copied ? "Copied!" : "Copy code"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDownload}
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.06]"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Download file</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </DialogHeader>

        <div className="relative overflow-auto max-h-[calc(85vh-52px)]">
          <pre className="m-0 p-4 bg-[#0d1117] text-[13px] leading-relaxed overflow-auto">
            <code
              ref={codeRef}
              className="language-html text-[#e6edf3] font-mono"
            >
              {code?.trim() || ""}
            </code>
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewCode;
