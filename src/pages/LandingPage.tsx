import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Info, Settings, AlertTriangle, Clock, CheckCircle, Play, Database, Wrench, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ChatInput } from "@/components/chat/ChatInput";

// Mock data for ITS requests
const mockITSRequests = {
  unreceived: [
    { id: "ITS-2024-0152", title: "서버 응답 지연 현상 발생", system: "e-총무", date: "2024-12-05", type: "I" },
    { id: "ITS-2024-0149", title: "신규 입사자 계정 발급 요청", system: "BiOn", date: "2024-12-04", type: "A" },
    { id: "ITS-2024-0153", title: "고객별 주문 현황 데이터 추출", system: "SATIS", date: "2024-12-06", type: "D" },
  ],
  inProgress: [
    { id: "ITS-2024-0151", title: "대시보드 UI 개선 요청", system: "e-총무", date: "2024-12-05", type: "C" },
    { id: "ITS-2024-0150", title: "월간 매출 데이터 추출 요청", system: "BiOn", date: "2024-12-04", type: "D" },
  ],
  completed: 1,
};

// Mock data for monitoring alerts
const mockMonitoringAlerts = {
  detected: [
    { id: "MON-2024-0045", title: "API-01 CPU 사용률 임계치 초과", system: "e-총무", date: "2024-12-05", severity: "critical" },
    { id: "MON-2024-0046", title: "WEB-02 메모리 사용률 높음", system: "BiOn", date: "2024-12-05", severity: "warning" },
    { id: "MON-2024-0047", title: "DB-01 디스크 I/O 지연", system: "SATIS", date: "2024-12-06", severity: "warning" },
  ],
  inProgress: [
    { id: "MON-2024-0044", title: "네트워크 대역폭 포화 상태", system: "e-총무", date: "2024-12-05", severity: "critical" },
    { id: "MON-2024-0043", title: "SSL 인증서 만료 임박", system: "BiOn", date: "2024-12-04", severity: "warning" },
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

// Animated AI Sphere Component
function AnimatedAISphere() {
  return (
    <div className="relative w-full h-[300px] flex items-center justify-center">
      {/* Outer glow ring */}
      <div className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-cyan-500/20 to-primary/20 animate-pulse-glow" />
      
      {/* Middle ring */}
      <div className="absolute w-56 h-56 rounded-full border border-cyan-500/30 animate-spin" style={{ animationDuration: '20s' }} />
      
      {/* Inner rotating ring */}
      <div className="absolute w-48 h-48 rounded-full border-2 border-dashed border-primary/40 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
      
      {/* Core sphere with gradient */}
      <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-cyan-400/80 via-primary/60 to-purple-600/80 shadow-2xl animate-float">
        {/* Inner glow */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-cyan-300/40 to-transparent" />
        
        {/* Particle dots */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"
            style={{
              top: `${50 + 45 * Math.sin((i * 30 * Math.PI) / 180)}%`,
              left: `${50 + 45 * Math.cos((i * 30 * Math.PI) / 180)}%`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
      
      {/* Orbiting particles */}
      <div className="absolute w-64 h-64 animate-spin" style={{ animationDuration: '10s' }}>
        <div className="absolute top-0 left-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50" />
        <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-primary rounded-full shadow-lg shadow-primary/50" />
      </div>
      
      <div className="absolute w-72 h-72 animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }}>
        <div className="absolute top-1/2 left-0 w-1.5 h-1.5 bg-purple-400 rounded-full" />
        <div className="absolute top-1/2 right-0 w-1.5 h-1.5 bg-cyan-300 rounded-full" />
      </div>
    </div>
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

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="bg-card/50 backdrop-blur border border-border/50 rounded-lg px-6 py-3">
          <h1 className="text-2xl font-light text-foreground">
            안녕하세요. <span className="font-medium">운영자</span>님
          </h1>
        </div>
        
        <div className="bg-card/50 backdrop-blur border border-border/50 rounded-lg px-4 py-2">
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="sm" className="h-7 px-3 text-xs">
              <Info className="w-3 h-3 mr-1" />
              정보
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-3 text-xs">
              <Settings className="w-3 h-3 mr-1" />
              설정
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {formatDateTime(currentTime)} 접속
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* AI Assistant Card */}
        <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur border-border/50 p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">AI Assistant</h2>
          
          <AnimatedAISphere />
          
          <div className="flex justify-center mt-4">
            <Button 
              onClick={handleTryNow}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
            >
              Try Now
            </Button>
          </div>
          
          <p className="text-muted-foreground mt-6 text-sm leading-relaxed">
            Analyze product sales over last year. Compare revenue, quality, sales and brand
          </p>
        </Card>

        {/* ITS 접수현황 */}
        <Card className="bg-card/50 backdrop-blur border-border/50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              ITS 접수현황
            </h3>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-red-400" />인시던트</span>
              <span className="flex items-center gap-1"><Wrench className="w-3 h-3 text-yellow-400" />개선</span>
              <span className="flex items-center gap-1"><Database className="w-3 h-3 text-blue-400" />데이터</span>
              <span className="flex items-center gap-1"><User className="w-3 h-3 text-purple-400" />계정/권한</span>
              <span className="flex items-center gap-1"><FileText className="w-3 h-3 text-gray-400" />단순</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* 미접수 */}
            <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3">
              <div className="flex items-center justify-center gap-2 text-red-400 text-xs mb-2">
                <Clock className="w-3 h-3" />
                미접수
              </div>
              <p className="text-2xl font-bold text-center text-foreground mb-3">{mockITSRequests.unreceived.length}</p>
              <div className="space-y-2">
                {mockITSRequests.unreceived.map((req) => {
                  const typeInfo = getTypeIcon(req.type);
                  const Icon = typeInfo.icon;
                  return (
                    <div key={req.id} className="flex items-start justify-between text-xs">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <Icon className={`w-3 h-3 ${typeInfo.color}`} />
                          <span className="truncate text-foreground">{req.title}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-primary text-[10px]">{req.id}</span>
                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">{req.system}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <span className="text-muted-foreground text-[10px]">{req.date}</span>
                        <Play className="w-3 h-3 text-primary cursor-pointer hover:text-primary/80" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 접수/처리중 */}
            <div className="bg-yellow-950/30 border border-yellow-900/50 rounded-lg p-3">
              <div className="flex items-center justify-center gap-2 text-yellow-400 text-xs mb-2">
                <Clock className="w-3 h-3" />
                접수/처리중
              </div>
              <p className="text-2xl font-bold text-center text-foreground mb-3">{mockITSRequests.inProgress.length}</p>
              <div className="space-y-2">
                {mockITSRequests.inProgress.map((req) => {
                  const typeInfo = getTypeIcon(req.type);
                  const Icon = typeInfo.icon;
                  return (
                    <div key={req.id} className="flex items-start justify-between text-xs">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <Icon className={`w-3 h-3 ${typeInfo.color}`} />
                          <span className="truncate text-foreground">{req.title}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-primary text-[10px]">{req.id}</span>
                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">{req.system}</Badge>
                        </div>
                      </div>
                      <span className="text-muted-foreground text-[10px] ml-2">{req.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 완료 */}
          <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-lg p-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 text-xs">
              <CheckCircle className="w-3 h-3" />
              완료
            </div>
            <span className="text-foreground font-medium">{mockITSRequests.completed}</span>
          </div>
        </Card>

        {/* 비정상 감지 현황 */}
        <Card className="bg-card/50 backdrop-blur border-border/50 p-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium">비정상 감지 현황</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* 감지 */}
            <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3">
              <div className="flex items-center justify-center gap-2 text-red-400 text-xs mb-2">
                <AlertTriangle className="w-3 h-3" />
                감지
              </div>
              <p className="text-2xl font-bold text-center text-foreground mb-3">{mockMonitoringAlerts.detected.length}</p>
              <div className="space-y-2">
                {mockMonitoringAlerts.detected.map((alert) => (
                  <div key={alert.id} className="flex items-start justify-between text-xs">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <AlertTriangle className={`w-3 h-3 ${alert.severity === 'critical' ? 'text-red-400' : 'text-yellow-400'}`} />
                        <span className="truncate text-foreground">{alert.title}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-orange-400 text-[10px]">{alert.id}</span>
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">{alert.system}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <span className="text-muted-foreground text-[10px]">{alert.date}</span>
                      <Play className="w-3 h-3 text-primary cursor-pointer hover:text-primary/80" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 처리중 */}
            <div className="bg-yellow-950/30 border border-yellow-900/50 rounded-lg p-3">
              <div className="flex items-center justify-center gap-2 text-yellow-400 text-xs mb-2">
                <Clock className="w-3 h-3" />
                처리중
              </div>
              <p className="text-2xl font-bold text-center text-foreground mb-3">{mockMonitoringAlerts.inProgress.length}</p>
              <div className="space-y-2">
                {mockMonitoringAlerts.inProgress.map((alert) => (
                  <div key={alert.id} className="flex items-start justify-between text-xs">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <AlertTriangle className={`w-3 h-3 ${alert.severity === 'critical' ? 'text-red-400' : 'text-yellow-400'}`} />
                        <span className="truncate text-foreground">{alert.title}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-orange-400 text-[10px]">{alert.id}</span>
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">{alert.system}</Badge>
                      </div>
                    </div>
                    <span className="text-muted-foreground text-[10px] ml-2">{alert.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 완료 */}
          <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-lg p-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 text-xs">
              <CheckCircle className="w-3 h-3" />
              완료
            </div>
            <span className="text-foreground font-medium">{mockMonitoringAlerts.completed}</span>
          </div>
        </Card>
      </div>

      {/* Chat Input Area */}
      <Card className="bg-card/50 backdrop-blur border-border/50 p-4">
        <ChatInput 
          onSend={(msg) => console.log(msg)} 
          showToolSelector={true}
          showQuickActions={false}
        />
        <p className="text-center text-xs text-muted-foreground mt-2">
          ✨ AI가 도움을 드릴 준비가 되었습니다
        </p>
      </Card>
    </div>
  );
}
