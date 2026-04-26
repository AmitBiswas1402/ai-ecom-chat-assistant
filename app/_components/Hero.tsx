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
  User,
  X,
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
  },
  {
    label: "SignUp Form",
    prompt:
      "Design a modern signup form with email, password, and social login options.",
    icon: Key,
  },
  {
    label: "Hero",
    prompt: "Build a SaaS hero section with title, subtitle, CTA, and image.",
    icon: HomeIcon,
  },
  {
    label: "User Profile Card",
    prompt:
      "Create a user profile card with avatar, name, bio, and follow button.",
    icon: User,
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
        image: imageUrl, // attach uploaded image URL if available
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
    <div className="flex flex-col items-center h-[80vh] justify-center">
      {/* Header */}
      <h2 className="font-bold text-7xl">What should we Design?</h2>
      <p className="mt-2 text-xl text-gray-500">Explore with AI</p>

      {/* Input Box */}
      <div className="w-full max-w-xl p-5 border mt-5 rounded-2xl">
        {/* Image Preview */}
        {imagePreview && (
          <div className="relative mb-3">
            <img
              src={imagePreview}
              alt="Preview"
              className="rounded-lg w-full max-h-60 object-contain"
            />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black text-white p-1 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <textarea
          placeholder="Describe your page design or paste a website URL..."
          className="w-full h-24 focus:outline-none focus:ring-0 resize-none"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
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
            >
              <ImagePlus />
            </Button>
            {inputIsUrl && (
              <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-medium animate-in fade-in">
                <Link2 className="w-3 h-3" />
                URL detected
              </span>
            )}
          </div>

          {!user ? (
            <SignInButton mode="modal" forceRedirectUrl={"/workspace"}>
              <Button
                size={"icon-lg"}
                className="rounded-full"
                disabled={!userInput}
              >
                <ArrowUp />
              </Button>
            </SignInButton>
          ) : (
            <Button
              size={"icon-lg"}
              className="rounded-full"
              disabled={!userInput || loading}
              onClick={CreateNewProject}
            >
              {loading ? <Loader2Icon className="animate-spin" /> : <ArrowUp />}
            </Button>
          )}
        </div>
      </div>

      {/* Suggestions */}
      <div className="mt-4 flex gap-2.5 flex-wrap justify-center">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant={"outline"}
            onClick={() => setUserInput(suggestion.prompt)}
          >
            <suggestion.icon className="mr-1" />
            {suggestion.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Hero;

const genRandom = () => Math.floor(Math.random() * 10000);
