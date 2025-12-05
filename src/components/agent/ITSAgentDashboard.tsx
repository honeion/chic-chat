import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Ticket, UserPlus, Shield, Database, Clock, CheckCircle, AlertCircle, Send, Key } from "lucide-react";
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
  { id: 1, title: "", status: "completed" as const },
  { id: 2, title: "", status: "in-progress" as const },
  { id: 3, title: "", status: "pending" as const },
  { id: 4, title: "", status: "pending" as const },
];

export function ITSAgentDashboard({ onRequest }: ITSAgentDashboardProps) {
  const { t } = useTranslation();
  const [tickets] = useState<TicketItem[]>(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);

  const requestCards = [
    { id: "account", title: t("dashboard.accountRequest"), description: t("dashboard.accountRequestDesc"), icon: <UserPlus className="w-5 h-5" />, bgColor: "bg-amber-100 dark:bg-amber-900/30", headerColor: "bg-amber-200 dark:bg-amber-800/50" },
    { id: "firewall", title: t("dashboard.firewallRequest"), description: t("dashboard.firewallRequestDesc"), icon: <Shield className="w-5 h-5" />, bgColor: "bg-orange-100 dark:bg-orange-900/30", headerColor: "bg-orange-200 dark:bg-orange-800/50" },
    { id: "data", title: t("dashboard.dataRequest"), description: t("dashboard.dataRequestDesc"), icon: <Database className="w-5 h-5" />, bgColor: "bg-emerald-100 dark:bg-emerald-900/30", headerColor: "bg-emerald-200 dark:bg-emerald-800/50" },
    { id: "access", title: t("dashboard.accessRequest"), description: t("dashboard.accessRequestDesc"), icon: <Key className="w-5 h-5" />, bgColor: "bg-green-100 dark:bg-green-900/30", headerColor: "bg-green-200 dark:bg-green-800/50" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <span className="px-3 py-1 text-xs rounded border bg-status-online/10 text-status-online border-status-online/30">{t("common.completed")}</span>;
      case "in-progress": return <span className="px-3 py-1 text-xs rounded border bg-status-busy/10 text-status-busy border-status-busy/30">{t("common.inProgress")}</span>;
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
      {/* ITS 운영 + ITS 요청 - 하나의 카드 안에 */}
      <div className="rounded-xl border border-border bg-card p-5">
        {/* ITS 운영 */}
        <div className="mb-6">
          <h3 className="text-base font-semibold flex items-center gap-2 text-foreground mb-4">
            <Ticket className="w-5 h-5 text-primary" />
            {t("dashboard.itsOperations")}
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg overflow-hidden border border-destructive/30">
              <div className="px-4 py-2 bg-destructive/20 flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium text-foreground">{t("common.received")}</span>
              </div>
              <div className="p-4 bg-background flex items-center justify-center">
                <p className="text-3xl font-bold text-foreground">{openCount}</p>
              </div>
            </div>
            <div className="rounded-lg overflow-hidden border border-status-busy/30">
              <div className="px-4 py-2 bg-status-busy/20 flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-status-busy" />
                <span className="text-sm font-medium text-foreground">{t("common.inProgress")}</span>
              </div>
              <div className="p-4 bg-background flex items-center justify-center">
                <p className="text-3xl font-bold text-foreground">{inProgressCount}</p>
              </div>
            </div>
            <div className="rounded-lg overflow-hidden border border-status-online/30">
              <div className="px-4 py-2 bg-status-online/20 flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-status-online" />
                <span className="text-sm font-medium text-foreground">{t("common.completed")}</span>
              </div>
              <div className="p-4 bg-background flex items-center justify-center">
                <p className="text-3xl font-bold text-foreground">{resolvedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ITS 요청 - 한 줄에 4개 */}
        <div>
          <h3 className="text-base font-semibold flex items-center gap-2 text-foreground mb-4">
            <Send className="w-5 h-5 text-accent" />
            {t("dashboard.itsRequests")}
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {requestCards.map(card => (
              <button
                key={card.id}
                onClick={() => onRequest(card.id)}
                className={cn(
                  "rounded-lg overflow-hidden border border-border transition-all hover:scale-[1.02] active:scale-[0.98] text-left",
                  card.bgColor
                )}
              >
                <div className={cn("px-3 py-2 flex items-center justify-center gap-2", card.headerColor)}>
                  <div className="text-foreground/80">{card.icon}</div>
                  <span className="font-medium text-sm text-foreground">{card.title}</span>
                </div>
                <div className="p-3">
                  <p className="text-xs text-muted-foreground text-center">{card.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 현황 섹션 */}
      <div>
        <h3 className="text-base font-semibold text-foreground mb-3">{t("dashboard.statusSection")}</h3>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 bg-primary/10 border-b border-border">
            <h4 className="text-sm font-semibold text-foreground text-center">{t("dashboard.ticketStatus")}</h4>
          </div>
          <div className="grid grid-cols-3 divide-x divide-border">
            {/* 접수대기 Column */}
            <div>
              <div className="px-4 py-2 bg-muted/50 border-b border-border">
                <span className="font-medium text-sm text-foreground">{t("common.pending")}</span>
              </div>
              <div className="p-3 space-y-2 min-h-[120px]">
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
              <div className="p-3 space-y-2 min-h-[120px]">
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
              <div className="p-3 space-y-2 min-h-[120px]">
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
      </div>

      {/* 이력 섹션 */}
      <div>
        <h3 className="text-base font-semibold text-foreground mb-3">{t("dashboard.historySection")}</h3>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 bg-muted/50 border-b border-border">
            <h4 className="text-sm font-semibold text-foreground text-center">{t("dashboard.processHistory")}</h4>
          </div>
          <div className="divide-y divide-border">
            {mockHistory.map(item => (
              <div key={item.id} className="px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <span className="text-sm font-medium text-foreground">{item.id}</span>
                {getStatusBadge(item.status)}
              </div>
            ))}
          </div>
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
