import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Ticket, UserPlus, Shield, Database, Clock, CheckCircle, AlertCircle, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface TicketItem {
  id: string;
  title: string;
  requester: string;
  status: "open" | "in-progress" | "resolved";
  priority: "high" | "medium" | "low";
  timestamp: string;
}

interface ITSAgentDashboardProps {
  onRequest: (requestType: string) => void;
}

const mockTickets: TicketItem[] = [
  { id: "t1", title: "VPN 접속 오류", requester: "김철수", status: "open", priority: "high", timestamp: "10:30" },
  { id: "t2", title: "이메일 수신 불가", requester: "이영희", status: "in-progress", priority: "medium", timestamp: "09:45" },
  { id: "t3", title: "프린터 연결 문제", requester: "박민수", status: "open", priority: "low", timestamp: "09:15" },
  { id: "t4", title: "소프트웨어 설치 요청", requester: "정수진", status: "resolved", priority: "medium", timestamp: "08:30" },
];

export function ITSAgentDashboard({ onRequest }: ITSAgentDashboardProps) {
  const { t } = useTranslation();
  const [tickets] = useState<TicketItem[]>(mockTickets);

  const requestCards = [
    { id: "account", title: t("dashboard.accountRequest"), description: t("dashboard.accountRequestDesc"), icon: <UserPlus className="w-6 h-6" />, color: "primary" },
    { id: "firewall", title: t("dashboard.firewallRequest"), description: t("dashboard.firewallRequestDesc"), icon: <Shield className="w-6 h-6" />, color: "status-busy" },
    { id: "data", title: t("dashboard.dataRequest"), description: t("dashboard.dataRequestDesc"), icon: <Database className="w-6 h-6" />, color: "accent" },
    { id: "access", title: t("dashboard.accessRequest"), description: t("dashboard.accessRequestDesc"), icon: <Shield className="w-6 h-6" />, color: "status-online" },
  ];

  const getStatusStyle = (status: TicketItem["status"]) => {
    switch (status) {
      case "open": return "bg-destructive/20 text-destructive";
      case "in-progress": return "bg-status-busy/20 text-status-busy";
      case "resolved": return "bg-status-online/20 text-status-online";
    }
  };

  const getStatusText = (status: TicketItem["status"]) => {
    switch (status) {
      case "open": return t("common.received");
      case "in-progress": return t("common.inProgress");
      case "resolved": return t("common.completed");
    }
  };

  const openCount = tickets.filter(t => t.status === "open").length;
  const inProgressCount = tickets.filter(t => t.status === "in-progress").length;
  const resolvedCount = tickets.filter(t => t.status === "resolved").length;

  return (
    <div className="grid grid-cols-2 gap-6 h-full">
      {/* ITS Operations Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
          <Ticket className="w-5 h-5 text-primary" />
          {t("dashboard.itsOperations")}
        </h3>

        {/* Ticket Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl overflow-hidden border border-destructive/30">
            <div className="px-3 py-2 bg-destructive/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-xs font-medium text-foreground">{t("common.received")}</span>
            </div>
            <div className="p-3 bg-background/80">
              <p className="text-2xl font-bold text-foreground">{openCount}</p>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-status-busy/30">
            <div className="px-3 py-2 bg-status-busy/20 flex items-center gap-2">
              <Clock className="w-4 h-4 text-status-busy" />
              <span className="text-xs font-medium text-foreground">{t("common.inProgress")}</span>
            </div>
            <div className="p-3 bg-background/80">
              <p className="text-2xl font-bold text-foreground">{inProgressCount}</p>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-status-online/30">
            <div className="px-3 py-2 bg-status-online/20 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-status-online" />
              <span className="text-xs font-medium text-foreground">{t("common.completed")}</span>
            </div>
            <div className="p-3 bg-background/80">
              <p className="text-2xl font-bold text-foreground">{resolvedCount}</p>
            </div>
          </div>
        </div>

        {/* Ticket List */}
        <div className="rounded-xl overflow-hidden border border-primary/30">
          <div className="px-4 py-3 bg-primary/20 flex items-center gap-2">
            <Ticket className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{t("dashboard.ticketStatus")}</span>
          </div>
          <div className="bg-background/80 divide-y divide-border/30 max-h-[400px] overflow-y-auto">
            {tickets.map(ticket => (
              <div key={ticket.id} className="p-3 hover:bg-primary/5 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-foreground text-sm">{ticket.title}</span>
                  <span className={cn("px-2 py-0.5 rounded text-xs font-medium", getStatusStyle(ticket.status))}>
                    {getStatusText(ticket.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t("common.requester")}: {ticket.requester}</span>
                  <span>{ticket.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ITS Requests Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
          <Send className="w-5 h-5 text-accent" />
          {t("dashboard.itsRequests")}
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {requestCards.map(card => (
            <button
              key={card.id}
              onClick={() => onRequest(card.id)}
              className={cn(
                "rounded-xl overflow-hidden border transition-all hover:scale-[1.02] active:scale-[0.98]",
                card.color === "primary" && "border-primary/30 hover:border-primary/60",
                card.color === "status-busy" && "border-status-busy/30 hover:border-status-busy/60",
                card.color === "accent" && "border-accent/30 hover:border-accent/60",
                card.color === "status-online" && "border-status-online/30 hover:border-status-online/60"
              )}
            >
              <div className={cn(
                "px-4 py-3 flex items-center gap-3",
                card.color === "primary" && "bg-primary/20",
                card.color === "status-busy" && "bg-status-busy/20",
                card.color === "accent" && "bg-accent/20",
                card.color === "status-online" && "bg-status-online/20"
              )}>
                <div className={cn(
                  card.color === "primary" && "text-primary",
                  card.color === "status-busy" && "text-status-busy",
                  card.color === "accent" && "text-accent",
                  card.color === "status-online" && "text-status-online"
                )}>
                  {card.icon}
                </div>
                <span className="font-semibold text-foreground">{card.title}</span>
              </div>
              <div className="p-4 bg-background/80">
                <p className="text-sm text-muted-foreground">{card.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Recent Requests */}
        <div className="rounded-xl overflow-hidden border border-accent/30">
          <div className="px-4 py-3 bg-accent/20 flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-foreground">{t("dashboard.recentRequests")}</span>
          </div>
          <div className="bg-background/80 p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">{t("dashboard.accountRequest")} - 홍길동</span>
                <span className="text-status-online text-xs">{t("common.approved")}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">{t("dashboard.firewallRequest")} - 10.0.0.1:8080</span>
                <span className="text-status-busy text-xs">{t("common.reviewing")}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">{t("dashboard.dataRequest")} - 고객DB</span>
                <span className="text-primary text-xs">{t("common.processing")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
