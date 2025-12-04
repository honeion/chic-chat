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
  { id: "t1", title: "Q4 예산 검토", department: "재무팀", priority: "high", status: "in-progress", dueDate: "12/15" },
  { id: "t2", title: "인사평가 자료 취합", department: "인사팀", priority: "high", status: "pending", dueDate: "12/10" },
  { id: "t3", title: "마케팅 ROI 분석", department: "마케팅팀", priority: "medium", status: "completed", dueDate: "12/05" },
  { id: "t4", title: "연간 보고서 초안", department: "기획팀", priority: "medium", status: "pending", dueDate: "12/20" },
];

const mockReports: Report[] = [
  { id: "r1", title: "주간 업무 보고서", type: "정기", status: "ready", timestamp: "10:00" },
  { id: "r2", title: "매출 분석 리포트", type: "분석", status: "generating", timestamp: "생성중" },
  { id: "r3", title: "KPI 현황 보고서", type: "KPI", status: "scheduled", timestamp: "14:00 예정" },
];

export function BizSupportAgentDashboard() {
  const getPriorityStyle = (priority: Task["priority"]) => {
    switch (priority) {
      case "high": return "bg-destructive/20 text-destructive";
      case "medium": return "bg-status-busy/20 text-status-busy";
      case "low": return "bg-muted text-muted-foreground";
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

  const pendingTasks = mockTasks.filter(t => t.status === "pending").length;
  const inProgressTasks = mockTasks.filter(t => t.status === "in-progress").length;
  const completedTasks = mockTasks.filter(t => t.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* 업무 현황 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl overflow-hidden border border-primary/30">
          <div className="px-4 py-2 bg-primary/20 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">전체 업무</span>
          </div>
          <div className="p-4 bg-background/80">
            <p className="text-3xl font-bold text-foreground">{mockTasks.length}<span className="text-lg ml-1">건</span></p>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden border border-status-busy/30">
          <div className="px-4 py-2 bg-status-busy/20 flex items-center gap-2">
            <Clock className="w-4 h-4 text-status-busy" />
            <span className="text-sm font-medium text-foreground">진행 중</span>
          </div>
          <div className="p-4 bg-background/80">
            <p className="text-3xl font-bold text-status-busy">{inProgressTasks}<span className="text-lg ml-1">건</span></p>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden border border-destructive/30">
          <div className="px-4 py-2 bg-destructive/20 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-foreground">대기 중</span>
          </div>
          <div className="p-4 bg-background/80">
            <p className="text-3xl font-bold text-destructive">{pendingTasks}<span className="text-lg ml-1">건</span></p>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden border border-status-online/30">
          <div className="px-4 py-2 bg-status-online/20 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-status-online" />
            <span className="text-sm font-medium text-foreground">완료</span>
          </div>
          <div className="p-4 bg-background/80">
            <p className="text-3xl font-bold text-status-online">{completedTasks}<span className="text-lg ml-1">건</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 업무 목록 */}
        <div className="rounded-xl overflow-hidden border border-primary/30">
          <div className="px-4 py-3 bg-primary/20 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">업무 현황</span>
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
                  {task.priority === "high" ? "긴급" : task.priority === "medium" ? "보통" : "낮음"}
                </span>
                <span className="text-xs text-muted-foreground">{task.dueDate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 보고서 */}
        <div className="rounded-xl overflow-hidden border border-accent/30">
          <div className="px-4 py-3 bg-accent/20 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-foreground">자동 보고서</span>
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
                  {report.status === "ready" ? "준비됨" : report.status === "generating" ? "생성중" : "예정"}
                </span>
                <span className="text-xs text-muted-foreground">{report.timestamp}</span>
              </div>
            ))}
          </div>
          <div className="p-3 bg-background/60 border-t border-border/30">
            <button className="text-sm text-primary hover:underline w-full text-center font-medium">새 보고서 생성</button>
          </div>
        </div>
      </div>

      {/* KPI 대시보드 */}
      <div className="rounded-xl overflow-hidden border border-status-online/30">
        <div className="px-4 py-3 bg-status-online/20 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-status-online" />
          <span className="text-sm font-medium text-foreground">KPI 현황</span>
        </div>
        <div className="p-4 bg-background/80">
          <div className="grid grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
              <p className="text-xs text-muted-foreground mb-1">업무 처리율</p>
              <p className="text-2xl font-bold text-foreground">87%</p>
            </div>
            <div className="p-3 rounded-lg bg-status-online/10 border border-status-online/20 text-center">
              <p className="text-xs text-muted-foreground mb-1">목표 달성률</p>
              <p className="text-2xl font-bold text-status-online">92%</p>
            </div>
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 text-center">
              <p className="text-xs text-muted-foreground mb-1">응답 시간</p>
              <p className="text-2xl font-bold text-foreground">1.2h</p>
            </div>
            <div className="p-3 rounded-lg bg-status-busy/10 border border-status-busy/20 text-center">
              <p className="text-xs text-muted-foreground mb-1">미처리 건</p>
              <p className="text-2xl font-bold text-status-busy">5</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
