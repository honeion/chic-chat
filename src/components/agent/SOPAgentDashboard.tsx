import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle, Clock, AlertTriangle, FileText, ChevronDown, ChevronUp, Play, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

interface Incident {
  id: string;
  title: string;
  description: string;
  status: "pending" | "processing" | "approved" | "rejected";
  priority: "high" | "medium" | "low";
  timestamp: string;
  recommendation?: string;
}

interface HistoryItem {
  id: string;
  action: string;
  result: string;
  timestamp: string;
  status: "success" | "warning" | "error";
}

interface SOPAgentDashboardProps {
  onApprove: (incidentId: string, incident: Incident) => void;
  onReject: (incidentId: string) => void;
}

const mockIncidents: Incident[] = [
  { id: "i1", title: "서버 CPU 사용률 90% 초과", description: "서버 A의 CPU 사용률이 임계치를 초과했습니다.", status: "pending", priority: "high", timestamp: "10:45", recommendation: "서버 재시작 또는 프로세스 정리 권장" },
  { id: "i2", title: "DB 연결 지연 감지", description: "데이터베이스 응답 시간이 평소보다 3배 느립니다.", status: "pending", priority: "medium", timestamp: "10:30", recommendation: "쿼리 최적화 또는 인덱스 확인 권장" },
  { id: "i3", title: "디스크 용량 80% 도달", description: "스토리지 공간이 부족해지고 있습니다.", status: "processing", priority: "low", timestamp: "09:15" },
  { id: "i4", title: "네트워크 지연 복구", description: "네트워크 레이턴시가 정상 범위로 복구되었습니다.", status: "approved", priority: "medium", timestamp: "08:30" },
];

const mockHistory: HistoryItem[] = [
  { id: "h1", action: "메모리 정리 실행", result: "2GB 메모리 확보 완료", timestamp: "09:00", status: "success" },
  { id: "h2", action: "로그 분석 수행", result: "이상 패턴 3건 발견", timestamp: "08:30", status: "warning" },
  { id: "h3", action: "헬스체크 완료", result: "모든 서비스 정상", timestamp: "08:00", status: "success" }
];

export function SOPAgentDashboard({ onApprove, onReject }: SOPAgentDashboardProps) {
  const { t } = useTranslation();
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [history] = useState<HistoryItem[]>(mockHistory);
  const [isCompletedCollapsed, setIsCompletedCollapsed] = useState(true);

  const handleApprove = (incidentId: string) => {
    const incident = incidents.find(i => i.id === incidentId);
    if (incident) {
      setIncidents(prev => prev.map(inc => inc.id === incidentId ? { ...inc, status: "processing" } : inc));
      onApprove(incidentId, incident);
    }
  };

  const handleReject = (incidentId: string) => {
    setIncidents(prev => prev.map(inc => inc.id === incidentId ? { ...inc, status: "rejected" } : inc));
    onReject(incidentId);
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

  const getStatusIcon = (status: HistoryItem["status"]) => {
    switch (status) {
      case "success": return <CheckCircle className="w-4 h-4 text-status-online" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-status-busy" />;
      case "error": return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const pendingIncidents = incidents.filter(i => i.status === "pending");
  const processingIncidents = incidents.filter(i => i.status === "processing");
  const completedIncidents = incidents.filter(i => i.status === "approved" || i.status === "rejected");

  const pendingCount = pendingIncidents.length;
  const processingCount = processingIncidents.length;
  const completedCount = completedIncidents.length;

  // 인시던트 아이템 렌더링 컴포넌트
  const IncidentListItem = ({ incident, showActions = false }: { incident: Incident; showActions?: boolean }) => {
    return (
      <div className="p-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className={cn("w-4 h-4 flex-shrink-0", getPriorityStyle(incident.priority).split(' ')[1])} />
          <p className="text-sm text-foreground truncate flex-1">{incident.title}</p>
          <span className={cn("px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0", getPriorityStyle(incident.priority))}>
            {getPriorityLabel(incident.priority)}
          </span>
          <span className="text-xs text-muted-foreground flex-shrink-0">{incident.timestamp}</span>
        </div>
        {showActions && (
          <div className="flex gap-2 mt-2 ml-6">
            <button 
              onClick={() => handleApprove(incident.id)} 
              className="px-2 py-1 rounded bg-status-online text-white hover:bg-status-online/90 transition-colors text-xs font-medium flex items-center gap-1"
            >
              <CheckCircle className="w-3 h-3" />
              {t("common.approve")}
            </button>
            <button 
              onClick={() => handleReject(incident.id)} 
              className="px-2 py-1 rounded bg-destructive text-white hover:bg-destructive/90 transition-colors text-xs font-medium flex items-center gap-1"
            >
              <XCircle className="w-3 h-3" />
              {t("common.reject")}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* 접수현황 */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-base font-semibold flex items-center gap-2 text-foreground mb-4">
          <Ticket className="w-5 h-5 text-primary" />
          {t("dashboard.pendingIncidents")}
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
                  <IncidentListItem key={incident.id} incident={incident} />
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
                  <IncidentListItem key={incident.id} incident={incident} />
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">인시던트 없음</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Processing History */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 bg-muted/50 border-b border-border flex items-center justify-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">{t("dashboard.processingHistory")}</h4>
        </div>
        <div className="divide-y divide-border">
          {history.slice(0, 5).map(item => (
            <div key={item.id} className="px-4 py-3 flex items-center gap-3">
              {getStatusIcon(item.status)}
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{item.action}</p>
                <p className="text-xs text-muted-foreground">{item.result}</p>
              </div>
              <span className="text-xs text-muted-foreground">{item.timestamp}</span>
            </div>
          ))}
        </div>
        <div className="p-3 bg-background/60 border-t border-border">
          <button className="text-sm text-primary hover:underline w-full text-center font-medium">{t("common.viewAll")}</button>
        </div>
      </div>

      {/* Daily Summary */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 bg-muted/50 border-b border-border flex items-center justify-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">{t("dashboard.todaySummary")}</h4>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">{t("dashboard.totalProcessed")}</p>
              <p className="text-xl font-bold text-foreground">{history.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-status-online/10 border border-status-online/20">
              <p className="text-xs text-muted-foreground mb-1">{t("dashboard.successRate")}</p>
              <p className="text-xl font-bold text-status-online">92%</p>
            </div>
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-xs text-muted-foreground mb-1">{t("dashboard.avgProcessTime")}</p>
              <p className="text-xl font-bold text-foreground">2.3m</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
