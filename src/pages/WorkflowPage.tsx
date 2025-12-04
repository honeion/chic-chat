import { useState } from "react";
import { Workflow, Plus, Play, Save, Trash2, ChevronRight, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  steps: string[];
  status: "active" | "draft" | "completed";
  lastRun?: string;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  example: string;
}

const mockTools: Tool[] = [
  {
    id: "1",
    name: "Health Check",
    description: "시스템 상태를 점검하고 이상 여부를 확인합니다.",
    example: "health_check(target='server1')",
  },
  {
    id: "2",
    name: "DB Connect",
    description: "데이터베이스 연결을 설정합니다.",
    example: "db_connect(host='localhost', port=5432)",
  },
  {
    id: "3",
    name: "Log Analyzer",
    description: "로그를 분석하여 패턴을 찾습니다.",
    example: "analyze_logs(path='/var/log')",
  },
  {
    id: "4",
    name: "Alert Send",
    description: "알림을 전송합니다.",
    example: "send_alert(channel='slack', message='...')",
  },
  { id: "5", name: "Report Gen", description: "리포트를 생성합니다.", example: "generate_report(type='daily')" },
  {
    id: "6",
    name: "API Request",
    description: "외부 API를 호출하고 응답을 처리합니다.",
    example: "api_request(url='https://api.example.com', method='GET')",
  },
  {
    id: "7",
    name: "File Manager",
    description: "파일 읽기, 쓰기, 삭제 작업을 수행합니다.",
    example: "file_manage(action='read', path='/data/config.json')",
  },
  {
    id: "8",
    name: "Email Sender",
    description: "이메일을 작성하고 발송합니다.",
    example: "send_email(to='user@example.com', subject='알림')",
  },
  {
    id: "9",
    name: "Scheduler",
    description: "작업을 예약하고 스케줄링합니다.",
    example: "schedule_task(cron='0 9 * * *', task='backup')",
  },
  {
    id: "10",
    name: "Data Transform",
    description: "데이터 형식을 변환합니다.",
    example: "transform_data(input='csv', output='json')",
  },
  {
    id: "11",
    name: "Cache Manager",
    description: "캐시 데이터를 관리합니다.",
    example: "cache_manage(action='clear', key='user_sessions')",
  },
  {
    id: "12",
    name: "Backup Tool",
    description: "데이터 백업을 생성하고 복원합니다.",
    example: "backup(source='/db', destination='/backup')",
  },
  {
    id: "13",
    name: "Security Scan",
    description: "보안 취약점을 스캔합니다.",
    example: "security_scan(target='web_app', type='vulnerability')",
  },
  {
    id: "14",
    name: "Metrics Collector",
    description: "시스템 메트릭을 수집합니다.",
    example: "collect_metrics(source='server', interval=60)",
  },
  {
    id: "15",
    name: "Load Balancer",
    description: "트래픽을 분산 처리합니다.",
    example: "balance_load(servers=['s1','s2'], algorithm='round_robin')",
  },
  {
    id: "16",
    name: "DNS Manager",
    description: "DNS 레코드를 관리합니다.",
    example: "manage_dns(action='add', record='A', value='192.168.1.1')",
  },
  {
    id: "17",
    name: "Container Deploy",
    description: "컨테이너를 배포하고 관리합니다.",
    example: "deploy_container(image='nginx:latest', port=80)",
  },
  {
    id: "18",
    name: "SSL Manager",
    description: "SSL 인증서를 관리합니다.",
    example: "manage_ssl(domain='example.com', action='renew')",
  },
  {
    id: "19",
    name: "Webhook Handler",
    description: "웹훅 이벤트를 처리합니다.",
    example: "handle_webhook(source='github', event='push')",
  },
  {
    id: "20",
    name: "Queue Manager",
    description: "메시지 큐를 관리합니다.",
    example: "manage_queue(action='send', queue='tasks', message='...')",
  },
];

const recommendedAgents: WorkflowItem[] = [
  {
    id: "r1",
    name: "서버 상태 점검 Agent",
    description: "서버 헬스체크 및 로그 분석",
    steps: ["Health Check", "Log Analyzer", "Alert Send"],
    status: "active",
  },
  {
    id: "r2",
    name: "DB 백업 Agent",
    description: "데이터베이스 백업 및 검증",
    steps: ["DB Connect", "Backup Create", "Verify", "Notify"],
    status: "active",
  },
  {
    id: "r3",
    name: "배포 자동화 Agent",
    description: "자동화된 배포 워크플로우",
    steps: ["Build", "Test", "Deploy", "Health Check"],
    status: "active",
  },
  {
    id: "r4",
    name: "로그 모니터링 Agent",
    description: "실시간 로그 수집 및 분석",
    steps: ["Log Collect", "Parse", "Analyze", "Alert"],
    status: "active",
  },
  {
    id: "r5",
    name: "보안 스캔 Agent",
    description: "취약점 탐지 및 보고",
    steps: ["Scan Init", "Vulnerability Check", "Report Gen", "Notify"],
    status: "active",
  },
  {
    id: "r6",
    name: "성능 테스트 Agent",
    description: "부하 테스트 및 성능 측정",
    steps: ["Load Test", "Metrics Collect", "Analyze", "Report"],
    status: "active",
  },
  {
    id: "r7",
    name: "데이터 마이그레이션 Agent",
    description: "데이터 이전 및 검증",
    steps: ["Export", "Transform", "Import", "Verify"],
    status: "active",
  },
  {
    id: "r8",
    name: "알림 관리 Agent",
    description: "다중 채널 알림 구성",
    steps: ["Config Load", "Channel Setup", "Test Send", "Activate"],
    status: "active",
  },
  {
    id: "r9",
    name: "캐시 관리 Agent",
    description: "캐시 초기화 및 워밍",
    steps: ["Cache Clear", "Data Load", "Cache Warm", "Verify"],
    status: "active",
  },
];

