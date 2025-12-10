import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageSquare, Settings, Server, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatSession {
  id: string;
  request: {
    id: string;
    requestNo: string;
    title: string;
    date: string;
    system?: string;
  };
  messages: any[];
  status: string;
  createdAt: string;
}

type SystemType = "e-총무" | "BiOn" | "SATIS";

interface InfraAgentDashboardProps {
  onNewChat?: () => void;
  onSelectSession?: (sessionId: string) => void;
  chatSessions?: ChatSession[];
  activeSessionId?: string | null;
  onOpenSettings?: (system: SystemType) => void;
}

const SYSTEMS: { id: SystemType; name: string }[] = [
  { id: "e-총무", name: "e-총무시스템" },
  { id: "BiOn", name: "BiOn시스템" },
  { id: "SATIS", name: "SATIS시스템" },
];

export function InfraAgentDashboard({
  onNewChat,
  onSelectSession,
  chatSessions = [],
  activeSessionId,
  onOpenSettings,
}: InfraAgentDashboardProps) {
  const { t } = useTranslation();
  const [selectedSystem, setSelectedSystem] = useState<SystemType | "전체">("전체");

  // INFRA- 로 시작하는 세션만 필터링
  const infraSessions = chatSessions.filter((s) => s.request.requestNo.startsWith("INFRA-"));

  // 시스템별 필터링
  const filteredSessions =
    selectedSystem === "전체" ? infraSessions : infraSessions.filter((s) => s.request.system === selectedSystem);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-status-online/20 text-status-online";
      case "in-progress":
        return "bg-status-busy/20 text-status-busy";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return t("common.completed");
      case "in-progress":
        return t("common.inProgress");
      default:
        return t("common.pending");
    }
  };

  return (
    <div className="space-y-6">
      {/* 제목 */}
      <h1 className="text-2xl font-bold text-foreground"></h1>

      {/* 시스템 필터링 및 설정 */}
      <div className="rounded-xl overflow-hidden border border-primary/30">
        <div className="px-4 py-3 bg-primary/20 flex items-center gap-2">
          <Server className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">운영 시스템</span>
        </div>
        <div className="bg-background/80 p-4">
          {/* 시스템 필터 버튼 */}
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground mr-2">시스템 필터:</span>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant={selectedSystem === "전체" ? "default" : "outline"}
                className="h-7 text-xs"
                onClick={() => setSelectedSystem("전체")}
              >
                전체
              </Button>
              {SYSTEMS.map((system) => (
                <Button
                  key={system.id}
                  size="sm"
                  variant={selectedSystem === system.id ? "default" : "outline"}
                  className="h-7 text-xs"
                  onClick={() => setSelectedSystem(system.id)}
                >
                  {system.id}
                </Button>
              ))}
            </div>
          </div>

          {/* 시스템 카드 목록 */}
          <div className="grid grid-cols-3 gap-4">
            {SYSTEMS.map((system) => (
              <div
                key={system.id}
                className={cn(
                  "p-4 rounded-lg border transition-all",
                  selectedSystem === system.id || selectedSystem === "전체"
                    ? "border-primary/50 bg-primary/5"
                    : "border-border/50 bg-card/50 opacity-50",
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{system.name}</span>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => onOpenSettings?.(system.id)}>
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  {infraSessions.filter((s) => s.request.system === system.id).length}건의 작업
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 처리 Chat 이력 */}
      <div className="rounded-xl overflow-hidden border border-primary/30">
        <div className="px-4 py-3 bg-primary/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">처리 Chat 이력</span>
            {selectedSystem !== "전체" && (
              <span className="px-2 py-0.5 rounded text-xs bg-primary/20 text-primary">{selectedSystem}</span>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1 border-primary/30 hover:bg-primary/10"
            onClick={onNewChat}
          >
            <MessageSquare className="w-3 h-3" />새 작업
          </Button>
        </div>
        <div className="bg-background/80 divide-y divide-border/30">
          {filteredSessions.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              {selectedSystem === "전체"
                ? "처리 이력이 없습니다. 새 작업을 시작해보세요."
                : `${selectedSystem} 시스템의 처리 이력이 없습니다.`}
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div
                key={session.id}
                className={cn(
                  "p-3 flex items-center gap-3 hover:bg-primary/5 cursor-pointer transition-colors",
                  activeSessionId === session.id && "bg-primary/10",
                )}
                onClick={() => onSelectSession?.(session.id)}
              >
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{session.request.title}</p>
                    {session.request.system && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-accent/20 text-accent">
                        {session.request.system}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{session.request.requestNo}</span>
                    <span>•</span>
                    <span>{session.request.date}</span>
                  </div>
                </div>
                <span className={cn("px-2 py-0.5 rounded text-xs font-medium", getStatusStyle(session.status))}>
                  {getStatusLabel(session.status)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
