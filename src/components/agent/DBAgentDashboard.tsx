import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Database, HardDrive, Clock, CheckCircle, AlertTriangle, Search, Play, ChevronDown, ChevronUp, Ticket, Wrench, User, FileText } from "lucide-react";
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

interface DatabaseInfo {
  id: string;
  name: string;
  type: string;
  size: string;
  connections: number;
  status: "online" | "maintenance" | "offline";
}

interface Query {
  id: string;
  query: string;
  duration: string;
  status: "running" | "completed" | "slow";
  timestamp: string;
}

interface DBTask {
  id: string;
  title: string;
  dbName: string;
  status: "pending" | "processing" | "completed";
  timestamp: string;
  requestNo?: string;
  type?: RequestType;
  sourceAgent?: string;
}

interface DBAgentDashboardProps {
  routedRequests?: RoutedRequest[];
}

const mockDatabases: DatabaseInfo[] = [
  { id: "db1", name: "PROD_DB", type: "Oracle", size: "2.5TB", connections: 145, status: "online" },
  { id: "db2", name: "DEV_DB", type: "PostgreSQL", size: "500GB", connections: 23, status: "online" },
  { id: "db3", name: "BACKUP_DB", type: "Oracle", size: "2.5TB", connections: 0, status: "maintenance" },
];

const mockQueries: Query[] = [
  { id: "q1", query: "SELECT * FROM orders WHERE date > ...", duration: "2.3s", status: "slow", timestamp: "10:45" },
  { id: "q2", query: "UPDATE inventory SET stock = ...", duration: "0.1s", status: "completed", timestamp: "10:44" },
  { id: "q3", query: "INSERT INTO logs VALUES ...", duration: "...", status: "running", timestamp: "10:45" },
];

const mockTasks: DBTask[] = [
  { id: "t1", title: "슬로우 쿼리 분석 요청", dbName: "PROD_DB", status: "pending", timestamp: "10:45" },
  { id: "t2", title: "백업 상태 확인", dbName: "BACKUP_DB", status: "pending", timestamp: "10:30" },
  { id: "t3", title: "인덱스 최적화", dbName: "PROD_DB", status: "processing", timestamp: "09:15" },
  { id: "t4", title: "커넥션 풀 정리", dbName: "DEV_DB", status: "completed", timestamp: "08:30" },
];

// 요청 타입별 아이콘 및 색상
const requestTypeConfig: Record<RequestType, { icon: React.ReactNode; label: string; color: string }> = {
  "I": { icon: <AlertTriangle className="w-4 h-4" />, label: "인시던트", color: "text-destructive" },
  "C": { icon: <Wrench className="w-4 h-4" />, label: "개선", color: "text-amber-500" },
  "D": { icon: <Database className="w-4 h-4" />, label: "데이터", color: "text-emerald-500" },
  "A": { icon: <User className="w-4 h-4" />, label: "계정/권한", color: "text-blue-500" },
  "S": { icon: <FileText className="w-4 h-4" />, label: "단순", color: "text-muted-foreground" },
};

