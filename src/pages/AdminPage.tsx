import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  Users,
  Server,
  Shield,
  FileText,
  Bot,
  Database,
  GitBranch,
  Activity,
  ArrowLeft,
  Settings,
  Crown,
  Monitor,
  Plug,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { UserManagement } from "@/components/admin/UserManagement";
import { SystemManagement } from "@/components/admin/SystemManagement";

import { PermissionManagement } from "@/components/admin/PermissionManagement";
import { InstructionManagement } from "@/components/admin/InstructionManagement";
import { AgentManagement } from "@/components/admin/AgentManagement";
import { KnowledgeRAGManagement } from "@/components/admin/KnowledgeRAGManagement";
import { KnowledgeGraphManagement } from "@/components/admin/KnowledgeGraphManagement";
import { AdminMonitoring } from "@/components/admin/AdminMonitoring";
import { SystemMonitoringManagement } from "@/components/admin/SystemMonitoringManagement";
import { MCPManagement } from "@/components/admin/MCPManagement";

type AdminSection =
  | "users"
  | "systems"
  | "permissions"
  | "system-monitoring"
  | "mcp"
  | "instructions"
  | "agents"
  | "knowledge-rag"
  | "knowledge-graph"
  | "monitoring";

const adminSections = [
  { id: "users" as AdminSection, icon: Users, label: "사용자관리" },
  { id: "systems" as AdminSection, icon: Server, label: "시스템관리" },
  { id: "permissions" as AdminSection, icon: Shield, label: "Agent 권한관리" },
  { id: "system-monitoring" as AdminSection, icon: Monitor, label: "시스템 모니터링 관리" },
  { id: "mcp" as AdminSection, icon: Plug, label: "MCP 서버/Tool 관리" },
  { id: "instructions" as AdminSection, icon: FileText, label: "지침관리" },
  { id: "agents" as AdminSection, icon: Bot, label: "My Agent 관리" },
  { id: "knowledge-rag" as AdminSection, icon: Database, label: "지식 RAG 관리" },
  { id: "knowledge-graph" as AdminSection, icon: GitBranch, label: "지식 Graph 관리" },
  { id: "monitoring" as AdminSection, icon: Activity, label: "모니터링" },
];

// Mock admin check - in production, this should be from authentication
const isAdmin = true;
const currentUser = {
  name: "관리자",
  email: "admin@example.com",
  isAdmin: true,
};

const AdminPage = () => {
  const [selectedSection, setSelectedSection] = useState<AdminSection>("users");
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Mock: redirect if not admin
  if (!isAdmin) {
    navigate("/");
    return null;
  }

  const renderContent = () => {
    switch (selectedSection) {
      case "users":
        return <UserManagement />;
      case "systems":
        return <SystemManagement />;
      case "permissions":
        return <PermissionManagement />;
      case "system-monitoring":
        return <SystemMonitoringManagement />;
      case "mcp":
        return <MCPManagement />;
      case "instructions":
        return <InstructionManagement />;
      case "agents":
        return <AgentManagement />;
      case "knowledge-rag":
        return <KnowledgeRAGManagement />;
      case "knowledge-graph":
        return <KnowledgeGraphManagement />;
      case "monitoring":
        return <AdminMonitoring />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-72 h-full bg-sidebar flex flex-col border-r border-border">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-semibold text-gradient">관리자 페이지</h1>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
            </div>
          </div>

          {/* Admin Badge */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
            <Crown className="w-4 h-4 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
            </div>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-primary text-primary-foreground">
              Admin
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            관리 메뉴
          </div>
          {adminSections.map((section) => {
            const Icon = section.icon;
            const isSelected = selectedSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setSelectedSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left",
                  isSelected
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{section.label}</span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium text-sm">메인으로 돌아가기</span>
          </button>
          <div className="flex items-center justify-center">
            <LanguageSelector />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Top Bar */}
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            {adminSections.find((s) => s.id === selectedSection)?.icon && (
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                {(() => {
                  const Icon = adminSections.find((s) => s.id === selectedSection)?.icon;
                  return Icon ? <Icon className="w-4 h-4 text-primary" /> : null;
                })()}
              </div>
            )}
            <h2 className="text-lg font-semibold">
              {adminSections.find((s) => s.id === selectedSection)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">{renderContent()}</div>
      </main>
    </div>
  );
};

export default AdminPage;
