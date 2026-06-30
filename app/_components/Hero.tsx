"use client";

import { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { UserDetailContext } from "@/context/UserDetailContext";
import { SignInButton, useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import {
  ArrowUp,
  HomeIcon,
  ImagePlus,
  Key,
  LayoutDashboard,
  Link2,
  Loader2Icon,
  Sparkles,
  User,
  X,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

const suggestions = [
  {
    label: "Dashboard",
    prompt:
      "Create a responsive SaaS analytics dashboard with charts and KPI cards.",
    icon: LayoutDashboard,
    color: "text-violet-400",
    bg: "hover:bg-violet-500/10 hover:border-violet-500/30",
  },
  {
    label: "SignUp Form",
    prompt:
      "Design a modern signup form with email, password, and social login options.",
    icon: Key,
    color: "text-sky-400",
    bg: "hover:bg-sky-500/10 hover:border-sky-500/30",
  },
  {
    label: "Hero",
    prompt: "Build a SaaS hero section with title, subtitle, CTA, and image.",
    icon: HomeIcon,
    color: "text-emerald-400",
    bg: "hover:bg-emerald-500/10 hover:border-emerald-500/30",
  },
  {
    label: "User Profile Card",
    prompt:
      "Create a user profile card with avatar, name, bio, and follow button.",
    icon: User,
    color: "text-pink-400",
    bg: "hover:bg-pink-500/10 hover:border-pink-500/30",
  },
];

const Hero = () => {
  const [userInput, setUserInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const { user } = useUser();
  const { has } = useAuth();
  const router = useRouter();

  const hasUnlimitedAccess = has && has({ plan: "unlimited" });

  /** Check if user input is a URL */
  const inputIsUrl = (() => {
    try {
      const trimmed = userInput.trim();
      if (!/^https?:\/\//i.test(trimmed)) return false;
      new URL(trimmed);
      return true;
    } catch {
      return false;
    }
  })();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      toast.error("Please upload a valid image file");
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  const CreateNewProject = async () => {
    setLoading(true);
    const projectId = uuidv4();
    const frameId = genRandom();

    let imageUrl = null;

    // Upload image if user selected one
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      const uploadRes = await axios.post("/api/upload-image", formData);
      imageUrl = uploadRes.data.url;
    }

    // If user input is a URL, scrape it and build an enhanced prompt
    let finalContent = userInput;
    if (inputIsUrl) {
      try {
        toast.info("Analyzing website...");
        const scrapeResult = await axios.post("/api/scrape-url", {
          url: userInput.trim(),
        });
        const data = scrapeResult.data;
        let prompt = `Recreate a website inspired by ${userInput.trim()}.\n\n`;
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
        finalContent = prompt;
      } catch (error) {
        console.error("Failed to scrape URL:", error);
        toast.error("Could not analyze the website, generating from URL text...");
        finalContent = `Recreate a website similar to ${userInput}. Generate a complete, modern, responsive HTML website (body content only) using Tailwind CSS and Flowbite components.`;
      }
    }

    const messages = [
      {
        role: "user",
        content: finalContent,
        image: imageUrl,
      },
    ];

    try {
      const result = await axios.post("/api/projects", {
        projectId,
        frameId,
        messages,
      });
      toast.success("Project created!");
      router.push(`/playground/${projectId}?frameId=${frameId}`);
    } catch (error) {
      toast.error("Internal server error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center min-h-[88vh] justify-center px-4 overflow-hidden">
      {/* Animated background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="orb-1 absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.55 0.22 290 / 0.18) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="orb-2 absolute top-1/2 -left-32 w-[420px] h-[420px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.55 0.20 220 / 0.14) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
        <div
          className="orb-3 absolute top-1/3 -right-32 w-[380px] h-[380px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.55 0.22 320 / 0.12) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
      </div>

      {/* "New" badge */}
      <div className="relative mb-6 flex items-center gap-2 badge-shimmer border border-primary/20 rounded-full px-4 py-1.5">
        <Zap className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-medium text-primary/90 tracking-wide">
          AI-Powered Web Design
        </span>
        <span className="ml-1 bg-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          NEW
        </span>
      </div>

      {/* Heading */}
      <h1 className="hero-gradient-text font-extrabold text-5xl md:text-[68px] tracking-tighter text-center leading-[1.06] max-w-3xl">
        What should we Design?
      </h1>
      <p className="mt-5 text-base md:text-lg text-muted-foreground/75 font-normal tracking-tight text-center max-w-md leading-relaxed">
        Describe anything — from a landing page to a full dashboard.{" "}
        <span className="text-primary/80 font-medium">AI builds it instantly.</span>
      </p>

      {/* Input Box */}
      <div className="relative w-full max-w-xl mt-10">
        {/* Subtle glow ring behind the card */}
        <div
          className="absolute inset-0 rounded-[32px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 100%, oklch(0.72 0.2 290 / 0.12), transparent 70%)",
            filter: "blur(12px)",
          }}
        />
        <div className="relative input-card-glow p-5 border border-border/60 bg-card/60 backdrop-blur-xl rounded-[28px]">
          {/* Image Preview */}
          {imagePreview && (
            <div className="relative mb-4 rounded-xl overflow-hidden border border-border/40 bg-accent/10">
              <img
                src={imagePreview}
                alt="Preview"
                className="rounded-lg w-full max-h-60 object-contain mx-auto"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 bg-background/80 hover:bg-destructive/20 text-foreground hover:text-destructive p-1.5 rounded-full backdrop-blur-sm border border-border/45 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <textarea
            placeholder="Describe your page design or paste a website URL..."
            className="w-full h-24 focus:outline-none focus:ring-0 resize-none bg-transparent text-foreground placeholder:text-muted-foreground/40 text-sm md:text-[15px] leading-relaxed"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/30">
            <div className="flex items-center gap-1.5">
              <input
                type="file"
                accept="image/*"
                id="image-upload"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                variant={"ghost"}
                size={"icon"}
                onClick={() => document.getElementById("image-upload")?.click()}
                className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary text-muted-foreground transition-all"
              >
                <ImagePlus className="w-5 h-5" />
              </Button>
              {inputIsUrl && (
                <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 border border-primary/25 px-2.5 py-1 rounded-full font-medium animate-in fade-in zoom-in-95 duration-200">
                  <Link2 className="w-3.5 h-3.5" />
                  URL detected
                </span>
              )}
            </div>

            {!user ? (
              <SignInButton mode="modal" forceRedirectUrl={"/workspace"}>
                <Button
                  size={"icon-lg"}
                  className="rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90 hover:scale-[1.04] active:scale-[0.97] transition-all"
                  disabled={!userInput}
                >
                  <ArrowUp />
                </Button>
              </SignInButton>
            ) : (
              <Button
                size={"icon-lg"}
                className="rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90 hover:scale-[1.04] active:scale-[0.97] transition-all"
                disabled={!userInput || loading}
                onClick={CreateNewProject}
              >
                {loading ? <Loader2Icon className="animate-spin" /> : <ArrowUp />}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="mt-8 flex gap-2 flex-wrap justify-center max-w-xl">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant={"outline"}
            onClick={() => setUserInput(suggestion.prompt)}
            className={`rounded-full px-3.5 py-1 text-xs border-border/40 ${suggestion.bg} ${suggestion.color} transition-all duration-200 flex items-center gap-1.5 font-normal tracking-wide`}
          >
            <suggestion.icon className="w-3.5 h-3.5" />
            {suggestion.label}
          </Button>
        ))}
      </div>

      {/* Subtle stats row */}
      <div className="mt-12 flex items-center gap-6 text-xs text-muted-foreground/50">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary/50" />
          <span>Powered by Gemini</span>
        </div>
        <div className="w-px h-3 bg-border/50" />
        <span>No code required</span>
        <div className="w-px h-3 bg-border/50" />
        <span>Instant preview</span>
      </div>
    </div>
  );
};

export default Hero;

const genRandom = () => Math.floor(Math.random() * 10000);
