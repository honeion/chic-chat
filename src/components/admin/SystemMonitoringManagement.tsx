import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Monitor,
  Plus,
  Search,
  Pencil,
  Globe,
  Database,
  Server,
  FileText,
  RefreshCw,
  Activity,
} from "lucide-react";
import { mockSystems } from "@/data/systems";

// 체크 유형 정의
const CHECK_TYPES = [
  { value: "HTTP", label: "HTTP", icon: Globe },
  { value: "DB", label: "DB", icon: Database },
  { value: "INTERFACE", label: "INTERFACE", icon: RefreshCw },
  { value: "BATCH", label: "BATCH", icon: Activity },
  { value: "SYSTEM", label: "SYSTEM", icon: Server },
  { value: "LOG", label: "LOG", icon: FileText },
];

// 체크 코드 정의
const CHECK_CODES: Record<string, { code: string; label: string; description: string }[]> = {
  HTTP: [
    { code: "HTTP_STATUS_200", label: "HTTP 200 응답", description: "HTTP 200 응답 여부 확인" },
    { code: "HTTP_LATENCY_UNDER_MS", label: "응답 시간 체크", description: "지정된 시간 내 응답 여부" },
  ],
  DB: [
    { code: "DB_CONNECT", label: "DB 접속 확인", description: "DB 접속 가능 여부" },
    { code: "DB_CUSTOM_QUERY_ASSERT", label: "커스텀 쿼리", description: "DB 쿼리 조건 검사" },
  ],
  INTERFACE: [
    { code: "IF_DATA_CHECK", label: "I/F 데이터 확인", description: "인터페이스 데이터 정상 여부" },
    { code: "IF_LOG_CHECK", label: "I/F 로그 확인", description: "인터페이스 로그 에러 여부" },
  ],
  BATCH: [
    { code: "BATCH_LAST_RUN_AFTER", label: "배치 실행 확인", description: "배치 최근 실행 여부" },
    { code: "BATCH_SUCCESS_CHECK", label: "배치 성공 확인", description: "배치 정상 완료 여부" },
  ],
  SYSTEM: [
    { code: "SYS_PROCESS_RUNNING", label: "프로세스 확인", description: "프로세스 실행 여부" },
    { code: "SYS_RESOURCE_CHECK", label: "리소스 확인", description: "CPU/Memory 임계치 확인" },
  ],
  LOG: [
    { code: "LOG_PATTERN_COUNT_ZERO", label: "로그 패턴 체크", description: "로그 패턴 0건 여부" },
    { code: "LOG_ERROR_CHECK", label: "에러 로그 체크", description: "에러 로그 발생 여부" },
  ],
};

// 중요도 정의
const SEVERITY_OPTIONS = [
  { value: "INFO", label: "INFO", color: "bg-blue-500" },
  { value: "WARN", label: "WARN", color: "bg-yellow-500" },
  { value: "CRIT", label: "CRIT", color: "bg-red-500" },
];

// 실행 주기 정의
const INTERVAL_OPTIONS = [
  { value: "5m", label: "5분" },
  { value: "10m", label: "10분" },
  { value: "30m", label: "30분" },
  { value: "1h", label: "매시간" },
  { value: "1d", label: "매일" },
];

// 환경 정의
const ENVIRONMENTS = ["PROD", "DEV", "STG", "DR"];

// 모니터링 체크 인터페이스
interface MonitoringCheck {
  id: string;
  systemId: string;
  environment: string;
  name: string;
  checkType: string;
  checkCode: string;
  target: string;
  interval: string;
  severity: string;
  isActive: boolean;
  timeout: number;
  config: Record<string, string>;
  updatedAt: string;
}

