import { useTranslation } from "react-i18next";
import { GitBranch, Calendar, CheckCircle, Clock, AlertTriangle, FileText, Users, Shield } from "lucide-react";
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

  const getStatusStyle = (status: ChangeRequest["status"]) => {
    switch (status) {
      case "completed": return "bg-status-online/20 text-status-online";
      case "in-progress": return "bg-status-busy/20 text-status-busy";
      case "approved": return "bg-primary/20 text-primary";
      case "pending": return "bg-muted text-muted-foreground";
      case "rejected": return "bg-destructive/20 text-destructive";
    }
  };

  const getStatusLabel = (status: ChangeRequest["status"]) => {
    switch (status) {
      case "completed": return t("common.completed");
      case "in-progress": return t("common.inProgress");
      case "approved": return t("common.approved");
      case "pending": return t("common.pending");
      case "rejected": return t("common.reject");
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

  const pendingCount = mockChangeRequests.filter(cr => cr.status === "pending").length;
  const inProgressCount = mockChangeRequests.filter(cr => cr.status === "in-progress").length;
  const approvedCount = mockChangeRequests.filter(cr => cr.status === "approved").length;
  const completedCount = mockChangeRequests.filter(cr => cr.status === "completed").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl overflow-hidden border border-muted-foreground/30">
          <div className="px-4 py-2 bg-muted/50 flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{t("common.pending")}</span>
          </div>
          <div className="p-4 bg-background/80">
            <p className="text-3xl font-bold text-foreground">{pendingCount}</p>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden border border-primary/30">
          <div className="px-4 py-2 bg-primary/20 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{t("common.approved")}</span>
          </div>
          <div className="p-4 bg-background/80">
            <p className="text-3xl font-bold text-primary">{approvedCount}</p>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden border border-status-busy/30">
          <div className="px-4 py-2 bg-status-busy/20 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-status-busy" />
            <span className="text-sm font-medium text-foreground">{t("common.inProgress")}</span>
          </div>
          <div className="p-4 bg-background/80">
            <p className="text-3xl font-bold text-status-busy">{inProgressCount}</p>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden border border-status-online/30">
          <div className="px-4 py-2 bg-status-online/20 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-status-online" />
            <span className="text-sm font-medium text-foreground">{t("common.completed")}</span>
          </div>
          <div className="p-4 bg-background/80">
            <p className="text-3xl font-bold text-status-online">{completedCount}</p>
          </div>
        </div>
      </div>

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
                  <span className={cn("px-2 py-0.5 rounded text-xs font-medium", getStatusStyle(cr.status))}>
                    {getStatusLabel(cr.status)}
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
