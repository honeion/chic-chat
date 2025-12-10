import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle, Clock, AlertTriangle, ChevronDown, ChevronUp, Play, Ticket, Database, Wrench, User, FileText, MessageSquare, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatSession } from "@/pages/AgentDetail";

// 요청 타입 정의 (ITS와 동일)
type RequestType = "I" | "C" | "D" | "A" | "S";

// 담당시스템 정의
type SystemType = "all" | "e-총무" | "BiOn" | "SATIS";

const systemOptions: { value: SystemType; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "e-총무", label: "e-총무시스템" },
  { value: "BiOn", label: "BiOn" },
  { value: "SATIS", label: "SATIS" },
];

interface RoutedRequest {
  id: string;
  requestNo: string;
  type: RequestType;
  title: string;
  date: string;
  sourceAgent: string;
  system?: string;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  status: "pending" | "processing" | "approved" | "rejected";
  priority: "high" | "medium" | "low";
  timestamp: string;
  recommendation?: string;
  requestNo?: string;
  type?: RequestType;
  sourceAgent?: string;
  system?: string;
}

interface SOPAgentDashboardProps {
  onApprove: (incidentId: string, incident: Incident) => void;
  onReject: (incidentId: string) => void;
  routedRequests?: RoutedRequest[];
  onStartChat?: (incident: Incident) => void;
  chatSessions?: ChatSession[];
  onSelectSession?: (sessionId: string) => void;
  activeSessionId?: string | null;
}

const mockIncidents: Incident[] = [
  { id: "i1", title: "서버 CPU 과부하 발생", description: "메인 서버의 CPU 사용률이 95%를 초과하여 긴급 조치가 필요합니다. 현재 서비스 응답 지연이 발생하고 있습니다.", status: "pending", priority: "high", timestamp: "10:15", requestNo: "SOP-2024-0001", type: "I" as RequestType, system: "e-총무" },
  { id: "i2", title: "DB 연결 오류 감지", description: "프로덕션 데이터베이스 연결 풀이 고갈되어 일부 트랜잭션이 실패하고 있습니다.", status: "pending", priority: "medium", timestamp: "09:45", requestNo: "SOP-2024-0002", type: "I" as RequestType, system: "BiOn" },
  { id: "i3", title: "메모리 누수 의심", description: "애플리케이션 서버의 메모리 사용량이 지속적으로 증가하고 있어 재시작이 필요할 수 있습니다.", status: "processing", priority: "medium", timestamp: "09:00", requestNo: "SOP-2024-0003", type: "I" as RequestType, system: "SATIS" },
  { id: "i4", title: "네트워크 지연 복구", description: "네트워크 레이턴시가 정상 범위로 복구되었습니다.", status: "approved", priority: "medium", timestamp: "08:30", system: "e-총무" },
];

// 요청 타입별 아이콘 및 색상
const requestTypeConfig: Record<RequestType, { icon: React.ReactNode; label: string; color: string }> = {
  "I": { icon: <AlertTriangle className="w-4 h-4" />, label: "인시던트", color: "text-destructive" },
  "C": { icon: <Wrench className="w-4 h-4" />, label: "개선", color: "text-amber-500" },
  "D": { icon: <Database className="w-4 h-4" />, label: "데이터", color: "text-emerald-500" },
  "A": { icon: <User className="w-4 h-4" />, label: "계정/권한", color: "text-blue-500" },
  "S": { icon: <FileText className="w-4 h-4" />, label: "단순", color: "text-muted-foreground" },
};

