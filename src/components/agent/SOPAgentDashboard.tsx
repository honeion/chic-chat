import { useState } from "react";
import { CheckCircle, XCircle, Clock, AlertTriangle, FileText } from "lucide-react";
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
  {
    id: "i1",
    title: "서버 CPU 사용률 90% 초과",
    description: "서버 A의 CPU 사용률이 임계치를 초과했습니다.",
    status: "pending",
    priority: "high",
    timestamp: "10:45",
    recommendation: "서버 재시작 또는 프로세스 정리 권장"
  },
  {
    id: "i2",
    title: "DB 연결 지연 감지",
    description: "데이터베이스 응답 시간이 평소보다 3배 느립니다.",
    status: "pending",
    priority: "medium",
    timestamp: "10:30",
    recommendation: "쿼리 최적화 또는 인덱스 확인 권장"
  },
  {
    id: "i3",
    title: "디스크 용량 80% 도달",
    description: "스토리지 공간이 부족해지고 있습니다.",
    status: "processing",
    priority: "low",
    timestamp: "09:15"
  }
];

const mockHistory: HistoryItem[] = [
  { id: "h1", action: "메모리 정리 실행", result: "2GB 메모리 확보 완료", timestamp: "09:00", status: "success" },
  { id: "h2", action: "로그 분석 수행", result: "이상 패턴 3건 발견", timestamp: "08:30", status: "warning" },
  { id: "h3", action: "헬스체크 완료", result: "모든 서비스 정상", timestamp: "08:00", status: "success" }
];

export function SOPAgentDashboard({ onApprove, onReject }: SOPAgentDashboardProps) {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [history] = useState<HistoryItem[]>(mockHistory);

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

  const getStatusIcon = (status: HistoryItem["status"]) => {
    switch (status) {
      case "success": return <CheckCircle className="w-4 h-4 text-status-online" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-status-busy" />;
      case "error": return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const pendingCount = incidents.filter(i => i.status === "pending").length;
  const processingCount = incidents.filter(i => i.status === "processing").length;
  const completedToday = history.length;

  return (
    <div className="space-y-6">
      {/* Status Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl overflow-hidden border border-status-busy/30">
          <div className="px-4 py-2 bg-status-busy/20 flex items-center gap-2">
            <Clock className="w-4 h-4 text-status-busy" />
            <span className="text-sm font-medium text-foreground">대기 중</span>
          </div>
          <div className="p-4 bg-background/80">
            <p className="text-3xl font-bold text-foreground">{pendingCount}<span className="text-lg ml-1">건</span></p>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden border border-primary/30">
          <div className="px-4 py-2 bg-primary/20 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">처리 중</span>
          </div>
          <div className="p-4 bg-background/80">
            <p className="text-3xl font-bold text-foreground">{processingCount}<span className="text-lg ml-1">건</span></p>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden border border-status-online/30">
          <div className="px-4 py-2 bg-status-online/20 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-status-online" />
            <span className="text-sm font-medium text-foreground">오늘 완료</span>
          </div>
          <div className="p-4 bg-background/80">
            <p className="text-3xl font-bold text-foreground">{completedToday}<span className="text-lg ml-1">건</span></p>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden border border-accent/30">
          <div className="px-4 py-2 bg-accent/20 flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-foreground">일일 보고서</span>
          </div>
          <div className="p-4 bg-background/80">
            <button className="text-sm text-primary hover:underline font-medium">보기</button>
          </div>
        </div>
      </div>

      {/* Incident List */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-status-busy" />
          승인 대기 인시던트
        </h3>
        <div className="space-y-3">
          {incidents.filter(i => i.status === "pending" || i.status === "processing").map(incident => (
            <div key={incident.id} className="rounded-xl overflow-hidden border border-primary/30">
              <div className="px-4 py-3 bg-primary/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-foreground">{incident.title}</h4>
                  <span className={cn("px-2 py-0.5 rounded text-xs font-medium", getPriorityStyle(incident.priority))}>
                    {incident.priority === "high" ? "긴급" : incident.priority === "medium" ? "보통" : "낮음"}
                  </span>
                  <span className="text-xs text-muted-foreground">{incident.timestamp}</span>
                </div>
                <div className="flex gap-2">
                  {incident.status === "pending" && (
                    <>
                      <button onClick={() => handleApprove(incident.id)} className="px-3 py-1.5 rounded-lg bg-status-online text-white hover:bg-status-online/90 transition-colors text-sm font-medium flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        승인
                      </button>
                      <button onClick={() => handleReject(incident.id)} className="px-3 py-1.5 rounded-lg bg-destructive text-white hover:bg-destructive/90 transition-colors text-sm font-medium flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        거부
                      </button>
                    </>
                  )}
                  {incident.status === "processing" && (
                    <span className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-sm">처리 중...</span>
                  )}
                </div>
              </div>
              <div className="p-4 bg-background/80">
                <p className="mb-3 text-foreground">{incident.description}</p>
                {incident.recommendation && (
                  <div className="p-3 rounded-lg bg-status-online/20 border-l-4 border-status-online">
                    <p className="text-sm"><span className="text-status-online font-semibold">AI 권장:</span> <span className="text-foreground">{incident.recommendation}</span></p>
                  </div>
                )}
              </div>
            </div>
          ))}
          {incidents.filter(i => i.status === "pending" || i.status === "processing").length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-status-online/50" />
              <p>모든 인시던트가 처리되었습니다</p>
            </div>
          )}
        </div>
      </div>

      {/* Processing History */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          처리 이력
        </h3>
        <div className="rounded-xl overflow-hidden border border-primary/30">
          <div className="px-4 py-3 bg-primary/20 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">최근 처리 내역</span>
          </div>
          <div className="bg-background/80 divide-y divide-border/30">
            {history.slice(0, 5).map(item => (
              <div key={item.id} className="p-3 flex items-center gap-3">
                {getStatusIcon(item.status)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.result}</p>
                </div>
                <span className="text-xs text-muted-foreground">{item.timestamp}</span>
              </div>
            ))}
          </div>
          <div className="p-3 bg-background/60 border-t border-border/30">
            <button className="text-sm text-primary hover:underline w-full text-center font-medium">전체 이력 보기</button>
          </div>
        </div>
      </div>

      {/* Daily Summary */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          오늘의 요약 보고서
        </h3>
        <div className="rounded-xl overflow-hidden border border-accent/30">
          <div className="px-4 py-3 bg-accent/20 flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-foreground">오늘의 성과</span>
          </div>
          <div className="p-4 bg-background/80">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">총 처리 건수</p>
                <p className="text-xl font-bold text-foreground">{completedToday}건</p>
              </div>
              <div className="p-3 rounded-lg bg-status-online/10 border border-status-online/20">
                <p className="text-xs text-muted-foreground mb-1">성공률</p>
                <p className="text-xl font-bold text-status-online">92%</p>
              </div>
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-xs text-muted-foreground mb-1">평균 처리 시간</p>
                <p className="text-xl font-bold text-foreground">2.3분</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              오늘 {completedToday}건의 작업을 처리했습니다. 서버 상태는 전반적으로 안정적이며, 
              CPU 사용률 관련 인시던트 1건이 대기 중입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