// Mock 데이터
const mockMonitoringChecks: MonitoringCheck[] = [
  // e-총무 시스템 - HTTP
  {
    id: "mc1",
    systemId: "s1",
    environment: "PROD",
    name: "e-총무 API 헬스체크",
    checkType: "HTTP",
    checkCode: "HTTP_STATUS_200",
    target: "https://api.e-chongmu.example.com/health",
    interval: "5m",
    severity: "WARN",
    isActive: true,
    timeout: 30,
    config: { url: "https://api.e-chongmu.example.com/health" },
    updatedAt: "2024-01-15 14:30",
  },
  // e-총무 시스템 - DB
  {
    id: "mc2",
    systemId: "s1",
    environment: "PROD",
    name: "e-총무 DB 접속 확인",
    checkType: "DB",
    checkCode: "DB_CONNECT",
    target: "CHONGMU_DB",
    interval: "10m",
    severity: "CRIT",
    isActive: true,
    timeout: 60,
    config: { database: "CHONGMU_DB" },
    updatedAt: "2024-01-14 10:00",
  },
  // e-총무 시스템 - INTERFACE
  {
    id: "mc3",
    systemId: "s1",
    environment: "PROD",
    name: "e-총무 ERP 연동 데이터 확인",
    checkType: "INTERFACE",
    checkCode: "IF_DATA_CHECK",
    target: "ERP_IF",
    interval: "30m",
    severity: "WARN",
    isActive: true,
    timeout: 60,
    config: { interfaceName: "ERP_SYNC", checkQuery: "SELECT COUNT(*) FROM if_erp_log WHERE status='ERROR'" },
    updatedAt: "2024-01-14 09:00",
  },
  // e-총무 시스템 - BATCH
  {
    id: "mc4",
    systemId: "s1",
    environment: "PROD",
    name: "e-총무 일일정산 배치",
    checkType: "BATCH",
    checkCode: "BATCH_LAST_RUN_AFTER",
    target: "DAILY_SETTLE_BATCH",
    interval: "1h",
    severity: "CRIT",
    isActive: true,
    timeout: 120,
    config: { batchName: "DAILY_SETTLE_BATCH", maxAge: "24h" },
    updatedAt: "2024-01-13 09:00",
  },
  // e-총무 시스템 - SYSTEM
  {
    id: "mc5",
    systemId: "s1",
    environment: "PROD",
    name: "e-총무 WAS 프로세스 확인",
    checkType: "SYSTEM",
    checkCode: "SYS_PROCESS_RUNNING",
    target: "chongmu-was",
    interval: "5m",
    severity: "CRIT",
    isActive: true,
    timeout: 30,
    config: { processName: "java", processKeyword: "chongmu-was" },
    updatedAt: "2024-01-12 18:00",
  },
  // e-총무 시스템 - LOG
  {
    id: "mc6",
    systemId: "s1",
    environment: "PROD",
    name: "e-총무 에러 로그 모니터링",
    checkType: "LOG",
    checkCode: "LOG_PATTERN_COUNT_ZERO",
    target: "ELK",
    interval: "10m",
    severity: "WARN",
    isActive: true,
    timeout: 30,
    config: { logTool: "ELK", pattern: "ERROR OR Exception", timeRange: "10m" },
    updatedAt: "2024-01-12 16:45",
  },
  // BiOn 시스템 샘플
  {
    id: "mc7",
    systemId: "s2",
    environment: "PROD",
    name: "BiOn API 헬스체크",
    checkType: "HTTP",
    checkCode: "HTTP_STATUS_200",
    target: "https://api.bion.example.com/health",
    interval: "5m",
    severity: "WARN",
    isActive: true,
    timeout: 30,
    config: { url: "https://api.bion.example.com/health" },
    updatedAt: "2024-01-11 14:00",
  },
  // SATIS 시스템 샘플
  {
    id: "mc8",
    systemId: "s3",
    environment: "DEV",
    name: "SATIS 로그 모니터링",
    checkType: "LOG",
    checkCode: "LOG_ERROR_CHECK",
    target: "ELK",
    interval: "10m",
    severity: "INFO",
    isActive: false,
    timeout: 30,
    config: { logTool: "ELK", pattern: "FATAL", timeRange: "30m" },
    updatedAt: "2024-01-10 11:30",
  },
];

