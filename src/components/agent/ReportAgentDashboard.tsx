import { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  FileText, AlertTriangle, ClipboardList, TestTube, FileCheck, 
  FolderArchive, PlayCircle, Settings, MessageSquare, Download, 
  ChevronDown, ChevronUp, Calendar, Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { ChatSession } from "@/pages/AgentDetail";

// 보고서 타입 정의
interface ReportType {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

// 생성된 보고서 정의
export interface GeneratedReport {
  id: string;
  typeId: string;
  typeName: string;
  title: string;
  generatedAt: string;
  size: string;
  status: "ready" | "generating";
  savedToRAG?: boolean;
}

interface ReportAgentDashboardProps {
  onStartReport?: (reportType: ReportType) => void;
  chatSessions?: ChatSession[];
  onSelectSession?: (sessionId: string) => void;
  activeSessionId?: string | null;
  generatedReports?: GeneratedReport[];
}

const reportTypes: ReportType[] = [
  { 
    id: "incident", 
    name: "장애보고서", 
    icon: <AlertTriangle className="w-6 h-6" />,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/30"
  },
  { 
    id: "change-plan", 
    name: "변경계획서", 
    icon: <ClipboardList className="w-6 h-6" />,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30"
  },
  { 
    id: "test-scenario", 
    name: "테스트시나리오", 
    icon: <TestTube className="w-6 h-6" />,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30"
  },
  { 
    id: "change-result", 
    name: "변경결과보고서", 
    icon: <FileCheck className="w-6 h-6" />,
    color: "text-status-online",
    bgColor: "bg-status-online/10",
    borderColor: "border-status-online/30"
  },
  { 
    id: "consolidated", 
    name: "취합문서", 
    icon: <FolderArchive className="w-6 h-6" />,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30"
  },
];

// Mock 생성된 보고서 데이터
const mockGeneratedReports: GeneratedReport[] = [
  { id: "gr1", typeId: "incident", typeName: "장애보고서", title: "API 서버 장애 보고서 (2024-12-05)", generatedAt: "2024-12-05 14:30", size: "2.3MB", status: "ready" },
  { id: "gr2", typeId: "change-plan", typeName: "변경계획서", title: "DB 스키마 변경 계획서", generatedAt: "2024-12-04 10:00", size: "1.5MB", status: "ready" },
  { id: "gr3", typeId: "test-scenario", typeName: "테스트시나리오", title: "결제 모듈 테스트 시나리오", generatedAt: "2024-12-03 16:45", size: "890KB", status: "ready" },
  { id: "gr4", typeId: "change-result", typeName: "변경결과보고서", title: "인프라 업그레이드 결과 보고서", generatedAt: "2024-12-02 11:20", size: "3.1MB", status: "ready" },
  { id: "gr5", typeId: "consolidated", typeName: "취합문서", title: "11월 월간 운영 보고서", generatedAt: "2024-12-01 09:00", size: "8.5MB", status: "ready" },
];

const getReportTypeConfig = (typeId: string) => {
  return reportTypes.find(r => r.id === typeId) || reportTypes[0];
};

export function ReportAgentDashboard({ 
  onStartReport,
  chatSessions = [], 
  onSelectSession,
  activeSessionId,
  generatedReports: externalReports
}: ReportAgentDashboardProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isReportsExpanded, setIsReportsExpanded] = useState(true);
  
  const generatedReports = externalReports || mockGeneratedReports;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <span className="px-3 py-1 text-xs rounded border bg-status-online/10 text-status-online border-status-online/30">{t("common.completed")}</span>;
      case "in-progress": return <span className="px-3 py-1 text-xs rounded border bg-status-busy/10 text-status-busy border-status-busy/30">{t("common.inProgress")}</span>;
      default: return null;
    }
  };

  const handleExecute = (reportType: ReportType) => {
    if (onStartReport) {
      onStartReport(reportType);
    }
  };

  const handleDownload = (report: GeneratedReport) => {
    toast({
      title: "다운로드 시작",
      description: `"${report.title}" 다운로드가 시작됩니다.`,
    });
  };

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* 보고서 유형 박스 */}
      <div className="grid grid-cols-5 gap-4">
        {reportTypes.map(report => (
          <div 
            key={report.id} 
            className={cn(
              "rounded-xl border p-4 flex flex-col items-center gap-3",
              report.borderColor,
              report.bgColor
            )}
          >
            <div className={cn("p-3 rounded-full", report.bgColor, report.color)}>
              {report.icon}
            </div>
            <span className="text-sm font-medium text-foreground text-center">{report.name}</span>
            <div className="flex items-center gap-2 mt-auto">
              <button
                onClick={() => handleExecute(report)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  report.bgColor,
                  `hover:${report.bgColor}`,
                  report.color
                )}
                title="보고서 생성"
              >
                <PlayCircle className="w-5 h-5" />
              </button>
              <button
                className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                title="설정"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 생성된 보고서 목록 */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <button
          onClick={() => setIsReportsExpanded(!isReportsExpanded)}
          className="w-full px-4 py-3 bg-primary/10 border-b border-border flex items-center justify-between hover:bg-primary/15 transition-colors"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">생성된 보고서</h4>
            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
              {generatedReports.length}
            </span>
          </div>
          {isReportsExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        
        {isReportsExpanded && (
          <div className="divide-y divide-border max-h-[280px] overflow-y-auto">
            {generatedReports.length > 0 ? (
              generatedReports.map(report => {
                const typeConfig = getReportTypeConfig(report.typeId);
                return (
                  <div 
                    key={report.id} 
                    className="px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                  >
                    <span className={cn("flex-shrink-0 p-2 rounded-lg", typeConfig.bgColor, typeConfig.color)}>
                      {typeConfig.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{report.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={cn("px-2 py-0.5 rounded text-xs font-medium", typeConfig.bgColor, typeConfig.color)}>
                          {report.typeName}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {report.generatedAt}
                        </span>
                        <span className="text-xs text-muted-foreground">{report.size}</span>
                        {report.savedToRAG !== undefined && (
                          <span className={cn(
                            "px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1",
                            report.savedToRAG 
                              ? "bg-primary/20 text-primary" 
                              : "bg-muted text-muted-foreground"
                          )}>
                            <Database className="w-3 h-3" />
                            {report.savedToRAG ? "RAG 저장됨" : "RAG 미저장"}
                          </span>
                        )}
                      </div>
                    </div>
                    {report.status === "ready" ? (
                      <button
                        onClick={() => handleDownload(report)}
                        className="p-2 rounded-lg bg-status-online/20 text-status-online hover:bg-status-online/30 transition-colors flex-shrink-0"
                        title="다운로드"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-status-busy/20 text-status-busy">
                        생성 중...
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-muted-foreground">생성된 보고서가 없습니다</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 처리 Chat 이력 */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 bg-muted/50 border-b border-border flex items-center justify-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">{t("dashboard.processChatHistory")}</h4>
        </div>
        <div className="divide-y divide-border">
          {chatSessions.length > 0 ? (
            chatSessions.map(session => {
              const isActive = session.id === activeSessionId;
              return (
                <button
                  key={session.id}
                  onClick={() => onSelectSession?.(session.id)}
                  className={cn(
                    "w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors text-left",
                    isActive && "bg-primary/10 border-l-2 border-l-primary"
                  )}
                >
                  <span className="flex-shrink-0 text-primary">
                    <FileText className="w-4 h-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{session.request?.title || "보고서 생성"}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-primary/80 font-mono">{session.request?.requestNo || session.id}</span>
                      <span className="text-xs text-muted-foreground">{session.request?.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{session.messages.length}</span>
                    {getStatusBadge(session.status)}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-muted-foreground">채팅 이력이 없습니다</p>
              <p className="text-xs text-muted-foreground mt-1">보고서 유형의 실행 버튼을 눌러 생성을 시작하세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}