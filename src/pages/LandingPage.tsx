import { useState, useEffect, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Info, Settings, AlertTriangle, Clock, CheckCircle, Play, Database, Wrench, User, FileText, Sparkles, MessageSquare, BarChart3, Shield, Zap, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChatInput } from "@/components/chat/ChatInput";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import ParticleSphere from "@/components/landing/ParticleSphere";

// Mock data for ITS requests
const mockITSRequests = {
  unreceived: [
    { id: "ITS-2024-0152", title: "서버 응답 지연 현상 발생", system: "e-총무", date: "2024-12-05", type: "I", detail: "e-총무 시스템에서 API 응답 시간이 평균 3초 이상으로 지연되고 있습니다. 사용자들의 업무 처리에 영향을 주고 있어 긴급 확인이 필요합니다." },
    { id: "ITS-2024-0149", title: "신규 입사자 계정 발급 요청", system: "BiOn", date: "2024-12-04", type: "A", detail: "마케팅팀 신규 입사자 3명에 대한 BiOn 시스템 계정 발급이 필요합니다. 입사일: 2024-12-09" },
    { id: "ITS-2024-0153", title: "고객별 주문 현황 데이터 추출", system: "SATIS", date: "2024-12-06", type: "D", detail: "2024년 하반기 고객별 주문 현황 데이터 추출 요청입니다. CSV 형식으로 제공 부탁드립니다." },
  ],
  inProgress: [
    { id: "ITS-2024-0151", title: "대시보드 UI 개선 요청", system: "e-총무", date: "2024-12-05", type: "C", detail: "관리자 대시보드의 차트 영역 UI 개선 요청입니다. 현재 처리율 70% 진행 중입니다." },
    { id: "ITS-2024-0150", title: "월간 매출 데이터 추출 요청", system: "BiOn", date: "2024-12-04", type: "D", detail: "11월 월간 매출 데이터 추출 작업 진행 중입니다. 내일 오전 완료 예정입니다." },
  ],
  completed: 1,
};

// Mock data for monitoring alerts
const mockMonitoringAlerts = {
  detected: [
    { id: "MON-2024-0045", title: "API-01 CPU 사용률 임계치 초과", system: "e-총무", date: "2024-12-05", severity: "critical", detail: "API-01 서버의 CPU 사용률이 95%를 초과했습니다. 즉시 확인이 필요합니다." },
    { id: "MON-2024-0046", title: "WEB-02 메모리 사용률 높음", system: "BiOn", date: "2024-12-05", severity: "warning", detail: "WEB-02 서버의 메모리 사용률이 85%입니다. 모니터링 필요합니다." },
    { id: "MON-2024-0047", title: "DB-01 디스크 I/O 지연", system: "SATIS", date: "2024-12-06", severity: "warning", detail: "DB-01 서버의 디스크 I/O 지연이 발생하고 있습니다. 쿼리 성능에 영향을 줄 수 있습니다." },
  ],
  inProgress: [
    { id: "MON-2024-0044", title: "네트워크 대역폭 포화 상태", system: "e-총무", date: "2024-12-05", severity: "critical", detail: "네트워크 대역폭 확장 작업을 진행 중입니다. 1시간 내 완료 예정입니다." },
    { id: "MON-2024-0043", title: "SSL 인증서 만료 임박", system: "BiOn", date: "2024-12-04", severity: "warning", detail: "SSL 인증서 갱신 작업을 진행 중입니다. 만료일 전 완료 예정입니다." },
  ],
  completed: 2,
};

const getTypeIcon = (type: string) => {
  const icons: Record<string, { icon: typeof AlertTriangle; color: string }> = {
    I: { icon: AlertTriangle, color: "text-red-400" },
    C: { icon: Wrench, color: "text-yellow-400" },
    D: { icon: Database, color: "text-blue-400" },
    A: { icon: User, color: "text-purple-400" },
    S: { icon: FileText, color: "text-gray-400" },
  };
  return icons[type] || icons.S;
};

