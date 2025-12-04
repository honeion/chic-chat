import { FileText, BarChart3, PieChart, TrendingUp, Download, Clock, CheckCircle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface Report {
  id: string;
  title: string;
  type: "daily" | "weekly" | "monthly" | "custom";
  status: "ready" | "generating" | "scheduled";
  generatedAt: string;
  size: string;
}

interface ScheduledReport {
  id: string;
  title: string;
  schedule: string;
  nextRun: string;
  recipients: number;
}

const mockReports: Report[] = [
  { id: "r1", title: "일일 시스템 현황 보고서", type: "daily", status: "ready", generatedAt: "오늘 06:00", size: "2.3MB" },
  { id: "r2", title: "주간 성과 분석 리포트", type: "weekly", status: "ready", generatedAt: "12/02", size: "5.1MB" },
  { id: "r3", title: "월간 KPI 보고서", type: "monthly", status: "generating", generatedAt: "생성중...", size: "-" },
  { id: "r4", title: "인시던트 분석 보고서", type: "custom", status: "ready", generatedAt: "12/01", size: "1.8MB" },
];

const mockScheduledReports: ScheduledReport[] = [
  { id: "s1", title: "일일 시스템 현황", schedule: "매일 06:00", nextRun: "내일 06:00", recipients: 15 },
  { id: "s2", title: "주간 성과 분석", schedule: "매주 월요일 09:00", nextRun: "12/09 09:00", recipients: 8 },
  { id: "s3", title: "월간 KPI 보고서", schedule: "매월 1일 00:00", nextRun: "01/01 00:00", recipients: 25 },
];

export function ReportAgentDashboard() {
  const getTypeStyle = (type: Report["type"]) => {
    switch (type) {
      case "daily": return "bg-primary/20 text-primary";
      case "weekly": return "bg-accent/20 text-accent";
      case "monthly": return "bg-status-online/20 text-status-online";
      case "custom": return "bg-muted text-muted-foreground";
    }
  };

  const getStatusStyle = (status: Report["status"]) => {
    switch (status) {
      case "ready": return "bg-status-online/20 text-status-online";
      case "generating": return "bg-status-busy/20 text-status-busy";
      case "scheduled": return "bg-muted text-muted-foreground";
    }
  };

  const readyCount = mockReports.filter(r => r.status === "ready").length;
  const generatingCount = mockReports.filter(r => r.status === "generating").length;

  return (
    <div className="space-y-6">
      {/* 보고서 현황 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl overflow-hidden border border-primary/30">
          <div className="px-4 py-2 bg-primary/20 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">전체 보고서</span>
          </div>
          <div className="p-4 bg-background/80">
            <p className="text-3xl font-bold text-foreground">{mockReports.length}<span className="text-lg ml-1">건</span></p>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden border border-status-online/30">
          <div className="px-4 py-2 bg-status-online/20 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-status-online" />
            <span className="text-sm font-medium text-foreground">다운로드 가능</span>
          </div>
          <div className="p-4 bg-background/80">
            <p className="text-3xl font-bold text-status-online">{readyCount}<span className="text-lg ml-1">건</span></p>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden border border-status-busy/30">
          <div className="px-4 py-2 bg-status-busy/20 flex items-center gap-2">
            <Clock className="w-4 h-4 text-status-busy" />
            <span className="text-sm font-medium text-foreground">생성 중</span>
          </div>
          <div className="p-4 bg-background/80">
            <p className="text-3xl font-bold text-status-busy">{generatingCount}<span className="text-lg ml-1">건</span></p>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden border border-accent/30">
          <div className="px-4 py-2 bg-accent/20 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-foreground">예약 보고서</span>
          </div>
          <div className="p-4 bg-background/80">
            <p className="text-3xl font-bold text-foreground">{mockScheduledReports.length}<span className="text-lg ml-1">건</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 보고서 목록 */}
        <div className="rounded-xl overflow-hidden border border-primary/30">
          <div className="px-4 py-3 bg-primary/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">생성된 보고서</span>
            </div>
            <button className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs hover:bg-primary/90 transition-colors">
              + 새 보고서
            </button>
          </div>
          <div className="bg-background/80 divide-y divide-border/30">
            {mockReports.map(report => (
              <div key={report.id} className="p-3 flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{report.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("px-2 py-0.5 rounded text-xs font-medium", getTypeStyle(report.type))}>
                      {report.type === "daily" ? "일일" : report.type === "weekly" ? "주간" : report.type === "monthly" ? "월간" : "사용자"}
                    </span>
                    <span className="text-xs text-muted-foreground">{report.generatedAt}</span>
                    <span className="text-xs text-muted-foreground">{report.size}</span>
                  </div>
                </div>
                {report.status === "ready" ? (
                  <button className="p-2 rounded-lg bg-status-online/20 text-status-online hover:bg-status-online/30 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                ) : (
                  <span className={cn("px-2 py-1 rounded text-xs font-medium", getStatusStyle(report.status))}>
                    생성중
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 예약 보고서 */}
        <div className="rounded-xl overflow-hidden border border-accent/30">
          <div className="px-4 py-3 bg-accent/20 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-foreground">예약 보고서</span>
          </div>
          <div className="bg-background/80 divide-y divide-border/30">
            {mockScheduledReports.map(report => (
              <div key={report.id} className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">{report.title}</p>
                  <span className="text-xs text-muted-foreground">{report.recipients}명 수신</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{report.schedule}</span>
                  <span className="text-primary">다음: {report.nextRun}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-background/60 border-t border-border/30">
            <button className="text-sm text-primary hover:underline w-full text-center font-medium">예약 관리</button>
          </div>
        </div>
      </div>

      {/* 보고서 템플릿 */}
      <div className="rounded-xl overflow-hidden border border-status-online/30">
        <div className="px-4 py-3 bg-status-online/20 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-status-online" />
          <span className="text-sm font-medium text-foreground">빠른 보고서 생성</span>
        </div>
        <div className="p-4 bg-background/80">
          <div className="grid grid-cols-4 gap-4">
            <button className="p-4 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors text-center">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium text-foreground">성과 분석</p>
            </button>
            <button className="p-4 rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-accent" />
              <p className="text-sm font-medium text-foreground">트렌드 분석</p>
            </button>
            <button className="p-4 rounded-lg bg-status-online/10 border border-status-online/20 hover:bg-status-online/20 transition-colors text-center">
              <PieChart className="w-8 h-8 mx-auto mb-2 text-status-online" />
              <p className="text-sm font-medium text-foreground">리소스 현황</p>
            </button>
            <button className="p-4 rounded-lg bg-status-busy/10 border border-status-busy/20 hover:bg-status-busy/20 transition-colors text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-status-busy" />
              <p className="text-sm font-medium text-foreground">인시던트 요약</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
