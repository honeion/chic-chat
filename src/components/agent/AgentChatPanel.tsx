import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageSquare, Send, CheckCircle, Clock, Loader2, X, AlertTriangle, Wrench, Database, User, FileText, ArrowRight, ExternalLink, PanelRightClose, PanelRightOpen } from "lucide-react";
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
  system?: string;
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
  // 모니터링 Agent용 결과 확인 상태
  isPendingMonitoringResult?: boolean;
  onRegisterDetection?: () => void;
  onCompleteNormal?: () => void;
  // 모니터링 감지 → SOP/직접처리 선택 상태
  isPendingDetectionAction?: boolean;
  onRouteToSOP?: () => void;
  onDirectProcess?: () => void;
  // 직접 처리 완료 대기 상태
  isPendingDirectComplete?: boolean;
  onDirectProcessComplete?: () => void;
  // SOP Agent 처리 완료 후 장애보고서 작성 여부 확인 상태
  isPendingReportConfirm?: boolean;
  onCreateReport?: () => void;
  onSkipReport?: () => void;
  // 보고서 Agent 장애보고서 작성 시작 대기 상태
  isPendingReportStart?: boolean;
  onStartReportWriting?: () => void;
  // 보고서 Agent 추가의견/재작성/완료 선택 상태
  isPendingReportReview?: boolean;
  onRewriteReport?: () => void;
  onCompleteReport?: () => void;
  // 보고서 완료 후 장애지식RAG 저장 여부 확인 상태
  isPendingKnowledgeSave?: boolean;
  onSaveToKnowledge?: () => void;
  onSkipKnowledgeSave?: () => void;
  // ITS Agent 이동 여부 확인 상태
  isPendingITSNavigate?: boolean;
  onNavigateToITS?: () => void;
  onSkipITSNavigate?: () => void;
  // ITS 완료 처리 확인 상태 (ITS Agent에서)
  isPendingITSComplete?: boolean;
  onCompleteITS?: () => void;
  onSkipITSComplete?: () => void;
  // Biz.Support Agent → ITS 요청 등록 상태
  isBizSupportSession?: boolean;
  isPendingITSTypeSelection?: boolean;
  isPendingITSConfirm?: boolean;
  pendingITSType?: "I" | "C" | "D" | "A" | "S";
  itsPreviewContent?: string;
  onStartITSRegistration?: () => void;
  onSelectITSType?: (type: "I" | "C" | "D" | "A" | "S") => void;
  onConfirmITSRequest?: () => void;
  onCancelITSRegistration?: () => void;
  // Chat panel expansion
  isExpanded?: boolean;
  onToggleExpand?: () => void;
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
  onCancelProcess,
  isPendingMonitoringResult,
  onRegisterDetection,
  onCompleteNormal,
  isPendingDetectionAction,
  onRouteToSOP,
  onDirectProcess,
  isPendingDirectComplete,
  onDirectProcessComplete,
  isPendingReportConfirm,
  onCreateReport,
  onSkipReport,
  isPendingReportStart,
  onStartReportWriting,
  isPendingReportReview,
  onRewriteReport,
  onCompleteReport,
  isPendingKnowledgeSave,
  onSaveToKnowledge,
  onSkipKnowledgeSave,
  isPendingITSNavigate,
  onNavigateToITS,
  onSkipITSNavigate,
  isPendingITSComplete,
  onCompleteITS,
  onSkipITSComplete,
  isBizSupportSession,
  isPendingITSTypeSelection,
  isPendingITSConfirm,
  pendingITSType,
  itsPreviewContent,
  onStartITSRegistration,
  onSelectITSType,
  onConfirmITSRequest,
  onCancelITSRegistration,
  isExpanded,
  onToggleExpand
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
    <div className="flex-1 flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {agentName} {t("agentChat.conversation")}
          </h3>
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
                  {activeRequest.system && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{activeRequest.system}</span>
                  )}
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

      {/* 모니터링 결과 확인 상태일 때 비정상감지 등록/정상완료 버튼 표시 */}
      {isPendingMonitoringResult && activeRequest && (
        <div className="p-3 border-t border-border bg-amber-500/5">
          <p className="text-xs text-muted-foreground mb-2 text-center">
            모니터링 결과를 어떻게 처리하시겠습니까?
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={onRegisterDetection}
              className="px-4 py-1.5 rounded-md bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors flex items-center gap-1.5 border border-destructive/20"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              비정상감지 등록
            </button>
            <button
              onClick={onCompleteNormal}
              className="px-4 py-1.5 rounded-md bg-status-online/20 text-status-online text-sm font-medium hover:bg-status-online/30 transition-colors flex items-center gap-1.5 border border-status-online/30"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              정상완료
            </button>
          </div>
        </div>
      )}

      {/* 감지 항목 SOP/직접처리 선택 상태일 때 버튼 표시 */}
      {isPendingDetectionAction && activeRequest && (
        <div className="p-3 border-t border-border bg-primary/5">
          <p className="text-xs text-muted-foreground mb-2 text-center">
            처리 방식을 선택해 주세요
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={onRouteToSOP}
              className="px-4 py-1.5 rounded-md bg-primary/20 text-primary text-sm font-medium hover:bg-primary/30 transition-colors flex items-center gap-1.5 border border-primary/30"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              SOP 처리
            </button>
            <button
              onClick={onDirectProcess}
              className="px-4 py-1.5 rounded-md bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors flex items-center gap-1.5 border border-border"
            >
              <Wrench className="w-3.5 h-3.5" />
              직접 처리
            </button>
          </div>
        </div>
      )}

      {/* 직접 처리 완료 대기 상태일 때 버튼 표시 */}
      {isPendingDirectComplete && activeRequest && (
        <div className="p-3 border-t border-border bg-status-online/5">
          <p className="text-xs text-muted-foreground mb-2 text-center">
            처리가 완료되면 아래 버튼을 눌러주세요
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={onDirectProcessComplete}
              className="px-4 py-1.5 rounded-md bg-status-online/20 text-status-online text-sm font-medium hover:bg-status-online/30 transition-colors flex items-center gap-1.5 border border-status-online/30"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              처리 완료
            </button>
          </div>
        </div>
      )}

      {/* SOP Agent 처리 완료 후 장애보고서 작성 여부 확인 */}
      {isPendingReportConfirm && activeRequest && (
        <div className="p-3 border-t border-border bg-amber-500/5">
          <p className="text-xs text-muted-foreground mb-2 text-center">
            장애보고서를 작성하시겠습니까?
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={onCreateReport}
              className="px-4 py-1.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 text-sm font-medium hover:bg-amber-500/30 transition-colors flex items-center gap-1.5 border border-amber-500/30"
            >
              <FileText className="w-3.5 h-3.5" />
              작성하기
            </button>
            <button
              onClick={onSkipReport}
              className="px-4 py-1.5 rounded-md bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors flex items-center gap-1.5 border border-border"
            >
              <X className="w-3.5 h-3.5" />
              건너뛰기
            </button>
          </div>
        </div>
      )}

      {/* 보고서 Agent 장애보고서 작성 시작 대기 */}
      {isPendingReportStart && activeRequest && (
        <div className="p-3 border-t border-border bg-primary/5">
          <p className="text-xs text-muted-foreground mb-2 text-center">
            장애보고서 작성을 시작하시겠습니까?
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={onStartReportWriting}
              className="px-4 py-1.5 rounded-md bg-primary/20 text-primary text-sm font-medium hover:bg-primary/30 transition-colors flex items-center gap-1.5 border border-primary/30"
            >
              <FileText className="w-3.5 h-3.5" />
              작성시작
            </button>
          </div>
        </div>
      )}

      {/* 보고서 추가의견/재작성/완료 선택 */}
      {isPendingReportReview && activeRequest && (
        <div className="p-3 border-t border-border bg-primary/5">
          <p className="text-xs text-muted-foreground mb-2 text-center">
            보고서를 검토해 주세요. 추가 의견 반영 후 재작성 또는 완료를 선택하세요.
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={onRewriteReport}
              className="px-4 py-1.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 text-sm font-medium hover:bg-amber-500/30 transition-colors flex items-center gap-1.5 border border-amber-500/30"
            >
              <Wrench className="w-3.5 h-3.5" />
              추가의견 반영 재작성
            </button>
            <button
              onClick={onCompleteReport}
              className="px-4 py-1.5 rounded-md bg-status-online/20 text-status-online text-sm font-medium hover:bg-status-online/30 transition-colors flex items-center gap-1.5 border border-status-online/30"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              완료
            </button>
          </div>
        </div>
      )}

      {/* 장애지식RAG 저장 여부 확인 */}
      {isPendingKnowledgeSave && activeRequest && (
        <div className="p-3 border-t border-border bg-emerald-500/5">
          <p className="text-xs text-muted-foreground mb-2 text-center">
            장애지식 RAG에 저장하시겠습니까?
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={onSaveToKnowledge}
              className="px-4 py-1.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-colors flex items-center gap-1.5 border border-emerald-500/30"
            >
              <Database className="w-3.5 h-3.5" />
              저장하기
            </button>
            <button
              onClick={onSkipKnowledgeSave}
              className="px-4 py-1.5 rounded-md bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors flex items-center gap-1.5 border border-border"
            >
              <X className="w-3.5 h-3.5" />
              건너뛰기
            </button>
          </div>
        </div>
      )}

      {/* ITS Agent 이동 여부 확인 */}
      {isPendingITSNavigate && activeRequest && (
        <div className="p-3 border-t border-border bg-blue-500/5">
          <p className="text-xs text-muted-foreground mb-2 text-center">
            ITS Agent로 이동하여 원본 요청 건을 완료 처리하시겠습니까?
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={onNavigateToITS}
              className="px-4 py-1.5 rounded-md bg-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-500/30 transition-colors flex items-center gap-1.5 border border-blue-500/30"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              ITS Agent로 이동
            </button>
            <button
              onClick={onSkipITSNavigate}
              className="px-4 py-1.5 rounded-md bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors flex items-center gap-1.5 border border-border"
            >
              <X className="w-3.5 h-3.5" />
              건너뛰기
            </button>
          </div>
        </div>
      )}

      {/* ITS 완료 처리 확인 (ITS Agent에서) */}
      {isPendingITSComplete && activeRequest && (
        <div className="p-3 border-t border-border bg-emerald-500/5">
          <p className="text-xs text-muted-foreground mb-2 text-center">
            원본 ITS 요청 건의 완료 처리를 진행하시겠습니까?
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={onCompleteITS}
              className="px-4 py-1.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-colors flex items-center gap-1.5 border border-emerald-500/30"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              완료 처리
            </button>
            <button
              onClick={onSkipITSComplete}
              className="px-4 py-1.5 rounded-md bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors flex items-center gap-1.5 border border-border"
            >
              <X className="w-3.5 h-3.5" />
              건너뛰기
            </button>
          </div>
        </div>
      )}

      {/* Biz.Support Agent ITS 요청 유형 선택 */}
      {isPendingITSTypeSelection && (
        <div className="p-3 border-t border-border bg-blue-500/5">
          <p className="text-xs text-muted-foreground mb-3 text-center">
            ITS 요청 유형을 선택해 주세요
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSelectITSType?.("I")}
              className="px-3 py-2 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition-colors flex items-center gap-1.5 border border-destructive/20"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              인시던트
            </button>
            <button
              onClick={() => onSelectITSType?.("C")}
              className="px-3 py-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-colors flex items-center gap-1.5 border border-amber-500/20"
            >
              <Wrench className="w-3.5 h-3.5" />
              개선 요청
            </button>
            <button
              onClick={() => onSelectITSType?.("D")}
              className="px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5 border border-emerald-500/20"
            >
              <Database className="w-3.5 h-3.5" />
              데이터 요청
            </button>
            <button
              onClick={() => onSelectITSType?.("A")}
              className="px-3 py-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-colors flex items-center gap-1.5 border border-blue-500/20"
            >
              <User className="w-3.5 h-3.5" />
              계정/권한
            </button>
          </div>
          <button
            onClick={() => onSelectITSType?.("S")}
            className="w-full mt-2 px-3 py-2 rounded-lg bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 transition-colors flex items-center justify-center gap-1.5 border border-border"
          >
            <FileText className="w-3.5 h-3.5" />
            단순 요청
          </button>
          <button
            onClick={onCancelITSRegistration}
            className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            취소
          </button>
        </div>
      )}

      {/* Biz.Support Agent ITS 요청 미리보기 및 확인 */}
      {isPendingITSConfirm && pendingITSType && (
        <div className="p-3 border-t border-border bg-blue-500/5">
          <p className="text-xs font-medium text-foreground mb-2 text-center">
            📋 ITS 요청 내용 확인
          </p>
          <div className="p-3 rounded-lg bg-background border border-border text-xs mb-3 max-h-40 overflow-y-auto">
            <div className="mb-2">
              <span className="text-muted-foreground">요청 유형: </span>
              <span className="font-medium">
                {pendingITSType === "I" && "인시던트"}
                {pendingITSType === "C" && "개선 요청"}
                {pendingITSType === "D" && "데이터 요청"}
                {pendingITSType === "A" && "계정/권한"}
                {pendingITSType === "S" && "단순 요청"}
              </span>
            </div>
            {itsPreviewContent && (
              <div>
                <span className="text-muted-foreground">요청 내용:</span>
                <p className="mt-1 whitespace-pre-wrap text-foreground">{itsPreviewContent}</p>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-3 text-center">
            위 내용으로 ITS 요청을 등록하시겠습니까?
          </p>
          <div className="flex gap-2">
            <button
              onClick={onConfirmITSRequest}
              className="flex-1 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2 border border-blue-500/30"
            >
              <CheckCircle className="w-4 h-4" />
              등록하기
            </button>
            <button
              onClick={onCancelITSRegistration}
              className="flex-1 px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors flex items-center justify-center gap-2 border border-border"
            >
              <X className="w-4 h-4" />
              취소
            </button>
          </div>
        </div>
      )}

      {/* Biz.Support Agent ITS 요청 등록 버튼 */}
      {isBizSupportSession && !isPendingITSTypeSelection && !isPendingITSConfirm && onStartITSRegistration && (
        <div className="px-4 py-2 border-t border-border bg-blue-500/5">
          <button
            onClick={onStartITSRegistration}
            className="w-full px-4 py-2 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2 border border-blue-500/30"
          >
            <ExternalLink className="w-4 h-4" />
            ITS 요청 등록하기
          </button>
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
