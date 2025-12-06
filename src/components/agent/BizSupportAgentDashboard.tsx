import { useTranslation } from "react-i18next";
import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatSession {
  id: string;
  request: {
    id: string;
    requestNo: string;
    title: string;
    date: string;
  };
  messages: any[];
  status: string;
  createdAt: string;
}

interface BizSupportAgentDashboardProps {
  onNewChat?: () => void;
  onSelectSession?: (sessionId: string) => void;
  chatSessions?: ChatSession[];
  activeSessionId?: string | null;
}

export function BizSupportAgentDashboard({ 
  onNewChat, 
  onSelectSession,
  chatSessions = [],
  activeSessionId
}: BizSupportAgentDashboardProps) {
  const { t } = useTranslation();

  // Biz.Support 관련 세션만 필터링 (BIZ- 으로 시작하는 요청번호)
  const bizSessions = chatSessions.filter(s => 
    s.request.requestNo.startsWith("BIZ-")
  );

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
      <div className="rounded-xl overflow-hidden border border-primary/30">
        <div className="px-4 py-3 bg-primary/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{t("biz.chatHistory")}</span>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-7 text-xs gap-1 border-primary/30 hover:bg-primary/10"
            onClick={onNewChat}
          >
            <Plus className="w-3 h-3" />
            {t("biz.newChat")}
          </Button>
        </div>
        <div className="bg-background/80 divide-y divide-border/30">
          {bizSessions.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              채팅 이력이 없습니다. 새 채팅을 시작해보세요.
            </div>
          ) : (
            bizSessions.map(session => (
              <div 
                key={session.id} 
                className={cn(
                  "p-3 flex items-center gap-3 hover:bg-primary/5 cursor-pointer transition-colors",
                  activeSessionId === session.id && "bg-primary/10"
                )}
                onClick={() => onSelectSession?.(session.id)}
              >
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{session.request.title}</p>
                  <p className="text-xs text-muted-foreground">{session.request.date}</p>
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
