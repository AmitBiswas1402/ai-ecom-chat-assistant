"use client";
import { Button } from "@/components/ui/button";
import { Messages } from "../[projectId]/page";
import { ArrowUp, Link2 } from "lucide-react";
import { useState } from "react";

type Props = {
  messages: Messages[] | any;
  onSend: (message: string) => void;
  loading: boolean;
  image?: string;
};

const ChatSection = ({ messages, onSend, loading }: Props) => {
  const [input, setInput] = useState<string>("");

  /** Check if current input is a URL */
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

  const safeMessages: Messages[] = Array.isArray(messages) ? messages : [];

  return (
    <div className="w-96 h-[90vh] shadow p-4 flex flex-col">
      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
        {safeMessages.length === 0 ? (
          <p className="text-gray-400 text-center">No Messages Yet</p>
        ) : (
          safeMessages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-2 rounded-lg max-w-[80%] space-y-2 ${
                  msg.role === "user"
                    ? "bg-gray-100 text-black"
                    : "bg-gray-300 text-black"
                }`}
              >
                {/* IMAGE PREVIEW IF EXISTS */}
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="uploaded"
                    className="rounded-lg max-w-[180px] max-h-[180px] object-cover"
                  />
                )}

                {/* TEXT CONTENT */}
                {msg.content && <p>{msg.content}</p>}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-center items-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-800"></div>
            <span className="ml-2 text-zinc-800">Generating code...</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t space-y-2">
        {inputIsUrl && (
          <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-medium">
            <Link2 className="w-3 h-3" />
            URL detected — will analyze & recreate
          </span>
        )}
        <div className="flex items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your design or paste a website URL..."
            className="flex-1 resize-none border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
          />
          <Button
            size={"icon-lg"}
            className="rounded-full"
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            <ArrowUp />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatSection;
