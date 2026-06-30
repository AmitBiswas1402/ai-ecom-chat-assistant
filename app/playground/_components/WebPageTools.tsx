"use client";
import { Button } from "@/components/ui/button";
import {
  Download,
  ExternalLink,
  Loader2,
  Maximize2,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import JSZip from "jszip";

const HTML_CODE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="AI Website Builder - Modern TailwindCSS + Flowbite Template">
  <title>AI Website Builder</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.css" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"></script>
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css" />
  <script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js"></script>
  <link rel="stylesheet" href="https://unpkg.com/tippy.js@6/dist/tippy.css" />
  <script src="https://unpkg.com/@popperjs/core@2"></script>
  <script src="https://unpkg.com/tippy.js@6"></script>
</head>
<body id="root">
  {code}
</body>
</html>`;

const screenSizes = [
  { id: "web",    icon: Monitor,    label: "Desktop",  width: "1280px", shortLabel: "1280" },
  { id: "tablet", icon: Tablet,     label: "Tablet",   width: "768px",  shortLabel: "768"  },
  { id: "mobile", icon: Smartphone, label: "Mobile",   width: "375px",  shortLabel: "375"  },
];

const WebPageTools = ({
  selectedScreenSize,
  setSelectedScreenSize,
  generatedCode,
}: any) => {
  const [finalCode, setFinalCode] = useState<string>("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const cleanCode = (HTML_CODE.replace("{code}", generatedCode) || "")
      .replace(/```html/g, "")
      .replace(/```/g, "")
      .replace(/^\s*html\s*\n/gm, "");
    setFinalCode(cleanCode);
  }, [generatedCode]);

  const downloadCode = async () => {
    if (!finalCode || downloading) return;
    setDownloading(true);
    try {
      const zip = new JSZip();

      const bodyContent = (generatedCode || "")
        .replace(/```html/g, "")
        .replace(/```/g, "")
        .replace(/^\s*html\s*\n/gm, "")
        .trim();

      zip.file("index.html", finalCode);

      const needsStyles =
        bodyContent.includes("class=") ||
        bodyContent.includes("style=") ||
        bodyContent.includes("className") ||
        bodyContent.includes("<style");
      if (needsStyles) {
        zip.file("styles.css", `:root { color-scheme: dark; }\n* { box-sizing: border-box; }\nbody { margin: 0; min-height: 100vh; }\nimg { max-width: 100%; display: block; }\na { color: inherit; text-decoration: none; }\n`);
      }

      const needsJs =
        bodyContent.includes("onclick") ||
        bodyContent.includes("addEventListener") ||
        bodyContent.includes("querySelector") ||
        bodyContent.includes("getElementById") ||
        bodyContent.includes("querySelectorAll") ||
        bodyContent.includes("function ") ||
        bodyContent.includes("const ") ||
        bodyContent.includes("let ") ||
        bodyContent.includes("var ") ||
        bodyContent.includes("new ") ||
        bodyContent.includes("fetch(");
      if (needsJs) {
        zip.file("index.js", `import "./styles.css";\n`);
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "project.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const openInCodeSandbox = async () => {
    if (!finalCode) return;
    try {
      const files: Record<string, { content: string }> = {
        "/index.html": { content: finalCode },
      };

      const bodyContent = (generatedCode || "")
        .replace(/```html/g, "")
        .replace(/```/g, "")
        .replace(/^\s*html\s*\n/gm, "")
        .trim();

      const needsStyles =
        bodyContent.includes("class=") ||
        bodyContent.includes("style=") ||
        bodyContent.includes("className") ||
        bodyContent.includes("<style");
      if (needsStyles) {
        files["/styles.css"] = {
          content: `:root { color-scheme: dark; }\n* { box-sizing: border-box; }\nbody { margin: 0; min-height: 100vh; }\nimg { max-width: 100%; display: block; }\na { color: inherit; text-decoration: none; }\n`,
        };
      }

      const needsJs =
        bodyContent.includes("onclick") ||
        bodyContent.includes("addEventListener") ||
        bodyContent.includes("querySelector") ||
        bodyContent.includes("getElementById") ||
        bodyContent.includes("querySelectorAll") ||
        bodyContent.includes("function ") ||
        bodyContent.includes("const ") ||
        bodyContent.includes("let ") ||
        bodyContent.includes("var ") ||
        bodyContent.includes("new ") ||
        bodyContent.includes("fetch(");
      if (needsJs) {
        files["/index.js"] = { content: `import "./styles.css";\n` };
      }

      const parameters = { files, template: "static" };
      const formData = new FormData();
      formData.append("parameters", JSON.stringify(parameters));
      formData.append("template", "static");

      const res = await fetch("https://codesandbox.io/api/v1/sandboxes/define", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      window.open(`https://codesandbox.io/s/${data.sandbox_id}`, "_blank");
    } catch (err) {
      console.error("Failed to open in CodeSandbox:", err);
    }
  };

  const currentSize = screenSizes.find((s: any) => s.id === selectedScreenSize);

  return (
    <div className="shrink-0 flex items-center justify-between gap-2 px-3 py-2 border border-border/40 bg-card/40 backdrop-blur-sm rounded-xl shadow-xs">
      {/* Screen size switcher */}
      <div className="flex items-center gap-0.5 bg-muted/40 rounded-lg p-0.5">
        {screenSizes.map(({ id, icon: Icon, label, shortLabel }: any) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => setSelectedScreenSize(id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                  selectedScreenSize === id
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden text-[10px] font-mono">{shortLabel}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom"><p>{label} ({currentSize?.width})</p></TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Viewport width pill */}
      {currentSize && (
        <span className="hidden lg:flex text-[11px] text-muted-foreground/60 bg-muted/30 border border-border/30 px-2.5 py-1 rounded-full font-mono items-center gap-1.5">
          <Maximize2 className="w-3 h-3" />
          {currentSize.width}
        </span>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 ml-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={openInCodeSandbox}
              disabled={!generatedCode}
              className="rounded-lg h-8 px-2.5 text-xs border-border/50 hover:border-primary/30 hover:bg-primary/5 gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open Sandbox</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom"><p>Open in CodeSandbox</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              onClick={downloadCode}
              disabled={!generatedCode || downloading}
              className="rounded-lg h-8 px-2.5 text-xs bg-primary text-primary-foreground hover:opacity-90 shadow-sm shadow-primary/20 gap-1.5"
            >
              {downloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{downloading ? "Zipping..." : "Download"}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom"><p>Download all files as ZIP</p></TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default WebPageTools;