const myAgentWorkflows: WorkflowItem[] = [
  {
    id: "m1",
    name: "일일 점검 루틴",
    description: "매일 아침 자동 실행",
    steps: ["Health Check", "DB Connect", "Report Gen"],
    status: "active",
    lastRun: "오늘 09:00",
  },
  {
    id: "m2",
    name: "장애 대응 플로우",
    description: "장애 감지 시 자동 대응",
    steps: ["Alert Detect", "Log Analyzer", "Notify", "Escalate"],
    status: "draft",
  },
  {
    id: "m3",
    name: "주간 리포트",
    description: "매주 월요일 리포트 생성",
    steps: ["Data Collect", "Analyze", "Report Gen", "Email Send"],
    status: "completed",
    lastRun: "지난주 월요일",
  },
];

export function WorkflowPage() {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowItem | null>(null);
  const [showAllRecommended, setShowAllRecommended] = useState(false);

  const displayedRecommendedAgents = showAllRecommended ? recommendedAgents : recommendedAgents.slice(0, 3);

  const getStatusStyle = (status: WorkflowItem["status"]) => {
    switch (status) {
      case "active":
        return "bg-status-online/20 text-status-online";
      case "draft":
        return "bg-status-busy/20 text-status-busy";
      case "completed":
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: WorkflowItem["status"]) => {
    switch (status) {
      case "active":
        return "활성";
      case "draft":
        return "초안";
      case "completed":
        return "완료";
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
              <h1 className="text-2xl font-bold">My Agent</h1>
              <p className="text-sm text-muted-foreground">에이전트를 관리하고 실행하세요</p>
            </div>
          </div>
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />새 에이전트
          </button>
        </div>

        {/* Recommended Agents */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">추천 Agent</h2>
            <button
              onClick={() => setShowAllRecommended(!showAllRecommended)}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              {showAllRecommended ? "접기" : `전체보기 (${recommendedAgents.length})`}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedRecommendedAgents.map((workflow) => (
              <div
                key={workflow.id}
                onClick={() => setSelectedWorkflow(workflow)}
                className={cn(
                  "p-4 rounded-xl border cursor-pointer transition-all hover:border-primary/50",
                  selectedWorkflow?.id === workflow.id
                    ? "bg-primary/10 border-primary/50"
                    : "bg-chat-user/30 border-border/50",
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

        {/* Tool List */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Tool List
          </h2>
          <div className="flex flex-wrap gap-3">
            {mockTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(selectedTool?.id === tool.id ? null : tool)}
                className={cn(
                  "px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                  selectedTool?.id === tool.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-chat-user/50 hover:bg-chat-user border border-border/50",
                )}
              >
                {tool.name}
              </button>
            ))}
          </div>
        </div>

        {/* My Agent Workflows */}
        <div>
          <h2 className="text-lg font-semibold mb-4">My Agent</h2>
          <div className="space-y-3">
            {myAgentWorkflows.map((workflow) => (
              <div
                key={workflow.id}
                onClick={() => setSelectedWorkflow(workflow)}
                className={cn(
                  "p-4 rounded-xl border cursor-pointer transition-all hover:border-primary/50",
                  selectedWorkflow?.id === workflow.id
                    ? "bg-primary/10 border-primary/50"
                    : "bg-chat-user/30 border-border/50",
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

      {/* Tool Detail Panel */}
      {selectedTool && !selectedWorkflow && (
        <div className="w-80 border-l border-border bg-sidebar p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Tool 이름</h3>
            <button
              onClick={() => setSelectedTool(null)}
              className="p-1 rounded-lg hover:bg-secondary transition-colors"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
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

      {/* Workflow Detail Panel */}
      {selectedWorkflow && (
        <div className="w-96 border-l border-border bg-sidebar p-6 animate-slide-up overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{selectedWorkflow.name}</h3>
            <button
              onClick={() => setSelectedWorkflow(null)}
              className="p-1 rounded-lg hover:bg-secondary transition-colors"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
          </div>

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
