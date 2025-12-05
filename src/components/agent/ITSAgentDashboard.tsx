import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Ticket, UserPlus, Shield, Database, Clock, CheckCircle, AlertCircle, Send, X, Key } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TicketItem {
  id: string;
  ticketNumber: string;
  ticketType: string;
  title: string;
  system: string;
  requester: string;
  status: "open" | "in-progress" | "resolved";
  timestamp: string;
  processHistory?: string;
}

interface ITSAgentDashboardProps {
  onRequest: (requestType: string) => void;
}

const mockTickets: TicketItem[] = [
  { id: "t1", ticketNumber: "ITS-2024-001", ticketType: "계정발급", title: "계정발급요청서", system: "e-총무", requester: "김철수", status: "open", timestamp: "2024-12-05 10:30" },
  { id: "t2", ticketNumber: "ITS-2024-002", ticketType: "데이터추출", title: "데이터추출요청서", system: "BiOn", requester: "이영희", status: "open", timestamp: "2024-12-05 09:45" },
  { id: "t3", ticketNumber: "ITS-2024-003", ticketType: "시스템접근", title: "정보시스템ID신청", system: "SATIS", requester: "박민수", status: "in-progress", timestamp: "2024-12-05 09:15", processHistory: "담당자 배정 완료" },
  { id: "t4", ticketNumber: "ITS-2024-004", ticketType: "SOP", title: "sop", system: "ITS", requester: "정수진", status: "resolved", timestamp: "2024-12-04 16:30", processHistory: "처리 완료" },
];

const mockHistory = [
  { id: 1, title: "VPN 접속 권한 신청", status: "completed" as const },
  { id: 2, title: "신규 계정 발급 요청", status: "in-progress" as const },
  { id: 3, title: "데이터베이스 접근 권한", status: "pending" as const },
  { id: 4, title: "방화벽 포트 오픈 요청", status: "pending" as const },
];

