"use client";
import { useParams, useSearchParams } from "next/navigation";
import ChatSection from "../_components/ChatSection";
import PlayGroundHeader from "../_components/PlayGroundHeader";
import WebsiteDesign from "../_components/WebsiteDesign";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export type Frame = {
  projectId: string;
  frameId: string;
  designCode: string;
  chatMessages: Messages[];
};

export type Messages = {
  role: "user" | "assistant";
  content?: string;
  image?: string; 
};

/** Check if a string is a URL */
const isUrl = (str: string): boolean => {
  try {
    const trimmed = str.trim();
    if (!/^https?:\/\//i.test(trimmed)) return false;
    new URL(trimmed);
    return true;
  } catch {
    return false;
  }
};

/** Build an enhanced prompt from scraped page data */
const buildUrlPrompt = (url: string, data: any): string => {
  let prompt = `Recreate a website inspired by ${url}.\n\n`;
  prompt += `Here is the extracted content from that website:\n`;
  if (data.title) prompt += `- Page Title: ${data.title}\n`;
  if (data.metaDescription) prompt += `- Description: ${data.metaDescription}\n`;
  if (data.navLinks?.length) prompt += `- Navigation Items: ${data.navLinks.join(", ")}\n`;
  if (data.headings?.length) prompt += `- Headings: ${data.headings.join(" | ")}\n`;
  if (data.paragraphs?.length) prompt += `- Content Sections:\n${data.paragraphs.map((p: string) => `  • ${p}`).join("\n")}\n`;
  if (data.buttons?.length) prompt += `- Buttons/CTAs: ${data.buttons.join(", ")}\n`;
  if (data.images?.length) prompt += `- Image Descriptions: ${data.images.join(", ")}\n`;
  if (data.sections?.length) prompt += `- Page Sections/Landmarks: ${data.sections.join(", ")}\n`;
  prompt += `\nGenerate a complete, modern, responsive HTML website (body content only) that recreates this design using Tailwind CSS and Flowbite components. Match the layout, sections, and content structure as closely as possible while making it visually stunning.`;
  return prompt;
};

/** Strip trailing code fence markers from generated code */
const cleanGeneratedCode = (code: string): string => {
  return code.replace(/```\s*$/g, "").trim();
};

const Prompt = `
userInput: {userInput}

Instructions:

1. If the user input explicitly requests generating code, UI layout, webpage design, or HTML/CSS/JS output (e.g., "Create a landing page", "Build a dashboard", "Generate a Tailwind CSS website"), then follow ALL the rules below:

   **General Design Requirements:**
   - Generate complete HTML code using **Tailwind CSS with Flowbite UI components**.
   - Include only the <body> content — **do NOT include <head>, <html>, or <title> tags**.
   - Apply a **modern, professional design** using **blue as the primary theme color** consistently across all components.
   - The design MUST be **fully responsive across mobile phones, tablets, and desktop devices**.
   - Ensure **clean spacing, consistent padding, modern typography, and visual hierarchy**.
   - Each section or component must be **independent** and not rely on other sections unless explicitly requested.

   **Media & Image Requirements:**
   - Use placeholder images with alt text:
       - Light Mode: https://community.softr.io/uploads/db9110/original/2X/7/74e6e7e382d0ff5d7773ca9a87e6f6f8817a68a6.jpeg
       - Dark Mode: https://www.cibaky.com/wp-content/uploads/2015/12/placeholder-3.jpg
   - Use descriptive alt attributes such as alt="placeholder image for product section".

   **Technology & Components:**
   - Use:
       - Flowbite UI components (buttons, alerts, modals, forms, cards, tables, navigation, etc.)
       - FontAwesome icons (class format: "fa fa-<icon-name>")
       - Chart.js for charts with theme-consistent styling
       - Swiper.js for sliders/carousels
       - Tippy.js for tooltips
   - Include interactive UI elements such as dropdowns, accordions, tabs, sliders, and modals wherever suitable.
   - Ensure charts and components are styled to follow the blue theme color without breaking responsiveness.

   **Design & UX Rules:**
   - Use clear visual hierarchy (headings, subheadings, text spacing).
   - Buttons must use Tailwind + Flowbite and follow the primary color scheme.
   - Navigation menus should be well-spaced and aligned horizontally on desktop and collapsible on mobile.
   - Do not include broken links or dummy "#" links—use proper placeholders such as "javascript:void(0)".
   - Ensure every section has sufficient padding (min. py-8) and modern layout structure.

   **IMPORTANT:**
   - Do NOT include any introductory or explanatory text in the output.
   - Directly output only the HTML code starting from the content inside <body>.
   - Code must be production-ready, visually appealing, and professionally structured.

2. If the user input is casual, general, or not explicitly requesting code generation (e.g., "Hello", "How are you?", "Tell me about Tailwind CSS"), then:
   - Respond with a friendly conversational message and **do NOT generate any code**.

Examples:
- User: "Hi" → Response: "Hello! How can I assist you today?"
- User: "Build a responsive landing page with Tailwind CSS" → Response: [Return complete HTML <body> code as per the above rules]
`;

const PlayGround = () => {
  const { projectId } = useParams();
  const params = useSearchParams();
  const frameId = params.get("frameId");
  const [frameDetails, setFrameDetails] = useState<Frame>();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Messages[]>([]);
  const [generatedCode, setGeneratedCode] = useState<string>();

  useEffect(() => {
    frameId && GetFrameDetails();
  }, [frameId]);

  const GetFrameDetails = async () => {
    const result = await axios.get(
      "/api/frames?frameId=" + frameId + "&projectId=" + projectId
    );
    console.log(result.data);
    setFrameDetails(result.data);

    // const designCode = result.data?.designCode;
    // const index = designCode.indexOf("```html") + 7;
    // const formattedCode = designCode.slice(index);
    // setGeneratedCode(formattedCode);

    const designCode = result.data?.designCode ?? "";

    // Safely check before processing
    if (designCode && designCode.includes("```html")) {
      const index = designCode.indexOf("```html") + 7;
      const formattedCode = cleanGeneratedCode(designCode.slice(index));
      setGeneratedCode(formattedCode);
    } else {
      setGeneratedCode(designCode || ""); 
    }

    if (result.data?.chatMessages?.length == 1) {
      const userMsg = result.data?.chatMessages[0].content;
      SendMessage(userMsg);
    } else {
      setMessages(result.data?.chatMessages);
    }
  };

  const SendMessage = async (userInput: string) => {
    setLoading(true);

    // Add user message to chat
    setMessages((prev: any) => [...prev, { role: "user", content: userInput }]);

    // Check if user input is a URL — if so, scrape and build enhanced prompt
    let finalPrompt = userInput;
    if (isUrl(userInput)) {
      try {
        toast.info("Analyzing website...");
        const scrapeResult = await axios.post("/api/scrape-url", {
          url: userInput.trim(),
        });
        finalPrompt = buildUrlPrompt(userInput.trim(), scrapeResult.data);
      } catch (error) {
        console.error("Failed to scrape URL:", error);
        toast.error("Could not analyze the website, generating from URL text...");
        finalPrompt = `Recreate a website similar to ${userInput}. Generate a complete, modern, responsive HTML website (body content only) using Tailwind CSS and Flowbite components.`;
      }
    }

    const result = await fetch("/api/ai-model", {
      method: "POST",
      body: JSON.stringify({
        messages: [
          { role: "user", content: Prompt?.replace("{userInput}", finalPrompt) },
        ],
      }),
    });

    let aiResponse = "";
    let isCode = false;
    const reader = result.body?.getReader();
    const decoder = new TextDecoder();

    while (true) {
      //@ts-ignore
      const { done, value } = await reader?.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      aiResponse += chunk;

      if (!isCode && aiResponse.includes("```html")) {
        isCode = true;
        const index = aiResponse.indexOf("```html") + 7;
        const initialCodeChunk = aiResponse.slice(index);
        setGeneratedCode((prev: any) => (prev || "") + initialCodeChunk);
      } else if (isCode) {
        setGeneratedCode((prev: any) => (prev || "") + chunk);
      }
    }

    // Clean trailing code fence from generated code
    if (isCode) {
      setGeneratedCode((prev) => cleanGeneratedCode(prev || ""));
    }

    await SaveGeneratedCode(aiResponse);
    // After streaming end
    if (!isCode) {
      setMessages((prev: any) => [
        ...prev,
        { role: "assistant", content: aiResponse },
      ]);
    } else {
      setMessages((prev: any) => [
        ...prev,
        { role: "assistant", content: "Your code is ready!" },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (messages.length > 0) {
      SaveMessages();
    }
  }, [messages]);

  const SaveMessages = async () => {
    const result = await axios.put("/api/chats", {
      messages,
      frameId,
    });
    console.log(result);
  };

  const SaveGeneratedCode = async (code: string) => {
    const result = await axios.put("/api/frames", {
      designCode: code,
      frameId,
      projectId,
    });
    console.log(result.data);
    toast.success("Website is Ready!");
  };

  return (
    <div>
      <PlayGroundHeader />

      <div className="flex">
        {/* Chat section */}
        <ChatSection
          messages={messages ?? []}
          onSend={(input: string) => SendMessage(input)}
          loading={loading}
        />

        {/* Website design */}
        <WebsiteDesign generatedCode={generatedCode ?? ""} />
      </div>
    </div>
  );
};
export default PlayGround;
