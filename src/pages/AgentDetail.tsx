import { useState } from "react";
import { Bot, Settings, Info, Send, CheckCircle, XCircle, Clock, AlertTriangle, MessageSquare, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
interface Incident {
  id: string;
  title: string;
  description: string;
  status: "pending" | "processing" | "approved" | "rejected";
  priority: "high" | "medium" | "low";
  timestamp: string;
  recommendation?: string;
}
interface HistoryItem {
  id: string;
  action: string;
  result: string;
  timestamp: string;
  status: "success" | "warning" | "error";
}
const mockIncidents: Incident[] = [{
  id: "i1",
  title: "서버 CPU 사용률 90% 초과",
  description: "서버 A의 CPU 사용률이 임계치를 초과했습니다.",
  status: "pending",
  priority: "high",
  timestamp: "10:45",
  recommendation: "서버 재시작 또는 프로세스 정리 권장"
}, {
  id: "i2",
  title: "DB 연결 지연 감지",
  description: "데이터베이스 응답 시간이 평소보다 3배 느립니다.",
  status: "pending",
  priority: "medium",
  timestamp: "10:30",
  recommendation: "쿼리 최적화 또는 인덱스 확인 권장"
}, {
  id: "i3",
  title: "디스크 용량 80% 도달",
  description: "스토리지 공간이 부족해지고 있습니다.",
  status: "processing",
  priority: "low",
  timestamp: "09:15"
}];
const mockHistory: HistoryItem[] = [{
  id: "h1",
  action: "메모리 정리 실행",
  result: "2GB 메모리 확보 완료",
  timestamp: "09:00",
  status: "success"
}, {
  id: "h2",
  action: "로그 분석 수행",
  result: "이상 패턴 3건 발견",
  timestamp: "08:30",
  status: "warning"
}, {
  id: "h3",
  action: "헬스체크 완료",
  result: "모든 서비스 정상",
  timestamp: "08:00",
  status: "success"
}];
interface AgentDetailProps {
  agentId: string;
  agentName: string;
}
export function AgentDetail({
  agentId,
  agentName
}: AgentDetailProps) {
  const [chatInput, setChatInput] = useState("");
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [history, setHistory] = useState<HistoryItem[]>(mockHistory);
  const [messages, setMessages] = useState<Array<{
    role: "user" | "agent";
    content: string;
  }>>([{
    role: "agent",
    content: "안녕하세요! 현재 3건의 인시던트가 대기 중입니다. 어떤 작업을 도와드릴까요?"
  }]);
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages([...messages, {
      role: "user",
      content: chatInput
    }]);
    setChatInput("");
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "agent",
        content: "요청을 처리하고 있습니다. 잠시만 기다려주세요."
      }]);
    }, 500);
  };
  const handleApprove = (incidentId: string) => {
    setIncidents(prev => prev.map(inc => inc.id === incidentId ? {
      ...inc,
      status: "approved"
    } : inc));
    const incident = incidents.find(i => i.id === incidentId);
    if (incident) {
      setHistory(prev => [{
        id: `h${Date.now()}`,
        action: `${incident.title} 승인`,
        result: "조치 실행 중",
        timestamp: new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        status: "success"
      }, ...prev]);
      setMessages(prev => [...prev, {
        role: "agent",
        content: `"${incident.title}" 인시던트가 승인되었습니다. 권장 조치를 실행합니다.`
      }]);
    }
  };
  const handleReject = (incidentId: string) => {
    setIncidents(prev => prev.map(inc => inc.id === incidentId ? {
      ...inc,
      status: "rejected"
    } : inc));
  };
  const getPriorityStyle = (priority: Incident["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-destructive/20 text-destructive";
      case "medium":
        return "bg-status-busy/20 text-status-busy";
      case "low":
        return "bg-muted text-muted-foreground";
    }
  };
  const getStatusIcon = (status: HistoryItem["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-status-online" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-status-busy" />;
      case "error":
        return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };
  const pendingCount = incidents.filter(i => i.status === "pending").length;
  const processingCount = incidents.filter(i => i.status === "processing").length;
  const completedToday = history.length;
  return <div className="flex-1 flex h-full overflow-hidden">
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

        {/* Status Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-chat-user/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-status-busy" />
              <span className="text-sm text-secondary-foreground">대기 중</span>
            </div>
            <p className="text-2xl font-bold">{pendingCount}건</p>
          </div>
          <div className="bg-chat-user/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-primary" />
              <span className="text-sm text-secondary-foreground">처리 중</span>
            </div>
            <p className="text-2xl font-bold">{processingCount}건</p>
          </div>
          <div className="bg-chat-user/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-status-online" />
              <span className="text-sm text-secondary-foreground">오늘 완료</span>
            </div>
            <p className="text-2xl font-bold">{completedToday}건</p>
          </div>
          <div className="bg-chat-user/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-accent" />
              <span className="text-sm text-secondary-foreground">일일 보고서</span>
            </div>
            <button className="text-sm text-primary hover:underline">보기</button>
          </div>
        </div>

        {/* Incident List */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-status-busy" />
            승인 대기 인시던트
          </h3>
          <div className="space-y-3">
            {incidents.filter(i => i.status === "pending" || i.status === "processing").map(incident => <div key={incident.id} className="rounded-xl overflow-hidden border border-primary/30">
                {/* Header */}
                <div className="px-4 py-3 bg-primary/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-foreground">{incident.title}</h4>
                    <span className={cn("px-2 py-0.5 rounded text-xs font-medium", getPriorityStyle(incident.priority))}>
                      {incident.priority === "high" ? "긴급" : incident.priority === "medium" ? "보통" : "낮음"}
                    </span>
                    <span className="text-xs text-muted-foreground">{incident.timestamp}</span>
                  </div>
                  <div className="flex gap-2">
                    {incident.status === "pending" && <>
                      <button onClick={() => handleApprove(incident.id)} className="px-3 py-1.5 rounded-lg bg-status-online text-white hover:bg-status-online/90 transition-colors text-sm font-medium flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        승인
                      </button>
                      <button onClick={() => handleReject(incident.id)} className="px-3 py-1.5 rounded-lg bg-destructive text-white hover:bg-destructive/90 transition-colors text-sm font-medium flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        거부
                      </button>
                    </>}
                    {incident.status === "processing" && <span className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-sm">처리 중...</span>}
                  </div>
                </div>
                {/* Content */}
                <div className="p-4 bg-background/80">
                  <p className="mb-3 text-foreground">{incident.description}</p>
                  {incident.recommendation && <div className="p-3 rounded-lg bg-status-online/20 border-l-4 border-status-online">
                      <p className="text-sm"><span className="text-status-online font-semibold">AI 권장:</span> <span className="text-foreground">{incident.recommendation}</span></p>
                    </div>}
                </div>
              </div>)}
            {incidents.filter(i => i.status === "pending" || i.status === "processing").length === 0 && <div className="p-8 text-center text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-status-online/50" />
                <p>모든 인시던트가 처리되었습니다</p>
              </div>}
          </div>
        </div>

        {/* Processing History */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            처리 이력
          </h3>
          <div className="bg-chat-user/50 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden">
            <div className="divide-y divide-border/50">
              {history.slice(0, 5).map(item => <div key={item.id} className="p-3 flex items-center gap-3">
                  {getStatusIcon(item.status)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.result}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                </div>)}
            </div>
            <div className="p-3 border-t border-border/50">
              <button className="text-sm text-primary hover:underline w-full text-center">전체 이력 보기</button>
            </div>
          </div>
        </div>

        {/* Daily Summary */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            오늘의 요약 보고서
          </h3>
          <div className="bg-chat-user/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-3 rounded-lg bg-white/90 text-background">
                <p className="text-xs text-background/70 mb-1">총 처리 건수</p>
                <p className="text-xl font-bold">{completedToday}건</p>
              </div>
              <div className="p-3 rounded-lg bg-white/90 text-background">
                <p className="text-xs text-background/70 mb-1">성공률</p>
                <p className="text-xl font-bold text-status-online">92%</p>
              </div>
              <div className="p-3 rounded-lg bg-white/90 text-background">
                <p className="text-xs text-background/70 mb-1">평균 처리 시간</p>
                <p className="text-xl font-bold">2.3분</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              오늘 {completedToday}건의 작업을 처리했습니다. 서버 상태는 전반적으로 안정적이며, 
              CPU 사용률 관련 인시던트 1건이 대기 중입니다.
            </p>
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      <div className="w-96 border-l border-border bg-sidebar flex flex-col">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Agent 대화
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, idx) => <div key={idx} className={cn("p-3 rounded-xl max-w-[85%]", msg.role === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-chat-user/50 border border-border/50")}>
              <p className="text-sm">{msg.content}</p>
            </div>)}
        </div>

        <div className="p-3 border-t border-border/50">
          <div className="flex flex-wrap gap-2 mb-3">
            <button onClick={() => setMessages(prev => [...prev, {
            role: "user",
            content: "현재 상태 확인해줘"
          }, {
            role: "agent",
            content: "현재 시스템 상태를 확인합니다. CPU 사용률: 45%, 메모리: 62%, 디스크: 78%. 전반적으로 안정적입니다."
          }])} className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-xs transition-colors">
              상태 확인
            </button>
            <button onClick={() => setMessages(prev => [...prev, {
            role: "user",
            content: "로그 분석해줘"
          }, {
            role: "agent",
            content: "최근 1시간 로그를 분석합니다. 경고 2건, 에러 0건 발견. 대부분 정상적인 요청 로그입니다."
          }])} className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-xs transition-colors">
              로그 분석
            </button>
            <button onClick={() => setMessages(prev => [...prev, {
            role: "user",
            content: "일일 보고서 생성해줘"
          }, {
            role: "agent",
            content: "일일 보고서를 생성합니다. 총 처리 건수: 15건, 성공률: 92%, 주요 이슈: CPU 과부하 1건. 보고서가 준비되었습니다."
          }])} className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-xs transition-colors">
              보고서 생성
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSendMessage()} placeholder="Agent에게 요청하세요..." className="flex-1 px-3 py-2 rounded-lg bg-chat-user/50 border border-border/50 text-sm focus:outline-none focus:border-primary" />
            <button onClick={handleSendMessage} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>;
}