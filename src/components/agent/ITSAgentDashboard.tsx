import { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  Ticket, UserPlus, Shield, Database, Clock, CheckCircle, AlertCircle, Send, Key,
  Play, AlertTriangle, Wrench, FileText, User, MessageSquare, ChevronDown, ChevronUp, Cloud, Monitor
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ChatSession, ITSRequest } from "@/pages/AgentDetail";

// 요청 타입 정의
type RequestType = "I" | "C" | "D" | "A" | "S";

// 담당시스템 정의
type SystemType = "all" | "e-총무" | "BiOn" | "SATIS";

const systemOptions: { value: SystemType; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "e-총무", label: "e-총무시스템" },
  { value: "BiOn", label: "BiOn" },
  { value: "SATIS", label: "SATIS" },
];

interface ITSAgentDashboardProps {
  onRequest: (requestType: string) => void;
  onStartChat?: (request: ITSRequest) => void;
  chatSessions?: ChatSession[];
  onSelectSession?: (sessionId: string) => void;
  activeSessionId?: string | null;
  requests?: ITSRequest[];
}

// 요청 타입별 아이콘 및 색상
const requestTypeConfig: Record<RequestType, { icon: React.ReactNode; label: string; color: string }> = {
  "I": { icon: <AlertTriangle className="w-4 h-4" />, label: "인시던트", color: "text-destructive" },
  "C": { icon: <Wrench className="w-4 h-4" />, label: "개선", color: "text-amber-500" },
  "D": { icon: <Database className="w-4 h-4" />, label: "데이터", color: "text-emerald-500" },
  "A": { icon: <User className="w-4 h-4" />, label: "계정/권한", color: "text-blue-500" },
  "S": { icon: <FileText className="w-4 h-4" />, label: "단순", color: "text-muted-foreground" },
};

// Default Mock 요청 데이터 - 각 타입별 1개씩 (시스템 정보 추가)
const defaultMockRequests: ITSRequest[] = [
  // 미접수 (open)
  { id: "r1", requestNo: "ITS-2024-0152", type: "I", title: "서버 응답 지연 현상 발생", date: "2024-12-05", status: "open", system: "e-총무" },
  { id: "r4", requestNo: "ITS-2024-0149", type: "A", title: "신규 입사자 계정 발급 요청", date: "2024-12-04", status: "open", system: "BiOn" },
  { id: "r6", requestNo: "ITS-2024-0153", type: "D", title: "고객별 주문 현황 데이터 추출", date: "2024-12-06", status: "open", system: "SATIS" },
  // 접수/처리중 (in-progress)
  { id: "r2", requestNo: "ITS-2024-0151", type: "C", title: "대시보드 UI 개선 요청", date: "2024-12-05", status: "in-progress", system: "e-총무" },
  { id: "r3", requestNo: "ITS-2024-0150", type: "D", title: "월간 매출 데이터 추출 요청", date: "2024-12-04", status: "in-progress", system: "BiOn" },
  // 완료 (resolved)
  { id: "r5", requestNo: "ITS-2024-0148", type: "S", title: "프린터 용지 교체 요청", date: "2024-12-03", status: "resolved", system: "SATIS" },
];

