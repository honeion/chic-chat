import { useTranslation } from "react-i18next";
import { MessageSquare } from "lucide-react";

interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  status: "completed" | "in-progress";
}

const mockChatHistory: ChatSession[] = [
  { id: "c1", title: "예산 검토 요청", timestamp: "2024-12-05 14:30", status: "completed" },
  { id: "c2", title: "HR 데이터 수집 문의", timestamp: "2024-12-05 11:20", status: "completed" },
  { id: "c3", title: "마케팅 분석 요청", timestamp: "2024-12-04 16:45", status: "completed" },
  { id: "c4", title: "연간 보고서 초안 작성", timestamp: "2024-12-04 09:15", status: "in-progress" },
];

export function BizSupportAgentDashboard() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="rounded-xl overflow-hidden border border-primary/30">
        <div className="px-4 py-3 bg-primary/20 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">{t("agent.chatHistory")}</span>
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
