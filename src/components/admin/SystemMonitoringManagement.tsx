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
  Check,
  ChevronsUpDown,
  Code,
  FileCode,
  Copy,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
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
    { code: "HTTP_CUSTOM_HEALTH", label: "사용자 지정 Health Check", description: "URL 호출 후 예상 결과값 비교" },
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
    { code: "BATCH_DATA_CHECK", label: "BATCH 데이터 확인", description: "배치 데이터 정상 여부" },
    { code: "BATCH_LOG_CHECK", label: "BATCH 로그 확인", description: "배치 로그 에러 여부" },
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
// 환경 정의
const ENVIRONMENTS = ["PROD", "DEV", "STG", "DR"];

// 시스템별 DB 목록 (시스템 관리와 연동)
const SYSTEM_DATABASES: Record<string, { id: string; dbName: string; dbType: string }[]> = {
  s1: [
    { id: "db1-s1", dbName: "echongmu_db", dbType: "Postgres" },
    { id: "db2-s1", dbName: "echongmu_log_db", dbType: "Postgres" },
  ],
  s2: [
    { id: "db1-s2", dbName: "bion_main_db", dbType: "MSSQL" },
    { id: "db2-s2", dbName: "bion_report_db", dbType: "MSSQL" },
  ],
  s3: [
    { id: "db1-s3", dbName: "satis_order_db", dbType: "Oracle" },
    { id: "db2-s3", dbName: "satis_logistics_db", dbType: "Oracle" },
  ],
  s4: [
    { id: "db1-s4", dbName: "its_service_db", dbType: "Postgres" },
  ],
  s5: [
    { id: "db1-s5", dbName: "erp_master_db", dbType: "Oracle" },
    { id: "db2-s5", dbName: "erp_hr_db", dbType: "Oracle" },
    { id: "db3-s5", dbName: "erp_fi_db", dbType: "Oracle" },
  ],
  s6: [
    { id: "db1-s6", dbName: "hrm_main_db", dbType: "MySQL" },
  ],
  s7: [
    { id: "db1-s7", dbName: "logistics_api_db", dbType: "Postgres" },
  ],
  s8: [
    { id: "db1-s8", dbName: "payment_if_db", dbType: "MySQL" },
  ],
};

// 시스템별 서버 목록 (시스템 관리와 연동)
const SYSTEM_SERVERS: Record<string, { id: string; serverName: string; hostType: string; vmIp?: string; namespace?: string }[]> = {
  s1: [
    { id: "srv1-s1", serverName: "echongmu-web-01", hostType: "VM", vmIp: "10.0.1.10" },
    { id: "srv2-s1", serverName: "echongmu-web-02", hostType: "VM", vmIp: "10.0.1.11" },
    { id: "srv3-s1", serverName: "echongmu-app-k8s", hostType: "K8S", namespace: "chongmu-prod" },
  ],
  s2: [
    { id: "srv1-s2", serverName: "bion-main-01", hostType: "VM", vmIp: "10.0.2.10" },
    { id: "srv2-s2", serverName: "bion-k8s-cluster", hostType: "K8S", namespace: "bion-prod" },
  ],
  s3: [
    { id: "srv1-s3", serverName: "satis-api-01", hostType: "VM", vmIp: "10.0.3.10" },
    { id: "srv2-s3", serverName: "satis-api-02", hostType: "VM", vmIp: "10.0.3.11" },
  ],
  s4: [
    { id: "srv1-s4", serverName: "its-web-k8s", hostType: "K8S", namespace: "its-prod" },
  ],
  s5: [
    { id: "srv1-s5", serverName: "erp-main-01", hostType: "VM", vmIp: "10.0.5.10" },
    { id: "srv2-s5", serverName: "erp-main-02", hostType: "VM", vmIp: "10.0.5.11" },
    { id: "srv3-s5", serverName: "erp-batch-01", hostType: "VM", vmIp: "10.0.5.20" },
  ],
  s6: [
    { id: "srv1-s6", serverName: "hrm-web-k8s", hostType: "K8S", namespace: "hr-prod" },
  ],
  s7: [
    { id: "srv1-s7", serverName: "logistics-api-k8s", hostType: "K8S", namespace: "logistics-prod" },
  ],
  s8: [
    { id: "srv1-s8", serverName: "payment-if-01", hostType: "VM", vmIp: "10.0.8.10" },
  ],
};

// 모니터링 체크 인터페이스
interface MonitoringCheck {
  id: string;
  systemId: string;
  environment: string;
  name: string;
  checkType: string;
  checkCode: string;
  target: string;
  severity: string;
  isActive: boolean;
  timeout: number;
  config: Record<string, string>;
  updatedAt: string;
}

