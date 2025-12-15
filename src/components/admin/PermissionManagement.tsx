import { useState } from "react";
import { cn } from "@/lib/utils";
import { Shield, Bot, Users, Server, Briefcase, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

type UserRole = "관리자" | "운영자(조회)" | "운영자(제어)" | "현업담당자";

interface RolePermission {
  roleId: UserRole;
  roleName: string;
  description: string;
  icon: React.ReactNode;
  controlPermission: boolean;
  agentPermissions: Record<string, boolean>;
}

const agents = [
  { id: "its", name: "ITS Agent" },
  { id: "sop", name: "SOP Agent" },
  { id: "change", name: "변경관리 Agent" },
  { id: "db", name: "DB Agent" },
  { id: "monitoring", name: "모니터링 Agent" },
  { id: "report", name: "보고서 Agent" },
  { id: "biz", name: "Biz.Support Agent" },
  { id: "infra", name: "인프라 Agent" },
];

const initialRolePermissions: RolePermission[] = [
  {
    roleId: "관리자",
    roleName: "관리자",
    description: "시스템 전체 관리 권한을 가진 최고 권한 그룹",
    icon: <Crown className="w-5 h-5 text-status-online" />,
    controlPermission: true,
    agentPermissions: {
      its: true, sop: true, change: true, db: true, monitoring: true, report: true, biz: true, infra: true,
    },
  },
  {
    roleId: "운영자(제어)",
    roleName: "운영자(제어)",
    description: "시스템 운영 및 제어 권한을 가진 그룹",
    icon: <Server className="w-5 h-5 text-blue-500" />,
    controlPermission: true,
    agentPermissions: {
      its: true, sop: true, change: true, db: true, monitoring: true, report: true, biz: true, infra: true,
    },
  },
  {
    roleId: "운영자(조회)",
    roleName: "운영자(조회)",
    description: "시스템 모니터링 및 조회만 가능한 그룹",
    icon: <Server className="w-5 h-5 text-accent" />,
    controlPermission: false,
    agentPermissions: {
      its: true, sop: true, change: true, db: true, monitoring: true, report: true, biz: true, infra: true,
    },
  },
  {
    roleId: "현업담당자",
    roleName: "현업담당자",
    description: "업무 시스템 사용 및 요청 권한을 가진 그룹",
    icon: <Briefcase className="w-5 h-5 text-muted-foreground" />,
    controlPermission: true,
    agentPermissions: {
      its: false, sop: false, change: false, db: false, monitoring: false, report: false, biz: true, infra: false,
    },
  },
];

export function PermissionManagement() {
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>(initialRolePermissions);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const toggleControlPermission = (roleId: UserRole) => {
    setRolePermissions(
      rolePermissions.map((r) =>
        r.roleId === roleId
          ? { ...r, controlPermission: !r.controlPermission }
          : r
      )
    );
  };

  const toggleAgentPermission = (roleId: UserRole, agentId: string) => {
    setRolePermissions(
      rolePermissions.map((r) =>
        r.roleId === roleId
          ? {
              ...r,
              agentPermissions: {
                ...r.agentPermissions,
                [agentId]: !r.agentPermissions[agentId],
              },
            }
          : r
      )
    );
  };

  const countEnabled = (perms: Record<string, boolean>) =>
    Object.values(perms).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Role Cards */}
      <div className="grid grid-cols-4 gap-4">
        {rolePermissions.map((role) => (
          <Card 
            key={role.roleId}
            className={cn(
              "cursor-pointer transition-all hover:ring-2 hover:ring-primary/50",
              selectedRole === role.roleId && "ring-2 ring-primary"
            )}
            onClick={() => setSelectedRole(selectedRole === role.roleId ? null : role.roleId)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  {role.icon}
                </div>
                <div>
                  <p className="font-medium text-sm">{role.roleName}</p>
                  <p className="text-xs text-muted-foreground">
                    Agent {countEnabled(role.agentPermissions)}/{agents.length}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{role.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Agent Permission Matrix */}
      <Card>
        <CardHeader className="bg-primary/10">
          <CardTitle className="text-base flex items-center gap-2">
            <Bot className="w-5 h-5" />
            권한 그룹별 Agent 사용 권한
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50 text-sm">
                <tr>
                  <th className="text-left px-4 py-3 font-medium min-w-[180px]">권한 그룹</th>
                  <th className="text-center px-3 py-3 font-medium text-xs bg-primary/10">제어</th>
                  {agents.map((agent) => (
                    <th key={agent.id} className="text-center px-3 py-3 font-medium text-xs">
                      {agent.name}
                    </th>
                  ))}
                  <th className="text-center px-4 py-3 font-medium">활성</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rolePermissions.map((role) => (
                  <tr 
                    key={role.roleId} 
                    className={cn(
                      "hover:bg-secondary/30 transition-colors",
                      selectedRole === role.roleId && "bg-primary/5"
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          {role.icon}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{role.roleName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center px-3 py-3 bg-primary/5">
                      <Switch
                        checked={role.controlPermission}
                        onCheckedChange={() => toggleControlPermission(role.roleId)}
                      />
                    </td>
                    {agents.map((agent) => (
                      <td key={agent.id} className="text-center px-3 py-3">
                        <Switch
                          checked={role.agentPermissions[agent.id] || false}
                          onCheckedChange={() => toggleAgentPermission(role.roleId, agent.id)}
                        />
                      </td>
                    ))}
                    <td className="text-center px-4 py-3">
                      <Badge variant="secondary">
                        {countEnabled(role.agentPermissions)}/{agents.length}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-8 h-4 bg-primary rounded-full" />
          <span>권한 있음</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-4 bg-secondary rounded-full" />
          <span>권한 없음</span>
        </div>
        <p className="text-xs">
          * 권한 그룹별로 Agent 사용 권한을 설정합니다. Tool 권한은 MCP 서버/Tool 관리에서 설정합니다.
        </p>
      </div>
    </div>
  );
}