// Expandable Item Component
function ExpandableItem({ 
  id, 
  title, 
  system, 
  detail, 
  icon: Icon, 
  iconColor,
  idColor = "text-primary",
  showPlay = false 
}: { 
  id: string; 
  title: string; 
  system: string; 
  detail: string;
  icon: typeof AlertTriangle;
  iconColor: string;
  idColor?: string;
  showPlay?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between text-xs bg-background/30 rounded px-2 py-1.5 cursor-pointer hover:bg-background/50 transition-colors">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Icon className={`w-3 h-3 ${iconColor} shrink-0`} />
            <span className="truncate text-foreground">{title}</span>
            <span className={`${idColor} text-[10px] shrink-0`}>{id}</span>
            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 shrink-0">{system}</Badge>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            {showPlay && <Play className="w-3 h-3 text-primary cursor-pointer hover:text-primary/80" />}
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-1 ml-5 p-2 text-xs text-muted-foreground bg-background/20 rounded border-l-2 border-primary/30">
          {detail}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).replace(/\. /g, ".").replace(",", "");
  };

  const handleTryNow = () => {
    navigate("/");
  };

  // Current situation summary
  const totalPending = mockITSRequests.unreceived.length + mockMonitoringAlerts.detected.length;
  const totalInProgress = mockITSRequests.inProgress.length + mockMonitoringAlerts.inProgress.length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section - with bottom border instead of individual card borders */}
        <div className="flex justify-between items-start pb-4 mb-6 border-b border-border/50">
          <div className="px-2">
            <h1 className="text-2xl font-light text-foreground">
              안녕하세요. <span className="font-medium">운영자</span>님
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="h-8 px-3 text-sm">
              <Info className="w-4 h-4 mr-1" />
              정보
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-3 text-sm">
              <Settings className="w-4 h-4 mr-1" />
              설정
            </Button>
            <span className="text-sm text-muted-foreground">
              {formatDateTime(currentTime)} 접속
            </span>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left: AI Assistant */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Assistant
              </h2>
              <p className="text-sm text-muted-foreground">운영 업무를 지원하는 지능형 어시스턴트</p>
            </div>
            
            <Suspense fallback={
              <div className="w-full h-[250px] flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              </div>
            }>
              <ParticleSphere />
            </Suspense>
            
            {/* Current Situation Summary */}
            <div className="bg-card/30 rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                현재 상황 요약
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">대기 중인 항목</span>
                  <span className="text-red-400 font-medium">{totalPending}건</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">처리 중인 항목</span>
                  <span className="text-yellow-400 font-medium">{totalInProgress}건</span>
                </div>
              </div>
            </div>

            {/* What AI can help with - Conversational style */}
            <div className="bg-card/30 rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                이런 것들을 도와드릴 수 있어요
              </h3>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageSquare className="w-3 h-3 text-cyan-400" />
                  "ITS 요청 처리 좀 도와줘"
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertTriangle className="w-3 h-3 text-orange-400" />
                  "지금 장애 상황 분석해줘"
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Database className="w-3 h-3 text-blue-400" />
                  "이번 달 매출 데이터 뽑아줘"
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="w-3 h-3 text-green-400" />
                  "서버 상태 확인해줘"
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={handleTryNow}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
              >
                시작하기
              </Button>
            </div>
          </div>

          {/* Right: Status Sections - Stacked vertically */}
          <div className="space-y-6">
            {/* ITS 접수현황 */}
            <div className="bg-card/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" />
                  ITS 접수현황
                </h3>
                <div className="flex gap-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-0.5"><AlertTriangle className="w-2.5 h-2.5 text-red-400" />I</span>
                  <span className="flex items-center gap-0.5"><Wrench className="w-2.5 h-2.5 text-yellow-400" />C</span>
                  <span className="flex items-center gap-0.5"><Database className="w-2.5 h-2.5 text-blue-400" />D</span>
                  <span className="flex items-center gap-0.5"><User className="w-2.5 h-2.5 text-purple-400" />A</span>
                </div>
              </div>

              <div className="space-y-3">
                {/* 미접수 - Row */}
                <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-3 h-3 text-red-400" />
                    <span className="text-xs text-red-400">미접수</span>
                    <span className="text-sm font-bold text-foreground">{mockITSRequests.unreceived.length}</span>
                  </div>
                  <div className="space-y-1.5">
                    {mockITSRequests.unreceived.map((req) => {
                      const typeInfo = getTypeIcon(req.type);
                      return (
                        <ExpandableItem
                          key={req.id}
                          id={req.id}
                          title={req.title}
                          system={req.system}
                          detail={req.detail}
                          icon={typeInfo.icon}
                          iconColor={typeInfo.color}
                          showPlay
                        />
                      );
                    })}
                  </div>
                </div>

                {/* 접수/처리중 - Row */}
                <div className="bg-yellow-950/20 border border-yellow-900/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-yellow-400">접수/처리중</span>
                    <span className="text-sm font-bold text-foreground">{mockITSRequests.inProgress.length}</span>
                  </div>
                  <div className="space-y-1.5">
                    {mockITSRequests.inProgress.map((req) => {
                      const typeInfo = getTypeIcon(req.type);
                      return (
                        <ExpandableItem
                          key={req.id}
                          id={req.id}
                          title={req.title}
                          system={req.system}
                          detail={req.detail}
                          icon={typeInfo.icon}
                          iconColor={typeInfo.color}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* 완료 - Compact */}
                <div className="flex items-center justify-between bg-emerald-950/20 border border-emerald-900/30 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs">
                    <CheckCircle className="w-3 h-3" />
                    완료
                  </div>
                  <span className="text-foreground font-medium text-sm">{mockITSRequests.completed}</span>
                </div>
              </div>
            </div>

            {/* 비정상 감지 현황 */}
            <div className="bg-card/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-medium">비정상 감지 현황</h3>
              </div>

              <div className="space-y-3">
                {/* 감지 - Row */}
                <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                    <span className="text-xs text-red-400">감지</span>
                    <span className="text-sm font-bold text-foreground">{mockMonitoringAlerts.detected.length}</span>
                  </div>
                  <div className="space-y-1.5">
                    {mockMonitoringAlerts.detected.map((alert) => (
                      <ExpandableItem
                        key={alert.id}
                        id={alert.id}
                        title={alert.title}
                        system={alert.system}
                        detail={alert.detail}
                        icon={AlertTriangle}
                        iconColor={alert.severity === 'critical' ? 'text-red-400' : 'text-yellow-400'}
                        idColor="text-orange-400"
                        showPlay
                      />
                    ))}
                  </div>
                </div>

                {/* 처리중 - Row */}
                <div className="bg-yellow-950/20 border border-yellow-900/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-yellow-400">처리중</span>
                    <span className="text-sm font-bold text-foreground">{mockMonitoringAlerts.inProgress.length}</span>
                  </div>
                  <div className="space-y-1.5">
                    {mockMonitoringAlerts.inProgress.map((alert) => (
                      <ExpandableItem
                        key={alert.id}
                        id={alert.id}
                        title={alert.title}
                        system={alert.system}
                        detail={alert.detail}
                        icon={AlertTriangle}
                        iconColor={alert.severity === 'critical' ? 'text-red-400' : 'text-yellow-400'}
                        idColor="text-orange-400"
                      />
                    ))}
                  </div>
                </div>

                {/* 완료 - Compact */}
                <div className="flex items-center justify-between bg-emerald-950/20 border border-emerald-900/30 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs">
                    <CheckCircle className="w-3 h-3" />
                    완료
                  </div>
                  <span className="text-foreground font-medium text-sm">{mockMonitoringAlerts.completed}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Chat Input - with top border instead of card border */}
        <div className="pt-4 border-t border-border/50">
          <ChatInput 
            onSend={(msg) => console.log(msg)} 
            showToolSelector={true}
            showQuickActions={false}
          />
          <p className="text-center text-xs text-muted-foreground mt-3">
            ✨ AI가 도움을 드릴 준비가 되었습니다
          </p>
        </div>
      </div>
    </div>
  );
}
