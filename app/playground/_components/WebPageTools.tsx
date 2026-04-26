"use client";
import { Button } from "@/components/ui/button";
import {
  Code2Icon,
  Download,
  Monitor,
  Smartphone,
  SquareArrowOutUpRight,
  Tablet,
} from "lucide-react";
import ViewCode from "./ViewCode";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const HTML_CODE = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="AI Website Builder - Modern TailwindCSS + Flowbite Template">
    <title>AI Website Builder</title>

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- Flowbite CSS & JS -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.css" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"></script>

    <!-- Font Awesome / Lucide -->
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>

    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <!-- AOS -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js"></script>

    <!-- GSAP -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>

    <!-- Lottie -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.11.2/lottie.min.js"></script>

    <!-- Swiper -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css" />
    <script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js"></script>

    <!-- Tippy.js -->
    <link rel="stylesheet" href="https://unpkg.com/tippy.js@6/dist/tippy.css" />
    <script src="https://unpkg.com/@popperjs/core@2"></script>
    <script src="https://unpkg.com/tippy.js@6"></script>
  </head>
  <body id="root">
    {code}
  </body>
  </html>
`;

const WebPageTools = ({
  selectedScreenSize,
  setSelectedScreenSize,
  generatedCode,
}: any) => {
  const [finalCode, setFinalCode] = useState<string>();

  useEffect(() => {
    const cleanCode = (HTML_CODE.replace("{code}", generatedCode) || "")
      .replace(/```html/g, "")
      .replace(/```/g, "")
      .replace(/^\s*html\s*\n/gm, "");
    setFinalCode(cleanCode);
  }, [generatedCode]);

  const ViweInNewTab = () => {
    if (!generatedCode) return;

    const blob = new Blob([finalCode ?? ""], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    window.open(url, "_blank");
  };

  const downloadCode = () => {
    const blob = new Blob([finalCode ?? ""], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "index.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-1 p-2 shadow rounded-xl w-full flex items-center justify-between">
      <div className="flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={
                selectedScreenSize === "web" ? "border border-primary" : ""
              }
              onClick={() => setSelectedScreenSize("web")}
            >
              <Monitor />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>PC</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={
                selectedScreenSize === "tablet" ? "border border-primary" : ""
              }
              onClick={() => setSelectedScreenSize("tablet")}
            >
              <Tablet />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Tab</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={
                selectedScreenSize === "mobile" ? "border border-primary" : ""
              }
              onClick={() => setSelectedScreenSize("mobile")}
            >
              <Smartphone />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Mobile</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex gap-2">
        <Button variant={"outline"} onClick={() => ViweInNewTab()}>
          View <SquareArrowOutUpRight />
        </Button>
        <ViewCode code={finalCode}>
          <Button>
            Code <Code2Icon />
          </Button>
        </ViewCode>
        <Button onClick={downloadCode}>
          Download <Download />
        </Button>
      </div>
    </div>
  );
};
export default WebPageTools;
