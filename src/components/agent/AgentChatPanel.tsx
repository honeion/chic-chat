import { useState } from "react";
import { MessageSquare, Send, CheckCircle, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProcessingStep {
  id: string;
  step: string;
  status: "pending" | "running" | "completed";
  detail?: string;
}

interface Message {
  role: "user" | "agent";
  content: string;
  processingSteps?: ProcessingStep[];
}

interface AgentChatPanelProps {
  agentName: string;
  messages: Message[];
  onSendMessage: (message: string) => void;
  onQuickAction: (action: string) => void;
  quickActions: Array<{ label: string; action: string }>;
}

export function AgentChatPanel({ 
  agentName, 
  messages, 
  onSendMessage, 
  onQuickAction,
  quickActions 
}: AgentChatPanelProps) {
  const [chatInput, setChatInput] = useState("");

  const handleSend = () => {
    if (!chatInput.trim()) return;
    onSendMessage(chatInput);
    setChatInput("");
  };

  const getStepIcon = (status: ProcessingStep["status"]) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-3 h-3 text-status-online" />;
      case "running": return <Loader2 className="w-3 h-3 text-primary animate-spin" />;
      case "pending": return <Clock className="w-3 h-3 text-muted-foreground" />;
    }
  };

  return (
    <div className="w-[30%] min-w-[320px] border-l border-border bg-sidebar flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          {agentName} 대화
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div key={idx} className={cn(
            "max-w-[90%]",
            msg.role === "user" ? "ml-auto" : ""
          )}>
            <div className={cn(
              "p-3 rounded-xl",
              msg.role === "user" 
                ? "bg-primary text-primary-foreground" 
                : "bg-chat-user/50 border border-border/50"
            )}>
              <p className="text-sm">{msg.content}</p>
            </div>
            
            {/* 처리 과정 표시 */}
            {msg.processingSteps && msg.processingSteps.length > 0 && (
              <div className="mt-2 space-y-1 animate-fade-in">
                {msg.processingSteps.map((step, stepIdx) => (
                  <div 
                    key={step.id} 
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg text-xs",
                      "bg-background/80 border border-border/30",
                      step.status === "running" && "border-primary/50 bg-primary/5"
                    )}
                    style={{ animationDelay: `${stepIdx * 100}ms` }}
                  >
                    {getStepIcon(step.status)}
                    <span className={cn(
                      "flex-1",
                      step.status === "completed" && "text-muted-foreground",
                      step.status === "running" && "text-primary font-medium",
                      step.status === "pending" && "text-muted-foreground"
                    )}>
                      {step.step}
                    </span>
                    {step.detail && (
                      <span className="text-muted-foreground">{step.detail}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-border/50">
        <div className="flex flex-wrap gap-2 mb-3">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => onQuickAction(action.action)}
              className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-xs transition-colors"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Agent에게 요청하세요..."
            className="flex-1 px-3 py-2 rounded-lg bg-chat-user/50 border border-border/50 text-sm focus:outline-none focus:border-primary"
          />
          <button 
            onClick={handleSend}
            className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
