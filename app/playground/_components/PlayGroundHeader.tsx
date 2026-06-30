"use client";
import { Button } from "@/components/ui/button";
import { OnSaveContext } from "@/context/OnSaveContext";
import Image from "next/image";
import Link from "next/link";
import { useContext, useState } from "react";
import { ArrowLeft, Check, Save, Sparkles } from "lucide-react";

const PlayGroundHeader = () => {
  const { setOnSaveDate } = useContext(OnSaveContext);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setOnSaveDate(Date.now());
    setTimeout(() => setSaving(false), 1500);
  };

  return (
    <div className="flex justify-between items-center px-4 py-2.5 border-b border-border/30 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
      {/* Left: back + logo */}
      <div className="flex items-center gap-3">
        <Link href={"/workspace"}>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent/50"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <Link href={"/workspace"} className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-primary/20 blur-sm" />
            <Image src={"/logo.svg"} alt="logo" width={26} height={26} className="relative" />
          </div>
          <h2 className="font-bold text-[15px] tracking-tight hero-gradient-text hidden sm:block">
            AI Creator
          </h2>
        </Link>

        {/* Status pill */}
        <div className="hidden md:flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-primary/80 font-medium">Playground</span>
        </div>
      </div>

      {/* Right: save */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="rounded-full px-5 bg-primary text-primary-foreground hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 shadow-md shadow-primary/25 flex items-center gap-1.5 text-sm"
      >
        {saving ? (
          <>
            <Check className="w-3.5 h-3.5" />
            Saved
          </>
        ) : (
          <>
            <Save className="w-3.5 h-3.5" />
            Save
          </>
        )}
      </Button>
    </div>
  );
};

export default PlayGroundHeader;
