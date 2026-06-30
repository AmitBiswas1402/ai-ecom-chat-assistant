"use client";

import React, { useRef, useState } from "react";
import {
  X,
  Image as ImageIcon,
  Crop,
  Expand,
  Image as ImageUpscale,
  ImageMinus,
  Loader2Icon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ImageKit from "imagekit";

type Props = {
  selectedEl: HTMLImageElement;
  clearSelection: () => void;
};

const transformOptions = [
  { label: "Smart Crop", value: "smartcrop", icon: <Crop size={14} />, transformation: "fo-auto" },
  { label: "Resize", value: "resize", icon: <Expand size={14} />, transformation: "e-dropshadow" },
  { label: "Upscale", value: "upscale", icon: <ImageUpscale size={14} />, transformation: "e-upscale" },
  { label: "BG Remove", value: "bgremove", icon: <ImageMinus size={14} />, transformation: "e-bgremove" },
];

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

const ImageSettingSection = ({ selectedEl, clearSelection }: Props) => {
  const [altText, setAltText] = useState(selectedEl.alt || "");
  const [width, setWidth] = useState<number>(selectedEl.width || 300);
  const [height, setHeight] = useState<number>(selectedEl.height || 200);
  const [selectedImage, setSelectedImage] = useState<File>();
  const [loading, setLoading] = useState(false);
  const [borderRadius, setBorderRadius] = useState(selectedEl.style.borderRadius || "0px");
  const [preview, setPreview] = useState(selectedEl.src || "");
  const [activeTransforms, setActiveTransforms] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const toggleTransform = (value: string) => {
    setActiveTransforms((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const saveUploadedFile = async () => {
    if (selectedImage) {
      setLoading(true);
      const imageRef = await imagekit.upload({
        //@ts-ignore
        file: selectedImage,
        fileName: Date.now() + ".png",
        isPublished: true,
      });
      //@ts-ignore
      selectedEl.setAttribute("src", imageRef?.url + "?tr=");
      setLoading(false);
    }
  };

  const openFileDialog = () => fileInputRef.current?.click();

  const GenerateAiImage = async () => {
    setLoading(true);
    const url = `https://ik.imagekit.io/obw9ltpba/ik-genimg-prompt-${altText}/${Date.now()}.png?tr=`;
    setPreview(url);
    selectedEl.setAttribute("src", url);
  };

  const ApplyTransformation = (trValue: string) => {
    setLoading(true);
    if (!preview.includes(trValue)) {
      const url = preview + trValue + ",";
      setPreview(url);
      selectedEl.setAttribute("src", url);
    } else {
      const url = preview.replaceAll(trValue + ",", "");
      setPreview(url);
      selectedEl.setAttribute("src", url);
    }
  };

  return (
    <div className="w-80 shrink-0 shadow-lg bg-[#0d1117] border-l border-white/[0.06] p-4 space-y-4 relative rounded-r-2xl overflow-auto h-full">
      {/* Close */}
      <div className="flex items-center justify-between">
        <h2 className="flex gap-2 items-center font-semibold text-foreground text-sm">
          <ImageIcon size={16} className="text-primary" /> Image Settings
        </h2>
        <Button
          variant="ghost"
          onClick={clearSelection}
          size="icon"
          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.06]"
        >
          <X size={16} />
        </Button>
      </div>

      {/* Preview */}
      <div className="flex justify-center">
        <img
          src={preview}
          alt={altText}
          className="max-h-36 object-contain border border-white/[0.08] rounded-lg cursor-pointer hover:opacity-80"
          onClick={openFileDialog}
          onLoad={() => setLoading(false)}
        />
      </div>

      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

      {/* Upload */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-8 bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] text-foreground text-xs"
        onClick={saveUploadedFile}
        disabled={loading}
      >
        {loading && <Loader2Icon className="animate-spin mr-1.5" size={14} />} Upload Image
      </Button>

      {/* Prompt */}
      <div>
        <label className="text-xs text-muted-foreground">Prompt</label>
        <Input
          type="text"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="Describe the image"
          className="mt-1 h-8 bg-white/[0.04] border-white/[0.08] text-foreground text-xs"
        />
      </div>

      <Button className="w-full h-8 bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 text-xs" onClick={GenerateAiImage} disabled={loading}>
        {loading && <Loader2Icon className="animate-spin mr-1.5" size={14} />} Generate AI Image
      </Button>

      {/* Transform Buttons */}
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">AI Transform</label>
        <div className="flex gap-1.5 flex-wrap">
          <TooltipProvider>
            {transformOptions.map((opt) => (
              <Tooltip key={opt.value}>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant={preview.includes(opt.transformation) ? "default" : "outline"}
                    className={`h-8 w-8 p-0 ${
                      preview.includes(opt.transformation)
                        ? "bg-primary text-primary-foreground"
                        : "bg-white/[0.04] border-white/[0.08] text-muted-foreground hover:bg-white/[0.08]"
                    }`}
                    onClick={() => ApplyTransformation(opt.transformation)}
                  >
                    {opt.icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#161b22] border-white/[0.08] text-foreground text-xs">
                  {opt.label}
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </div>

      {/* Conditional Resize Inputs */}
      {activeTransforms.includes("resize") && (
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground">Width</label>
            <Input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="mt-1 h-8 bg-white/[0.04] border-white/[0.08] text-foreground text-xs" />
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground">Height</label>
            <Input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="mt-1 h-8 bg-white/[0.04] border-white/[0.08] text-foreground text-xs" />
          </div>
        </div>
      )}

      {/* Border Radius */}
      <div>
        <label className="text-xs text-muted-foreground">Border Radius</label>
        <Input
          type="text"
          value={borderRadius}
          onChange={(e) => setBorderRadius(e.target.value)}
          placeholder="e.g. 8px or 50%"
          className="mt-1 h-8 bg-white/[0.04] border-white/[0.08] text-foreground text-xs"
        />
      </div>
    </div>
  );
};

export default ImageSettingSection;
