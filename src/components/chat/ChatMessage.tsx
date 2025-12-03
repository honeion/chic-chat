import { cn } from "@/lib/utils";
import { Bot, User, Copy, ThumbsUp, ThumbsDown } from "lucide-react";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  isLast?: boolean;
}

export function ChatMessage({ message, isLast }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center py-2 animate-fade-in">
        <span className="px-3 py-1.5 bg-chat-system rounded-full text-xs text-muted-foreground">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex gap-3 py-4 px-4 animate-slide-up",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-primary"
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Bubble */}
      <div
        className={cn(
          "max-w-[75%] space-y-2",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "px-4 py-3 rounded-2xl",
            isUser
              ? "bg-chat-user text-foreground rounded-tr-md"
              : "bg-chat-assistant text-foreground rounded-tl-md"
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>

        {/* Actions & Time */}
        <div
          className={cn(
            "flex items-center gap-2 px-1",
            isUser ? "flex-row-reverse" : "flex-row"
          )}
        >
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {!isUser && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1 rounded hover:bg-secondary transition-colors">
                <Copy className="w-3 h-3 text-muted-foreground" />
              </button>
              <button className="p-1 rounded hover:bg-secondary transition-colors">
                <ThumbsUp className="w-3 h-3 text-muted-foreground" />
              </button>
              <button className="p-1 rounded hover:bg-secondary transition-colors">
                <ThumbsDown className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
