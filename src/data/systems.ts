// 시스템 데이터 인터페이스 및 공유 목록

export type SystemType = "WEB" | "C/S" | "API" | "IF" | "기타";

export const systemTypes: SystemType[] = ["WEB", "C/S", "API", "IF", "기타"];

export interface SystemData {
  id: string;
  name: string;
  shortName: string;
  description: string;
  systemType: SystemType;
  url: string;
  apiEndpoint: string;
  namespace: string;
  svc: string;
  mcpServer: string;
  spec: {
    cpu: string;
    memory: string;
    storage: string;
  };
  status: "active" | "maintenance" | "inactive";
  managers: string[];
  manager: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const mockSystems: SystemData[] = [
  {
    id: "s1",
    name: "전자총무관리시스템",
    shortName: "e-총무",
    description: "전자 총무 관리 시스템",
    systemType: "WEB",
    url: "https://e-chongmu.example.com",
    apiEndpoint: "https://api.e-chongmu.example.com/v1",
    namespace: "chongmu-prod",
    svc: "chongmu-web-svc",
    mcpServer: "mcp-chongmu-01",
    spec: { cpu: "4 vCPU", memory: "16GB", storage: "500GB" },
    status: "active",
    managers: ["김철수", "이영희"],
    manager: "김철수",
    isActive: true,
    createdAt: "2023-01-15",
    updatedAt: "2024-12-01",
  },
  {
    id: "s2",
    name: "비즈니스온라인플랫폼",
    shortName: "BiOn",
    description: "비즈니스 온라인 플랫폼",
    systemType: "WEB",
    url: "https://bion.example.com",
    apiEndpoint: "https://api.bion.example.com/v2",
    namespace: "bion-prod",
    svc: "bion-main-svc",
    mcpServer: "mcp-bion-01",
    spec: { cpu: "8 vCPU", memory: "32GB", storage: "1TB" },
    status: "active",
    managers: ["박민수"],
    manager: "박민수",
    isActive: true,
    createdAt: "2023-03-20",
    updatedAt: "2024-11-28",
  },
  {
    id: "s3",
    name: "영업물류통합관리시스템",
    shortName: "SATIS",
    description: "영업/물류 통합 관리 시스템",
    systemType: "API",
    url: "https://satis.example.com",
    apiEndpoint: "https://api.satis.example.com/v1",
    namespace: "satis-prod",
    svc: "satis-api-svc",
    mcpServer: "mcp-satis-01",
    spec: { cpu: "6 vCPU", memory: "24GB", storage: "750GB" },
    status: "maintenance",
    managers: ["정다현", "최우진"],
    manager: "정다현",
    isActive: true,
    createdAt: "2022-06-10",
    updatedAt: "2024-12-05",
  },
  {
    id: "s4",
    name: "IT서비스관리시스템",
    shortName: "ITS",
    description: "IT 서비스 관리 시스템",
    systemType: "WEB",
    url: "https://its.example.com",
    apiEndpoint: "https://api.its.example.com/v1",
    namespace: "its-prod",
    svc: "its-backend-svc",
    mcpServer: "mcp-its-01",
    spec: { cpu: "4 vCPU", memory: "16GB", storage: "300GB" },
    status: "active",
    managers: ["김철수"],
    manager: "김철수",
    isActive: true,
    createdAt: "2021-09-01",
    updatedAt: "2024-12-08",
  },
  {
    id: "s5",
    name: "전사자원관리시스템",
    shortName: "ERP",
    description: "전사 자원 관리 시스템",
    systemType: "C/S",
    url: "https://erp.example.com",
    apiEndpoint: "https://api.erp.example.com/v1",
    namespace: "erp-prod",
    svc: "erp-main-svc",
    mcpServer: "mcp-erp-01",
    spec: { cpu: "12 vCPU", memory: "64GB", storage: "2TB" },
    status: "active",
    managers: ["이영희"],
    manager: "이영희",
    isActive: true,
    createdAt: "2020-05-10",
    updatedAt: "2024-12-10",
  },
  {
    id: "s6",
    name: "인사관리시스템",
    shortName: "HRM",
    description: "인사 관리 시스템",
    systemType: "WEB",
    url: "https://hr.example.com",
    apiEndpoint: "https://api.hr.example.com/v1",
    namespace: "hr-prod",
    svc: "hr-web-svc",
    mcpServer: "mcp-hr-01",
    spec: { cpu: "4 vCPU", memory: "16GB", storage: "500GB" },
    status: "active",
    managers: ["최민지"],
    manager: "최민지",
    isActive: true,
    createdAt: "2021-03-15",
    updatedAt: "2024-11-20",
  },
  {
    id: "s7",
    name: "물류연동API시스템",
    shortName: "물류API",
    description: "물류 연동 API 시스템",
    systemType: "API",
    url: "https://logistics-api.example.com",
    apiEndpoint: "https://api.logistics.example.com/v2",
    namespace: "logistics-prod",
    svc: "logistics-api-svc",
    mcpServer: "mcp-logistics-01",
    spec: { cpu: "8 vCPU", memory: "32GB", storage: "1TB" },
    status: "active",
    managers: ["박준혁"],
    manager: "박준혁",
    isActive: true,
    createdAt: "2022-08-01",
    updatedAt: "2024-12-05",
  },
  {
    id: "s8",
    name: "결제인터페이스시스템",
    shortName: "결제IF",
    description: "결제 인터페이스 시스템",
    systemType: "IF",
    url: "https://payment-if.example.com",
    apiEndpoint: "https://api.payment.example.com/v1",
    namespace: "payment-prod",
    svc: "payment-if-svc",
    mcpServer: "mcp-payment-01",
    spec: { cpu: "6 vCPU", memory: "24GB", storage: "500GB" },
    status: "active",
    managers: ["김민수"],
    manager: "김민수",
    isActive: false,
    createdAt: "2023-02-20",
    updatedAt: "2024-10-15",
  },
];

// 시스템 이름 목록만 가져오는 헬퍼 함수
export const getSystemNames = (): string[] => {
  return mockSystems.map((system) => system.name);
};
