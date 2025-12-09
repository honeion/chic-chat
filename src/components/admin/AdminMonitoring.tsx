import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Activity,
  Users,
  Bot,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Server,
  Cpu,
  HardDrive,
  Wifi,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Mock data for charts
const usageData = [
  { time: "00:00", agents: 12, users: 45, requests: 120 },
  { time: "04:00", agents: 8, users: 20, requests: 45 },
  { time: "08:00", agents: 35, users: 180, requests: 450 },
  { time: "12:00", agents: 42, users: 220, requests: 580 },
  { time: "16:00", agents: 38, users: 190, requests: 420 },
  { time: "20:00", agents: 25, users: 120, requests: 280 },
];

const agentUsageData = [
  { name: "ITS Agent", usage: 320 },
  { name: "SOP Agent", usage: 280 },
  { name: "모니터링 Agent", usage: 245 },
  { name: "DB Agent", usage: 180 },
  { name: "보고서 Agent", usage: 150 },
  { name: "변경관리 Agent", usage: 120 },
  { name: "Biz.Support Agent", usage: 95 },
];

const systemHealthData = [
  { name: "e-총무", value: 98, status: "healthy" },
  { name: "BiOn", value: 95, status: "healthy" },
  { name: "SATIS", value: 87, status: "warning" },
  { name: "ITS", value: 99, status: "healthy" },
];

const recentActivities = [
  { id: 1, user: "김철수", action: "ITS Agent 실행", time: "2분 전", status: "success" },
  { id: 2, user: "이영희", action: "SOP 문서 조회", time: "5분 전", status: "success" },
  { id: 3, user: "박민수", action: "DB 백업 실행", time: "10분 전", status: "success" },
  { id: 4, user: "정다현", action: "모니터링 알림", time: "15분 전", status: "warning" },
  { id: 5, user: "최우진", action: "보고서 생성", time: "20분 전", status: "success" },
  { id: 6, user: "김철수", action: "변경관리 승인", time: "30분 전", status: "success" },
];

const alertsData = [
  { id: 1, system: "SATIS", message: "CPU 사용률 85% 초과", level: "warning", time: "10분 전" },
  { id: 2, system: "e-총무", message: "예정된 점검 알림", level: "info", time: "1시간 후" },
  { id: 3, system: "BiOn", message: "API 응답시간 증가 감지", level: "warning", time: "25분 전" },
];

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--muted-foreground))", "hsl(142 70% 45%)"];

export function AdminMonitoring() {
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month">("today");

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          실시간 모니터링
        </h2>
        <div className="flex items-center gap-2 border rounded-lg p-1">
          {(["today", "week", "month"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-colors",
                timeRange === range
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {range === "today" ? "오늘" : range === "week" ? "이번 주" : "이번 달"}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">1,245</p>
                <p className="text-xs text-muted-foreground">오늘 요청 수</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-status-online">
              <TrendingUp className="w-3 h-3" />
              <span>+12% vs 어제</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">48</p>
                <p className="text-xs text-muted-foreground">활성 사용자</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-status-online">
              <TrendingUp className="w-3 h-3" />
              <span>+5 vs 어제</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">7</p>
                <p className="text-xs text-muted-foreground">실행 중인 Agent</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-status-online/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-status-online" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <CheckCircle className="w-3 h-3" />
              <span>모두 정상</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-xs text-muted-foreground">주의 알림</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-status-busy/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-status-busy" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-status-busy">
              <Clock className="w-3 h-3" />
              <span>확인 필요</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Usage Over Time */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">시간대별 사용량</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="requests"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span>요청 수</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <span>사용자 수</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Usage */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Agent별 사용량</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentUsageData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11 }}
                    width={100}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="usage" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health & Activities Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* System Health */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="w-4 h-4" />
              시스템 상태
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemHealthData.map((system) => (
                <div key={system.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        system.status === "healthy" ? "bg-status-online" : "bg-status-busy"
                      )}
                    />
                    <span className="text-sm">{system.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          system.status === "healthy" ? "bg-status-online" : "bg-status-busy"
                        )}
                        style={{ width: `${system.value}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-10">{system.value}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2">
              <div className="text-center p-2 rounded-lg bg-secondary/50">
                <Cpu className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm font-medium">45%</p>
                <p className="text-xs text-muted-foreground">CPU</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-secondary/50">
                <HardDrive className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm font-medium">62%</p>
                <p className="text-xs text-muted-foreground">Storage</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-secondary/50">
                <Wifi className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm font-medium">28ms</p>
                <p className="text-xs text-muted-foreground">Latency</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4" />
              최근 활동
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-secondary/30"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        activity.status === "success" ? "bg-status-online" : "bg-status-busy"
                      )}
                    />
                    <div>
                      <p className="text-sm font-medium">{activity.user}</p>
                      <p className="text-xs text-muted-foreground">{activity.action}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              알림
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alertsData.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "p-3 rounded-lg border",
                    alert.level === "warning"
                      ? "bg-status-busy/10 border-status-busy/30"
                      : "bg-primary/10 border-primary/30"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge
                      variant={alert.level === "warning" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {alert.system}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{alert.time}</span>
                  </div>
                  <p className="text-sm">{alert.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