export function SystemMonitoringManagement() {
  const [checks, setChecks] = useState<MonitoringCheck[]>(mockMonitoringChecks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCheck, setEditingCheck] = useState<MonitoringCheck | null>(null);

  // 필터 상태
  const [filterSystem, setFilterSystem] = useState<string>("all");
  const [filterEnv, setFilterEnv] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterActive, setFilterActive] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // 모달 폼 상태
  const [formData, setFormData] = useState({
    systemId: "",
    environment: "PROD",
    name: "",
    checkType: "",
    checkCode: "",
    target: "",
    interval: "5m",
    severity: "WARN",
    isActive: true,
    timeout: 30,
    config: {} as Record<string, string>,
  });

  // 필터링된 목록
  const filteredChecks = checks.filter((check) => {
    if (filterSystem !== "all" && check.systemId !== filterSystem) return false;
    if (filterEnv !== "all" && check.environment !== filterEnv) return false;
    if (filterType !== "all" && check.checkType !== filterType) return false;
    if (filterSeverity !== "all" && check.severity !== filterSeverity) return false;
    if (filterActive !== "all") {
      const isActive = filterActive === "active";
      if (check.isActive !== isActive) return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !check.name.toLowerCase().includes(query) &&
        !check.checkCode.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    return true;
  });

  // 모달 열기 (추가)
  const handleAdd = () => {
    setEditingCheck(null);
    setFormData({
      systemId: mockSystems[0]?.id || "",
      environment: "PROD",
      name: "",
      checkType: "",
      checkCode: "",
      target: "",
      interval: "5m",
      severity: "WARN",
      isActive: true,
      timeout: 30,
      config: {},
    });
    setIsModalOpen(true);
  };

  // 모달 열기 (수정)
  const handleEdit = (check: MonitoringCheck) => {
    setEditingCheck(check);
    setFormData({
      systemId: check.systemId,
      environment: check.environment,
      name: check.name,
      checkType: check.checkType,
      checkCode: check.checkCode,
      target: check.target,
      interval: check.interval,
      severity: check.severity,
      isActive: check.isActive,
      timeout: check.timeout,
      config: { ...check.config },
    });
    setIsModalOpen(true);
  };

  // 저장
  const handleSave = () => {
    if (!formData.systemId || !formData.checkType || !formData.checkCode) {
      alert("필수 항목을 입력해주세요.");
      return;
    }

    const now = new Date().toISOString().slice(0, 16).replace("T", " ");

    if (editingCheck) {
      // 수정
      setChecks(
        checks.map((c) =>
          c.id === editingCheck.id
            ? { ...c, ...formData, updatedAt: now }
            : c
        )
      );
    } else {
      // 추가
      const newCheck: MonitoringCheck = {
        id: `mc${Date.now()}`,
        ...formData,
        updatedAt: now,
      };
      setChecks([...checks, newCheck]);
    }

    setIsModalOpen(false);
  };

  // 사용 여부 토글
  const handleToggleActive = (id: string) => {
    setChecks(
      checks.map((c) =>
        c.id === id ? { ...c, isActive: !c.isActive } : c
      )
    );
  };

  // 시스템명 가져오기
  const getSystemName = (systemId: string) => {
    const system = mockSystems.find((s) => s.id === systemId);
    return system?.shortName || systemId;
  };

  // 중요도 배지 색상
  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case "CRIT":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "WARN":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  // 체크 유형 아이콘
  const getTypeIcon = (type: string) => {
    const typeInfo = CHECK_TYPES.find((t) => t.value === type);
    if (typeInfo) {
      const Icon = typeInfo.icon;
      return <Icon className="w-4 h-4" />;
    }
    return null;
  };

  // 체크 유형 변경 시 체크 코드 초기화
  const handleTypeChange = (type: string) => {
    setFormData({
      ...formData,
      checkType: type,
      checkCode: "",
      config: {},
    });
  };

  // 설정 필드 렌더링
  const renderConfigFields = () => {
    const { checkType, checkCode } = formData;

    if (!checkCode) return null;

    switch (checkCode) {
      case "HTTP_STATUS_200":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">URL</Label>
              <Input
                value={formData.config.url || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    target: e.target.value,
                    config: { ...formData.config, url: e.target.value },
                  })
                }
                placeholder="https://api.example.com/health"
                className="text-sm"
              />
            </div>
          </div>
        );

      case "HTTP_LATENCY_UNDER_MS":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">URL</Label>
              <Input
                value={formData.config.url || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    target: e.target.value,
                    config: { ...formData.config, url: e.target.value },
                  })
                }
                placeholder="https://api.example.com/health"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">최대 응답 시간 (ms)</Label>
              <Input
                type="number"
                value={formData.config.maxLatency || "500"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, maxLatency: e.target.value },
                  })
                }
                placeholder="500"
                className="text-sm"
              />
            </div>
          </div>
        );

      case "DB_CONNECT":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">데이터베이스 선택</Label>
              <Select
                value={formData.config.database || ""}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    target: value,
                    config: { ...formData.config, database: value },
                  })
                }
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="DB 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ORDER_DB">ORDER_DB</SelectItem>
                  <SelectItem value="USER_DB">USER_DB</SelectItem>
                  <SelectItem value="LOG_DB">LOG_DB</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "DB_CUSTOM_QUERY_ASSERT":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">데이터베이스 선택</Label>
              <Select
                value={formData.config.database || ""}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    target: value,
                    config: { ...formData.config, database: value },
                  })
                }
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="DB 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ORDER_DB">ORDER_DB</SelectItem>
                  <SelectItem value="USER_DB">USER_DB</SelectItem>
                  <SelectItem value="LOG_DB">LOG_DB</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">SQL 쿼리</Label>
              <Textarea
                value={formData.config.sql || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, sql: e.target.value },
                  })
                }
                placeholder="SELECT count(*) AS cnt FROM orders WHERE created_at >= now() - interval '10 minutes'"
                className="text-sm font-mono"
                rows={3}
              />
            </div>
            <div>
              <Label className="text-xs">조건 (예: cnt &gt;= 1)</Label>
              <Input
                value={formData.config.condition || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, condition: e.target.value },
                  })
                }
                placeholder="cnt >= 1"
                className="text-sm"
              />
            </div>
          </div>
        );

      case "BATCH_LAST_RUN_AFTER":
      case "BATCH_SUCCESS_CHECK":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">배치명</Label>
              <Input
                value={formData.config.batchName || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    target: e.target.value,
                    config: { ...formData.config, batchName: e.target.value },
                  })
                }
                placeholder="ORDER_BATCH"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">최대 경과 시간</Label>
              <Input
                value={formData.config.maxAge || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, maxAge: e.target.value },
                  })
                }
                placeholder="2h"
                className="text-sm"
              />
            </div>
          </div>
        );

      case "LOG_PATTERN_COUNT_ZERO":
      case "LOG_ERROR_CHECK":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">로그 도구</Label>
              <Select
                value={formData.config.logTool || ""}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    target: value,
                    config: { ...formData.config, logTool: value },
                  })
                }
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="로그 도구 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ELK">ELK</SelectItem>
                  <SelectItem value="Splunk">Splunk</SelectItem>
                  <SelectItem value="CloudWatch">CloudWatch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">패턴</Label>
              <Input
                value={formData.config.pattern || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, pattern: e.target.value },
                  })
                }
                placeholder="ERROR OR Exception"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">시간 범위</Label>
              <Input
                value={formData.config.timeRange || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, timeRange: e.target.value },
                  })
                }
                placeholder="10m"
                className="text-sm"
              />
            </div>
          </div>
        );

      case "SYS_PROCESS_RUNNING":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">서버 선택</Label>
              <Select
                value={formData.config.server || ""}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    target: value,
                    config: { ...formData.config, server: value },
                  })
                }
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="서버 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEB-01">WEB-01</SelectItem>
                  <SelectItem value="WEB-02">WEB-02</SelectItem>
                  <SelectItem value="APP-01">APP-01</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">프로세스명</Label>
              <Input
                value={formData.config.processName || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, processName: e.target.value },
                  })
                }
                placeholder="java, nginx"
                className="text-sm"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-muted-foreground">
            설정 필드가 정의되지 않았습니다.
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-primary/10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              시스템 모니터링 관리
            </CardTitle>
            <Button onClick={handleAdd} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              체크 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* 필터 영역 */}
          <div className="flex flex-wrap gap-3 p-3 rounded-lg bg-muted/30">
            <Select value={filterSystem} onValueChange={setFilterSystem}>
              <SelectTrigger className="w-32 text-sm">
                <SelectValue placeholder="시스템" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 시스템</SelectItem>
                {mockSystems.map((sys) => (
                  <SelectItem key={sys.id} value={sys.id}>
                    {sys.shortName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterEnv} onValueChange={setFilterEnv}>
              <SelectTrigger className="w-28 text-sm">
                <SelectValue placeholder="환경" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 환경</SelectItem>
                {ENVIRONMENTS.map((env) => (
                  <SelectItem key={env} value={env}>
                    {env}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32 text-sm">
                <SelectValue placeholder="체크 유형" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 유형</SelectItem>
                {CHECK_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-28 text-sm">
                <SelectValue placeholder="중요도" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {SEVERITY_OPTIONS.map((sev) => (
                  <SelectItem key={sev.value} value={sev.value}>
                    {sev.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterActive} onValueChange={setFilterActive}>
              <SelectTrigger className="w-24 text-sm">
                <SelectValue placeholder="사용" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="active">사용</SelectItem>
                <SelectItem value="inactive">중지</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="체크 이름 또는 코드 검색"
                className="pl-8 text-sm"
              />
            </div>
          </div>

          {/* 목록 테이블 */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-24">시스템명</TableHead>
                  <TableHead className="w-12">사용</TableHead>
                  <TableHead>체크 이름</TableHead>
                  <TableHead className="w-16">환경</TableHead>
                  <TableHead className="w-28">유형</TableHead>
                  <TableHead>코드</TableHead>
                  <TableHead>대상</TableHead>
                  <TableHead className="w-16">주기</TableHead>
                  <TableHead className="w-16">중요도</TableHead>
                  <TableHead className="w-32">수정일시</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredChecks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      등록된 모니터링 체크가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredChecks.map((check) => (
                    <TableRow key={check.id}>
                      <TableCell className="text-sm">
                        {getSystemName(check.systemId)}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={check.isActive}
                          onCheckedChange={() => handleToggleActive(check.id)}
                          className="scale-75"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{check.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {check.environment}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {getTypeIcon(check.checkType)}
                          <span className="text-sm">{check.checkType}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {check.checkCode}
                      </TableCell>
                      <TableCell className="text-sm truncate max-w-40" title={check.target}>
                        {check.target}
                      </TableCell>
                      <TableCell className="text-sm">
                        {INTERVAL_OPTIONS.find((i) => i.value === check.interval)?.label || check.interval}
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${getSeverityBadgeClass(check.severity)}`}>
                          {check.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {check.updatedAt}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(check)}
                          className="h-7 w-7 p-0"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 추가/수정 모달 */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCheck ? "모니터링 체크 수정" : "모니터링 체크 추가"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* 기본 정보 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">시스템 *</Label>
                <Select
                  value={formData.systemId}
                  onValueChange={(value) => setFormData({ ...formData, systemId: value })}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="시스템 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockSystems.map((sys) => (
                      <SelectItem key={sys.id} value={sys.id}>
                        {sys.shortName} - {sys.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">환경 *</Label>
                <Select
                  value={formData.environment}
                  onValueChange={(value) => setFormData({ ...formData, environment: value })}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ENVIRONMENTS.map((env) => (
                      <SelectItem key={env} value={env}>
                        {env}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label className="text-sm">사용</Label>
            </div>

            <div>
              <Label className="text-xs">체크 이름</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="예: API 헬스체크"
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs">중요도 *</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) => setFormData({ ...formData, severity: value })}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEVERITY_OPTIONS.map((sev) => (
                      <SelectItem key={sev.value} value={sev.value}>
                        {sev.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">실행 주기 *</Label>
                <Select
                  value={formData.interval}
                  onValueChange={(value) => setFormData({ ...formData, interval: value })}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERVAL_OPTIONS.map((int) => (
                      <SelectItem key={int.value} value={int.value}>
                        {int.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">타임아웃 (초)</Label>
                <Input
                  type="number"
                  value={formData.timeout}
                  onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) || 30 })}
                  className="text-sm"
                />
              </div>
            </div>

            {/* 체크 유형 및 코드 선택 */}
            <div className="border-t pt-4">
              <Label className="text-xs font-medium">체크 유형 / 체크 항목 *</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Select
                    value={formData.checkType}
                    onValueChange={handleTypeChange}
                    disabled={!!editingCheck}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="체크 유형 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHECK_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select
                    value={formData.checkCode}
                    onValueChange={(value) => setFormData({ ...formData, checkCode: value, config: {} })}
                    disabled={!formData.checkType || !!editingCheck}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="체크 항목 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.checkType &&
                        CHECK_CODES[formData.checkType]?.map((code) => (
                          <SelectItem key={code.code} value={code.code}>
                            <div>
                              <div className="font-medium">{code.label}</div>
                              <div className="text-xs text-muted-foreground">{code.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* 설정 값 입력 */}
            {formData.checkCode && (
              <div className="border-t pt-4">
                <Label className="text-xs font-medium mb-2 block">설정 값</Label>
                {renderConfigFields()}
              </div>
            )}

            {/* 저장 버튼 */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                취소
              </Button>
              <Button onClick={handleSave}>
                {editingCheck ? "수정" : "추가"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
