import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageSquare, Send, CheckCircle, Clock, Loader2, X, AlertTriangle, Wrench, Database, User, FileText, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProcessingStep {
  id: string;
  step: string;
  status: "pending" | "running" | "completed";
  detail?: string;
}

interface MessageLink {
  label: string;
  agentId: string;
}

interface Message {
  role: "user" | "agent";
  content: string;
  processingSteps?: ProcessingStep[];
  link?: MessageLink;
}

// 현재 처리 중인 요청 정보
type RequestType = "I" | "C" | "D" | "A" | "S";
interface ActiveRequest {
  id: string;
  requestNo: string;
  type: RequestType;
  title: string;
  date: string;
}

interface AgentChatPanelProps {
  agentName: string;
  messages: Message[];
  onSendMessage: (message: string) => void;
  onQuickAction: (action: string) => void;
  quickActions: Array<{ label: string; action: string }>;
  activeRequest?: ActiveRequest | null;
  onCloseRequest?: () => void;
  isPendingApproval?: boolean;
  onApproveRequest?: () => void;
  onRejectRequest?: () => void;
  onNavigateToAgent?: (agentId: string) => void;
  // SOP Agent용 처리 시작 확인 상태
  isPendingProcessStart?: boolean;
  onStartProcess?: () => void;
  onCancelProcess?: () => void;
}

// 요청 타입별 아이콘 및 색상
const requestTypeConfig: Record<RequestType, { icon: React.ReactNode; label: string; color: string }> = {
  "I": { icon: <AlertTriangle className="w-4 h-4" />, label: "인시던트", color: "text-destructive" },
  "C": { icon: <Wrench className="w-4 h-4" />, label: "개선", color: "text-amber-500" },
  "D": { icon: <Database className="w-4 h-4" />, label: "데이터", color: "text-emerald-500" },
  "A": { icon: <User className="w-4 h-4" />, label: "계정/권한", color: "text-blue-500" },
  "S": { icon: <FileText className="w-4 h-4" />, label: "단순", color: "text-muted-foreground" },
};

export function AgentChatPanel({ 
  agentName, 
  messages, 
  onSendMessage, 
  onQuickAction,
  quickActions,
  activeRequest,
  onCloseRequest,
  isPendingApproval,
  onApproveRequest,
  onRejectRequest,
  onNavigateToAgent,
  isPendingProcessStart,
  onStartProcess,
  onCancelProcess
}: AgentChatPanelProps) {
  const { t } = useTranslation();
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
          {agentName} {t("agentChat.conversation")}
        </h3>
      </div>

      {/* 현재 처리 중인 요청 제목 영역 */}
      {activeRequest && (
        <div className="px-4 py-3 border-b border-border bg-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className={cn("flex-shrink-0", requestTypeConfig[activeRequest.type].color)}>
                {requestTypeConfig[activeRequest.type].icon}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{activeRequest.title}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-primary/80 font-mono">{activeRequest.requestNo}</span>
                  <span className="text-xs text-muted-foreground">{activeRequest.date}</span>
                </div>
              </div>
            </div>
            {onCloseRequest && (
              <button
                onClick={onCloseRequest}
                className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
      
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
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              
              {/* Agent 이동 링크 */}
              {msg.link && onNavigateToAgent && (
                <button
                  onClick={() => onNavigateToAgent(msg.link!.agentId)}
                  className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm font-medium border border-primary/30"
                >
                  <ArrowRight className="w-4 h-4" />
                  {msg.link.label}
                </button>
              )}
            </div>
            
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

      {/* 승인 대기 상태일 때 접수/반려 버튼 표시 */}
      {isPendingApproval && activeRequest && (
        <div className="p-3 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground mb-2 text-center">
            요청을 접수하시겠습니까?
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={onApproveRequest}
              className="px-4 py-1.5 rounded-md bg-status-online/20 text-status-online text-sm font-medium hover:bg-status-online/30 transition-colors flex items-center gap-1.5 border border-status-online/30"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              접수
            </button>
            <button
              onClick={onRejectRequest}
              className="px-4 py-1.5 rounded-md bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors flex items-center gap-1.5 border border-destructive/20"
            >
              <X className="w-3.5 h-3.5" />
              반려
            </button>
          </div>
        </div>
      )}

      {/* SOP Agent 처리 시작 확인 상태일 때 처리/취소 버튼 표시 */}
      {isPendingProcessStart && activeRequest && (
        <div className="p-3 border-t border-border bg-primary/5">
          <p className="text-xs text-muted-foreground mb-2 text-center">
            해당 인시던트를 처리하시겠습니까?
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={onStartProcess}
              className="px-4 py-1.5 rounded-md bg-primary/20 text-primary text-sm font-medium hover:bg-primary/30 transition-colors flex items-center gap-1.5 border border-primary/30"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              처리
            </button>
            <button
              onClick={onCancelProcess}
              className="px-4 py-1.5 rounded-md bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors flex items-center gap-1.5 border border-border"
            >
              <X className="w-3.5 h-3.5" />
              취소
            </button>
          </div>
        </div>
      )}

      {/* 일반 상태일 때 퀵 액션 표시 */}
      {!isPendingApproval && !isPendingProcessStart && (
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
      )}

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder={t("agentChat.placeholder")}
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