export function SOPAgentDashboard({ 
  onApprove, 
  onReject, 
  routedRequests = [],
  onStartChat,
  chatSessions = [],
  onSelectSession,
  activeSessionId
}: SOPAgentDashboardProps) {
  const { t } = useTranslation();
  const [selectedSystem, setSelectedSystem] = useState<SystemType>("all");
  
  // 라우팅된 요청을 인시던트로 변환 - SOP Agent용 chatSessions 상태 기반으로 status 결정
  const routedIncidents: Incident[] = routedRequests.map(req => {
    // SOP Agent에서 생성된 세션만 찾기 (agentType === "sop")
    const sopSession = chatSessions.find(s => 
      s.request.id === req.id && s.agentType === "sop"
    );
    
    let status: Incident["status"] = "pending";
    
    if (sopSession) {
      if (sopSession.status === "in-progress" || sopSession.status === "pending-report-confirm") {
        status = "processing";
      } else if (sopSession.status === "completed") {
        status = "approved";
      } else if (sopSession.status === "rejected") {
        status = "rejected";
      } else if (sopSession.status === "pending-process-start") {
        status = "pending";
      }
    }
    
    return {
      id: req.id,
      title: req.title,
      description: `${req.sourceAgent}에서 전달된 요청`,
      status,
      priority: "high" as const,
      timestamp: req.date,
      requestNo: req.requestNo,
      type: req.type,
      sourceAgent: req.sourceAgent,
      system: req.system,
    };
  });
  
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [isCompletedCollapsed, setIsCompletedCollapsed] = useState(true);
  
  // 모든 인시던트 (라우팅된 것 + 기존 것)
  const allIncidents = [...routedIncidents, ...incidents];

  // 시스템 필터링 함수
  const filterBySystem = (items: Incident[]): Incident[] => {
    if (selectedSystem === "all") return items;
    return items.filter(item => item.system === selectedSystem);
  };

  // 채팅 세션 필터링
  const filterSessionsBySystem = (sessions: ChatSession[]): ChatSession[] => {
    if (selectedSystem === "all") return sessions.filter(s => s.request.type === "I");
    return sessions.filter(s => {
      if (s.request.type !== "I") return false;
      const matchingIncident = allIncidents.find(i => i.id === s.request.id);
      return matchingIncident?.system === selectedSystem;
    });
  };

  const filteredIncidents = filterBySystem(allIncidents);

  const handleApprove = (incidentId: string) => {
    const incident = allIncidents.find(i => i.id === incidentId);
    if (incident) {
      setIncidents(prev => prev.map(inc => inc.id === incidentId ? { ...inc, status: "processing" } : inc));
      onApprove(incidentId, incident);
    }
  };

  const getPriorityStyle = (priority: Incident["priority"]) => {
    switch (priority) {
      case "high": return "bg-destructive/20 text-destructive";
      case "medium": return "bg-status-busy/20 text-status-busy";
      case "low": return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityLabel = (priority: Incident["priority"]) => {
    switch (priority) {
      case "high": return t("common.urgent");
      case "medium": return t("common.normal");
      case "low": return t("common.low");
    }
  };

  const pendingIncidents = filteredIncidents.filter(i => i.status === "pending");
  const processingIncidents = filteredIncidents.filter(i => i.status === "processing");
  const completedIncidents = filteredIncidents.filter(i => i.status === "approved" || i.status === "rejected");

  const pendingCount = pendingIncidents.length;
  const processingCount = processingIncidents.length;
  const completedCount = completedIncidents.length;

  const filteredChatSessions = filterSessionsBySystem(chatSessions);

  const handlePlayClick = (incident: Incident) => {
    console.log("SOPAgentDashboard handlePlayClick called:", incident);
    console.log("onStartChat exists:", !!onStartChat);
    if (onStartChat) {
      onStartChat(incident);
    }
  };

  // 세션 ID 찾기 헬퍼 함수
  const findSessionByIncidentId = (incidentId: string) => {
    return chatSessions.find(session => session.request.id === incidentId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <span className="px-3 py-1 text-xs rounded border bg-status-online/10 text-status-online border-status-online/30">{t("common.completed")}</span>;
      case "in-progress": return <span className="px-3 py-1 text-xs rounded border bg-status-busy/10 text-status-busy border-status-busy/30">{t("common.inProgress")}</span>;
      case "pending-approval": return <span className="px-3 py-1 text-xs rounded border bg-amber-500/10 text-amber-500 border-amber-500/30">접수 대기</span>;
      case "rejected": return <span className="px-3 py-1 text-xs rounded border bg-destructive/10 text-destructive border-destructive/30">반려</span>;
      default: return null;
    }
  };

  // ITS 스타일 인시던트 아이템 렌더링 컴포넌트
  const IncidentListItem = ({ incident, showActions = false, clickable = false }: { incident: Incident; showActions?: boolean; clickable?: boolean }) => {
    const config = incident.type ? requestTypeConfig[incident.type] : null;
    const session = findSessionByIncidentId(incident.id);
    const isActive = session?.id === activeSessionId;
    
    const handleItemClick = () => {
      if (clickable) {
        if (session) {
          onSelectSession?.(session.id);
        } else if (onStartChat) {
          onStartChat(incident);
        }
      }
    };
    
    return (
      <div 
        className={cn(
          "p-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors",
          clickable && "cursor-pointer",
          isActive && "ring-1 ring-primary bg-primary/10"
        )}
        onClick={clickable ? handleItemClick : undefined}
      >
        <div className="flex items-center gap-2 mb-1">
          {config ? (
            <span className={cn("flex-shrink-0", config.color)} title={config.label}>
              {config.icon}
            </span>
          ) : (
            <AlertTriangle className={cn("w-4 h-4 flex-shrink-0", getPriorityStyle(incident.priority).split(' ')[1])} />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground truncate">{incident.title}</p>
            {incident.requestNo && (
              <p className="text-xs text-primary/80 font-mono">{incident.requestNo}</p>
            )}
          </div>
          <span className={cn("px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0", getPriorityStyle(incident.priority))}>
            {getPriorityLabel(incident.priority)}
          </span>
          <span className="text-xs text-muted-foreground flex-shrink-0">{incident.timestamp}</span>
          {showActions && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlayClick(incident);
              }}
              className="p-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors flex-shrink-0"
              title="처리 시작"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {incident.sourceAgent && (
          <p className="text-xs text-muted-foreground ml-6">📌 {incident.sourceAgent}에서 전달됨</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* 담당시스템 선택 */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Monitor className="w-4 h-4 text-primary" />
            <span>담당시스템</span>
          </div>
          <div className="flex items-center gap-2">
            {systemOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setSelectedSystem(option.value)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md transition-colors",
                  selectedSystem === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 접수현황 - ITS 스타일 */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-base font-semibold flex items-center gap-2 text-foreground mb-4">
          <Ticket className="w-5 h-5 text-primary" />
          {t("dashboard.pendingIncidents")}
          {selectedSystem !== "all" && (
            <span className="text-xs font-normal text-primary/80 ml-1">({selectedSystem})</span>
          )}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {/* 접수 */}
          <div className="rounded-lg overflow-hidden border border-destructive/30">
            <div className="px-4 py-2 bg-destructive/20 flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium text-foreground">{t("common.received")}</span>
            </div>
            <div className="p-3 bg-background flex items-center justify-center border-b border-border/50">
              <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
            </div>
            <div className="p-2 bg-background/50 space-y-1.5 max-h-[280px] overflow-y-auto">
              {pendingIncidents.length > 0 ? (
                pendingIncidents.map(incident => (
                  <IncidentListItem key={incident.id} incident={incident} showActions={true} />
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">인시던트 없음</p>
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
              <p className="text-2xl font-bold text-foreground">{processingCount}</p>
            </div>
            <div className="p-2 bg-background/50 space-y-1.5 max-h-[280px] overflow-y-auto">
              {processingIncidents.length > 0 ? (
                processingIncidents.map(incident => (
                  <IncidentListItem key={incident.id} incident={incident} clickable={true} />
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">인시던트 없음</p>
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
              <span className="text-sm font-bold text-foreground ml-2">{completedCount}</span>
            </div>
            {isCompletedCollapsed ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          {!isCompletedCollapsed && (
            <div className="p-2 bg-background/50 space-y-1.5 max-h-[200px] overflow-y-auto">
              {completedIncidents.length > 0 ? (
                completedIncidents.map(incident => (
                  <IncidentListItem key={incident.id} incident={incident} clickable={true} />
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">인시던트 없음</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 처리 Chat 이력 */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 bg-muted/50 border-b border-border flex items-center justify-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">
            {t("dashboard.processChatHistory")}
            {selectedSystem !== "all" && (
              <span className="text-xs font-normal text-primary/80 ml-1">({selectedSystem})</span>
            )}
          </h4>
        </div>
        <div className="divide-y divide-border">
          {filteredChatSessions.length > 0 ? (
            filteredChatSessions.map(session => {
              const config = session.request.type ? requestTypeConfig[session.request.type] : null;
              const isActive = session.id === activeSessionId;
              return (
                <button
                  key={session.id}
                  onClick={() => onSelectSession?.(session.id)}
                  className={cn(
                    "w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors text-left",
                    isActive && "bg-primary/10 border-l-2 border-l-primary"
                  )}
                >
                  <span className={cn("flex-shrink-0", config?.color || "text-primary")}>
                    {config?.icon || <AlertTriangle className="w-4 h-4" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{session.request.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-primary/80 font-mono">{session.request.requestNo}</span>
                      <span className="text-xs text-muted-foreground">{session.request.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{session.messages.length}</span>
                    {getStatusBadge(session.status)}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-muted-foreground">채팅 이력이 없습니다</p>
              <p className="text-xs text-muted-foreground mt-1">접수 항목의 플레이 버튼을 눌러 채팅을 시작하세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}