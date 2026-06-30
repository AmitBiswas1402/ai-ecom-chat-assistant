"use client";
import { Button } from "@/components/ui/button";
import { Messages } from "../[projectId]/page";
import { ArrowUp, Bot, Link2, Loader2, User, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = {
  messages: Messages[] | any;
  onSend: (message: string) => void;
  loading: boolean;
  image?: string;
};

const SUGGESTIONS = [
  "Create a modern landing page",
  "Build a pricing section",
  "Design a hero with gradient",
];

const ChatSection = ({ messages, onSend, loading }: Props) => {
  const [input, setInput] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const inputIsUrl = (() => {
    try {
      const trimmed = input.trim();
      if (!/^https?:\/\//i.test(trimmed)) return false;
      new URL(trimmed);
      return true;
    } catch {
      return false;
    }
  })();

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const safeMessages: Messages[] = Array.isArray(messages) ? messages : [];

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-background border-r border-border/30">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-border/30 bg-card/30 backdrop-blur-sm flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/25 flex items-center justify-center shadow-sm shadow-primary/10">
          <Bot className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-foreground">AI Assistant</p>
          <p className="text-[10px] text-muted-foreground/60">Describe, iterate, refine</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-400/80 font-medium">Online</span>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 flex flex-col scrollbar-thin scrollbar-thumb-border/40">
        {safeMessages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10">
              <Sparkles className="w-6 h-6 text-primary/70" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground/80">Ready to create</p>
              <p className="text-xs text-muted-foreground/50 mt-1.5 max-w-[200px] leading-relaxed">
                Describe a layout, paste a URL, or try a suggestion below.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 w-full max-w-[220px]">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(s);
                    onSend(s);
                  }}
                  className="text-left text-xs text-muted-foreground/60 hover:text-primary hover:bg-primary/5 border border-border/30 hover:border-primary/25 rounded-lg px-3 py-2 transition-all duration-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          safeMessages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="shrink-0 w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
              )}
              <div
                className={`py-2.5 px-3.5 max-w-[82%] text-sm leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-md"
                    : "bg-muted/60 text-foreground border border-border/40 rounded-2xl rounded-tl-md"
                }`}
              >
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="uploaded"
                    className="rounded-lg max-w-[160px] max-h-[160px] object-cover mb-2"
                  />
                )}
                {msg.content && (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
              {msg.role === "user" && (
                <div className="shrink-0 w-7 h-7 rounded-lg bg-foreground/10 border border-border/40 flex items-center justify-center mt-0.5">
                  <User className="w-3.5 h-3.5 text-foreground/70" />
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="flex gap-2.5 justify-start">
            <div className="shrink-0 w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center mt-0.5">
              <Bot className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="bg-muted/60 border border-border/40 rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-2.5">
              <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
              <span className="text-xs text-muted-foreground font-medium">Generating...</span>
              <span className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1 h-1 rounded-full bg-primary/60 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Footer */}
      <div className="shrink-0 p-3 border-t border-border/30 bg-card/20 backdrop-blur-md">
        <div className="input-card-glow w-full border border-border/50 bg-card/60 backdrop-blur-md rounded-2xl p-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe changes or paste a URL..."
            className="w-full min-h-[56px] resize-none bg-transparent text-foreground placeholder:text-muted-foreground/40 focus:outline-none text-sm leading-relaxed"
          />
          <div className="flex justify-between items-center mt-1.5 pt-1.5 border-t border-border/20">
            <div className="flex items-center gap-1.5">
              {inputIsUrl && (
                <span className="flex items-center gap-1 text-[11px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full font-medium animate-in fade-in zoom-in-95 duration-200">
                  <Link2 className="w-3 h-3" />
                  URL detected
                </span>
              )}
              {!inputIsUrl && !input.trim() && (
                <span className="text-[10px] text-muted-foreground/40 hidden sm:block">
                  Shift+Enter for newline
                </span>
              )}
            </div>
            <Button
              size="icon"
              className="rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:opacity-90 hover:scale-[1.04] active:scale-[0.97] transition-all h-8 w-8"
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSection;
