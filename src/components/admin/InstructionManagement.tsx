import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  FileText,
  Server,
  User,
  Calendar,
  History,
  Eye,
  ChevronDown,
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
import { Badge } from "@/components/ui/badge";

interface InstructionVersion {
  version: string;
  content: string;
  updatedAt: string;
  updatedBy: string;
}

interface InstructionData {
  id: string;
  name: string;
  systemId: string;
  systemName: string;
  description: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  currentVersion: string;
  versions: InstructionVersion[];
}

const mockInstructions: InstructionData[] = [
  {
    id: "i1",
    name: "e-총무 장애대응 지침",
    systemId: "s1",
    systemName: "e-총무",
    description: "e-총무 시스템 장애 발생 시 대응 절차",
    content: `# e-총무 장애대응 지침

## 1. 장애 감지
- 모니터링 시스템을 통한 자동 감지
- 사용자 신고를 통한 감지

## 2. 초기 대응
1. 장애 영향도 파악
2. 담당자 알림 발송
3. 장애 등급 분류

## 3. 복구 절차
- 서버 재시작
- 로그 분석
- 원인 파악 및 조치`,
    author: "김철수",
    createdAt: "2024-01-15",
    updatedAt: "2024-12-01",
    currentVersion: "1.2.0",
    versions: [
      { version: "1.2.0", content: "최신 버전", updatedAt: "2024-12-01", updatedBy: "김철수" },
      { version: "1.1.0", content: "중간 버전", updatedAt: "2024-06-15", updatedBy: "이영희" },
      { version: "1.0.0", content: "초기 버전", updatedAt: "2024-01-15", updatedBy: "김철수" },
    ],
  },
  {
    id: "i2",
    name: "BiOn 배포 절차서",
    systemId: "s2",
    systemName: "BiOn",
    description: "BiOn 시스템 배포 시 준수해야 할 절차",
    content: `# BiOn 배포 절차서

## 배포 전 체크리스트
- 코드 리뷰 완료
- 테스트 통과 확인
- 변경관리 승인

## 배포 단계
1. 스테이징 환경 테스트
2. 운영 환경 배포
3. 헬스체크 확인`,
    author: "박민수",
    createdAt: "2024-02-20",
    updatedAt: "2024-11-28",
    currentVersion: "2.0.1",
    versions: [
      { version: "2.0.1", content: "패치", updatedAt: "2024-11-28", updatedBy: "박민수" },
      { version: "2.0.0", content: "메이저 업데이트", updatedAt: "2024-08-10", updatedBy: "박민수" },
    ],
  },
  {
    id: "i3",
    name: "SATIS 데이터 백업 지침",
    systemId: "s3",
    systemName: "SATIS",
    description: "SATIS 시스템 데이터 백업 및 복구 절차",
    content: `# SATIS 데이터 백업 지침

## 백업 스케줄
- 일간: 증분 백업
- 주간: 전체 백업
- 월간: 아카이브

## 복구 절차
1. 백업 파일 확인
2. 복구 대상 선정
3. 복구 실행 및 검증`,
    author: "이영희",
    createdAt: "2024-03-10",
    updatedAt: "2024-10-15",
    currentVersion: "1.1.0",
    versions: [
      { version: "1.1.0", content: "현재", updatedAt: "2024-10-15", updatedBy: "이영희" },
    ],
  },
];

const systems = [
  { id: "s1", name: "e-총무" },
  { id: "s2", name: "BiOn" },
  { id: "s3", name: "SATIS" },
  { id: "s4", name: "ITS" },
];

