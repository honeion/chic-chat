import { useState } from "react";
import { useTranslation } from "react-i18next";
import { GitBranch, Calendar, CheckCircle, Clock, AlertTriangle, FileText, Users, Shield, ChevronDown, ChevronUp, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChangeRequest {
  id: string;
  title: string;
  type: "planned" | "emergency" | "standard";
  status: "pending" | "approved" | "in-progress" | "completed" | "rejected";
  requester: string;
  scheduledDate: string;
  risk: "high" | "medium" | "low";
}

const mockChangeRequests: ChangeRequest[] = [
  { id: "cr1", title: "DB Schema Change", type: "planned", status: "approved", requester: "Dev Kim", scheduledDate: "12/10 02:00", risk: "high" },
  { id: "cr2", title: "Security Patch", type: "emergency", status: "in-progress", requester: "Sec Park", scheduledDate: "In Progress", risk: "medium" },
  { id: "cr3", title: "API Version Upgrade", type: "planned", status: "pending", requester: "Backend Lee", scheduledDate: "12/15 03:00", risk: "medium" },
  { id: "cr4", title: "Server Scaling", type: "standard", status: "completed", requester: "Infra Choi", scheduledDate: "Done", risk: "low" },
];

export function ChangeManagementAgentDashboard() {
  const { t } = useTranslation();
  const [isCompletedCollapsed, setIsCompletedCollapsed] = useState(true);

  const getTypeStyle = (type: ChangeRequest["type"]) => {
    switch (type) {
      case "emergency": return "bg-destructive/20 text-destructive";
      case "planned": return "bg-primary/20 text-primary";
      case "standard": return "bg-muted text-muted-foreground";
    }
  };

  const getTypeLabel = (type: ChangeRequest["type"]) => {
    switch (type) {
      case "emergency": return t("change.emergency");
      case "planned": return t("change.planned");
      case "standard": return t("change.standard");
    }
  };

  const getRiskStyle = (risk: ChangeRequest["risk"]) => {
    switch (risk) {
      case "high": return "text-destructive";
      case "medium": return "text-status-busy";
      case "low": return "text-status-online";
    }
  };

  const getRiskLabel = (risk: ChangeRequest["risk"]) => {
    switch (risk) {
      case "high": return t("change.highRisk");
      case "medium": return t("change.mediumRisk");
      case "low": return t("change.lowRisk");
    }
  };

  const pendingRequests = mockChangeRequests.filter(cr => cr.status === "pending" || cr.status === "approved");
  const inProgressRequests = mockChangeRequests.filter(cr => cr.status === "in-progress");
  const completedRequests = mockChangeRequests.filter(cr => cr.status === "completed" || cr.status === "rejected");

  const ChangeRequestListItem = ({ request }: { request: ChangeRequest }) => {
    return (
      <div className="p-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
        <div className="flex items-center gap-2 mb-1">
          <GitBranch className={cn("w-4 h-4 flex-shrink-0", getRiskStyle(request.risk))} />
          <p className="text-sm text-foreground truncate flex-1">{request.title}</p>
          <span className={cn("px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0", getTypeStyle(request.type))}>
            {getTypeLabel(request.type)}
          </span>
        </div>
        <div className="flex items-center gap-3 ml-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {request.requester}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {request.scheduledDate}
          </span>
          <span className={cn("flex items-center gap-1", getRiskStyle(request.risk))}>
            <Shield className="w-3 h-3" />
            {getRiskLabel(request.risk)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* 접수현황 - ITS 스타일 */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-base font-semibold flex items-center gap-2 text-foreground mb-4">
          <Ticket className="w-5 h-5 text-primary" />
          {t("change.changeStatus")}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {/* 접수 */}
          <div className="rounded-lg overflow-hidden border border-destructive/30">
            <div className="px-4 py-2 bg-destructive/20 flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium text-foreground">{t("common.received")}</span>
            </div>
            <div className="p-3 bg-background flex items-center justify-center border-b border-border/50">
              <p className="text-2xl font-bold text-foreground">{pendingRequests.length}</p>
            </div>
            <div className="p-2 bg-background/50 space-y-1.5 max-h-[280px] overflow-y-auto">
              {pendingRequests.length > 0 ? (
                pendingRequests.map(request => (
                  <ChangeRequestListItem key={request.id} request={request} />
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">변경 요청 없음</p>
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
              <p className="text-2xl font-bold text-foreground">{inProgressRequests.length}</p>
            </div>
            <div className="p-2 bg-background/50 space-y-1.5 max-h-[280px] overflow-y-auto">
              {inProgressRequests.length > 0 ? (
                inProgressRequests.map(request => (
                  <ChangeRequestListItem key={request.id} request={request} />
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">변경 요청 없음</p>
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
              <span className="text-sm font-bold text-foreground ml-2">{completedRequests.length}</span>
            </div>
            {isCompletedCollapsed ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          {!isCompletedCollapsed && (
            <div className="p-2 bg-background/50 space-y-1.5 max-h-[200px] overflow-y-auto">
              {completedRequests.length > 0 ? (
                completedRequests.map(request => (
                  <ChangeRequestListItem key={request.id} request={request} />
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">변경 요청 없음</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 변경 요청 관리 */}
      <div className="rounded-xl overflow-hidden border border-primary/30">
        <div className="px-4 py-3 bg-primary/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{t("change.changeManagement")}</span>
          </div>
          <button className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs hover:bg-primary/90 transition-colors">
            + {t("common.newChangeRequest")}
          </button>
        </div>
        <div className="bg-background/80 divide-y divide-border/30">
          {mockChangeRequests.map(cr => (
            <div key={cr.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-foreground">{cr.title}</h4>
                  <span className={cn("px-2 py-0.5 rounded text-xs font-medium", getTypeStyle(cr.type))}>
                    {getTypeLabel(cr.type)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className={cn("w-4 h-4", getRiskStyle(cr.risk))} />
                  <span className={cn("text-xs font-medium", getRiskStyle(cr.risk))}>
                    {getRiskLabel(cr.risk)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {cr.requester}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {cr.scheduledDate}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 이번 주 변경 일정 */}
      <div className="rounded-xl overflow-hidden border border-accent/30">
        <div className="px-4 py-3 bg-accent/20 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-foreground">{t("change.weekSchedule")}</span>
        </div>
        <div className="p-4 bg-background/80">
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">10</p>
                <p className="text-xs text-muted-foreground">Dec</p>
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">DB Schema Change</p>
                <p className="text-xs text-muted-foreground">02:00 - 04:00 | {t("change.highRisk")}</p>
              </div>
              <span className="px-2 py-1 rounded bg-primary/20 text-primary text-xs">{t("common.approved")}</span>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">15</p>
                <p className="text-xs text-muted-foreground">Dec</p>
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">API Version Upgrade</p>
                <p className="text-xs text-muted-foreground">03:00 - 05:00 | {t("change.mediumRisk")}</p>
              </div>
              <span className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs">{t("common.pending")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
