import { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  FileText, AlertTriangle, ClipboardList, TestTube, FileCheck, 
  FolderArchive, PlayCircle, Settings, MessageSquare, Clock, CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
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

interface ReportAgentDashboardProps {
  onStartReport?: (reportType: ReportType) => void;
  chatSessions?: ChatSession[];
  onSelectSession?: (sessionId: string) => void;
  activeSessionId?: string | null;
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

export function ReportAgentDashboard({ 
  onStartReport,
  chatSessions = [], 
  onSelectSession,
  activeSessionId
}: ReportAgentDashboardProps) {
  const { t } = useTranslation();

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