export function ITSAgentDashboard({ onRequest }: ITSAgentDashboardProps) {
  const { t } = useTranslation();
  const [tickets] = useState<TicketItem[]>(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);

  const requestCards = [
    { id: "account", title: t("dashboard.accountRequest"), description: t("dashboard.accountRequestDesc"), icon: <UserPlus className="w-5 h-5" />, bgColor: "bg-amber-100 dark:bg-amber-900/30", borderColor: "border-amber-200 dark:border-amber-800" },
    { id: "firewall", title: t("dashboard.firewallRequest"), description: t("dashboard.firewallRequestDesc"), icon: <Shield className="w-5 h-5" />, bgColor: "bg-orange-100 dark:bg-orange-900/30", borderColor: "border-orange-200 dark:border-orange-800" },
    { id: "data", title: t("dashboard.dataRequest"), description: t("dashboard.dataRequestDesc"), icon: <Database className="w-5 h-5" />, bgColor: "bg-emerald-100 dark:bg-emerald-900/30", borderColor: "border-emerald-200 dark:border-emerald-800" },
    { id: "access", title: t("dashboard.accessRequest"), description: t("dashboard.accessRequestDesc"), icon: <Key className="w-5 h-5" />, bgColor: "bg-green-100 dark:bg-green-900/30", borderColor: "border-green-200 dark:border-green-800" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <span className="px-2 py-0.5 text-xs rounded bg-status-online/20 text-status-online border border-status-online/30">{t("common.completed")}</span>;
      case "in-progress": return <span className="px-2 py-0.5 text-xs rounded bg-status-busy/20 text-status-busy border border-status-busy/30">{t("common.inProgress")}</span>;
      default: return null;
    }
  };

  const openTickets = tickets.filter(t => t.status === "open");
  const inProgressTickets = tickets.filter(t => t.status === "in-progress");
  const resolvedTickets = tickets.filter(t => t.status === "resolved");

  const openCount = openTickets.length;
  const inProgressCount = inProgressTickets.length;
  const resolvedCount = resolvedTickets.length;

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Top Section: ITS 운영 + ITS 요청 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ITS 운영 */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-base font-semibold flex items-center gap-2 text-foreground mb-4">
            <Ticket className="w-5 h-5 text-primary" />
            {t("dashboard.itsOperations")}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg overflow-hidden border border-destructive/30">
              <div className="px-3 py-1.5 bg-destructive/10 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                <span className="text-xs font-medium text-foreground">{t("common.received")}</span>
              </div>
              <div className="p-3 bg-background">
                <p className="text-2xl font-bold text-foreground">{openCount}</p>
              </div>
            </div>
            <div className="rounded-lg overflow-hidden border border-status-busy/30">
              <div className="px-3 py-1.5 bg-status-busy/10 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-status-busy" />
                <span className="text-xs font-medium text-foreground">{t("common.inProgress")}</span>
              </div>
              <div className="p-3 bg-background">
                <p className="text-2xl font-bold text-foreground">{inProgressCount}</p>
              </div>
            </div>
            <div className="rounded-lg overflow-hidden border border-status-online/30">
              <div className="px-3 py-1.5 bg-status-online/10 flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-status-online" />
                <span className="text-xs font-medium text-foreground">{t("common.completed")}</span>
              </div>
              <div className="p-3 bg-background">
                <p className="text-2xl font-bold text-foreground">{resolvedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ITS 요청 */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-base font-semibold flex items-center gap-2 text-foreground mb-4">
            <Send className="w-5 h-5 text-accent" />
            {t("dashboard.itsRequests")}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {requestCards.map(card => (
              <button
                key={card.id}
                onClick={() => onRequest(card.id)}
                className={cn(
                  "rounded-lg border transition-all hover:scale-[1.02] active:scale-[0.98] text-left",
                  card.bgColor, card.borderColor
                )}
              >
                <div className="p-3 flex items-center gap-2">
                  <div className="text-foreground/70">{card.icon}</div>
                  <span className="font-medium text-sm text-foreground">{card.title}</span>
                </div>
                <div className="px-3 pb-3">
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 현황 섹션: ITS 티켓 현황 (Kanban Style) */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 bg-primary/10 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground text-center">{t("dashboard.ticketStatus")}</h3>
        </div>
        <div className="grid grid-cols-3 divide-x divide-border">
          {/* 접수대기 Column */}
          <div>
            <div className="px-4 py-2 bg-muted/50 border-b border-border">
              <span className="font-medium text-sm text-foreground">{t("common.pending")}</span>
            </div>
            <div className="p-3 space-y-2 min-h-[150px]">
              {openTickets.map(ticket => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="w-full p-3 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors text-left"
                >
                  <p className="text-sm font-medium text-foreground truncate">{ticket.title}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 처리중 Column */}
          <div>
            <div className="px-4 py-2 bg-muted/50 border-b border-border">
              <span className="font-medium text-sm text-foreground">{t("common.inProgress")}</span>
            </div>
            <div className="p-3 space-y-2 min-h-[150px]">
              {inProgressTickets.map(ticket => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="w-full p-3 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors text-left"
                >
                  <p className="text-sm font-medium text-foreground truncate">{ticket.title}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 완료 Column */}
          <div>
            <div className="px-4 py-2 bg-muted/50 border-b border-border">
              <span className="font-medium text-sm text-foreground">{t("common.completed")}</span>
            </div>
            <div className="p-3 space-y-2 min-h-[150px]">
              {resolvedTickets.map(ticket => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="w-full p-3 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors text-left"
                >
                  <p className="text-sm font-medium text-foreground truncate">{ticket.title}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 이력 섹션: 처리 이력 */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 bg-muted/50 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground text-center">{t("dashboard.processHistory")}</h3>
        </div>
        <div className="divide-y divide-border">
          {mockHistory.map(item => (
            <div key={item.id} className="px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground w-6">{item.id}</span>
                <span className="text-sm text-foreground">{item.title}</span>
              </div>
              {getStatusBadge(item.status)}
            </div>
          ))}
        </div>
      </div>

      {/* Ticket Detail Modal */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("dashboard.ticketDetail")}</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t("dashboard.ticketNumber")}</p>
                  <p className="text-sm font-medium text-foreground">{selectedTicket.ticketNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t("dashboard.ticketType")}</p>
                  <p className="text-sm font-medium text-foreground">{selectedTicket.ticketType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t("dashboard.ticketTitle")}</p>
                  <p className="text-sm font-medium text-foreground">{selectedTicket.title}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t("sidebar.system")}</p>
                  <p className="text-sm font-medium text-foreground">{selectedTicket.system}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t("common.requester")}</p>
                  <p className="text-sm font-medium text-foreground">{selectedTicket.requester}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t("common.datetime")}</p>
                  <p className="text-sm font-medium text-foreground">{selectedTicket.timestamp}</p>
                </div>
              </div>
              {selectedTicket.processHistory && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t("dashboard.processHistory")}</p>
                  <p className="text-sm font-medium text-foreground">{selectedTicket.processHistory}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
