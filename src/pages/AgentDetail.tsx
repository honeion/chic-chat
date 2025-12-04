import { useState } from "react";
import { Bot, Settings, Info, Play, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tool {
  id: string;
  name: string;
  description: string;
  example: string;
}

const mockTools: Tool[] = [
  { id: "1", name: "Health Check", description: "시스템 상태를 점검하고 이상 여부를 확인합니다.", example: "health_check(target='server1')" },
  { id: "2", name: "DB Connect", description: "데이터베이스 연결을 설정합니다.", example: "db_connect(host='localhost', port=5432)" },
  { id: "3", name: "Log Analyzer", description: "로그를 분석하여 패턴을 찾습니다.", example: "analyze_logs(path='/var/log')" },
  { id: "4", name: "Alert Send", description: "알림을 전송합니다.", example: "send_alert(channel='slack', message='...')" },
  { id: "5", name: "Report Gen", description: "리포트를 생성합니다.", example: "generate_report(type='daily')" },
];

interface AgentDetailProps {
  agentId: string;
  agentName: string;
}

export function AgentDetail({ agentId, agentName }: AgentDetailProps) {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{agentName}</h1>
              <p className="text-sm text-muted-foreground">Agent ID: {agentId}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors flex items-center gap-2 text-sm">
              <Info className="w-4 h-4" />
              정보
            </button>
            <button className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors flex items-center gap-2 text-sm">
              <Settings className="w-4 h-4" />
              설정
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-chat-user/50 backdrop-blur-sm rounded-xl p-6 border border-border/50">
            <h3 className="text-lg font-semibold mb-4">사용현황</h3>
            <div className="space-y-3">
              <div className="flex justify-between p-3 rounded-lg bg-white/90 text-background">
                <span className="text-background/70">오늘 실행</span>
                <span className="font-medium">24회</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-white/90 text-background">
                <span className="text-background/70">성공률</span>
                <span className="font-medium text-status-online">98.5%</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-white/90 text-background">
                <span className="text-background/70">평균 응답시간</span>
                <span className="font-medium">1.2초</span>
              </div>
            </div>
          </div>
          
          <div className="bg-chat-user/50 backdrop-blur-sm rounded-xl p-6 border border-border/50">
            <h3 className="text-lg font-semibold mb-4">이력</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-white/90 text-background">
                <span className="w-2 h-2 rounded-full bg-status-online" />
                <span className="text-background/70">10:30</span>
                <span>Health Check 완료</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-white/90 text-background">
                <span className="w-2 h-2 rounded-full bg-status-online" />
                <span className="text-background/70">10:25</span>
                <span>DB Connect 완료</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-white/90 text-background">
                <span className="w-2 h-2 rounded-full bg-status-busy" />
                <span className="text-background/70">10:20</span>
                <span>Log 분석 경고</span>
              </div>
            </div>
          </div>
          
          <div className="bg-chat-user/50 backdrop-blur-sm rounded-xl p-6 border border-border/50">
            <h3 className="text-lg font-semibold mb-4">RunBook</h3>
            <div className="space-y-2 text-sm">
              <div className="p-3 rounded-lg bg-white/90 text-background hover:bg-white cursor-pointer transition-colors">
                장애 대응 매뉴얼
              </div>
              <div className="p-3 rounded-lg bg-white/90 text-background hover:bg-white cursor-pointer transition-colors">
                배포 프로세스
              </div>
              <div className="p-3 rounded-lg bg-white/90 text-background hover:bg-white cursor-pointer transition-colors">
                점검 체크리스트
              </div>
            </div>
          </div>
        </div>

        {/* Tool List */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Tool List</h3>
          <div className="flex flex-wrap gap-3">
            {mockTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(selectedTool?.id === tool.id ? null : tool)}
                className={cn(
                  "px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                  selectedTool?.id === tool.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-chat-user/50 hover:bg-chat-user border border-border/50"
                )}
              >
                {tool.name}
              </button>
            ))}
          </div>
        </div>

        {/* Recommended Workflows */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">추천 워크플로우</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { id: "r1", name: "서버 상태 점검", description: "서버 헬스체크 및 로그 분석", steps: ["Health Check", "Log Analyzer", "Alert Send"] },
              { id: "r2", name: "DB 백업 프로세스", description: "데이터베이스 백업 및 검증", steps: ["DB Connect", "Backup Create", "Verify"] },
            ].map((workflow) => (
              <div
                key={workflow.id}
                className="p-4 rounded-xl border cursor-pointer transition-all hover:border-primary/50 bg-chat-user/30 border-border/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium">{workflow.name}</h4>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-status-online/20 text-status-online">활성</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{workflow.description}</p>
                <div className="flex items-center gap-1 overflow-x-auto">
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

        {/* My Workflows */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">My 워크플로우</h3>
            <button className="px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm font-medium">
              워크플로우 추가하기
            </button>
          </div>
          <div className="space-y-3">
            {[
              { id: "m1", name: "일일 점검 루틴", description: "매일 아침 자동 실행", steps: ["Health Check", "DB Connect", "Report Gen"], lastRun: "오늘 09:00" },
            ].map((workflow) => (
              <div
                key={workflow.id}
                className="p-4 rounded-xl border cursor-pointer transition-all hover:border-primary/50 bg-chat-user/30 border-border/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Play className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{workflow.name}</h4>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-status-online/20 text-status-online">활성</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{workflow.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">마지막 실행: {workflow.lastRun}</span>
                    <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-1">
                      <Play className="w-4 h-4" />
                      실행
                    </button>
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

      {/* Tool Detail Panel */}
      {selectedTool && (
        <div className="w-80 border-l border-border bg-sidebar p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Tool 이름</h3>
            <button 
              onClick={() => setSelectedTool(null)}
              className="p-1 rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-chat-user/50 border border-border/50">
              <h4 className="font-medium text-primary mb-2">{selectedTool.name}</h4>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Tool 설명</h4>
              <div className="p-4 rounded-xl bg-chat-user/50 border border-border/50">
                <p className="text-sm">{selectedTool.description}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">사용 예제</h4>
              <div className="p-4 rounded-xl bg-chat-user/50 border border-border/50">
                <code className="text-sm font-mono text-primary">{selectedTool.example}</code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
