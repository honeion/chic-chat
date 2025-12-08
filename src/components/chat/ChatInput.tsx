import { useState, useRef, KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { Send, Paperclip, Mic, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolSelector } from "./ToolSelector";
import { SystemSelector } from "./SystemSelector";
import { InstructionSelector } from "./InstructionSelector";
import { KnowledgeRAGSelector } from "./KnowledgeRAGSelector";
import { KnowledgeGraphSelector } from "./KnowledgeGraphSelector";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  showToolSelector?: boolean;
  showQuickActions?: boolean;
}

export function ChatInput({ onSend, disabled, showToolSelector = false, showQuickActions = false }: ChatInputProps) {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  const quickActions = [
    t("chat.quickActions.summarize"),
    t("chat.quickActions.writeCode"),
    t("chat.quickActions.translate"),
    t("chat.quickActions.analyze"),
  ];

  return (
    <div className="p-4 border-t border-border bg-background/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto">
        {/* Selectors - for Assistant */}
        {showToolSelector && (
          <div className="mb-3 flex items-center gap-2 flex-wrap">
            <SystemSelector />
            <InstructionSelector />
            <ToolSelector />
            <KnowledgeRAGSelector />
            <KnowledgeGraphSelector />
          </div>
        )}

        {/* Quick Actions */}
        {showQuickActions && (
          <div className="flex items-center gap-2 mb-3">
            {quickActions.map((action) => (
              <button
                key={action}
                onClick={() => setMessage(action)}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground hover:bg-primary/20 hover:text-primary transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="relative flex items-end gap-2 p-2 bg-secondary rounded-2xl border border-border focus-within:border-primary/50 focus-within:shadow-glow transition-all">
          {/* Attachment Button */}
          <button className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder={t("chat.placeholder")}
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent resize-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none py-2 max-h-[150px]"
          />

          {/* Voice Button */}
          <button className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Mic className="w-5 h-5" />
          </button>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            className={cn(
              "p-2.5 rounded-xl transition-all duration-200",
              message.trim()
                ? "gradient-primary text-primary-foreground shadow-glow animate-pulse-glow"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-muted-foreground">
          <Sparkles className="w-3 h-3 text-primary" />
          <span>{t("chat.aiReady")}</span>
        </div>
      </div>
    </div>
  );
}
