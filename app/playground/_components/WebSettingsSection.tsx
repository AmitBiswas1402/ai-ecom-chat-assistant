"use client";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  selectedEl: HTMLElement;
  clearSelection: () => void;
};

const ElementSettingsSection = ({ selectedEl, clearSelection }: Props) => {
  const [classes, setClasses] = useState<string[]>([]);
  const [newClass, setNewClass] = useState("");
  const [align, setAlign] = React.useState(selectedEl?.style?.textAlign);

  const applyStyle = (property: string, value: string) => {
    if (selectedEl) {
      selectedEl.style[property as any] = value;
    }
  };

  React.useEffect(() => {
    if (selectedEl && align) {
      selectedEl.style.textAlign = align;
    }
  }, [align, selectedEl]);

  useEffect(() => {
    if (!selectedEl) return;
    const currentClasses = selectedEl.className
      .split(" ")
      .filter((c) => c.trim() !== "");
    setClasses(currentClasses);

    const observer = new MutationObserver(() => {
      const updated = selectedEl.className
        .split(" ")
        .filter((c) => c.trim() !== "");
      setClasses(updated);
    });

    observer.observe(selectedEl, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [selectedEl]);

  const removeClass = (cls: string) => {
    const updated = classes.filter((c) => c !== cls);
    setClasses(updated);
    selectedEl.className = updated.join(" ");
  };

  const addClass = () => {
    const trimmed = newClass.trim();
    if (!trimmed) return;
    if (!classes.includes(trimmed)) {
      const updated = [...classes, trimmed];
      setClasses(updated);
      selectedEl.className = updated.join(" ");
    }
    setNewClass("");
  };

  return (
    <div className="w-80 shrink-0 shadow-lg bg-[#0d1117] border-l border-white/[0.06] p-4 space-y-4 overflow-auto h-full rounded-r-2xl">
      <div className="flex items-center justify-between">
        <h2 className="flex gap-2 items-center font-semibold text-foreground text-sm">
          Element Settings
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={clearSelection}
          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.06]"
        >
          <X size={16} />
        </Button>
      </div>

      {/* Font Size + Text Color */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground">Font Size</label>
          <Select
            defaultValue={selectedEl?.style?.fontSize || "24px"}
            onValueChange={(value) => applyStyle("fontSize", value)}
          >
            <SelectTrigger className="w-full mt-1 h-8 bg-white/[0.04] border-white/[0.08] text-foreground text-xs">
              <SelectValue placeholder="Select Size" />
            </SelectTrigger>
            <SelectContent className="bg-[#161b22] border-white/[0.08]">
              {Array.from({ length: 53 }, (_, index) => (
                <SelectItem value={`${index + 12}px`} key={index} className="text-foreground text-xs focus:bg-primary/15 focus:text-primary">
                  {index + 12} px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block">Color</label>
          <input
            type="color"
            className="w-9 h-9 rounded-lg mt-1 cursor-pointer border border-white/[0.08] bg-transparent"
            value={selectedEl?.style?.color || "#ffffff"}
            onChange={(e) => applyStyle("color", e.target.value)}
          />
        </div>
      </div>

      {/* Text Alignment */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Alignment</label>
        <ToggleGroup
          type="single"
          value={align}
          onValueChange={setAlign}
          className="bg-white/[0.04] rounded-lg p-0.5 inline-flex w-full"
        >
          <ToggleGroupItem value="left" className="p-1.5 rounded hover:bg-white/[0.06] flex-1 text-muted-foreground">
            <AlignLeft size={16} />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" className="p-1.5 rounded hover:bg-white/[0.06] flex-1 text-muted-foreground">
            <AlignCenter size={16} />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" className="p-1.5 rounded hover:bg-white/[0.06] flex-1 text-muted-foreground">
            <AlignRight size={16} />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Background Color + Border Radius */}
      <div className="flex items-center gap-3">
        <div>
          <label className="text-xs text-muted-foreground block">Background</label>
          <input
            type="color"
            className="w-9 h-9 rounded-lg mt-1 cursor-pointer border border-white/[0.08] bg-transparent"
            defaultValue={selectedEl?.style?.backgroundColor || "#1a1a2e"}
            onChange={(e) => applyStyle("backgroundColor", e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-muted-foreground">Border Radius</label>
          <Input
            type="text"
            placeholder="e.g. 8px"
            defaultValue={selectedEl?.style?.borderRadius || ""}
            onChange={(e) => applyStyle("borderRadius", e.target.value)}
            className="mt-1 h-8 bg-white/[0.04] border-white/[0.08] text-foreground text-xs"
          />
        </div>
      </div>

      {/* Padding */}
      <div>
        <label className="text-xs text-muted-foreground">Padding</label>
        <Input
          type="text"
          placeholder="e.g. 10px 15px"
          defaultValue={selectedEl?.style?.padding || ""}
          onChange={(e) => applyStyle("padding", e.target.value)}
          className="mt-1 h-8 bg-white/[0.04] border-white/[0.08] text-foreground text-xs"
        />
      </div>

      {/* Margin */}
      <div>
        <label className="text-xs text-muted-foreground">Margin</label>
        <Input
          type="text"
          placeholder="e.g. 10px 15px"
          defaultValue={selectedEl?.style?.margin || ""}
          onChange={(e) => applyStyle("margin", e.target.value)}
          className="mt-1 h-8 bg-white/[0.04] border-white/[0.08] text-foreground text-xs"
        />
      </div>

      {/* Class Manager */}
      <div>
        <label className="text-xs text-muted-foreground font-medium">Classes</label>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {classes.length > 0 ? (
            classes.map((cls) => (
              <span
                key={cls}
                className="flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-full bg-white/[0.06] border border-white/[0.08] text-muted-foreground"
              >
                {cls}
                <button
                  onClick={() => removeClass(cls)}
                  className="ml-0.5 text-red-400 hover:text-red-300"
                >
                  ×
                </button>
              </span>
            ))
          ) : (
            <span className="text-muted-foreground/40 text-[11px]">No classes</span>
          )}
        </div>
        <div className="flex gap-1.5 mt-2">
          <Input
            value={newClass}
            onChange={(e) => setNewClass(e.target.value)}
            placeholder="Add class..."
            className="h-8 bg-white/[0.04] border-white/[0.08] text-foreground text-xs"
          />
          <Button type="button" onClick={addClass} size="sm" className="h-8 px-3 bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 text-xs">
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ElementSettingsSection;