export function InstructionManagement() {
  const [instructions, setInstructions] = useState<InstructionData[]>(mockInstructions);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSystem, setSelectedSystem] = useState<string>("all");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInstruction, setSelectedInstruction] = useState<InstructionData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const filteredInstructions = instructions.filter((inst) => {
    const matchesSearch =
      inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSystem = selectedSystem === "all" || inst.systemId === selectedSystem;
    return matchesSearch && matchesSystem;
  });

  // Group by system
  const instructionsBySystem = systems.reduce((acc, system) => {
    acc[system.id] = filteredInstructions.filter((i) => i.systemId === system.id);
    return acc;
  }, {} as Record<string, InstructionData[]>);

  const handleDelete = (id: string) => {
    setInstructions(instructions.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="지침 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedSystem}
            onChange={(e) => setSelectedSystem(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm min-w-[120px]"
          >
            <option value="all">전체 시스템</option>
            {systems.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          지침 추가
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{instructions.length}</p>
                <p className="text-xs text-muted-foreground">전체 지침</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {systems.slice(0, 3).map((system) => (
          <Card key={system.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Server className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {instructions.filter((i) => i.systemId === system.id).length}
                  </p>
                  <p className="text-xs text-muted-foreground">{system.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Instruction List by System */}
      <div className="space-y-4">
        {systems
          .filter((s) => selectedSystem === "all" || s.id === selectedSystem)
          .map((system) => {
            const systemInstructions = instructionsBySystem[system.id] || [];
            if (systemInstructions.length === 0) return null;

            return (
              <Card key={system.id}>
                <CardHeader className="bg-primary/10 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Server className="w-5 h-5" />
                      {system.name}
                    </CardTitle>
                    <Badge variant="secondary">{systemInstructions.length}개 지침</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {systemInstructions.map((inst) => (
                      <div
                        key={inst.id}
                        className="p-4 hover:bg-secondary/30 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedInstruction(inst);
                          setIsDetailModalOpen(true);
                          setIsEditMode(false);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{inst.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                v{inst.currentVersion}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{inst.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {inst.author}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {inst.updatedAt}
                              </span>
                              <span className="flex items-center gap-1">
                                <History className="w-3 h-3" />
                                {inst.versions.length}개 버전
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInstruction(inst);
                                setIsDetailModalOpen(true);
                                setIsEditMode(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(inst.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Detail/Edit Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {selectedInstruction?.name}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVersionHistory(!showVersionHistory)}
                  className="gap-2"
                >
                  <History className="w-4 h-4" />
                  버전 이력
                </Button>
                <Button
                  variant={isEditMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsEditMode(!isEditMode)}
                  className="gap-2"
                >
                  {isEditMode ? <Eye className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  {isEditMode ? "미리보기" : "편집"}
                </Button>
              </div>
            </div>
          </DialogHeader>

          {selectedInstruction && (
            <div className="space-y-4 py-4">
              {showVersionHistory && (
                <div className="p-4 rounded-lg bg-secondary/50 space-y-2 mb-4">
                  <h4 className="font-medium text-sm">버전 이력</h4>
                  <div className="space-y-2">
                    {selectedInstruction.versions.map((v, idx) => (
                      <div
                        key={v.version}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-lg text-sm",
                          idx === 0 ? "bg-primary/10 border border-primary/30" : "bg-background"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant={idx === 0 ? "default" : "secondary"}>v{v.version}</Badge>
                          <span>{v.updatedBy}</span>
                        </div>
                        <span className="text-muted-foreground">{v.updatedAt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                    지침명
                  </label>
                  {isEditMode ? (
                    <Input defaultValue={selectedInstruction.name} />
                  ) : (
                    <p className="text-sm p-2 bg-secondary/30 rounded-lg">
                      {selectedInstruction.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                    시스템
                  </label>
                  {isEditMode ? (
                    <select
                      defaultValue={selectedInstruction.systemId}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                    >
                      {systems.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm p-2 bg-secondary/30 rounded-lg">
                      {selectedInstruction.systemName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                  설명
                </label>
                {isEditMode ? (
                  <Textarea defaultValue={selectedInstruction.description} rows={2} />
                ) : (
                  <p className="text-sm p-2 bg-secondary/30 rounded-lg">
                    {selectedInstruction.description}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                  지침 내용 (Markdown)
                </label>
                {isEditMode ? (
                  <Textarea
                    defaultValue={selectedInstruction.content}
                    rows={15}
                    className="font-mono text-sm"
                  />
                ) : (
                  <div className="p-4 bg-secondary/30 rounded-lg prose prose-sm dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm">{selectedInstruction.content}</pre>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              닫기
            </Button>
            {isEditMode && <Button onClick={() => setIsDetailModalOpen(false)}>저장</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>지침 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">지침명</label>
              <Input placeholder="지침 이름 입력" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">시스템</label>
              <select className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                <option value="">시스템 선택</option>
                {systems.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">설명</label>
              <Textarea placeholder="지침 설명 입력" rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">내용 (Markdown)</label>
              <Textarea placeholder="지침 내용 입력" rows={8} className="font-mono" />
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
