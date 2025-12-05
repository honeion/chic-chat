import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Workflow, Plus, Play, Save, Trash2, ChevronRight, ChevronDown, Store, Clock, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { NewAgentModal } from "@/components/workflow/NewAgentModal";
import { WorkflowChatPanel } from "@/components/workflow/WorkflowChatPanel";
import { WorkflowItem, agentMarketItems } from "@/pages/Index";

interface ExecutionHistory {
  id: string;
  timestamp: string;
  status: "success" | "failed" | "running";
  duration: string;
}

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
  { id: "6", name: "API Request", description: "외부 API를 호출하고 응답을 처리합니다.", example: "api_request(url='https://api.example.com', method='GET')" },
  { id: "7", name: "File Manager", description: "파일 읽기, 쓰기, 삭제 작업을 수행합니다.", example: "file_manage(action='read', path='/data/config.json')" },
  { id: "8", name: "Email Sender", description: "이메일을 작성하고 발송합니다.", example: "send_email(to='user@example.com', subject='알림')" },
  { id: "9", name: "Scheduler", description: "작업을 예약하고 스케줄링합니다.", example: "schedule_task(cron='0 9 * * *', task='backup')" },
  { id: "10", name: "Data Transform", description: "데이터 형식을 변환합니다.", example: "transform_data(input='csv', output='json')" },
  { id: "11", name: "Cache Manager", description: "캐시 데이터를 관리합니다.", example: "cache_manage(action='clear', key='user_sessions')" },
  { id: "12", name: "Backup Tool", description: "데이터 백업을 생성하고 복원합니다.", example: "backup(source='/db', destination='/backup')" },
  { id: "13", name: "Security Scan", description: "보안 취약점을 스캔합니다.", example: "security_scan(target='web_app', type='vulnerability')" },
  { id: "14", name: "Metrics Collector", description: "시스템 메트릭을 수집합니다.", example: "collect_metrics(source='server', interval=60)" },
  { id: "15", name: "Load Balancer", description: "트래픽을 분산 처리합니다.", example: "balance_load(servers=['s1','s2'], algorithm='round_robin')" },
  { id: "16", name: "DNS Manager", description: "DNS 레코드를 관리합니다.", example: "manage_dns(action='add', record='A', value='192.168.1.1')" },
  { id: "17", name: "Container Deploy", description: "컨테이너를 배포하고 관리합니다.", example: "deploy_container(image='nginx:latest', port=80)" },
  { id: "18", name: "SSL Manager", description: "SSL 인증서를 관리합니다.", example: "manage_ssl(domain='example.com', action='renew')" },
  { id: "19", name: "Webhook Handler", description: "웹훅 이벤트를 처리합니다.", example: "handle_webhook(source='github', event='push')" },
  { id: "20", name: "Queue Manager", description: "메시지 큐를 관리합니다.", example: "manage_queue(action='send', queue='tasks', message='...')" },
];

const mockExecutionHistory: Record<string, ExecutionHistory[]> = {
  m1: [
    { id: "e1", timestamp: "오늘 09:00", status: "success", duration: "2분 30초" },
    { id: "e2", timestamp: "어제 09:00", status: "success", duration: "2분 15초" },
    { id: "e3", timestamp: "2일 전 09:00", status: "failed", duration: "1분 45초" },
  ],
  m2: [
    { id: "e4", timestamp: "오늘 14:30", status: "running", duration: "진행 중" },
  ],
  m3: [
    { id: "e5", timestamp: "지난주 월요일", status: "success", duration: "5분 20초" },
    { id: "e6", timestamp: "2주 전 월요일", status: "success", duration: "5분 10초" },
  ],
};

interface WorkflowPageProps {
  myAgents: WorkflowItem[];
  setMyAgents: (agents: WorkflowItem[]) => void;
  selectedAgent: WorkflowItem | null;
  setSelectedAgent: (agent: WorkflowItem | null) => void;
  onAddFromMarket: (agent: WorkflowItem) => void;
  onAddNewAgent: (agent: { name: string; description: string; steps: string[]; instructions: string }) => void;
}

