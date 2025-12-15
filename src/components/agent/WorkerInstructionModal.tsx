import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { FileText, Save, X, Eye, Edit, CheckCircle2, Settings, Server } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { SystemDetailSettings } from "./SystemDetailSettings";

interface WorkerInstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  agentName: string;
  systems: { id: string; name: string }[];
  hideSystemSettings?: boolean; // Biz.Support Agent용
}

interface WorkerInstruction {
  id: string;
  systemId: string;
  systemName: string;
  content: string;
  updatedAt: string;
}

// Mock 데이터 - 실제로는 백엔드에서 로드
const mockWorkerInstructions: Record<string, WorkerInstruction[]> = {
  "its": [
    { id: "wi1", systemId: "e-총무", systemName: "e-총무", content: "# ITS Agent 지침 (e-총무)\n\n## 기본 처리 방침\n- 인시던트 요청은 우선순위에 따라 처리\n- 응답 시간 목표: 긴급 30분, 일반 2시간\n\n## 처리 절차\n1. 요청 접수 및 분류\n2. 담당자 배정\n3. 처리 및 결과 통보", updatedAt: "2024-12-01" },
    { id: "wi2", systemId: "BiOn", systemName: "BiOn", content: "# ITS Agent 지침 (BiOn)\n\n## 기본 처리 방침\n- 구매 관련 긴급 요청 우선 처리\n\n## 처리 절차\n1. 요청 분석\n2. 승인 프로세스\n3. 결과 통보", updatedAt: "2024-12-02" },
  ],
  "sop": [
    { id: "wi3", systemId: "e-총무", systemName: "e-총무", content: "# SOP Agent 지침 (e-총무)\n\n## 장애 처리 절차\n1. 장애 감지 및 분류\n2. 영향도 분석\n3. 복구 절차 실행\n4. 결과 보고", updatedAt: "2024-12-01" },
  ],
  "monitoring": [
    { id: "wi4", systemId: "e-총무", systemName: "e-총무", content: "# 모니터링 Agent 지침 (e-총무)\n\n## 모니터링 기준\n- CPU: 80% 초과 시 경고\n- 메모리: 85% 초과 시 경고\n- 응답시간: 3초 초과 시 경고", updatedAt: "2024-12-03" },
  ],
};

