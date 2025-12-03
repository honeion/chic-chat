import { 
  MessageSquare, 
  Users, 
  Bot, 
  Workflow, 
  TrendingUp, 
  Activity,
  Clock,
  Zap
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const statsCards = [
  { label: "총 대화 수", value: "1,284", change: "+12%", icon: MessageSquare, color: "primary" },
  { label: "활성 사용자", value: "342", change: "+8%", icon: Users, color: "accent" },
  { label: "AI Agent 연결", value: "12", change: "+2", icon: Bot, color: "primary" },
  { label: "Workflow 실행", value: "89", change: "+23%", icon: Workflow, color: "accent" },
];

const chartData = [
  { name: "월", messages: 120, users: 45 },
  { name: "화", messages: 180, users: 52 },
  { name: "수", messages: 240, users: 78 },
  { name: "목", messages: 200, users: 65 },
  { name: "금", messages: 320, users: 90 },
  { name: "토", messages: 180, users: 48 },
  { name: "일", messages: 140, users: 35 },
];

const agentUsageData = [
  { name: "AI 어시스턴트", usage: 456 },
  { name: "Super Agent", usage: 289 },
  { name: "RAG Agent", usage: 187 },
  { name: "Code Agent", usage: 134 },
  { name: "Workflow", usage: 98 },
];

const recentActivities = [
  { type: "agent", message: "Super Agent가 작업을 완료했습니다", time: "2분 전", status: "success" },
  { type: "user", message: "새로운 사용자가 등록했습니다", time: "15분 전", status: "info" },
  { type: "workflow", message: "데이터 파이프라인이 실행 중입니다", time: "32분 전", status: "warning" },
  { type: "agent", message: "RAG Agent 문서 인덱싱 완료", time: "1시간 전", status: "success" },
  { type: "system", message: "시스템 업데이트가 적용되었습니다", time: "2시간 전", status: "info" },
];

export default function Dashboard() {
  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">대시보드</h1>
            <p className="text-muted-foreground text-sm">시스템 현황 및 통계를 확인하세요</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm">
            <Activity className="w-4 h-4" />
            <span>실시간 업데이트</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <div
              key={stat.label}
              className="p-5 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 animate-fade-in shadow-card"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${stat.color === "primary" ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-status-online bg-status-online/10 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Chart */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-card border border-border shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">메시지 & 사용자 추이</h3>
                <p className="text-xs text-muted-foreground">최근 7일간 통계</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  메시지
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                  사용자
                </span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(175, 80%, 50%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(175, 80%, 50%)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(175, 60%, 40%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(175, 60%, 40%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 22%)" />
                  <XAxis dataKey="name" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                  <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(220, 18%, 13%)", 
                      border: "1px solid hsl(220, 15%, 22%)",
                      borderRadius: "8px",
                      fontSize: "12px"
                    }} 
                  />
                  <Area type="monotone" dataKey="messages" stroke="hsl(175, 80%, 50%)" fillOpacity={1} fill="url(#colorMessages)" strokeWidth={2} />
                  <Area type="monotone" dataKey="users" stroke="hsl(175, 60%, 40%)" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Agent Usage */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-card">
            <div className="mb-4">
              <h3 className="font-semibold text-foreground">Agent 사용량</h3>
              <p className="text-xs text-muted-foreground">이번 주 통계</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentUsageData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 22%)" horizontal={false} />
                  <XAxis type="number" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="hsl(215, 20%, 55%)" fontSize={11} width={90} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(220, 18%, 13%)", 
                      border: "1px solid hsl(220, 15%, 22%)",
                      borderRadius: "8px",
                      fontSize: "12px"
                    }} 
                  />
                  <Bar dataKey="usage" fill="hsl(175, 80%, 50%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Activity */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">최근 활동</h3>
              <button className="text-xs text-primary hover:underline">모두 보기</button>
            </div>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`w-2 h-2 mt-2 rounded-full ${
                    activity.status === "success" ? "bg-status-online" :
                    activity.status === "warning" ? "bg-status-busy" :
                    "bg-primary"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{activity.message}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-card">
            <h3 className="font-semibold text-foreground mb-4">빠른 실행</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Bot, label: "새 Agent 생성", desc: "AI 에이전트 추가" },
                { icon: Workflow, label: "Workflow 실행", desc: "파이프라인 시작" },
                { icon: Users, label: "사용자 관리", desc: "권한 설정" },
                { icon: Zap, label: "MCP 연결", desc: "외부 연동" },
              ].map((action, index) => (
                <button
                  key={action.label}
                  className="p-4 rounded-xl bg-secondary/50 hover:bg-primary/10 hover:border-primary/30 border border-transparent transition-all duration-200 text-left group"
                >
                  <action.icon className="w-5 h-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-foreground">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
