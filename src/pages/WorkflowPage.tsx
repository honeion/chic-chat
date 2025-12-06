import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Workflow, Plus, Play, Save, Trash2, ChevronRight, ChevronDown, Store, Clock, History, Folder, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { NewAgentModal } from "@/components/workflow/NewAgentModal";
import { AgentDetailModal } from "@/components/workflow/AgentDetailModal";
import { WorkflowChatPanel } from "@/components/workflow/WorkflowChatPanel";
import { WorkflowItem, agentMarketItems, OPERATING_SYSTEMS, OperatingSystem, AgentTemplateType, agentTemplates } from "@/pages/Index";

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
  "m1-2": [
    { id: "e1-2", timestamp: "오늘 09:00", status: "success", duration: "1분 50초" },
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
  selectedTemplateType: AgentTemplateType | null;
  setSelectedTemplateType: (type: AgentTemplateType | null) => void;
}

export function WorkflowPage({
  myAgents,
  setMyAgents,
  selectedAgent,
  setSelectedAgent,
  onAddFromMarket,
  onAddNewAgent,
  selectedTemplateType,
  setSelectedTemplateType
}: WorkflowPageProps) {
  const { t } = useTranslation();
  const [expandedMarket, setExpandedMarket] = useState(false);
  const [expandedMyAgent, setExpandedMyAgent] = useState<string | null>(null);
  const [isNewAgentModalOpen, setIsNewAgentModalOpen] = useState(false);
  const [selectedMarketAgent, setSelectedMarketAgent] = useState<WorkflowItem | null>(null);
  const [selectedSystems, setSelectedSystems] = useState<OperatingSystem[]>([]);

  const displayedMarketAgents = expandedMarket ? agentMarketItems : agentMarketItems.slice(0, 4);
  
  // 템플릿 타입과 시스템으로 필터링
  const filteredMyAgents = myAgents.filter(agent => {
    // 템플릿 타입 필터
    if (selectedTemplateType && agent.templateType !== selectedTemplateType) {
      return false;
    }
    // 시스템 필터 (템플릿 뷰에서만 적용)
    if (selectedTemplateType && selectedSystems.length > 0) {
      const agentSystems = agent.systems || (agent.system ? [agent.system] : []);
      return agentSystems.some(sys => selectedSystems.includes(sys));
    }
    return true;
  });

  const SYSTEM_BOXES: OperatingSystem[] = ["e-총무", "BiOn", "SATIS"];

  const toggleSystem = (system: OperatingSystem) => {
    setSelectedSystems(prev => 
      prev.includes(system) 
        ? prev.filter(s => s !== system)
        : [...prev, system]
    );
  };

  const getTemplateName = (type: AgentTemplateType) => {
    const template = agentTemplates.find(t => t.type === type);
    return template?.name || type;
  };

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

  const handleMarketAgentClick = (agent: WorkflowItem) => {
    setSelectedMarketAgent(agent);
  };

  const handleAddFromMarketModal = (agent: WorkflowItem) => {
    onAddFromMarket(agent);
    setSelectedMarketAgent(null);
  };

  const handleDeleteAgent = (agentId: string) => {
    const updatedAgents = myAgents.filter(a => a.id !== agentId);
    setMyAgents(updatedAgents);
    if (selectedAgent?.id === agentId) {
      setSelectedAgent(null);
    }
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      {/* Main Content - 70% */}
      <div className="flex-[7] p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {selectedTemplateType && (
              <button
                onClick={() => {
                  setSelectedTemplateType(null);
                  setSelectedSystems([]);
                }}
                className="p-2 rounded-lg hover:bg-secondary transition-colors mr-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Workflow className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {selectedTemplateType ? getTemplateName(selectedTemplateType) : t("sidebar.myAgent")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {selectedTemplateType 
                  ? `시스템별 ${getTemplateName(selectedTemplateType)} 관리` 
                  : t("workflow.subtitle")}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsNewAgentModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {selectedTemplateType ? `${getTemplateName(selectedTemplateType)} 추가` : t("workflow.newAgent")}
          </button>
        </div>

        {/* 템플릿 타입 선택 시 시스템 필터 표시 */}
        {selectedTemplateType && (
          <div className="mb-6">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              시스템 필터
            </div>
            <div className="flex gap-3">
              {SYSTEM_BOXES.map((system) => (
                <button
                  key={system}
                  onClick={() => toggleSystem(system)}
                  className={cn(
                    "px-4 py-3 rounded-xl border-2 transition-all font-medium text-sm",
                    selectedSystems.includes(system)
                      ? "bg-primary/20 border-primary text-primary shadow-md"
                      : "bg-card/50 border-border/50 text-muted-foreground hover:border-primary/50 hover:bg-card"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4" />
                    {system}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 템플릿 타입이 선택되지 않았을 때 - 템플릿 선택 화면 */}
        {!selectedTemplateType && (
          <div className="mb-8">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Agent 템플릿
            </div>
            <div className="grid grid-cols-2 gap-4">
              {agentTemplates.map((template) => {
                const count = myAgents.filter(a => a.templateType === template.type).length;
                return (
                  <button
                    key={template.type}
                    onClick={() => setSelectedTemplateType(template.type)}
                    className="p-5 rounded-xl border-2 border-border/50 bg-card/50 hover:border-primary/50 hover:bg-card transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Workflow className="w-5 h-5 text-primary" />
                      </div>
                      <span className="px-2 py-1 rounded-full bg-secondary text-xs font-medium">
                        {count}개
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* My Agent - 템플릿 타입 선택 시에만 표시 */}
        {selectedTemplateType && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Workflow className="w-5 h-5" />
            {getTemplateName(selectedTemplateType)} 목록
            <span className="text-sm font-normal text-muted-foreground">
              ({filteredMyAgents.length}개)
            </span>
          </h2>
          <div className="space-y-3">
            {filteredMyAgents.length === 0 ? (
              <div className="p-8 rounded-xl border border-dashed border-border/50 text-center">
                <p className="text-muted-foreground mb-4">
                  {selectedSystems.length > 0 
                    ? `선택한 시스템에 등록된 ${getTemplateName(selectedTemplateType)}이(가) 없습니다.`
                    : `등록된 ${getTemplateName(selectedTemplateType)}이(가) 없습니다.`}
                </p>
                <button 
                  onClick={() => setIsNewAgentModalOpen(true)}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  새로 추가하기
                </button>
              </div>
            ) : (
            filteredMyAgents.map((agent) => (
              <div key={agent.id}>
                {/* Agent Card */}
                <div
                  className={cn(
                    "p-4 rounded-xl border cursor-pointer transition-all hover:border-primary/50",
                    selectedAgent?.id === agent.id ? "bg-primary/20 border-primary shadow-md" : "bg-chat-user/30 border-border/50",
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
                          {/* 시스템 태그 표시 */}
                          {agent.systems && agent.systems.length > 0 && (
                            <div className="flex gap-1">
                              {agent.systems.map(sys => (
                                <span key={sys} className="px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground">
                                  {sys}
                                </span>
                              ))}
                            </div>
                          )}
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
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAgent(agent.id);
                          }}
                          className="p-2 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"
                        >
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
            ))
            )}
          </div>
        </div>
        )}
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

      {/* Agent Detail Modal (for Market Agents) */}
      <AgentDetailModal
        isOpen={!!selectedMarketAgent}
        onClose={() => setSelectedMarketAgent(null)}
        agent={selectedMarketAgent}
        onAddToMyAgent={handleAddFromMarketModal}
      />
    </div>
  );
}
