import { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  Activity, AlertTriangle, CheckCircle, Clock, AlertCircle, 
  Play, MessageSquare, ChevronDown, ChevronUp, Server, Settings, PlayCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatSession } from "@/pages/AgentDetail";
import { MonitoringSettingsModal } from "./MonitoringSettingsModal";

// 감지 항목 타입 정의
type DetectionSeverity = "critical" | "warning" | "info";

export interface DetectionItem {
  id: string;
  detectionNo: string;
  severity: DetectionSeverity;
  title: string;
  source: string;
  date: string;
  status: "detected" | "in-progress" | "resolved";
  system?: string;
}

// 시스템 정보 타입
export interface SystemInfo {
  id: string;
  name: string;
}

interface MonitoringAgentDashboardProps {
  onStartChat?: (detection: DetectionItem) => void;
  onStartMonitoring?: (system: SystemInfo) => void;
  chatSessions?: ChatSession[];
  onSelectSession?: (sessionId: string) => void;
  activeSessionId?: string | null;
  detections?: DetectionItem[];
  onAddDetection?: (detection: DetectionItem) => void;
}

// 심각도별 아이콘 및 색상
const severityConfig: Record<DetectionSeverity, { icon: React.ReactNode; label: string; color: string }> = {
  "critical": { icon: <AlertTriangle className="w-4 h-4" />, label: "심각", color: "text-destructive" },
  "warning": { icon: <AlertCircle className="w-4 h-4" />, label: "경고", color: "text-amber-500" },
  "info": { icon: <Activity className="w-4 h-4" />, label: "정보", color: "text-blue-500" },
};

// Mock 감지 데이터
const mockDetections: DetectionItem[] = [
  // 감지 (detected)
  { id: "d1", detectionNo: "MON-2024-0045", severity: "critical", title: "API-01 CPU 사용률 임계치 초과", source: "API-01", date: "2024-12-05", status: "detected", system: "e-총무" },
  { id: "d2", detectionNo: "MON-2024-0046", severity: "warning", title: "WEB-02 메모리 사용률 높음", source: "WEB-02", date: "2024-12-05", status: "detected", system: "BiOn" },
  { id: "d3", detectionNo: "MON-2024-0047", severity: "critical", title: "DB-01 디스크 I/O 지연", source: "DB-01", date: "2024-12-06", status: "detected", system: "SATIS" },
  // 처리중 (in-progress)
  { id: "d4", detectionNo: "MON-2024-0044", severity: "warning", title: "네트워크 대역폭 포화 상태", source: "NETWORK", date: "2024-12-05", status: "in-progress", system: "e-총무" },
  { id: "d5", detectionNo: "MON-2024-0043", severity: "critical", title: "SSL 인증서 만료 임박", source: "WEB-01", date: "2024-12-04", status: "in-progress", system: "BiOn" },
  // 완료 (resolved)
  { id: "d6", detectionNo: "MON-2024-0042", severity: "info", title: "DB-01 백업 완료", source: "DB-01", date: "2024-12-03", status: "resolved", system: "SATIS" },
  { id: "d7", detectionNo: "MON-2024-0041", severity: "warning", title: "WEB-01 응답 지연 해결", source: "WEB-01", date: "2024-12-02", status: "resolved", system: "e-총무" },
];

