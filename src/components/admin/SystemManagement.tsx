import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Server,
  Globe,
  Link2,
  Cloud,
  MoreHorizontal,
  ExternalLink,
  Copy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

import { SystemData, mockSystems } from "@/data/systems";

export function SystemManagement() {
  const [systems, setSystems] = useState<SystemData[]>(mockSystems);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<SystemData | null>(null);

  const filteredSystems = systems.filter(
    (system) =>
      system.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      system.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: SystemData["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-status-online text-white">운영중</Badge>;
      case "maintenance":
        return <Badge className="bg-status-busy text-white">점검중</Badge>;
      case "inactive":
        return <Badge variant="secondary">비활성</Badge>;
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="시스템 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          시스템 추가
        </Button>
      </div>

      {/* System Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSystems.map((system) => (
          <Card
            key={system.id}
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => {
              setSelectedSystem(system);
              setIsDetailModalOpen(true);
            }}
          >
            <CardHeader className="bg-primary/10 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Server className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{system.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{system.description}</p>
                  </div>
                </div>
                {getStatusBadge(system.status)}
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate text-muted-foreground">{system.url}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate text-muted-foreground">{system.namespace}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Cloud className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">MCP: {system.mcpServer}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  담당자: {system.managers.join(", ")}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSystem(system);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      수정
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setSystems(systems.filter((s) => s.id !== system.id));
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Server className="w-5 h-5 text-primary" />
              {selectedSystem?.name} 상세 정보
            </DialogTitle>
          </DialogHeader>
          {selectedSystem && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                    시스템명
                  </label>
                  <Input defaultValue={selectedSystem.name} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                    상태
                  </label>
                  <div className="mt-1">{getStatusBadge(selectedSystem.status)}</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                  설명
                </label>
                <Textarea defaultValue={selectedSystem.description} rows={2} />
              </div>

              <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  접속 정보
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">URL</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input defaultValue={selectedSystem.url} className="flex-1" />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopy(selectedSystem.url)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                        <a href={selectedSystem.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">API Endpoint</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input defaultValue={selectedSystem.apiEndpoint} className="flex-1" />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopy(selectedSystem.apiEndpoint)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Cloud className="w-4 h-4" />
                  인프라 정보
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Namespace</label>
                    <Input defaultValue={selectedSystem.namespace} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Service</label>
                    <Input defaultValue={selectedSystem.svc} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">MCP Server</label>
                    <Input defaultValue={selectedSystem.mcpServer} className="mt-1" />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
                <h4 className="font-medium text-sm">시스템 스펙</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">CPU</label>
                    <Input defaultValue={selectedSystem.spec.cpu} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Memory</label>
                    <Input defaultValue={selectedSystem.spec.memory} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Storage</label>
                    <Input defaultValue={selectedSystem.spec.storage} className="mt-1" />
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground flex justify-between">
                <span>생성일: {selectedSystem.createdAt}</span>
                <span>수정일: {selectedSystem.updatedAt}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              취소
            </Button>
            <Button onClick={() => setIsDetailModalOpen(false)}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>시스템 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">시스템명</label>
              <Input placeholder="시스템 이름 입력" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">설명</label>
              <Textarea placeholder="시스템 설명 입력" rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">URL</label>
              <Input placeholder="https://example.com" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">API Endpoint</label>
              <Input placeholder="https://api.example.com/v1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Namespace</label>
                <Input placeholder="namespace" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">MCP Server</label>
                <Input placeholder="mcp-server-01" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              취소
            </Button>
            <Button onClick={() => setIsCreateModalOpen(false)}>추가</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