// Mock 데이터
const mockMonitoringChecks: MonitoringCheck[] = [
  // ===== e-총무 시스템 (s1) - 모든 체크 유형/항목 =====
  
  // HTTP - HTTP_STATUS_200
  {
    id: "mc1-1",
    systemId: "s1",
    environment: "PROD",
    name: "e-총무 API 헬스체크",
    checkType: "HTTP",
    checkCode: "HTTP_STATUS_200",
    target: "https://api.e-chongmu.example.com/health",
    severity: "WARN",
    isActive: true,
    timeout: 30,
    config: { url: "https://api.e-chongmu.example.com/health" },
    updatedAt: "2024-01-15 14:30",
  },
  // HTTP - HTTP_LATENCY_UNDER_MS
  {
    id: "mc1-2",
    systemId: "s1",
    environment: "PROD",
    name: "e-총무 API 응답시간 체크",
    checkType: "HTTP",
    checkCode: "HTTP_LATENCY_UNDER_MS",
    target: "https://api.e-chongmu.example.com/api/main",
    severity: "WARN",
    isActive: true,
    timeout: 30,
    config: { url: "https://api.e-chongmu.example.com/api/main", maxLatency: "3000" },
    updatedAt: "2024-01-15 14:35",
  },
  // HTTP - HTTP_CUSTOM_HEALTH
  {
    id: "mc1-3",
    systemId: "s1",
    environment: "PROD",
    name: "e-총무 사용자 지정 헬스체크",
    checkType: "HTTP",
    checkCode: "HTTP_CUSTOM_HEALTH",
    target: "https://api.e-chongmu.example.com/custom-health",
    severity: "CRIT",
    isActive: true,
    timeout: 30,
    config: { url: "https://api.e-chongmu.example.com/custom-health", expectedValue: '{"status":"UP","db":"connected"}' },
    updatedAt: "2024-01-15 14:40",
  },
  
  // DB - DB_CONNECT
  {
    id: "mc2-1",
    systemId: "s1",
    environment: "PROD",
    name: "e-총무 DB 접속 확인",
    checkType: "DB",
    checkCode: "DB_CONNECT",
    target: "chongmu_main_db",
    severity: "CRIT",
    isActive: true,
    timeout: 60,
    config: { database: "chongmu_main_db" },
    updatedAt: "2024-01-14 10:00",
  },
  // DB - DB_CUSTOM_QUERY_ASSERT
  {
    id: "mc2-2",
    systemId: "s1",
    environment: "PROD",
    name: "e-총무 미처리 건수 체크",
    checkType: "DB",
    checkCode: "DB_CUSTOM_QUERY_ASSERT",
    target: "chongmu_main_db",
    severity: "WARN",
    isActive: true,
    timeout: 60,
    config: { database: "chongmu_main_db", sql: "SELECT COUNT(*) AS cnt FROM pending_tasks WHERE created_at < NOW() - INTERVAL '1 hour'", condition: "cnt = 0" },
    updatedAt: "2024-01-14 10:30",
  },
  
  // INTERFACE - IF_DATA_CHECK
  {
    id: "mc3-1",
    systemId: "s1",
    environment: "PROD",
    name: "e-총무 ERP 연동 데이터 확인",
    checkType: "INTERFACE",
    checkCode: "IF_DATA_CHECK",
    target: "chongmu_main_db",
    severity: "WARN",
    isActive: true,
    timeout: 60,
    config: { database: "chongmu_main_db", sql: "SELECT COUNT(*) AS cnt FROM if_erp_log WHERE status='ERROR' AND created_at >= NOW() - INTERVAL '30 minutes'", condition: "cnt = 0" },
    updatedAt: "2024-01-14 09:00",
  },
  // INTERFACE - IF_LOG_CHECK
  {
    id: "mc3-2",
    systemId: "s1",
    environment: "PROD",
    name: "e-총무 HR 연동 로그 확인",
    checkType: "INTERFACE",
    checkCode: "IF_LOG_CHECK",
    target: "서버로그",
    severity: "WARN",
    isActive: true,
    timeout: 60,
    config: { logTool: "서버로그", server: "echongmu-web-01", serverHostType: "VM", logFilePath: "/var/log/if/hr_sync.log", pattern: "ERROR|FAIL", timeRange: "1h" },
    updatedAt: "2024-01-14 09:30",
  },
  
  // BATCH - BATCH_DATA_CHECK
  {
    id: "mc4-1",
    systemId: "s1",
    environment: "PROD",
    name: "e-총무 일일정산 배치 데이터 확인",
    checkType: "BATCH",
    checkCode: "BATCH_DATA_CHECK",
    target: "chongmu_main_db",
    severity: "CRIT",
    isActive: true,
    timeout: 120,
    config: { database: "chongmu_main_db", sql: "SELECT COUNT(*) AS cnt FROM daily_settle_log WHERE status='ERROR' AND batch_date = CURRENT_DATE", condition: "cnt = 0" },
    updatedAt: "2024-01-13 09:00",
  },
  // BATCH - BATCH_LOG_CHECK
  {
    id: "mc4-2",
    systemId: "s1",
    environment: "PROD",
    name: "e-총무 월마감 배치 로그 확인",
    checkType: "BATCH",
    checkCode: "BATCH_LOG_CHECK",
    target: "Grafana",
    severity: "CRIT",
    isActive: true,
    timeout: 120,
    config: { logTool: "Grafana", grafanaUrl: "https://grafana.e-chongmu.example.com", dashboardId: "batch-logs", panelId: "1", grafanaTarget: '{app="batch-scheduler", job="monthly-close"}', pattern: "FATAL|ERROR", timeRange: "24h" },
    updatedAt: "2024-01-13 09:30",
  },
  
  // SYSTEM - SYS_PROCESS_RUNNING
  {
    id: "mc5-1",
    systemId: "s1",
    environment: "PROD",
    name: "e-총무 WAS 프로세스 확인",
    checkType: "SYSTEM",
    checkCode: "SYS_PROCESS_RUNNING",
    target: "echongmu-web-01",
    severity: "CRIT",
    isActive: true,
    timeout: 30,
    config: { server: "echongmu-web-01", serverHostType: "VM", processName: "java, nginx" },
    updatedAt: "2024-01-12 18:00",
  },
  // SYSTEM - SYS_RESOURCE_CHECK
  {
    id: "mc5-2",
    systemId: "s1",
    environment: "PROD",
    name: "e-총무 서버 리소스 확인",
    checkType: "SYSTEM",
    checkCode: "SYS_RESOURCE_CHECK",
    target: "echongmu-app-k8s",
    severity: "WARN",
    isActive: true,
    timeout: 30,
    config: { server: "echongmu-app-k8s", serverHostType: "K8S", deploymentName: "chongmu-api, chongmu-web", cpuThreshold: "80", memoryThreshold: "85", diskThreshold: "90" },
    updatedAt: "2024-01-12 18:30",
  },
  
  // LOG - LOG_PATTERN_COUNT_ZERO
  {
    id: "mc6-1",
    systemId: "s1",
    environment: "PROD",
    name: "e-총무 에러 로그 모니터링",
    checkType: "LOG",
    checkCode: "LOG_PATTERN_COUNT_ZERO",
    target: "Grafana",
    severity: "WARN",
    isActive: true,
    timeout: 30,
    config: { logTool: "Grafana", grafanaUrl: "https://grafana.e-chongmu.example.com", dashboardId: "app-logs", panelId: "2", grafanaTarget: '{app="chongmu-api", level="error"}', pattern: "ERROR OR Exception", timeRange: "10m" },
    updatedAt: "2024-01-12 16:45",
  },
  // LOG - LOG_ERROR_CHECK
  {
    id: "mc6-2",
    systemId: "s1",
    environment: "PROD",
    name: "e-총무 FATAL 로그 체크",
    checkType: "LOG",
    checkCode: "LOG_ERROR_CHECK",
    target: "서버로그",
    severity: "CRIT",
    isActive: true,
    timeout: 30,
    config: { logTool: "서버로그", server: "echongmu-web-02", serverHostType: "VM", logFilePath: "/var/log/chongmu/application.log", pattern: "FATAL", timeRange: "5m" },
    updatedAt: "2024-01-12 17:00",
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
    severity: "INFO",
    isActive: false,
    timeout: 30,
    config: { logTool: "ELK", pattern: "FATAL", timeRange: "30m" },
    updatedAt: "2024-01-10 11:30",
  },
];