export function ITSAgentDashboard({ 
  onRequest, 
  onStartChat, 
  chatSessions = [], 
  onSelectSession,
  activeSessionId,
  requests: propRequests
}: ITSAgentDashboardProps) {
  const { t } = useTranslation();
  const requests = propRequests || defaultMockRequests;
  const [selectedTicket, setSelectedTicket] = useState<ITSRequest | null>(null);
  const [isCompletedCollapsed, setIsCompletedCollapsed] = useState(true);
  const [selectedSystem, setSelectedSystem] = useState<SystemType>("all");

  // 시스템 필터링 함수
  const filterBySystem = (items: ITSRequest[]): ITSRequest[] => {
    if (selectedSystem === "all") return items;
    return items.filter(item => item.system === selectedSystem);
  };

  // 채팅 세션 필터링 (request에 system 정보가 있는 경우)
  const filterSessionsBySystem = (sessions: ChatSession[]): ChatSession[] => {
    if (selectedSystem === "all") return sessions;
    return sessions.filter(session => {
      // 세션의 request에서 시스템 정보 확인
      const matchingRequest = requests.find(r => r.id === session.request.id);
      return matchingRequest?.system === selectedSystem;
    });
  };

  const requestCards = [
    { id: "workload", title: t("dashboard.workloadRegister"), icon: <FileText className="w-5 h-5" />, bgColor: "bg-amber-100 dark:bg-amber-900/30", headerColor: "bg-amber-200 dark:bg-amber-800/50" },
    { id: "firewall", title: t("dashboard.firewallRequest"), icon: <Shield className="w-5 h-5" />, bgColor: "bg-orange-100 dark:bg-orange-900/30", headerColor: "bg-orange-200 dark:bg-orange-800/50" },
    { id: "dbsafer", title: t("dashboard.dbSaferRequest"), icon: <Database className="w-5 h-5" />, bgColor: "bg-emerald-100 dark:bg-emerald-900/30", headerColor: "bg-emerald-200 dark:bg-emerald-800/50" },
    { id: "cloud", title: t("dashboard.cloudRequest"), icon: <Cloud className="w-5 h-5" />, bgColor: "bg-blue-100 dark:bg-blue-900/30", headerColor: "bg-blue-200 dark:bg-blue-800/50" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <span className="px-3 py-1 text-xs rounded border bg-status-online/10 text-status-online border-status-online/30">{t("common.completed")}</span>;
      case "in-progress": return <span className="px-3 py-1 text-xs rounded border bg-status-busy/10 text-status-busy border-status-busy/30">{t("common.inProgress")}</span>;
      case "pending-approval": return <span className="px-3 py-1 text-xs rounded border bg-amber-500/10 text-amber-500 border-amber-500/30">접수 대기</span>;
      case "rejected": return <span className="px-3 py-1 text-xs rounded border bg-destructive/10 text-destructive border-destructive/30">반려</span>;
      default: return null;
    }
  };

  // 필터링된 요청들
  const filteredRequests = filterBySystem(requests);
  const openRequests = filteredRequests.filter(r => r.status === "open");
  const inProgressRequests = filteredRequests.filter(r => r.status === "in-progress");
  const resolvedRequests = filteredRequests.filter(r => r.status === "resolved");

  const openCount = openRequests.length;
  const inProgressCount = inProgressRequests.length;
  const resolvedCount = resolvedRequests.length;

  // 필터링된 채팅 세션
  const filteredChatSessions = filterSessionsBySystem(chatSessions);

  const handlePlayClick = (request: ITSRequest) => {
    if (onStartChat) {
      onStartChat(request);
    }
  };

  // 세션 ID 찾기 헬퍼 함수
  const findSessionByRequestId = (requestId: string) => {
    return chatSessions.find(session => session.request.id === requestId);
  };

  // 요청 아이템 클릭 핸들러
  const handleRequestClick = (request: ITSRequest) => {
    const session = findSessionByRequestId(request.id);
    if (session && onSelectSession) {
      onSelectSession(session.id);
    }
  };

  // 요청 아이템 렌더링 컴포넌트
  const RequestListItem = ({ request, showPlay = false, clickable = false }: { request: ITSRequest; showPlay?: boolean; clickable?: boolean }) => {
    const config = requestTypeConfig[request.type];
    const session = findSessionByRequestId(request.id);
    const isActive = session?.id === activeSessionId;
    
    const content = (
      <>
        <span className={cn("flex-shrink-0", config.color)} title={config.label}>
          {config.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground truncate">{request.title}</p>
          <p className="text-xs text-primary/80 font-mono">{request.requestNo}</p>
        </div>
        <span className="text-xs text-muted-foreground flex-shrink-0">{request.date}</span>
        {showPlay && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePlayClick(request);
            }}
            className="p-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors flex-shrink-0"
            title="채팅 시작"
          >
            <Play className="w-3.5 h-3.5" />
          </button>
        )}
      </>
    );

    if (clickable && session) {
      return (
        <button
          onClick={() => handleRequestClick(request)}
          className={cn(
            "w-full flex items-center gap-2 p-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors text-sm text-left",
            isActive && "bg-primary/10 ring-1 ring-primary/30"
          )}
        >
          {content}
        </button>
      );
    }

    return (
      <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors text-sm">
        {content}
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

      {/* ITS접수현황 + ITS 요청 - 하나의 카드 안에 */}
      <div className="rounded-xl border border-border bg-card p-5">
        {/* ITS접수현황 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold flex items-center gap-2 text-foreground">
              <Ticket className="w-5 h-5 text-primary" />
              {t("dashboard.itsReceptionStatus")}
              {selectedSystem !== "all" && (
                <span className="text-xs font-normal text-primary/80 ml-1">({selectedSystem})</span>
              )}
            </h3>
            {/* 요청 타입 범례 */}
            <div className="flex items-center gap-3 text-xs">
              {(Object.entries(requestTypeConfig) as [RequestType, typeof requestTypeConfig[RequestType]][]).map(([type, config]) => (
                <div key={type} className="flex items-center gap-1">
                  <span className={config.color}>{config.icon}</span>
                  <span className="text-muted-foreground">{config.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* 미접수 */}
            <div className="rounded-lg overflow-hidden border border-destructive/30">
              <div className="px-4 py-2 bg-destructive/20 flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium text-foreground">{t("common.notReceived")}</span>
              </div>
              <div className="p-3 bg-background flex items-center justify-center border-b border-border/50">
                <p className="text-2xl font-bold text-foreground">{openCount}</p>
              </div>
              <div className="p-2 bg-background/50 space-y-1.5 max-h-[280px] overflow-y-auto">
                {openRequests.length > 0 ? (
                  openRequests.map(request => (
                    <RequestListItem key={request.id} request={request} showPlay={true} />
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-2">요청 없음</p>
                )}
              </div>
            </div>

            {/* 접수/처리중 */}
            <div className="rounded-lg overflow-hidden border border-status-busy/30">
              <div className="px-4 py-2 bg-status-busy/20 flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-status-busy" />
                <span className="text-sm font-medium text-foreground">{t("common.receivedProcessing")}</span>
              </div>
              <div className="p-3 bg-background flex items-center justify-center border-b border-border/50">
                <p className="text-2xl font-bold text-foreground">{inProgressCount}</p>
              </div>
              <div className="p-2 bg-background/50 space-y-1.5 max-h-[280px] overflow-y-auto">
                {inProgressRequests.length > 0 ? (
                  inProgressRequests.map(request => (
                    <RequestListItem key={request.id} request={request} clickable={true} />
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-2">요청 없음</p>
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
                <span className="text-sm font-bold text-foreground ml-2">{resolvedCount}</span>
              </div>
              {isCompletedCollapsed ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            {!isCompletedCollapsed && (
              <div className="p-2 bg-background/50 space-y-1.5 max-h-[200px] overflow-y-auto">
                {resolvedRequests.length > 0 ? (
                  resolvedRequests.map(request => (
                    <RequestListItem key={request.id} request={request} clickable={true} />
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-2">요청 없음</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ITS 요청 - 한 줄에 4개 */}
        <div>
          <h3 className="text-base font-semibold flex items-center gap-2 text-foreground mb-4">
            <Send className="w-5 h-5 text-accent" />
            {t("dashboard.itsRequests")}
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {requestCards.map(card => (
              <button
                key={card.id}
                onClick={() => onRequest(card.id)}
                className={cn(
                  "rounded-lg overflow-hidden border border-border transition-all hover:scale-[1.02] active:scale-[0.98] text-left",
                  card.bgColor
                )}
              >
                <div className={cn("px-4 py-3 flex items-center justify-center gap-2", card.headerColor)}>
                  <div className="text-foreground/80">{card.icon}</div>
                  <span className="font-medium text-sm text-foreground">{card.title}</span>
                </div>
              </button>
            ))}
          </div>
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
              const config = requestTypeConfig[session.request.type];
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
                  <span className={cn("flex-shrink-0", config.color)}>
                    {config.icon}
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
              <p className="text-xs text-muted-foreground mt-1">미접수 요청의 플레이 버튼을 눌러 채팅을 시작하세요</p>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Detail Modal */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("dashboard.ticketDetail")}</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <span className={requestTypeConfig[selectedTicket.type].color}>
                  {requestTypeConfig[selectedTicket.type].icon}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{selectedTicket.title}</p>
                  <p className="text-xs text-muted-foreground">{requestTypeConfig[selectedTicket.type].label} 요청</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t("common.datetime")}</p>
                  <p className="text-sm font-medium text-foreground">{selectedTicket.date}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">상태</p>
                  <p className="text-sm font-medium text-foreground">
                    {selectedTicket.status === "open" && "미접수"}
                    {selectedTicket.status === "in-progress" && "접수/처리중"}
                    {selectedTicket.status === "resolved" && "완료"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
