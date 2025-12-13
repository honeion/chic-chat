// 시스템 데이터 인터페이스 및 공유 목록

export interface SystemData {
  id: string;
  name: string;
  description: string;
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
  createdAt: string;
  updatedAt: string;
}

export const mockSystems: SystemData[] = [
  {
    id: "s1",
    name: "e-총무",
    description: "전자 총무 관리 시스템",
    url: "https://e-chongmu.example.com",
    apiEndpoint: "https://api.e-chongmu.example.com/v1",
    namespace: "chongmu-prod",
    svc: "chongmu-web-svc",
    mcpServer: "mcp-chongmu-01",
    spec: { cpu: "4 vCPU", memory: "16GB", storage: "500GB" },
    status: "active",
    managers: ["김철수", "이영희"],
    createdAt: "2023-01-15",
    updatedAt: "2024-12-01",
  },
  {
    id: "s2",
    name: "BiOn",
    description: "비즈니스 온라인 플랫폼",
    url: "https://bion.example.com",
    apiEndpoint: "https://api.bion.example.com/v2",
    namespace: "bion-prod",
    svc: "bion-main-svc",
    mcpServer: "mcp-bion-01",
    spec: { cpu: "8 vCPU", memory: "32GB", storage: "1TB" },
    status: "active",
    managers: ["박민수"],
    createdAt: "2023-03-20",
    updatedAt: "2024-11-28",
  },
  {
    id: "s3",
    name: "SATIS",
    description: "영업/물류 통합 관리 시스템",
    url: "https://satis.example.com",
    apiEndpoint: "https://api.satis.example.com/v1",
    namespace: "satis-prod",
    svc: "satis-api-svc",
    mcpServer: "mcp-satis-01",
    spec: { cpu: "6 vCPU", memory: "24GB", storage: "750GB" },
    status: "maintenance",
    managers: ["정다현", "최우진"],
    createdAt: "2022-06-10",
    updatedAt: "2024-12-05",
  },
  {
    id: "s4",
    name: "ITS",
    description: "IT 서비스 관리 시스템",
    url: "https://its.example.com",
    apiEndpoint: "https://api.its.example.com/v1",
    namespace: "its-prod",
    svc: "its-backend-svc",
    mcpServer: "mcp-its-01",
    spec: { cpu: "4 vCPU", memory: "16GB", storage: "300GB" },
    status: "active",
    managers: ["김철수"],
    createdAt: "2021-09-01",
    updatedAt: "2024-12-08",
  },
];

// 시스템 이름 목록만 가져오는 헬퍼 함수
export const getSystemNames = (): string[] => {
  return mockSystems.map((system) => system.name);
};
