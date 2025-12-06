import { useTranslation } from "react-i18next";
import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  status: "completed" | "in-progress";
}

const mockChatHistory: ChatSession[] = [
  { id: "c1", title: "e-총무 시스템 접속 오류 문의", timestamp: "2024-12-05 14:30", status: "completed" },
  { id: "c2", title: "구매시스템 결재 프로세스 문의", timestamp: "2024-12-05 11:20", status: "completed" },
  { id: "c3", title: "영업시스템 데이터 조회 권한 요청", timestamp: "2024-12-04 16:45", status: "completed" },
  { id: "c4", title: "물류시스템 재고 현황 조회 방법 안내", timestamp: "2024-12-04 09:15", status: "in-progress" },
  { id: "c5", title: "SAP 연동 오류 해결 지원", timestamp: "2024-12-03 15:40", status: "completed" },
];

interface BizSupportAgentDashboardProps {
  onNewChat?: () => void;
}

export function BizSupportAgentDashboard({ onNewChat }: BizSupportAgentDashboardProps) {
  const { t } = useTranslation();

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
          {mockChatHistory.map(session => (
            <div key={session.id} className="p-3 flex items-center gap-3 hover:bg-primary/5 cursor-pointer transition-colors">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{session.title}</p>
                <p className="text-xs text-muted-foreground">{session.timestamp}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                session.status === "completed" 
                  ? "bg-status-online/20 text-status-online" 
                  : "bg-status-busy/20 text-status-busy"
              }`}>
                {session.status === "completed" ? t("common.completed") : t("common.inProgress")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