export function DBAgentDashboard({ routedRequests = [] }: DBAgentDashboardProps) {
  const { t } = useTranslation();
  const [isCompletedCollapsed, setIsCompletedCollapsed] = useState(true);

  // 라우팅된 요청을 Task로 변환
  const routedTasks: DBTask[] = routedRequests.map(req => ({
    id: req.id,
    title: req.title,
    dbName: "PROD_DB",
    status: "pending" as const,
    timestamp: req.date,
    requestNo: req.requestNo,
    type: req.type,
    sourceAgent: req.sourceAgent,
  }));

  const allTasks = [...routedTasks, ...mockTasks];

  const getStatusStyle = (status: DatabaseInfo["status"]) => {
    switch (status) {
      case "online": return "bg-status-online/20 text-status-online";
      case "maintenance": return "bg-status-busy/20 text-status-busy";
      case "offline": return "bg-destructive/20 text-destructive";
    }
  };

  const getStatusLabel = (status: DatabaseInfo["status"]) => {
    switch (status) {
      case "online": return t("common.online");
      case "maintenance": return t("common.maintenance");
      case "offline": return t("common.offline");
    }
  };

  const getQueryStatusStyle = (status: Query["status"]) => {
    switch (status) {
      case "running": return "bg-primary/20 text-primary";
      case "completed": return "bg-status-online/20 text-status-online";
      case "slow": return "bg-status-busy/20 text-status-busy";
    }
  };

  const pendingTasks = allTasks.filter(t => t.status === "pending");
  const processingTasks = allTasks.filter(t => t.status === "processing");
  const completedTasks = allTasks.filter(t => t.status === "completed");

  // ITS 스타일 Task 아이템 렌더링 컴포넌트
  const TaskListItem = ({ task, showPlay = false }: { task: DBTask; showPlay?: boolean }) => {
    const config = task.type ? requestTypeConfig[task.type] : null;
    
    return (
      <div className="p-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
        <div className="flex items-center gap-2">
          {config ? (
            <span className={cn("flex-shrink-0", config.color)} title={config.label}>
              {config.icon}
            </span>
          ) : (
            <Database className="w-4 h-4 text-primary flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground truncate">{task.title}</p>
            {task.requestNo ? (
              <p className="text-xs text-primary/80 font-mono">{task.requestNo}</p>
            ) : (
              <p className="text-xs text-primary/80 font-mono">{task.dbName}</p>
            )}
          </div>
          <span className="text-xs text-muted-foreground flex-shrink-0">{task.timestamp}</span>
          {showPlay && (
            <button
              className="p-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors flex-shrink-0"
              title="처리 시작"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {task.sourceAgent && (
          <p className="text-xs text-muted-foreground ml-6 mt-1">📌 {task.sourceAgent}에서 전달됨</p>
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
          {t("db.dbStatus")}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {/* 접수 */}
          <div className="rounded-lg overflow-hidden border border-destructive/30">
            <div className="px-4 py-2 bg-destructive/20 flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium text-foreground">{t("common.received")}</span>
            </div>
            <div className="p-3 bg-background flex items-center justify-center border-b border-border/50">
              <p className="text-2xl font-bold text-foreground">{pendingTasks.length}</p>
            </div>
            <div className="p-2 bg-background/50 space-y-1.5 max-h-[280px] overflow-y-auto">
              {pendingTasks.length > 0 ? (
                pendingTasks.map(task => (
                  <TaskListItem key={task.id} task={task} showPlay={true} />
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">작업 없음</p>
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
              <p className="text-2xl font-bold text-foreground">{processingTasks.length}</p>
            </div>
            <div className="p-2 bg-background/50 space-y-1.5 max-h-[280px] overflow-y-auto">
              {processingTasks.length > 0 ? (
                processingTasks.map(task => (
                  <TaskListItem key={task.id} task={task} />
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">작업 없음</p>
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
              <span className="text-sm font-bold text-foreground ml-2">{completedTasks.length}</span>
            </div>
            {isCompletedCollapsed ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          {!isCompletedCollapsed && (
            <div className="p-2 bg-background/50 space-y-1.5 max-h-[200px] overflow-y-auto">
              {completedTasks.length > 0 ? (
                completedTasks.map(task => (
                  <TaskListItem key={task.id} task={task} />
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">작업 없음</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* DB 현황 */}
      <div className="rounded-xl overflow-hidden border border-primary/30">
        <div className="px-4 py-3 bg-primary/20 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">{t("db.totalDb")}</span>
        </div>
        <div className="bg-background/80">
          <div className="grid grid-cols-3 gap-4 p-4">
            {mockDatabases.map(db => (
              <div key={db.id} className="p-4 rounded-lg border border-border/30 bg-background/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-foreground">{db.name}</span>
                  <span className={cn("px-2 py-0.5 rounded text-xs font-medium", getStatusStyle(db.status))}>
                    {getStatusLabel(db.status)}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="text-foreground">{db.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size</span>
                    <span className="text-foreground">{db.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Connections</span>
                    <span className="text-foreground">{db.connections}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 쿼리 모니터링 */}
      <div className="rounded-xl overflow-hidden border border-accent/30">
        <div className="px-4 py-3 bg-accent/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-foreground">{t("db.queryMonitoring")}</span>
          </div>
          <button className="px-3 py-1 rounded-lg bg-primary/20 text-primary text-xs hover:bg-primary/30 transition-colors flex items-center gap-1">
            <Play className="w-3 h-3" />
            {t("db.runQuery")}
          </button>
        </div>
        <div className="bg-background/80 divide-y divide-border/30">
          {mockQueries.map(query => (
            <div key={query.id} className="p-3 flex items-center gap-3">
              <code className="flex-1 text-xs text-muted-foreground font-mono truncate">{query.query}</code>
              <span className={cn("px-2 py-0.5 rounded text-xs font-medium", getQueryStatusStyle(query.status))}>
                {query.duration}
              </span>
              <span className="text-xs text-muted-foreground">{query.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}