export function WorkerInstructionModal({
  isOpen,
  onClose,
  agentId,
  agentName,
  systems,
  hideSystemSettings = false,
}: WorkerInstructionModalProps) {
  const { toast } = useToast();
  const [mainTab, setMainTab] = useState<string>("system-settings");
  const [activeSystemId, setActiveSystemId] = useState<string>(systems[0]?.id || "");
  const [instructions, setInstructions] = useState<WorkerInstruction[]>([]);
  const [editContent, setEditContent] = useState<string>("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // 지침 로드
  useEffect(() => {
    if (isOpen) {
      const agentInstructions = mockWorkerInstructions[agentId] || [];
      setInstructions(agentInstructions);
      
      // 첫 번째 시스템의 지침 로드
      if (systems.length > 0) {
        setActiveSystemId(systems[0].id);
        const systemInstruction = agentInstructions.find(i => i.systemId === systems[0].id);
        setEditContent(systemInstruction?.content || "");
      }
      setHasChanges(false);
      setIsPreviewMode(false);
      // hideSystemSettings인 경우 worker-instruction 탭으로 시작
      setMainTab(hideSystemSettings ? "worker-instruction" : "system-settings");
    }
  }, [isOpen, agentId, systems, hideSystemSettings]);

  // 시스템 변경 시 지침 로드
  const handleSystemChange = (systemId: string) => {
    if (hasChanges) {
      // 변경사항이 있으면 저장 확인
      if (!confirm("변경사항이 저장되지 않았습니다. 다른 시스템으로 이동하시겠습니까?")) {
        return;
      }
    }
    setActiveSystemId(systemId);
    const systemInstruction = instructions.find(i => i.systemId === systemId);
    setEditContent(systemInstruction?.content || "");
    setHasChanges(false);
    setIsPreviewMode(false);
  };

  // 저장
  const handleSave = () => {
    const existingIndex = instructions.findIndex(i => i.systemId === activeSystemId);
    const systemName = systems.find(s => s.id === activeSystemId)?.name || activeSystemId;
    
    if (existingIndex >= 0) {
      // 기존 지침 업데이트
      const updated = [...instructions];
      updated[existingIndex] = {
        ...updated[existingIndex],
        content: editContent,
        updatedAt: new Date().toISOString().split("T")[0],
      };
      setInstructions(updated);
    } else {
      // 새 지침 추가
      const newInstruction: WorkerInstruction = {
        id: `wi-${Date.now()}`,
        systemId: activeSystemId,
        systemName: systemName,
        content: editContent,
        updatedAt: new Date().toISOString().split("T")[0],
      };
      setInstructions([...instructions, newInstruction]);
    }
    
    setHasChanges(false);
    toast({
      title: "저장 완료",
      description: `${systemName} 시스템의 Worker 지침이 저장되었습니다.`,
    });
  };

  const handleContentChange = (content: string) => {
    setEditContent(content);
    setHasChanges(true);
  };

  const currentInstruction = instructions.find(i => i.systemId === activeSystemId);
  const hasInstruction = (systemId: string) => instructions.some(i => i.systemId === systemId && i.content.trim().length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            {agentName} 설정
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4 py-4">
          {/* 메인 설정 탭 */}
          <Tabs value={mainTab} onValueChange={setMainTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="w-fit">
              {!hideSystemSettings && (
                <TabsTrigger value="system-settings" className="gap-2">
                  <Server className="w-4 h-4" />
                  시스템 설정
                </TabsTrigger>
              )}
              <TabsTrigger value="worker-instruction" className="gap-2">
                <FileText className="w-4 h-4" />
                Worker 지침 설정
              </TabsTrigger>
            </TabsList>

            {/* 시스템 설정 탭 */}
            {!hideSystemSettings && (
              <TabsContent value="system-settings" className="flex-1 overflow-auto mt-4">
                {/* 시스템 선택 버튼 */}
                <div className="flex gap-2 mb-4">
                  {systems.map((system) => (
                    <Button
                      key={system.id}
                      variant={activeSystemId === system.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveSystemId(system.id)}
                      className="gap-1.5"
                    >
                      {system.name}
                    </Button>
                  ))}
                </div>
                
                {/* 시스템 상세 설정 */}
                <div className="border rounded-lg p-4 overflow-auto max-h-[calc(85vh-280px)]">
                  <SystemDetailSettings 
                    systemId={activeSystemId} 
                    systemName={systems.find(s => s.id === activeSystemId)?.name || ""} 
                  />
                </div>
              </TabsContent>
            )}

            <TabsContent value="worker-instruction" className="flex-1 overflow-hidden flex flex-col mt-4">
              {/* 시스템 선택 버튼 */}
              <div className="flex gap-2 mb-4">
                {systems.map((system) => (
                  <Button
                    key={system.id}
                    variant={activeSystemId === system.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSystemChange(system.id)}
                    className="gap-1.5"
                  >
                    {system.name}
                    {hasInstruction(system.id) && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    )}
                  </Button>
                ))}
              </div>

              {/* 편집 영역 */}
              <div className="flex-1 overflow-hidden flex flex-col border rounded-lg">
                {/* 편집/미리보기 토글 */}
                <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                  <div className="text-sm text-muted-foreground">
                    {currentInstruction ? (
                      <span>최종 수정: {currentInstruction.updatedAt}</span>
                    ) : (
                      <span>새 지침 작성</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={isPreviewMode ? "outline" : "default"}
                      size="sm"
                      onClick={() => setIsPreviewMode(false)}
                      className="gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      편집
                    </Button>
                    <Button
                      variant={isPreviewMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsPreviewMode(true)}
                      className="gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      미리보기
                    </Button>
                  </div>
                </div>

                {/* 편집/미리보기 영역 */}
                <div className="flex-1 overflow-auto">
                  {isPreviewMode ? (
                    <div className="p-4 h-full overflow-y-auto prose prose-sm dark:prose-invert max-w-none">
                      {editContent ? (
                        <ReactMarkdown>{editContent}</ReactMarkdown>
                      ) : (
                        <p className="text-muted-foreground italic">지침 내용이 없습니다.</p>
                      )}
                    </div>
                  ) : (
                    <Textarea
                      value={editContent}
                      onChange={(e) => handleContentChange(e.target.value)}
                      placeholder={`${systems.find(s => s.id === activeSystemId)?.name || ''} 시스템에 대한 ${agentName} Worker 지침을 입력하세요.\n\n마크다운 형식으로 작성할 수 있습니다.\n\n예시:\n# 제목\n## 부제목\n- 항목 1\n- 항목 2`}
                      className="h-full min-h-[350px] resize-none border-0 rounded-none font-mono text-sm"
                    />
                  )}
                </div>
              </div>

              {hasChanges && (
                <p className="text-sm text-amber-500 flex items-center gap-1 mt-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  저장되지 않은 변경사항이 있습니다.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            닫기
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || mainTab !== "worker-instruction"}>
            <Save className="w-4 h-4 mr-2" />
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
