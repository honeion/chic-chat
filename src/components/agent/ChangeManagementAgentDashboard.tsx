import { useState } from "react";
import { useTranslation } from "react-i18next";
import { GitBranch, Calendar, CheckCircle, Clock, AlertTriangle, Users, Shield, ChevronDown, ChevronUp, Ticket, Database, Wrench, User, FileText, Play } from "lucide-react";
import { cn } from "@/lib/utils";

// 요청 타입 정의 (ITS와 동일)
type RequestType = "I" | "C" | "D" | "A" | "S";

interface RoutedRequest {
  id: string;
  requestNo: string;
  type: RequestType;
  title: string;
  date: string;
  sourceAgent: string;
}

interface ChangeRequest {
  id: string;
  title: string;
  type: "planned" | "emergency" | "standard";
  status: "pending" | "approved" | "in-progress" | "completed" | "rejected";
  requester: string;
  scheduledDate: string;
  risk: "high" | "medium" | "low";
  requestNo?: string;
  requestType?: RequestType;
  sourceAgent?: string;
}

interface ChatSession {
  id: string;
  request: {
    id: string;
    requestNo: string;
    type: RequestType;
    title: string;
    date: string;
  };
  messages: any[];
  status: "pending-approval" | "pending-process-start" | "in-progress" | "completed" | "rejected";
  createdAt: string;
}

interface ChangeManagementAgentDashboardProps {
  routedRequests?: RoutedRequest[];
  onStartChat?: (request: ChangeRequest) => void;
  chatSessions?: ChatSession[];
  onSelectSession?: (sessionId: string) => void;
  activeSessionId?: string | null;
}

const mockChangeRequests: ChangeRequest[] = [
  { id: "cr1", title: "DB Schema Change", type: "planned", status: "approved", requester: "Dev Kim", scheduledDate: "12/10 02:00", risk: "high" },
  { id: "cr2", title: "Security Patch", type: "emergency", status: "in-progress", requester: "Sec Park", scheduledDate: "In Progress", risk: "medium" },
  { id: "cr3", title: "API Version Upgrade", type: "planned", status: "pending", requester: "Backend Lee", scheduledDate: "12/15 03:00", risk: "medium" },
  { id: "cr4", title: "Server Scaling", type: "standard", status: "completed", requester: "Infra Choi", scheduledDate: "Done", risk: "low" },
];

// 요청 타입별 아이콘 및 색상
const requestTypeConfig: Record<RequestType, { icon: React.ReactNode; label: string; color: string }> = {
  "I": { icon: <AlertTriangle className="w-4 h-4" />, label: "인시던트", color: "text-destructive" },
  "C": { icon: <Wrench className="w-4 h-4" />, label: "개선", color: "text-amber-500" },
  "D": { icon: <Database className="w-4 h-4" />, label: "데이터", color: "text-emerald-500" },
  "A": { icon: <User className="w-4 h-4" />, label: "계정/권한", color: "text-blue-500" },
  "S": { icon: <FileText className="w-4 h-4" />, label: "단순", color: "text-muted-foreground" },
};