interface SystemMonitoringManagementProps {
  filterBySystemName?: string; // 특정 시스템명으로 필터링 (e.g., "e-총무", "BiOn", "SATIS")
  isEmbedded?: boolean; // 모달 내 임베딩 모드
}

export function SystemMonitoringManagement({ filterBySystemName, isEmbedded = false }: SystemMonitoringManagementProps = {}) {
  // 시스템명으로 시스템 ID 찾기
  const getSystemIdByName = (name: string) => {
    const systemNameMap: Record<string, string> = {
      "e-총무": "s1",
      "BiOn": "s2",
      "SATIS": "s3",
    };
    return systemNameMap[name] || "";
  };

  const fixedSystemId = filterBySystemName ? getSystemIdByName(filterBySystemName) : "";
  const [checks, setChecks] = useState<MonitoringCheck[]>(mockMonitoringChecks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCheck, setEditingCheck] = useState<MonitoringCheck | null>(null);
  const [systemSearchOpen, setSystemSearchOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"json" | "md">("json");
  const { toast } = useToast();

  // 필터 상태 - fixedSystemId가 있으면 해당 시스템으로 고정
  const [filterSystem, setFilterSystem] = useState<string>(fixedSystemId || "s1");
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
    severity: "WARN",
    isActive: true,
    timeout: 30,
    config: {} as Record<string, string>,
  });

  // 필터링된 목록
  const filteredChecks = checks.filter((check) => {
    // fixedSystemId가 있으면 해당 시스템만 표시
    if (fixedSystemId && check.systemId !== fixedSystemId) return false;
    if (!fixedSystemId && filterSystem !== "all" && check.systemId !== filterSystem) return false;
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
      systemId: fixedSystemId || mockSystems[0]?.id || "",
      environment: "PROD",
      name: "",
      checkType: "",
      checkCode: "",
      target: "",
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

  // JSON 형식으로 변환
  const getMonitoringDataAsJson = () => {
    const systemName = filterSystem !== "all" 
      ? getSystemName(filterSystem) 
      : fixedSystemId 
        ? filterBySystemName 
        : "전체";
    
    const data = {
      system: systemName,
      exportedAt: new Date().toISOString(),
      totalChecks: filteredChecks.length,
      checks: filteredChecks.map(check => ({
        name: check.name,
        environment: check.environment,
        checkType: check.checkType,
        checkCode: check.checkCode,
        target: check.target,
        severity: check.severity,
        isActive: check.isActive,
        timeout: check.timeout,
        config: check.config,
        updatedAt: check.updatedAt,
      }))
    };
    return JSON.stringify(data, null, 2);
  };

  // Markdown 형식으로 변환
  const getMonitoringDataAsMd = () => {
    const systemName = filterSystem !== "all" 
      ? getSystemName(filterSystem) 
      : fixedSystemId 
        ? filterBySystemName 
        : "전체";
    
    let md = `# ${systemName} 모니터링 설정\n\n`;
    md += `> 내보내기 시간: ${new Date().toLocaleString("ko-KR")}\n\n`;
    md += `**총 ${filteredChecks.length}개의 체크 항목**\n\n`;
    md += `---\n\n`;

    // 체크 유형별로 그룹화
    const grouped = filteredChecks.reduce((acc, check) => {
      if (!acc[check.checkType]) acc[check.checkType] = [];
      acc[check.checkType].push(check);
      return acc;
    }, {} as Record<string, MonitoringCheck[]>);

    Object.entries(grouped).forEach(([type, checks]) => {
      const typeInfo = CHECK_TYPES.find(t => t.value === type);
      md += `## ${typeInfo?.label || type} (${checks.length}개)\n\n`;

      checks.forEach((check, idx) => {
        md += `### ${idx + 1}. ${check.name}\n\n`;
        md += `| 항목 | 값 |\n`;
        md += `|------|----|\n`;
        md += `| 환경 | ${check.environment} |\n`;
        md += `| 체크코드 | \`${check.checkCode}\` |\n`;
        md += `| 대상 | ${check.target} |\n`;
        md += `| 중요도 | ${check.severity} |\n`;
        md += `| 사용여부 | ${check.isActive ? "✅ 사용" : "❌ 중지"} |\n`;
        md += `| 타임아웃 | ${check.timeout}초 |\n`;
        
        if (Object.keys(check.config).length > 0) {
          md += `\n**상세 설정:**\n\n`;
          md += `\`\`\`json\n${JSON.stringify(check.config, null, 2)}\n\`\`\`\n`;
        }
        md += `\n`;
      });
    });

    return md;
  };

  // 클립보드 복사
  const handleCopy = () => {
    const content = viewMode === "json" ? getMonitoringDataAsJson() : getMonitoringDataAsMd();
    navigator.clipboard.writeText(content);
    toast({
      title: "복사 완료",
      description: `${viewMode.toUpperCase()} 형식으로 클립보드에 복사되었습니다.`,
    });
  };

  // 뷰 모달 열기
  const openViewModal = (mode: "json" | "md") => {
    if (filterSystem === "all" && !fixedSystemId) {
      toast({
        title: "시스템 선택 필요",
        description: "모니터링 정보를 보려면 시스템을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }
    setViewMode(mode);
    setViewModalOpen(true);
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
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm">URL</Label>
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
              />
            </div>
          </div>
        );

      case "HTTP_LATENCY_UNDER_MS":
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm">URL</Label>
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
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">최대 응답 시간 (ms)</Label>
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
              />
            </div>
          </div>
        );

      case "HTTP_CUSTOM_HEALTH":
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm">URL</Label>
              <Input
                value={formData.config.url || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    target: e.target.value,
                    config: { ...formData.config, url: e.target.value },
                  })
                }
                placeholder="https://api.example.com/custom-health"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">예상 결과값</Label>
              <Input
                value={formData.config.expectedResult || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, expectedResult: e.target.value },
                  })
                }
                placeholder="OK 또는 정상 텍스트 입력"
              />
              <p className="text-xs text-muted-foreground">
                URL 호출 결과 텍스트와 비교할 예상 값을 입력하세요.
              </p>
            </div>
          </div>
        );

      case "DB_CONNECT":
        const dbListConnect = SYSTEM_DATABASES[formData.systemId] || [];
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm">데이터베이스 선택</Label>
              {dbListConnect.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">선택한 시스템에 등록된 DB가 없습니다.</p>
              ) : (
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
                  <SelectTrigger>
                    <SelectValue placeholder="DB 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {dbListConnect.map((db) => (
                      <SelectItem key={db.id} value={db.dbName}>
                        <span className="font-medium">{db.dbName}</span>
                        <span className="text-xs text-muted-foreground ml-2">({db.dbType})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        );

      case "DB_CUSTOM_QUERY_ASSERT":
        const dbListQuery = SYSTEM_DATABASES[formData.systemId] || [];
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm">데이터베이스 선택</Label>
              {dbListQuery.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">선택한 시스템에 등록된 DB가 없습니다.</p>
              ) : (
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
                  <SelectTrigger>
                    <SelectValue placeholder="DB 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {dbListQuery.map((db) => (
                      <SelectItem key={db.id} value={db.dbName}>
                        <span className="font-medium">{db.dbName}</span>
                        <span className="text-xs text-muted-foreground ml-2">({db.dbType})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm">SQL 쿼리</Label>
              <Textarea
                value={formData.config.sql || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, sql: e.target.value },
                  })
                }
                placeholder="SELECT count(*) AS cnt FROM orders WHERE created_at >= now() - interval '10 minutes'"
                className="font-mono"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">조건 (예: cnt &gt;= 1)</Label>
              <Input
                value={formData.config.condition || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, condition: e.target.value },
                  })
                }
                placeholder="cnt >= 1"
              />
            </div>
          </div>
        );

      case "IF_DATA_CHECK":
        const dbListIF = SYSTEM_DATABASES[formData.systemId] || [];
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm">데이터베이스 선택</Label>
              {dbListIF.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">선택한 시스템에 등록된 DB가 없습니다.</p>
              ) : (
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
                  <SelectTrigger>
                    <SelectValue placeholder="DB 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {dbListIF.map((db) => (
                      <SelectItem key={db.id} value={db.dbName}>
                        <span className="font-medium">{db.dbName}</span>
                        <span className="text-xs text-muted-foreground ml-2">({db.dbType})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm">SQL 쿼리</Label>
              <Textarea
                value={formData.config.sql || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, sql: e.target.value },
                  })
                }
                placeholder="SELECT count(*) AS cnt FROM if_log WHERE status='ERROR' AND created_at >= now() - interval '10 minutes'"
                className="font-mono"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">조건 (예: cnt = 0)</Label>
              <Input
                value={formData.config.condition || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, condition: e.target.value },
                  })
                }
                placeholder="cnt = 0"
              />
            </div>
          </div>
        );

      case "BATCH_DATA_CHECK":
        const dbListBatch = SYSTEM_DATABASES[formData.systemId] || [];
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm">데이터베이스 선택</Label>
              {dbListBatch.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">선택한 시스템에 등록된 DB가 없습니다.</p>
              ) : (
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
                  <SelectTrigger>
                    <SelectValue placeholder="DB 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {dbListBatch.map((db) => (
                      <SelectItem key={db.id} value={db.dbName}>
                        <span className="font-medium">{db.dbName}</span>
                        <span className="text-xs text-muted-foreground ml-2">({db.dbType})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm">SQL 쿼리</Label>
              <Textarea
                value={formData.config.sql || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, sql: e.target.value },
                  })
                }
                placeholder="SELECT count(*) AS cnt FROM batch_log WHERE status='ERROR' AND created_at >= now() - interval '10 minutes'"
                className="font-mono"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">조건 (예: cnt = 0)</Label>
              <Input
                value={formData.config.condition || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, condition: e.target.value },
                  })
                }
                placeholder="cnt = 0"
              />
            </div>
          </div>
        );

      case "BATCH_LAST_RUN_AFTER":
      case "BATCH_SUCCESS_CHECK":
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm">배치명</Label>
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
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">최대 경과 시간</Label>
              <Input
                value={formData.config.maxAge || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, maxAge: e.target.value },
                  })
                }
                placeholder="2h"
              />
            </div>
          </div>
        );

      case "IF_LOG_CHECK":
      case "BATCH_LOG_CHECK":
      case "LOG_PATTERN_COUNT_ZERO":
      case "LOG_ERROR_CHECK":
        const serverListLog = SYSTEM_SERVERS[formData.systemId] || [];
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm">로그 도구</Label>
              <Select
                value={formData.config.logTool || ""}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    target: value,
                    config: { ...formData.config, logTool: value, server: "" },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="로그 도구 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Grafana">Grafana</SelectItem>
                  <SelectItem value="서버로그">서버로그</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.config.logTool === "Grafana" && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm">Grafana URL</Label>
                  <Input
                    value={formData.config.grafanaUrl || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: { ...formData.config, grafanaUrl: e.target.value },
                      })
                    }
                    placeholder="예: https://grafana.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Dashboard ID</Label>
                  <Input
                    value={formData.config.dashboardId || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: { ...formData.config, dashboardId: e.target.value },
                      })
                    }
                    placeholder="예: abc123xyz"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Panel ID</Label>
                  <Input
                    value={formData.config.panelId || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: { ...formData.config, panelId: e.target.value },
                      })
                    }
                    placeholder="예: 1"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">대상 정보 (Query/Label)</Label>
                  <Input
                    value={formData.config.grafanaTarget || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: { ...formData.config, grafanaTarget: e.target.value },
                      })
                    }
                    placeholder='예: {app="my-service", level="error"}'
                  />
                </div>
              </>
            )}
            {formData.config.logTool === "서버로그" && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm">서버 선택</Label>
                  {serverListLog.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">선택한 시스템에 등록된 서버가 없습니다.</p>
                  ) : (
                    <Select
                      value={formData.config.server || ""}
                      onValueChange={(value) => {
                        const selectedServer = serverListLog.find(s => s.serverName === value);
                        setFormData({
                          ...formData,
                          config: { 
                            ...formData.config, 
                            server: value,
                            serverHostType: selectedServer?.hostType || "",
                            deploymentName: "",
                            logFilePath: "",
                          },
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="서버 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {serverListLog.map((server) => (
                          <SelectItem key={server.id} value={server.serverName}>
                            <span className="font-medium">{server.serverName}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              ({server.hostType}{server.vmIp ? ` - ${server.vmIp}` : server.namespace ? ` - ${server.namespace}` : ""})
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                {formData.config.serverHostType === "K8S" && (
                  <div className="space-y-2">
                    <Label className="text-sm">Deployment 명</Label>
                    <Input
                      value={formData.config.deploymentName || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          config: { ...formData.config, deploymentName: e.target.value },
                        })
                      }
                      placeholder="예: my-app-deployment"
                    />
                  </div>
                )}
                {formData.config.serverHostType === "VM" && (
                  <div className="space-y-2">
                    <Label className="text-sm">Log 파일 경로</Label>
                    <Input
                      value={formData.config.logFilePath || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          config: { ...formData.config, logFilePath: e.target.value },
                        })
                      }
                      placeholder="예: /var/log/app/application.log"
                    />
                  </div>
                )}
              </>
            )}
            <div className="space-y-2">
              <Label className="text-sm">패턴</Label>
              <Input
                value={formData.config.pattern || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, pattern: e.target.value },
                  })
                }
                placeholder="ERROR OR Exception"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">시간 범위</Label>
              <Input
                value={formData.config.timeRange || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: { ...formData.config, timeRange: e.target.value },
                  })
                }
                placeholder="10m"
              />
            </div>
          </div>
        );

      case "SYS_PROCESS_RUNNING":
        const serverListSys = SYSTEM_SERVERS[formData.systemId] || [];
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm">서버 선택</Label>
              {serverListSys.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">선택한 시스템에 등록된 서버가 없습니다.</p>
              ) : (
                <Select
                  value={formData.config.server || ""}
                  onValueChange={(value) => {
                    const selectedServer = serverListSys.find(s => s.serverName === value);
                    setFormData({
                      ...formData,
                      target: value,
                      config: { 
                        ...formData.config, 
                        server: value,
                        serverHostType: selectedServer?.hostType || "",
                      },
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="서버 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {serverListSys.map((server) => (
                      <SelectItem key={server.id} value={server.serverName}>
                        <span className="font-medium">{server.serverName}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({server.hostType}{server.vmIp ? ` - ${server.vmIp}` : server.namespace ? ` - ${server.namespace}` : ""})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            {formData.config.serverHostType === "K8S" && (
              <div className="space-y-2">
                <Label className="text-sm">Deployment 명 (,로 여러개 입력 가능)</Label>
                <Input
                  value={formData.config.deploymentName || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: { ...formData.config, deploymentName: e.target.value },
                    })
                  }
                  placeholder="예: my-app-deployment, api-deployment"
                />
                <p className="text-xs text-muted-foreground">해당 Deployment의 POD를 조회합니다.</p>
              </div>
            )}
            {formData.config.serverHostType === "VM" && (
              <div className="space-y-2">
                <Label className="text-sm">프로세스명 (,로 여러개 입력 가능)</Label>
                <Input
                  value={formData.config.processName || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: { ...formData.config, processName: e.target.value },
                    })
                  }
                  placeholder="예: java, nginx, tomcat"
                />
              </div>
            )}
          </div>
        );

      case "SYS_RESOURCE_CHECK":
        const serverListRes = SYSTEM_SERVERS[formData.systemId] || [];
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm">서버 선택</Label>
              {serverListRes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">선택한 시스템에 등록된 서버가 없습니다.</p>
              ) : (
                <Select
                  value={formData.config.server || ""}
                  onValueChange={(value) => {
                    const selectedServer = serverListRes.find(s => s.serverName === value);
                    setFormData({
                      ...formData,
                      target: value,
                      config: { 
                        ...formData.config, 
                        server: value,
                        serverHostType: selectedServer?.hostType || "",
                      },
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="서버 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {serverListRes.map((server) => (
                      <SelectItem key={server.id} value={server.serverName}>
                        <span className="font-medium">{server.serverName}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({server.hostType}{server.vmIp ? ` - ${server.vmIp}` : server.namespace ? ` - ${server.namespace}` : ""})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            {formData.config.serverHostType === "K8S" && (
              <div className="space-y-2">
                <Label className="text-sm">Deployment 명 (,로 여러개 입력 가능)</Label>
                <Input
                  value={formData.config.deploymentName || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: { ...formData.config, deploymentName: e.target.value },
                    })
                  }
                  placeholder="예: my-app-deployment, api-deployment"
                />
                <p className="text-xs text-muted-foreground">해당 Deployment의 POD 리소스를 조회합니다.</p>
              </div>
            )}
            <div className="grid grid-cols-3 gap-5">
              <div className="space-y-2">
                <Label className="text-sm">CPU 임계치 (%)</Label>
                <Input
                  value={formData.config.cpuThreshold || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: { ...formData.config, cpuThreshold: e.target.value },
                    })
                  }
                  placeholder="80"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Memory 임계치 (%)</Label>
                <Input
                  value={formData.config.memoryThreshold || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: { ...formData.config, memoryThreshold: e.target.value },
                    })
                  }
                  placeholder="85"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Disk 임계치 (%)</Label>
                <Input
                  value={formData.config.diskThreshold || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      config: { ...formData.config, diskThreshold: e.target.value },
                    })
                  }
                  placeholder="90"
                />
              </div>
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

  const content = (
    <>
    <div className={isEmbedded ? "space-y-4" : "p-4 space-y-4"}>
      {/* 필터 영역 */}
      <div className="flex flex-wrap gap-3 p-3 rounded-lg bg-muted/30">
        {/* 시스템 필터 - fixedSystemId가 없을 때만 표시 */}
        {!fixedSystemId && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-48 justify-between text-sm font-normal"
              >
                {filterSystem !== "all"
                  ? mockSystems.find((sys) => sys.id === filterSystem)?.shortName
                  : "시스템 선택..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0" align="start">
              <Command>
                <CommandInput placeholder="시스템 검색..." />
                <CommandList>
                  <CommandEmpty>시스템을 찾을 수 없습니다.</CommandEmpty>
                  <CommandGroup>
                    {mockSystems.map((sys) => (
                      <CommandItem
                        key={sys.id}
                        value={sys.shortName + " " + sys.name}
                        onSelect={() => {
                          setFilterSystem(sys.id);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            filterSystem === sys.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{sys.shortName}</span>
                          <span className="text-xs text-muted-foreground">{sys.name}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}

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

        <div className="flex gap-2">
          <Button 
            onClick={() => openViewModal("json")} 
            size="sm" 
            variant="outline"
            disabled={filterSystem === "all" && !fixedSystemId}
          >
            <Code className="w-4 h-4 mr-1" />
            JSON
          </Button>
          <Button 
            onClick={() => openViewModal("md")} 
            size="sm" 
            variant="outline"
            disabled={filterSystem === "all" && !fixedSystemId}
          >
            <FileCode className="w-4 h-4 mr-1" />
            MD
          </Button>
        </div>

        <Button onClick={handleAdd} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          체크 추가
        </Button>
      </div>

      {/* 목록 테이블 */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {!fixedSystemId && filterSystem === "all" && <TableHead className="w-24">시스템명</TableHead>}
              <TableHead className="w-12">사용</TableHead>
              <TableHead>체크 이름</TableHead>
              <TableHead className="w-16">환경</TableHead>
              <TableHead className="w-28">유형</TableHead>
              <TableHead>코드</TableHead>
              <TableHead>대상</TableHead>
              <TableHead className="w-16">중요도</TableHead>
              <TableHead className="w-32">수정일시</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredChecks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={(fixedSystemId || filterSystem !== "all") ? 9 : 10} className="text-center py-8 text-muted-foreground">
                  등록된 모니터링 체크가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              filteredChecks.map((check) => (
                <TableRow 
                  key={check.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleEdit(check)}
                >
                  {!fixedSystemId && filterSystem === "all" && (
                    <TableCell className="text-sm">
                      {getSystemName(check.systemId)}
                    </TableCell>
                  )}
                  <TableCell onClick={(e) => e.stopPropagation()}>
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
                  <TableCell>
                    <Badge className={`text-xs ${getSeverityBadgeClass(check.severity)}`}>
                      {check.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {check.updatedAt}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
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
    </div>

    {/* 추가/수정 모달 */}
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg">
            {editingCheck ? "모니터링 체크 수정" : "모니터링 체크 추가"}
          </DialogTitle>
        </DialogHeader>

            <div className="space-y-6 py-2">
              {/* 기본 정보 */}
              <div className="space-y-5 p-4 rounded-lg bg-muted/30 border border-border/50">
                <h3 className="text-sm font-semibold text-muted-foreground">기본 정보</h3>
                
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-sm">시스템 *</Label>
                    {fixedSystemId ? (
                      <div className="h-10 flex items-center px-3 rounded-md border bg-muted/50">
                        <span className="text-sm">{filterBySystemName}</span>
                      </div>
                    ) : (
                      <Popover open={systemSearchOpen} onOpenChange={setSystemSearchOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={systemSearchOpen}
                            className="w-full justify-between font-normal"
                          >
                            {formData.systemId
                              ? mockSystems.find((sys) => sys.id === formData.systemId)?.shortName + " - " + mockSystems.find((sys) => sys.id === formData.systemId)?.name
                              : "시스템 선택..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[350px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="시스템 검색..." />
                            <CommandList>
                              <CommandEmpty>시스템을 찾을 수 없습니다.</CommandEmpty>
                              <CommandGroup>
                                {mockSystems.map((sys) => (
                                  <CommandItem
                                    key={sys.id}
                                    value={sys.shortName + " " + sys.name}
                                    onSelect={() => {
                                      setFormData({ ...formData, systemId: sys.id, config: {} });
                                      setSystemSearchOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        formData.systemId === sys.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium">{sys.shortName}</span>
                                      <span className="text-xs text-muted-foreground">{sys.name}</span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">환경 *</Label>
                    <Select
                      value={formData.environment}
                      onValueChange={(value) => setFormData({ ...formData, environment: value })}
                    >
                      <SelectTrigger>
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

                <div className="space-y-2">
                  <Label className="text-sm">체크 이름</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="체크 항목 이름을 입력하세요"
                  />
                </div>
              </div>

              {/* 체크 설정 */}
              <div className="space-y-5 p-4 rounded-lg bg-muted/30 border border-border/50">
                <h3 className="text-sm font-semibold text-muted-foreground">체크 설정</h3>
                
                <div className="flex gap-5">
                  <div className="space-y-2 w-36 shrink-0">
                    <Label className="text-sm">체크 유형 *</Label>
                    <Select
                      value={formData.checkType}
                      onValueChange={handleTypeChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="유형 선택" />
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

                  <div className="space-y-2 flex-1">
                    <Label className="text-sm">체크 항목 *</Label>
                    <Select
                      value={formData.checkCode}
                      onValueChange={(value) => setFormData({ ...formData, checkCode: value, config: {} })}
                      disabled={!formData.checkType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={formData.checkType ? "항목 선택" : "유형을 먼저 선택"} />
                      </SelectTrigger>
                      <SelectContent className="max-w-[500px]">
                        {CHECK_CODES[formData.checkType]?.map((code) => (
                          <SelectItem key={code.code} value={code.code}>
                            <div className="flex items-center gap-3">
                              <span className="font-medium">{code.label}</span>
                              <span className="text-xs text-muted-foreground">{code.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-sm">중요도</Label>
                    <Select
                      value={formData.severity}
                      onValueChange={(value) => setFormData({ ...formData, severity: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SEVERITY_OPTIONS.map((sev) => (
                          <SelectItem key={sev.value} value={sev.value}>
                            <div className="flex items-center gap-2">
                              <div className={cn("w-2 h-2 rounded-full", sev.color)} />
                              {sev.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">타임아웃 (초)</Label>
                    <Input
                      type="number"
                      value={formData.timeout}
                      onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) || 30 })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive" className="text-sm cursor-pointer">
                    사용 여부
                  </Label>
                </div>
              </div>

              {/* 상세 설정 */}
              {formData.checkCode && (
                <div className="space-y-5 p-4 rounded-lg bg-muted/30 border border-border/50">
                  <h3 className="text-sm font-semibold text-muted-foreground">상세 설정</h3>
                  {renderConfigFields()}
                </div>
              )}

              {/* 저장 버튼 */}
              <div className="flex justify-end gap-3 pt-4 border-t">
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

        {/* JSON/MD 뷰 모달 */}
        <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
          <DialogContent className="max-w-4xl max-h-[85vh]">
            <DialogHeader className="pb-4 border-b">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg flex items-center gap-2">
                  {viewMode === "json" ? <Code className="w-5 h-5" /> : <FileCode className="w-5 h-5" />}
                  {filterSystem !== "all" ? getSystemName(filterSystem) : filterBySystemName} 모니터링 설정 ({viewMode.toUpperCase()})
                </DialogTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "json" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("json")}
                  >
                    JSON
                  </Button>
                  <Button
                    variant={viewMode === "md" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("md")}
                  >
                    MD
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="w-4 h-4 mr-1" />
                    복사
                  </Button>
                </div>
              </div>
            </DialogHeader>
            <ScrollArea className="h-[60vh] mt-4">
              <pre className="text-sm font-mono bg-muted/50 p-4 rounded-lg whitespace-pre-wrap break-words">
                {viewMode === "json" ? getMonitoringDataAsJson() : getMonitoringDataAsMd()}
              </pre>
            </ScrollArea>
          </DialogContent>
        </Dialog>
    </>
  );

  if (isEmbedded) {
    return (
      <div className="space-y-4">
        {content}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    </div>
  );
}
