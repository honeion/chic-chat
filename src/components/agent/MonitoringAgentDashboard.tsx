import { Activity, Server, Database, Wifi, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServerStatus {
  id: string;
  name: string;
  cpu: number;
  memory: number;
  disk: number;
  status: "healthy" | "warning" | "critical";
}

interface Alert {
  id: string;
  message: string;
  severity: "info" | "warning" | "error";
  timestamp: string;
}

const mockServers: ServerStatus[] = [
  { id: "s1", name: "WEB-01", cpu: 45, memory: 62, disk: 55, status: "healthy" },
  { id: "s2", name: "WEB-02", cpu: 78, memory: 85, disk: 60, status: "warning" },
  { id: "s3", name: "DB-01", cpu: 35, memory: 70, disk: 45, status: "healthy" },
  { id: "s4", name: "API-01", cpu: 92, memory: 88, disk: 70, status: "critical" },
];

const mockAlerts: Alert[] = [
  { id: "a1", message: "API-01 CPU 사용률 임계치 초과", severity: "error", timestamp: "10:45" },
  { id: "a2", message: "WEB-02 메모리 사용률 높음", severity: "warning", timestamp: "10:30" },
  { id: "a3", message: "DB-01 백업 완료", severity: "info", timestamp: "10:00" },
];

export function MonitoringAgentDashboard() {
  const getStatusColor = (status: ServerStatus["status"]) => {
    switch (status) {
      case "healthy": return "text-status-online";
      case "warning": return "text-status-busy";
      case "critical": return "text-destructive";
    }
  };

  const getProgressColor = (value: number) => {
    if (value >= 90) return "bg-destructive";
    if (value >= 70) return "bg-status-busy";
    return "bg-status-online";
  };

  const getSeverityStyle = (severity: Alert["severity"]) => {
    switch (severity) {
      case "error": return "bg-destructive/20 text-destructive border-destructive/30";
      case "warning": return "bg-status-busy/20 text-status-busy border-status-busy/30";
      case "info": return "bg-primary/20 text-primary border-primary/30";
    }
  };

  const healthyCount = mockServers.filter(s => s.status === "healthy").length;
  const warningCount = mockServers.filter(s => s.status === "warning").length;
  const criticalCount = mockServers.filter(s => s.status === "critical").length;

  return (
    <div className="space-y-6">
      {/* 전체 현황 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl overflow-hidden border border-primary/30">
          <div className="px-4 py-2 bg-primary/20 flex items-center gap-2">
            <Server className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">전체 서버</span>
          </div>
          <div className="p-4 bg-background/80">
            <p className="text-3xl font-bold text-foreground">{mockServers.length}<span className="text-lg ml-1">대</span></p>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden border border-status-online/30">
          <div className="px-4 py-2 bg-status-online/20 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-status-online" />
            <span className="text-sm font-medium text-foreground">정상</span>
          </div>
          <div className="p-4 bg-background/80">
            <p className="text-3xl font-bold text-status-online">{healthyCount}<span className="text-lg ml-1">대</span></p>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden border border-status-busy/30">
          <div className="px-4 py-2 bg-status-busy/20 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-status-busy" />
            <span className="text-sm font-medium text-foreground">경고</span>
          </div>
          <div className="p-4 bg-background/80">
            <p className="text-3xl font-bold text-status-busy">{warningCount}<span className="text-lg ml-1">대</span></p>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden border border-destructive/30">
          <div className="px-4 py-2 bg-destructive/20 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-foreground">위험</span>
          </div>
          <div className="p-4 bg-background/80">
            <p className="text-3xl font-bold text-destructive">{criticalCount}<span className="text-lg ml-1">대</span></p>
          </div>
        </div>
      </div>

      {/* 서버 상태 */}
      <div className="rounded-xl overflow-hidden border border-primary/30">
        <div className="px-4 py-3 bg-primary/20 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">서버 리소스 현황</span>
        </div>
        <div className="bg-background/80">
          <div className="grid grid-cols-4 gap-4 p-4">
            {mockServers.map(server => (
              <div key={server.id} className="p-4 rounded-lg border border-border/30 bg-background/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-foreground">{server.name}</span>
                  <span className={cn("text-xs font-medium", getStatusColor(server.status))}>
                    {server.status === "healthy" ? "정상" : server.status === "warning" ? "경고" : "위험"}
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">CPU</span>
                      <span className="text-foreground">{server.cpu}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", getProgressColor(server.cpu))} style={{ width: `${server.cpu}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Memory</span>
                      <span className="text-foreground">{server.memory}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", getProgressColor(server.memory))} style={{ width: `${server.memory}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Disk</span>
                      <span className="text-foreground">{server.disk}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", getProgressColor(server.disk))} style={{ width: `${server.disk}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 알림 목록 */}
      <div className="rounded-xl overflow-hidden border border-status-busy/30">
        <div className="px-4 py-3 bg-status-busy/20 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-status-busy" />
          <span className="text-sm font-medium text-foreground">실시간 알림</span>
        </div>
        <div className="bg-background/80 divide-y divide-border/30">
          {mockAlerts.map(alert => (
            <div key={alert.id} className={cn("p-3 flex items-center gap-3 border-l-4", getSeverityStyle(alert.severity))}>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{alert.message}</p>
              </div>
              <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
