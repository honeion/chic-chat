import { useState } from "react";
import { Workflow, Plus, Play, Save, Trash2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  steps: string[];
  status: "active" | "draft" | "completed";
  lastRun?: string;
}

const recommendedWorkflows: WorkflowItem[] = [
  { id: "r1", name: "서버 상태 점검", description: "서버 헬스체크 및 로그 분석", steps: ["Health Check", "Log Analyzer", "Alert Send"], status: "active" },
  { id: "r2", name: "DB 백업 프로세스", description: "데이터베이스 백업 및 검증", steps: ["DB Connect", "Backup Create", "Verify", "Notify"], status: "active" },
  { id: "r3", name: "배포 파이프라인", description: "자동화된 배포 워크플로우", steps: ["Build", "Test", "Deploy", "Health Check"], status: "active" },
];

const myWorkflows: WorkflowItem[] = [
  { id: "m1", name: "일일 점검 루틴", description: "매일 아침 자동 실행", steps: ["Health Check", "DB Connect", "Report Gen"], status: "active", lastRun: "오늘 09:00" },
  { id: "m2", name: "장애 대응 플로우", description: "장애 감지 시 자동 대응", steps: ["Alert Detect", "Log Analyzer", "Notify", "Escalate"], status: "draft" },
  { id: "m3", name: "주간 리포트", description: "매주 월요일 리포트 생성", steps: ["Data Collect", "Analyze", "Report Gen", "Email Send"], status: "completed", lastRun: "지난주 월요일" },
];

export function WorkflowPage() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowItem | null>(null);

  const getStatusStyle = (status: WorkflowItem["status"]) => {
    switch (status) {
      case "active": return "bg-status-online/20 text-status-online";
      case "draft": return "bg-status-busy/20 text-status-busy";
      case "completed": return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: WorkflowItem["status"]) => {
    switch (status) {
      case "active": return "활성";
      case "draft": return "초안";
      case "completed": return "완료";
    }
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Workflow className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Workflow</h1>
              <p className="text-sm text-muted-foreground">워크플로우를 관리하고 실행하세요</p>
            </div>
          </div>
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            새 워크플로우
          </button>
        </div>

        {/* Recommended Workflows */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">추천 워크플로우</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedWorkflows.map((workflow) => (
              <div
                key={workflow.id}
                onClick={() => setSelectedWorkflow(workflow)}
                className={cn(
                  "p-4 rounded-xl border cursor-pointer transition-all hover:border-primary/50",
                  selectedWorkflow?.id === workflow.id
                    ? "bg-primary/10 border-primary/50"
                    : "bg-chat-user/30 border-border/50"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium">{workflow.name}</h3>
                  <span className={cn("px-2 py-0.5 rounded-full text-xs", getStatusStyle(workflow.status))}>
                    {getStatusLabel(workflow.status)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{workflow.description}</p>
                <div className="flex items-center gap-1 overflow-x-auto">
                  {workflow.steps.slice(0, 3).map((step, idx) => (
                    <div key={idx} className="flex items-center">
                      <span className="px-2 py-1 rounded bg-secondary/50 text-xs whitespace-nowrap">{step}</span>
                      {idx < 2 && idx < workflow.steps.length - 1 && (
                        <ChevronRight className="w-3 h-3 text-muted-foreground mx-0.5" />
                      )}
                    </div>
                  ))}
                  {workflow.steps.length > 3 && (
                    <span className="text-xs text-muted-foreground ml-1">+{workflow.steps.length - 3}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Workflows */}
        <div>
          <h2 className="text-lg font-semibold mb-4">My 워크플로우</h2>
          <div className="space-y-3">
            {myWorkflows.map((workflow) => (
              <div
                key={workflow.id}
                onClick={() => setSelectedWorkflow(workflow)}
                className={cn(
                  "p-4 rounded-xl border cursor-pointer transition-all hover:border-primary/50",
                  selectedWorkflow?.id === workflow.id
                    ? "bg-primary/10 border-primary/50"
                    : "bg-chat-user/30 border-border/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Workflow className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{workflow.name}</h3>
                        <span className={cn("px-2 py-0.5 rounded-full text-xs", getStatusStyle(workflow.status))}>
                          {getStatusLabel(workflow.status)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{workflow.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {workflow.lastRun && (
                      <span className="text-xs text-muted-foreground">마지막 실행: {workflow.lastRun}</span>
                    )}
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors">
                        <Play className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                        <Save className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3 overflow-x-auto">
                  {workflow.steps.map((step, idx) => (
                    <div key={idx} className="flex items-center">
                      <span className="px-2 py-1 rounded bg-secondary/50 text-xs whitespace-nowrap">{step}</span>
                      {idx < workflow.steps.length - 1 && (
                        <ChevronRight className="w-3 h-3 text-muted-foreground mx-0.5" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Workflow Detail Panel */}
      {selectedWorkflow && (
        <div className="w-96 border-l border-border bg-sidebar p-6 animate-slide-up overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">{selectedWorkflow.name}</h3>
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-chat-user/50 border border-border/50">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">설명</h4>
              <p className="text-sm">{selectedWorkflow.description}</p>
            </div>
            
            <div className="p-4 rounded-xl bg-chat-user/50 border border-border/50">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">단계</h4>
              <div className="space-y-2">
                {selectedWorkflow.steps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-medium">
                      {idx + 1}
                    </span>
                    <span className="text-sm">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                <Play className="w-4 h-4" />
                실행
              </button>
              <button className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                편집
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