export function ChangeManagementAgentDashboard({ 
  routedRequests = [],
  onStartChat,
  chatSessions = [],
  onSelectSession,
  activeSessionId
}: ChangeManagementAgentDashboardProps) {
  const { t } = useTranslation();
  const [isCompletedCollapsed, setIsCompletedCollapsed] = useState(true);
  
  // 변경관리 Agent에 해당하는 채팅 세션만 필터링 (type: C)
  const changeChatSessions = chatSessions.filter(s => s.request.type === "C");

  // 라우팅된 요청을 ChangeRequest로 변환
  const routedChangeRequests: ChangeRequest[] = routedRequests.map(req => ({
    id: req.id,
    title: req.title,
    type: "planned" as const,
    status: "pending" as const,
    requester: req.sourceAgent,
    scheduledDate: req.date,
    risk: "medium" as const,
    requestNo: req.requestNo,
    requestType: req.type,
    sourceAgent: req.sourceAgent,
  }));

  const allChangeRequests = [...routedChangeRequests, ...mockChangeRequests];

  const getTypeStyle = (type: ChangeRequest["type"]) => {
    switch (type) {
      case "emergency": return "bg-destructive/20 text-destructive";
      case "planned": return "bg-primary/20 text-primary";
      case "standard": return "bg-muted text-muted-foreground";
    }
  };

  const getTypeLabel = (type: ChangeRequest["type"]) => {
    switch (type) {
      case "emergency": return t("change.emergency");
      case "planned": return t("change.planned");
      case "standard": return t("change.standard");
    }
  };

  const getRiskStyle = (risk: ChangeRequest["risk"]) => {
    switch (risk) {
      case "high": return "text-destructive";
      case "medium": return "text-status-busy";
      case "low": return "text-status-online";
    }
  };

  const getRiskLabel = (risk: ChangeRequest["risk"]) => {
    switch (risk) {
      case "high": return t("change.highRisk");
      case "medium": return t("change.mediumRisk");
      case "low": return t("change.lowRisk");
    }
  };

  const pendingRequests = allChangeRequests.filter(cr => cr.status === "pending" || cr.status === "approved");
  const inProgressRequests = allChangeRequests.filter(cr => cr.status === "in-progress");
  const completedRequests = allChangeRequests.filter(cr => cr.status === "completed" || cr.status === "rejected");

  // ITS 스타일 ChangeRequest 아이템 렌더링 컴포넌트
  const ChangeRequestListItem = ({ request, showPlay = false }: { request: ChangeRequest; showPlay?: boolean }) => {
    const config = request.requestType ? requestTypeConfig[request.requestType] : null;
    
    return (
      <div className="p-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
        <div className="flex items-center gap-2 mb-1">
          {config ? (
            <span className={cn("flex-shrink-0", config.color)} title={config.label}>
              {config.icon}
            </span>
          ) : (
            <GitBranch className={cn("w-4 h-4 flex-shrink-0", getRiskStyle(request.risk))} />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground truncate">{request.title}</p>
            {request.requestNo ? (
              <p className="text-xs text-primary/80 font-mono">{request.requestNo}</p>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {request.requester}
                </span>
              </div>
            )}
          </div>
          <span className={cn("px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0", getTypeStyle(request.type))}>
            {getTypeLabel(request.type)}
          </span>
          <span className="text-xs text-muted-foreground flex-shrink-0">{request.scheduledDate}</span>
          {showPlay && onStartChat && (
            <button
              onClick={() => onStartChat(request)}
              className="p-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors flex-shrink-0"
              title="처리 시작"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {request.sourceAgent && (
          <p className="text-xs text-muted-foreground ml-6">📌 {request.sourceAgent}에서 전달됨</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* 접수현황 - ITS 스타일 */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-base font-semibold flex items-center gap-2 text-foreground mb-4">
          <Ticket className="w-5 h-5 text-primary" />
          {t("change.changeStatus")}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {/* 접수 */}
          <div className="rounded-lg overflow-hidden border border-destructive/30">
            <div className="px-4 py-2 bg-destructive/20 flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium text-foreground">{t("common.received")}</span>
            </div>
            <div className="p-3 bg-background flex items-center justify-center border-b border-border/50">
              <p className="text-2xl font-bold text-foreground">{pendingRequests.length}</p>
            </div>
            <div className="p-2 bg-background/50 space-y-1.5 max-h-[280px] overflow-y-auto">
              {pendingRequests.length > 0 ? (
                pendingRequests.map(request => (
                  <ChangeRequestListItem key={request.id} request={request} showPlay={true} />
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">변경 요청 없음</p>
              )}
            </div>
          </div>

          {/* 처리중 */}
          <div className="rounded-lg overflow-hidden border border-status-busy/30">
            <div className="px-4 py-2 bg-status-busy/20 flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-status-busy" />
              <span className="text-sm font-medium text-foreground">{t("common.processingStatus")}</span>
            </div>
            <div className="p-3 bg-background flex items-center justify-center border-b border-border/50">
              <p className="text-2xl font-bold text-foreground">{inProgressRequests.length}</p>
            </div>
            <div className="p-2 bg-background/50 space-y-1.5 max-h-[280px] overflow-y-auto">
              {inProgressRequests.length > 0 ? (
                inProgressRequests.map(request => (
                  <ChangeRequestListItem key={request.id} request={request} />
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">변경 요청 없음</p>
              )}
            </div>
          </div>
        </div>

        {/* 완료 - 접기 가능 */}
        <div className="mt-4 rounded-lg overflow-hidden border border-status-online/30">
          <button
            onClick={() => setIsCompletedCollapsed(!isCompletedCollapsed)}
            className="w-full px-4 py-2 bg-status-online/20 flex items-center justify-between hover:bg-status-online/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-status-online" />
              <span className="text-sm font-medium text-foreground">{t("common.completed")}</span>
              <span className="text-sm font-bold text-foreground ml-2">{completedRequests.length}</span>
            </div>
            {isCompletedCollapsed ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          {!isCompletedCollapsed && (
            <div className="p-2 bg-background/50 space-y-1.5 max-h-[200px] overflow-y-auto">
              {completedRequests.length > 0 ? (
                completedRequests.map(request => (
                  <ChangeRequestListItem key={request.id} request={request} />
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">변경 요청 없음</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 처리 Chat 이력 */}
      <div className="rounded-xl overflow-hidden border border-primary/30">
        <div className="px-4 py-3 bg-primary/20 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">{t("common.chatHistory")}</span>
          <span className="text-xs text-muted-foreground ml-auto">{changeChatSessions.length}건</span>
        </div>
        <div className="bg-background/80 divide-y divide-border/30 max-h-[300px] overflow-y-auto">
          {changeChatSessions.length > 0 ? (
            changeChatSessions.map(session => {
              const config = requestTypeConfig[session.request.type];
              const isActive = session.id === activeSessionId;
              return (
                <button
                  key={session.id}
                  onClick={() => onSelectSession?.(session.id)}
                  className={cn(
                    "w-full p-3 flex items-center gap-3 hover:bg-background transition-colors text-left",
                    isActive && "bg-primary/10"
                  )}
                >
                  <span className={cn("flex-shrink-0", config.color)}>
                    {config.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{session.request.title}</p>
                    <p className="text-xs text-muted-foreground">{session.request.requestNo}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-xs",
                      session.status === "completed" ? "bg-status-online/20 text-status-online" :
                      session.status === "in-progress" ? "bg-status-busy/20 text-status-busy" :
                      session.status === "rejected" ? "bg-destructive/20 text-destructive" :
                      "bg-primary/20 text-primary"
                    )}>
                      {session.status === "completed" ? t("common.completed") :
                       session.status === "in-progress" ? t("common.processingStatus") :
                       session.status === "rejected" ? t("common.rejected") :
                       t("common.pending")}
                    </span>
                    <span className="text-xs text-muted-foreground">{session.request.date}</span>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              처리 이력이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}