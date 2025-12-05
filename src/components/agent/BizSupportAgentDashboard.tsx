import { useTranslation } from "react-i18next";
import { Briefcase, TrendingUp, Users, FileText, CheckCircle, Clock, AlertTriangle, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  department: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in-progress" | "completed";
  dueDate: string;
}

interface Report {
  id: string;
  title: string;
  type: string;
  status: "ready" | "generating" | "scheduled";
  timestamp: string;
}

const mockTasks: Task[] = [
  { id: "t1", title: "Q4 Budget Review", department: "Finance", priority: "high", status: "in-progress", dueDate: "12/15" },
  { id: "t2", title: "HR Evaluation Data Collection", department: "HR", priority: "high", status: "pending", dueDate: "12/10" },
  { id: "t3", title: "Marketing ROI Analysis", department: "Marketing", priority: "medium", status: "completed", dueDate: "12/05" },
  { id: "t4", title: "Annual Report Draft", department: "Planning", priority: "medium", status: "pending", dueDate: "12/20" },
];

const mockReports: Report[] = [
  { id: "r1", title: "Weekly Business Report", type: "Regular", status: "ready", timestamp: "10:00" },
  { id: "r2", title: "Sales Analysis Report", type: "Analysis", status: "generating", timestamp: "Generating" },
  { id: "r3", title: "KPI Status Report", type: "KPI", status: "scheduled", timestamp: "14:00 Scheduled" },
];

export function BizSupportAgentDashboard() {
  const { t } = useTranslation();

  const getPriorityStyle = (priority: Task["priority"]) => {
    switch (priority) {
      case "high": return "bg-destructive/20 text-destructive";
      case "medium": return "bg-status-busy/20 text-status-busy";
      case "low": return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityLabel = (priority: Task["priority"]) => {
    switch (priority) {
      case "high": return t("common.urgent");
      case "medium": return t("common.normal");
      case "low": return t("common.low");
    }
  };

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4 text-status-online" />;
      case "in-progress": return <Clock className="w-4 h-4 text-status-busy" />;
      case "pending": return <AlertTriangle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getReportStatusStyle = (status: Report["status"]) => {
    switch (status) {
      case "ready": return "bg-status-online/20 text-status-online";
      case "generating": return "bg-primary/20 text-primary";
      case "scheduled": return "bg-muted text-muted-foreground";
    }
  };

  const getReportStatusLabel = (status: Report["status"]) => {
    switch (status) {
      case "ready": return t("biz.ready");
      case "generating": return t("report.generating");
      case "scheduled": return t("biz.scheduled");
    }
  };

  const pendingTasks = mockTasks.filter(t => t.status === "pending").length;
  const inProgressTasks = mockTasks.filter(t => t.status === "in-progress").length;
  const completedTasks = mockTasks.filter(t => t.status === "completed").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl overflow-hidden border border-primary/30">
          <div className="px-4 py-2 bg-primary/20 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{t("biz.totalTasks")}</span>
          </div>
          <div className="p-4 bg-background/80">
            <p className="text-3xl font-bold text-foreground">{mockTasks.length}</p>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden border border-status-busy/30">
          <div className="px-4 py-2 bg-status-busy/20 flex items-center gap-2">
            <Clock className="w-4 h-4 text-status-busy" />
            <span className="text-sm font-medium text-foreground">{t("common.inProgress")}</span>
          </div>
          <div className="p-4 bg-background/80">
            <p className="text-3xl font-bold text-status-busy">{inProgressTasks}</p>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden border border-destructive/30">
          <div className="px-4 py-2 bg-destructive/20 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-foreground">{t("common.pending")}</span>
          </div>
          <div className="p-4 bg-background/80">
            <p className="text-3xl font-bold text-destructive">{pendingTasks}</p>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden border border-status-online/30">
          <div className="px-4 py-2 bg-status-online/20 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-status-online" />
            <span className="text-sm font-medium text-foreground">{t("common.completed")}</span>
          </div>
          <div className="p-4 bg-background/80">
            <p className="text-3xl font-bold text-status-online">{completedTasks}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-xl overflow-hidden border border-primary/30">
          <div className="px-4 py-3 bg-primary/20 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{t("biz.taskStatus")}</span>
          </div>
          <div className="bg-background/80 divide-y divide-border/30">
            {mockTasks.map(task => (
              <div key={task.id} className="p-3 flex items-center gap-3">
                {getStatusIcon(task.status)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.department}</p>
                </div>
                <span className={cn("px-2 py-0.5 rounded text-xs font-medium", getPriorityStyle(task.priority))}>
                  {getPriorityLabel(task.priority)}
                </span>
                <span className="text-xs text-muted-foreground">{task.dueDate}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-accent/30">
          <div className="px-4 py-3 bg-accent/20 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-foreground">{t("biz.autoReport")}</span>
          </div>
          <div className="bg-background/80 divide-y divide-border/30">
            {mockReports.map(report => (
              <div key={report.id} className="p-3 flex items-center gap-3">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{report.title}</p>
                  <p className="text-xs text-muted-foreground">{report.type}</p>
                </div>
                <span className={cn("px-2 py-0.5 rounded text-xs font-medium", getReportStatusStyle(report.status))}>
                  {getReportStatusLabel(report.status)}
                </span>
                <span className="text-xs text-muted-foreground">{report.timestamp}</span>
              </div>
            ))}
          </div>
          <div className="p-3 bg-background/60 border-t border-border/30">
            <button className="text-sm text-primary hover:underline w-full text-center font-medium">{t("common.newReport")}</button>
          </div>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-status-online/30">
        <div className="px-4 py-3 bg-status-online/20 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-status-online" />
          <span className="text-sm font-medium text-foreground">{t("biz.kpiStatus")}</span>
        </div>
        <div className="p-4 bg-background/80">
          <div className="grid grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
              <p className="text-xs text-muted-foreground mb-1">{t("biz.taskProcessRate")}</p>
              <p className="text-2xl font-bold text-foreground">87%</p>
            </div>
            <div className="p-3 rounded-lg bg-status-online/10 border border-status-online/20 text-center">
              <p className="text-xs text-muted-foreground mb-1">{t("biz.goalAchievement")}</p>
              <p className="text-2xl font-bold text-status-online">92%</p>
            </div>
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 text-center">
              <p className="text-xs text-muted-foreground mb-1">{t("biz.responseTime")}</p>
              <p className="text-2xl font-bold text-foreground">1.2h</p>
            </div>
            <div className="p-3 rounded-lg bg-status-busy/10 border border-status-busy/20 text-center">
              <p className="text-xs text-muted-foreground mb-1">{t("biz.unprocessed")}</p>
              <p className="text-2xl font-bold text-status-busy">5</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