export function MonitoringAgentDashboard({ 
  onStartChat, 
  onStartMonitoring,
  chatSessions = [], 
  onSelectSession,
  activeSessionId,
  detections: externalDetections,
  onAddDetection
}: MonitoringAgentDashboardProps) {
  const { t } = useTranslation();
  const [internalDetections] = useState<DetectionItem[]>(mockDetections);
  const detections = externalDetections || internalDetections;
  const [isCompletedCollapsed, setIsCompletedCollapsed] = useState(true);
  const [settingsModalSystem, setSettingsModalSystem] = useState<SystemInfo | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <span className="px-3 py-1 text-xs rounded border bg-status-online/10 text-status-online border-status-online/30">{t("common.completed")}</span>;
      case "in-progress": return <span className="px-3 py-1 text-xs rounded border bg-status-busy/10 text-status-busy border-status-busy/30">{t("common.inProgress")}</span>;
      case "pending-approval": return <span className="px-3 py-1 text-xs rounded border bg-amber-500/10 text-amber-500 border-amber-500/30">접수 대기</span>;
      case "rejected": return <span className="px-3 py-1 text-xs rounded border bg-destructive/10 text-destructive border-destructive/30">반려</span>;
      default: return null;
    }
  };

  const detectedItems = detections.filter(d => d.status === "detected");
  const inProgressItems = detections.filter(d => d.status === "in-progress");
  const resolvedItems = detections.filter(d => d.status === "resolved");

  const detectedCount = detectedItems.length;
  const inProgressCount = inProgressItems.length;
  const resolvedCount = resolvedItems.length;

  const handlePlayClick = (detection: DetectionItem) => {
    if (onStartChat) {
      onStartChat(detection);
    }
  };

  // 세션 ID 찾기 헬퍼 함수
  const findSessionByDetectionId = (detectionId: string) => {
    return chatSessions.find(session => session.request?.id === detectionId);
  };

  // 감지 항목 클릭 핸들러
  const handleDetectionClick = (detection: DetectionItem) => {
    const session = findSessionByDetectionId(detection.id);
    if (session && onSelectSession) {
      onSelectSession(session.id);
    }
  };

  // 감지 항목 렌더링 컴포넌트
  const DetectionListItem = ({ detection, showPlay = false, clickable = false }: { detection: DetectionItem; showPlay?: boolean; clickable?: boolean }) => {
    const config = severityConfig[detection.severity];
    const session = findSessionByDetectionId(detection.id);
    const isActive = session?.id === activeSessionId;
    
    const content = (
      <>
        <span className={cn("flex-shrink-0", config.color)} title={config.label}>
          {config.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground truncate">{detection.title}</p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-primary/80 font-mono">{detection.detectionNo}</p>
            {detection.system && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{detection.system}</span>
            )}
            <span className="text-xs text-muted-foreground">• {detection.source}</span>
          </div>
        </div>
        <span className="text-xs text-muted-foreground flex-shrink-0">{detection.date}</span>
        {showPlay && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePlayClick(detection);
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
          onClick={() => handleDetectionClick(detection)}
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

  // 운영자 담당 시스템 목록
  const operatorSystems: SystemInfo[] = [
    { id: "etongmu", name: "e-총무시스템" },
    { id: "purchase", name: "구매시스템" },
    { id: "sales", name: "영업/물류시스템" },
  ];

  // 모니터링 실행 버튼 클릭 핸들러
  const handleMonitoringStart = (system: SystemInfo) => {
    if (onStartMonitoring) {
      onStartMonitoring(system);
    }
  };

  // 모니터링 설정 버튼 클릭 핸들러
  const handleOpenSettings = (system: SystemInfo) => {
    setSettingsModalSystem(system);
  };

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* 운영자 담당 시스템 */}
      <div className="grid grid-cols-3 gap-4">
        {operatorSystems.map(system => (
          <div 
            key={system.id} 
            className="rounded-xl border border-border bg-card p-4 flex items-center justify-between"
          >
            <span className="text-sm font-medium text-foreground">{system.name}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMonitoringStart(system)}
                className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                title="모니터링 실행"
              >
                <PlayCircle className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleOpenSettings(system)}
                className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                title="모니터링 설정"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 비정상 감지 현황 */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-base font-semibold flex items-center gap-2 text-foreground mb-4">
          <Server className="w-5 h-5 text-primary" />
          비정상 감지 현황
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {/* 감지 */}
          <div className="rounded-lg overflow-hidden border border-destructive/30">
            <div className="px-4 py-2 bg-destructive/20 flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium text-foreground">감지</span>
            </div>
            <div className="p-3 bg-background flex items-center justify-center border-b border-border/50">
              <p className="text-2xl font-bold text-foreground">{detectedCount}</p>
            </div>
            <div className="p-2 bg-background/50 space-y-1.5 max-h-[280px] overflow-y-auto">
              {detectedItems.length > 0 ? (
                detectedItems.map(detection => (
                  <DetectionListItem key={detection.id} detection={detection} showPlay={true} />
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">감지된 항목 없음</p>
              )}
            </div>
          </div>

          {/* 처리중 */}
          <div className="rounded-lg overflow-hidden border border-status-busy/30">
            <div className="px-4 py-2 bg-status-busy/20 flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-status-busy" />
              <span className="text-sm font-medium text-foreground">처리중</span>
            </div>
            <div className="p-3 bg-background flex items-center justify-center border-b border-border/50">
              <p className="text-2xl font-bold text-foreground">{inProgressCount}</p>
            </div>
            <div className="p-2 bg-background/50 space-y-1.5 max-h-[280px] overflow-y-auto">
              {inProgressItems.length > 0 ? (
                inProgressItems.map(detection => (
                  <DetectionListItem key={detection.id} detection={detection} clickable={true} />
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">처리중인 항목 없음</p>
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
              {resolvedItems.length > 0 ? (
                resolvedItems.map(detection => (
                  <DetectionListItem key={detection.id} detection={detection} clickable={true} />
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">완료된 항목 없음</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 처리 Chat 이력 */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 bg-muted/50 border-b border-border flex items-center justify-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">{t("dashboard.processChatHistory")}</h4>
        </div>
        <div className="divide-y divide-border">
          {chatSessions.length > 0 ? (
            chatSessions.map(session => {
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
                  <span className="flex-shrink-0 text-primary">
                    <Activity className="w-4 h-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{session.request?.title || "모니터링 알림"}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-primary/80 font-mono">{session.request?.requestNo || session.id}</span>
                      {session.request?.system && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{session.request.system}</span>
                      )}
                      <span className="text-xs text-muted-foreground">{session.request?.date}</span>
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
              <p className="text-xs text-muted-foreground mt-1">감지 항목의 플레이 버튼을 눌러 채팅을 시작하세요</p>
            </div>
          )}
        </div>
      </div>

      {/* 모니터링 설정 모달 */}
      <MonitoringSettingsModal
        isOpen={settingsModalSystem !== null}
        onClose={() => setSettingsModalSystem(null)}
        systemName={settingsModalSystem?.name || ""}
        systemId={settingsModalSystem?.id || ""}
      />
    </div>
  );
}
