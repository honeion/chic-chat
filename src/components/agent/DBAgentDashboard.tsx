import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Database, HardDrive, Clock, CheckCircle, AlertTriangle, Search, Play, ChevronDown, ChevronUp, Ticket, Wrench, User, FileText, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

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
  system?: string;
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
  status: string;
  createdAt: string;
}

interface DBAgentDashboardProps {
  routedRequests?: RoutedRequest[];
  onStartChat?: (task: DBTask) => void;
  chatSessions?: ChatSession[];
  onSelectSession?: (sessionId: string) => void;
  activeSessionId?: string | null;
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
  { id: "t1", title: "슬로우 쿼리 분석 요청", dbName: "PROD_DB", status: "pending", timestamp: "10:45", system: "e-총무" },
  { id: "t2", title: "백업 상태 확인", dbName: "BACKUP_DB", status: "pending", timestamp: "10:30", system: "BiOn" },
  { id: "t3", title: "인덱스 최적화", dbName: "PROD_DB", status: "processing", timestamp: "09:15", system: "SATIS" },
  { id: "t4", title: "커넥션 풀 정리", dbName: "DEV_DB", status: "completed", timestamp: "08:30", system: "e-총무" },
];

// 요청 타입별 아이콘 및 색상
const requestTypeConfig: Record<RequestType, { icon: React.ReactNode; label: string; color: string }> = {
  "I": { icon: <AlertTriangle className="w-4 h-4" />, label: "인시던트", color: "text-destructive" },
  "C": { icon: <Wrench className="w-4 h-4" />, label: "개선", color: "text-amber-500" },
  "D": { icon: <Database className="w-4 h-4" />, label: "데이터", color: "text-emerald-500" },
  "A": { icon: <User className="w-4 h-4" />, label: "계정/권한", color: "text-blue-500" },
  "S": { icon: <FileText className="w-4 h-4" />, label: "단순", color: "text-muted-foreground" },
};

export function DBAgentDashboard({ 
  routedRequests = [], 
  onStartChat,
  chatSessions = [],
  onSelectSession,
  activeSessionId
}: DBAgentDashboardProps) {
  const { t } = useTranslation();
  const [isCompletedCollapsed, setIsCompletedCollapsed] = useState(true);
  const [selectedSystem, setSelectedSystem] = useState<SystemType>("all");
  
  // DB Agent에 해당하는 채팅 세션만 필터링 (type: D)
  const dbChatSessions = chatSessions.filter(s => s.request.type === "D");

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
    system: req.system,
  }));

  const allTasks = [...routedTasks, ...mockTasks];

  // 시스템 필터링 함수
  const filterBySystem = (items: DBTask[]): DBTask[] => {
    if (selectedSystem === "all") return items;
    return items.filter(item => item.system === selectedSystem);
  };

  // 채팅 세션 필터링
  const filterSessionsBySystem = (sessions: typeof dbChatSessions): typeof dbChatSessions => {
    if (selectedSystem === "all") return sessions;
    return sessions.filter(s => {
      const matchingTask = allTasks.find(t => t.id === s.request.id);
      return matchingTask?.system === selectedSystem;
    });
  };

  const filteredTasks = filterBySystem(allTasks);
  const filteredChatSessions = filterSessionsBySystem(dbChatSessions);

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

  const pendingTasks = filteredTasks.filter(t => t.status === "pending");
  const processingTasks = filteredTasks.filter(t => t.status === "processing");
  const completedTasks = filteredTasks.filter(t => t.status === "completed");

  // 세션 ID 찾기 헬퍼 함수
  const findSessionByTaskId = (taskId: string) => {
    return chatSessions.find(session => session.request.id === taskId);
  };

  // ITS 스타일 Task 아이템 렌더링 컴포넌트
  const TaskListItem = ({ task, showPlay = false, clickable = false }: { task: DBTask; showPlay?: boolean; clickable?: boolean }) => {
    const config = task.type ? requestTypeConfig[task.type] : null;
    const session = findSessionByTaskId(task.id);
    const isActive = session?.id === activeSessionId;
    
    const handleItemClick = () => {
      if (clickable) {
        if (session) {
          onSelectSession?.(session.id);
        } else if (onStartChat) {
          onStartChat(task);
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
          {showPlay && onStartChat && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartChat(task);
              }}
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
          {t("db.dbStatus")}
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
                  <TaskListItem key={task.id} task={task} clickable={true} />
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
                  <TaskListItem key={task.id} task={task} clickable={true} />
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">작업 없음</p>
              )}
            </div>
          )}
        </div>
      </div>


      {/* 처리 Chat 이력 */}
      <div className="rounded-xl overflow-hidden border border-primary/30">
        <div className="px-4 py-3 bg-primary/20 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            {t("common.chatHistory")}
            {selectedSystem !== "all" && (
              <span className="text-xs font-normal text-primary/80 ml-1">({selectedSystem})</span>
            )}
          </span>
          <span className="text-xs text-muted-foreground ml-auto">{filteredChatSessions.length}건</span>
        </div>
        <div className="bg-background/80 divide-y divide-border/30 max-h-[300px] overflow-y-auto">
          {filteredChatSessions.length > 0 ? (
            filteredChatSessions.map(session => {
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