export function WorkflowPage({
  myAgents,
  setMyAgents,
  selectedAgent,
  setSelectedAgent,
  onAddFromMarket,
  onAddNewAgent
}: WorkflowPageProps) {
  const { t } = useTranslation();
  const [expandedMarket, setExpandedMarket] = useState(false);
  const [expandedMyAgent, setExpandedMyAgent] = useState<string | null>(null);
  const [isNewAgentModalOpen, setIsNewAgentModalOpen] = useState(false);

  const displayedMarketAgents = expandedMarket ? agentMarketItems : agentMarketItems.slice(0, 4);

  const getStatusStyle = (status: WorkflowItem["status"]) => {
    switch (status) {
      case "active": return "bg-status-online/20 text-status-online";
      case "draft": return "bg-status-busy/20 text-status-busy";
      case "completed": return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: WorkflowItem["status"]) => {
    switch (status) {
      case "active": return t("common.active");
      case "draft": return t("common.draft");
      case "completed": return t("common.completed");
    }
  };

  const getExecutionStatusStyle = (status: ExecutionHistory["status"]) => {
    switch (status) {
      case "success": return "text-status-online";
      case "failed": return "text-destructive";
      case "running": return "text-status-busy";
    }
  };

  const getExecutionStatusLabel = (status: ExecutionHistory["status"]) => {
    switch (status) {
      case "success": return t("common.success");
      case "failed": return t("common.failed");
      case "running": return t("common.running");
    }
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      {/* Main Content - 70% */}
      <div className="flex-[7] p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Workflow className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t("sidebar.myAgent")}</h1>
              <p className="text-sm text-muted-foreground">{t("workflow.subtitle")}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsNewAgentModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />{t("workflow.newAgent")}
          </button>
        </div>

        {/* Agent Market - Card Style */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">{t("workflow.agentMarket")}</h2>
            </div>
            <button
              onClick={() => setExpandedMarket(!expandedMarket)}
              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              {expandedMarket ? t("workflow.collapse") : t("workflow.expandAll")}
              <ChevronDown className={cn("w-4 h-4 transition-transform", expandedMarket && "rotate-180")} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {displayedMarketAgents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => onAddFromMarket(agent)}
                className="p-4 rounded-xl bg-accent/10 border border-accent/30 cursor-pointer transition-all hover:border-accent hover:bg-accent/20"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Workflow className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm mb-1">{agent.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{agent.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {agent.steps.slice(0, 3).map((step, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-secondary/50 text-xs">{step}</span>
                      ))}
                      {agent.steps.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{agent.steps.length - 3}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Agent */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Workflow className="w-5 h-5" />
            {t("sidebar.myAgent")}
          </h2>
          <div className="space-y-3">
            {myAgents.map((agent) => (
              <div key={agent.id}>
                {/* Agent Card */}
                <div
                  className={cn(
                    "p-4 rounded-xl border cursor-pointer transition-all hover:border-primary/50",
                    selectedAgent?.id === agent.id ? "bg-primary/10 border-primary/50" : "bg-chat-user/30 border-border/50",
                    expandedMyAgent === agent.id && "rounded-b-none border-b-0"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center gap-4 flex-1"
                      onClick={() => setSelectedAgent(agent)}
                    >
                      <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                        <Workflow className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{agent.name}</h3>
                          <span className={cn("px-2 py-0.5 rounded-full text-xs", getStatusStyle(agent.status))}>
                            {getStatusLabel(agent.status)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{agent.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {agent.lastRun && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {agent.lastRun}
                        </span>
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
                      <button
                        onClick={() => setExpandedMyAgent(expandedMyAgent === agent.id ? null : agent.id)}
                        className="p-2 rounded-lg hover:bg-secondary transition-colors"
                      >
                        <History className={cn("w-4 h-4 transition-transform", expandedMyAgent === agent.id && "text-primary")} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-3 overflow-x-auto">
                    {agent.steps.map((step, idx) => (
                      <div key={idx} className="flex items-center">
                        <span className="px-2 py-1 rounded bg-secondary/50 text-xs whitespace-nowrap">{step}</span>
                        {idx < agent.steps.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground mx-0.5" />}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Execution History */}
                {expandedMyAgent === agent.id && mockExecutionHistory[agent.id] && (
                  <div className="border border-t-0 border-border/50 rounded-b-xl bg-secondary/30 p-4 space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <History className="w-4 h-4" />
                      {t("workflow.executionHistory")}
                    </h4>
                    {mockExecutionHistory[agent.id].map((history) => (
                      <div
                        key={history.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-chat-user/30 border border-border/30"
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn("w-2 h-2 rounded-full", 
                            history.status === "success" ? "bg-status-online" :
                            history.status === "failed" ? "bg-destructive" : "bg-status-busy animate-pulse"
                          )} />
                          <span className="text-sm">{history.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={cn("text-xs font-medium", getExecutionStatusStyle(history.status))}>
                            {getExecutionStatusLabel(history.status)}
                          </span>
                          <span className="text-xs text-muted-foreground">{history.duration}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Panel - 30% */}
      <div className="flex-[3] h-full">
        <WorkflowChatPanel agentName={selectedAgent?.name} />
      </div>

      {/* New Agent Modal */}
      <NewAgentModal
        isOpen={isNewAgentModalOpen}
        onClose={() => setIsNewAgentModalOpen(false)}
        onSave={onAddNewAgent}
        tools={mockTools}
      />
    </div>
  );
}
