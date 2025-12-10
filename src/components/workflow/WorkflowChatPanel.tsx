import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Send, Bot, User, Sparkles, Play, PanelRightClose, PanelRightOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ActiveAgent {
  id: string;
  name: string;
  system: string;
}

interface WorkflowChatPanelProps {
  agentName?: string;
  activeAgent?: ActiveAgent | null;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function WorkflowChatPanel({ agentName, activeAgent, isExpanded, onToggleExpand }: WorkflowChatPanelProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: t("workflow.chatGreeting"),
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // When activeAgent changes, add a system message
  useEffect(() => {
    if (activeAgent) {
      const startMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `🚀 "${activeAgent.name}" Agent를 실행합니다.\n\n시스템: ${activeAgent.system}\n\n무엇을 도와드릴까요?`,
        timestamp: new Date(),
      };
      setMessages([startMessage]);
    }
  }, [activeAgent]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate response
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `"${input}"에 대해 처리하겠습니다. 워크플로우를 실행하거나 수정할 수 있습니다.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 1000);
  };

  const quickActions = [
    t("agentChat.quickActions.status"),
    t("agentChat.quickActions.logs"),
    t("agentChat.quickActions.report"),
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-sidebar">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              {activeAgent ? <Play className="w-5 h-5 text-primary" /> : <Bot className="w-5 h-5 text-primary" />}
            </div>
            <div>
              <h3 className="font-semibold">{activeAgent?.name || agentName || t("workflow.agentChat")}</h3>
              <p className="text-xs text-muted-foreground">
                {activeAgent ? `${activeAgent.system} · 실행 중` : t("common.online")}
              </p>
            </div>
          </div>
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              title={isExpanded ? "접기" : "확장"}
            >
              {isExpanded ? (
                <PanelRightClose className="w-5 h-5 text-muted-foreground" />
              ) : (
                <PanelRightOpen className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3",
              msg.role === "user" ? "flex-row-reverse" : ""
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                msg.role === "user" ? "bg-primary/20" : "bg-secondary"
              )}
            >
              {msg.role === "user" ? (
                <User className="w-4 h-4 text-primary" />
              ) : (
                <Bot className="w-4 h-4 text-primary" />
              )}
            </div>
            <div
              className={cn(
                "max-w-[80%] px-4 py-2.5 rounded-2xl text-sm",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-md"
                  : "bg-chat-assistant rounded-tl-md"
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-center gap-1 px-4 py-2.5 bg-chat-assistant rounded-2xl rounded-tl-md">
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>


      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 p-2 bg-secondary rounded-xl border border-border focus-within:border-primary/50 transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={t("chat.placeholder")}
            className="flex-1 bg-transparent text-sm focus:outline-none px-2"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={cn(
              "p-2 rounded-lg transition-colors",
              input.trim()
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-muted-foreground">
          <Sparkles className="w-3 h-3 text-primary" />
          <span>{t("chat.aiReady")}</span>
        </div>
      </div>
    </div>
  );
}
