# AI Worker - UI 설계 명세서

> DB 설계 및 Backend 설계를 위한 UI 기반 데이터 모델 및 기능 명세

---

## 1. 애플리케이션 구조

### 1.1 메인 네비게이션

| 섹션 | 설명 | 경로 |
|------|------|------|
| Worker | SKI Agent 목록 및 대시보드 | `/` (기본) |
| My Agent | 사용자 정의 Agent 관리 | `/` (탭 전환) |
| Assistant | 대화형 AI 어시스턴트 | `/` (탭 전환) |
| Admin | 관리자 페이지 | `/admin` |
| MyPage | 사용자 설정 | `/mypage` |
| Login | 로그인 | `/login` |

### 1.2 사용자 역할

| 역할 | 권한 |
|------|------|
| 운영자(제어) | Worker Agent 사용, 요청 처리, 시스템 모니터링 |
| 현업담당자 | Biz.Support Agent 사용, ITS 요청 등록 |
| 관리자 | Admin 페이지 접근, 전체 시스템 관리 |

---

## 2. 시스템 데이터 모델

### 2.1 운영 시스템 (System)

```typescript
interface System {
  id: string;
  shortName: string;           // "e-총무", "BiOn", "SATIS"
  name: string;                // "전자총무관리시스템"
  description: string;
  systemType: "WEB" | "C/S" | "API" | "IF" | "기타";
  manager: string;             // 담당자 (User 참조)
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  envDetails: Record<EnvType, EnvDetail>;
}

type EnvType = "PROD" | "DEV" | "STG" | "DR";

interface EnvDetail {
  isEnabled: boolean;
  urls: UrlInfo[];
  servers: ServerInfo[];
  databases: DBInfo[];
  cicds: CICDInfo[];
}
```

### 2.2 URL 정보

```typescript
interface UrlInfo {
  id: string;
  url: string;
  accessType: "internal" | "external";
  isPrimary: boolean;
  hostsRequired: boolean;
  hostsIp: string;
  description: string;
}
```

### 2.3 서버 정보

```typescript
interface ServerInfo {
  id: string;
  serverName: string;
  infraType: "CLOUD" | "ONPREM";
  provider: "AWS" | "AZURE" | "PRIVATE";
  hostType: "K8S" | "VM";
  description: string;
  // K8S 전용
  subscription: string;
  clusterName: string;
  namespace: string;
  k8sAuth: string;
  // VM 전용
  vmIp: string;
  vmOs: string;
  vmAuth: string;
}
```

### 2.4 DB 정보

```typescript
interface DBInfo {
  id: string;
  dbType: "Postgres" | "MSSQL" | "MySQL" | "Oracle";
  dbIp: string;
  dbPort: string;
  dbName: string;
  dbUser: string;
  dbPassword: string;
  keyVaultKey: string;
}
```

### 2.5 CI/CD 정보

```typescript
interface CICDInfo {
  id: string;
  repoType: "GitHub" | "GitLab" | "Bitbucket" | "Azure DevOps" | "기타";
  repoUrl: string;
  repoBranch: string;
  repoAuth: string;
  pipelineType: "Jenkins" | "Azure DevOps" | "GitHub Actions" | "GitLab CI" | "ArgoCD" | "기타";
  pipelineUrl: string;
  pipelineName: string;
  pipelineAuth: string;
  description: string;
}
```

---

## 3. 사용자 데이터 모델

### 3.1 사용자 (User)

```typescript
interface User {
  id: string;
  employeeId: string;          // 사번
  name: string;
  email: string;
  department: string;
  position: string;
  role: "운영자(제어)" | "현업담당자" | "관리자";
  systems: string[];           // 담당 시스템 ID 배열
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
}
```

---

## 4. Worker Agent 데이터 모델

### 4.1 Agent 유형

| ID | Agent 명 | 기능 | 주요 데이터 |
|----|----------|------|------------|
| a1 | ITS Agent | IT 서비스 요청 접수/처리 | 요청 (5가지 타입) |
| a2 | SOP Agent | 인시던트 장애 처리 | 인시던트, 장애보고서 |
| a3 | 변경관리 Agent | 개선요청 처리 | 변경요청 |
| a4 | DB Agent | 데이터 추출/조회 | 데이터요청 |
| a5 | 모니터링 Agent | 시스템 상태 모니터링 | 비정상 감지 |
| a6 | 보고서 Agent | 보고서 생성 | 보고서 |
| a7 | Biz.Support Agent | 현업 시스템 문의 | 채팅 |
| a8 | 인프라 Agent | 인프라 관리 | 인프라 설정 |

### 4.2 요청 (Request)

```typescript
interface Request {
  id: string;
  requestNo: string;           // "ITS-2024-0001" 형식
  type: RequestType;
  title: string;
  description: string;
  system: string;              // 시스템 shortName
  status: RequestStatus;
  priority: "high" | "medium" | "low";
  createdAt: string;
  updatedAt: string;
  createdBy: string;           // User ID
  assignedTo?: string;         // User ID
}

type RequestType = "I" | "C" | "D" | "A" | "S";
// I: 인시던트요청, C: 개선요청, D: 데이터요청, A: 계정/권한요청, S: 단순요청

type RequestStatus = 
  | "unreceived"      // 미접수
  | "received"        // 접수
  | "in-progress"     // 처리중
  | "completed"       // 완료
  | "rejected";       // 반려
```

### 4.3 요청 타입별 라우팅

| 요청 타입 | ITS 접수 후 라우팅 대상 |
|-----------|------------------------|
| 인시던트(I) | SOP Agent |
| 개선(C) | 변경관리 Agent |
| 데이터(D) | DB Agent |
| 계정/권한(A) | ITS 내부 처리 |
| 단순(S) | ITS 내부 처리 |

### 4.4 채팅 세션 (ChatSession)

```typescript
interface ChatSession {
  id: string;
  agentType: AgentType;
  request: Request;
  messages: ChatMessage[];
  status: SessionStatus;
  system: string;
  createdAt: string;
  updatedAt: string;
}

type AgentType = "its" | "sop" | "db" | "change-management" | "monitoring" | "report" | "biz-support" | "infra";

type SessionStatus = 
  | "pending"                  // 대기
  | "pending-approval"         // 승인 대기 (ITS)
  | "pending-process-start"    // 처리 시작 대기
  | "in-progress"              // 처리중
  | "completed";               // 완료

interface ChatMessage {
  role: "user" | "agent";
  content: string;
  timestamp?: string;
}
```

### 4.5 비정상 감지 (Detection) - 모니터링 Agent

```typescript
interface DetectionItem {
  id: string;
  detectionNo: string;         // "MON-2024-0001" 형식
  title: string;
  severity: "critical" | "warning" | "info";
  source: string;              // 감지 출처
  system: string;
  status: "detected" | "in-progress" | "resolved";
  detectedAt: string;
  resolvedAt?: string;
}
```

### 4.6 보고서 (Report) - 보고서 Agent

```typescript
interface GeneratedReport {
  id: string;
  typeId: ReportType;
  typeName: string;
  title: string;
  content?: string;
  generatedAt: string;
  size: string;
  status: "ready" | "generating";
  savedToRAG: boolean;
  linkedRequestNo?: string;    // 연관된 요청 번호
}

type ReportType = "incident" | "change-plan" | "test-scenario" | "change-result" | "aggregate";
```

---

## 5. My Agent 데이터 모델

### 5.1 Agent 마켓 템플릿

```typescript
interface AgentMarketItem {
  id: string;
  name: string;
  description: string;
  steps: string[];
  instructions: string[];      // 지침 ID 배열
  tools: string[];             // 도구 ID 배열
  knowledgeBases: string[];    // Knowledge ID 배열
  version: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### 5.2 My Agent Type

```typescript
interface MyAgentType {
  id: string;
  name: string;
  description: string;
  steps: string[];
  status: "active" | "draft" | "completed";
  systems: OperatingSystem[];
  registeredAgents: RegisteredAgent[];
  createdAt: string;
  createdBy: string;
}

interface RegisteredAgent {
  id: string;
  name: string;
  system: OperatingSystem;
  settings?: Record<string, string>;
  createdAt: string;
}

type OperatingSystem = "e-총무" | "BiOn" | "SATIS" | "ITS";
```

---

## 6. Assistant 데이터 모델

### 6.1 Assistant 채팅

```typescript
interface AssistantChat {
  id: string;
  title: string;
  messages: ChatMessage[];
  selectedInstruction?: string;   // 선택된 지침 ID
  selectedTools: string[];        // 선택된 도구 ID 배열
  selectedKnowledge: string[];    // 선택된 Knowledge ID 배열
  system?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 7. 관리자 (Admin) 데이터 모델

### 7.1 지침 (Instruction)

```typescript
interface Instruction {
  id: string;
  title: string;
  content: string;             // Markdown 형식
  category: "public" | "system" | "worker";
  system?: string;             // 시스템별 지침인 경우
  worker?: string;             // Worker 지침인 경우
  author: string;              // User ID
  version: string;
  createdAt: string;
  updatedAt: string;
}
```

### 7.2 MCP 서버/도구

```typescript
interface MCPServer {
  id: string;
  name: string;
  description: string;
  connectionType: "stdio" | "sse" | "http";
  connectionUrl: string;
  authType: string;
  connectionStatus: "connected" | "failed" | "testing" | "unknown";
  lastTestedAt?: string;
  isActive: boolean;
  createdAt: string;
}

interface MCPTool {
  id: string;
  serverId: string;
  name: string;
  description: string;
  parameters?: Record<string, any>;
  isActive: boolean;
}
```

### 7.3 Knowledge RAG

```typescript
interface KnowledgeRAG {
  id: string;
  name: string;
  description: string;
  system: string;
  documentCount: number;
  lastUpdated: string;
  usageCount: number;
  isActive: boolean;
}
```

### 7.4 Knowledge Graph

```typescript
interface KnowledgeGraph {
  id: string;
  name: string;
  description: string;
  system: string;
  nodeCount: number;
  edgeCount: number;
  lastUpdated: string;
  usageCount: number;
  isActive: boolean;
}
```

### 7.5 모니터링 설정

```typescript
interface MonitoringCheck {
  id: string;
  systemId: string;
  checkType: MonitoringCheckType;
  checkCode: MonitoringCheckCode;
  name: string;
  config: MonitoringCheckConfig;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

type MonitoringCheckType = "HTTP" | "DB" | "INTERFACE" | "BATCH" | "SYSTEM" | "LOG";

type MonitoringCheckCode = 
  | "HTTP_CUSTOM_HEALTH"
  | "DB_CONNECT"
  | "DB_CUSTOM_QUERY_ASSERT"
  | "IF_DATA_CHECK"
  | "IF_LOG_CHECK"
  | "BATCH_DATA_CHECK"
  | "BATCH_LOG_CHECK"
  | "SYS_PROCESS_RUNNING"
  | "SYS_RESOURCE_CHECK"
  | "LOG_PATTERN_CHECK"
  | "LOG_ERROR_CHECK";

interface MonitoringCheckConfig {
  url?: string;
  expectedResult?: string;
  query?: string;
  condition?: string;
  dbId?: string;
  serverId?: string;
  deploymentName?: string;      // K8S
  processName?: string;         // VM
  logPath?: string;             // VM
  cpuThreshold?: number;
  memoryThreshold?: number;
  diskThreshold?: number;
  grafanaUrl?: string;
  dashboardId?: string;
  panelId?: string;
}
```

---

## 8. 주요 워크플로우

### 8.1 ITS 요청 처리 플로우

```
[미접수] → (운영자 승인) → [접수/처리중] → (타입별 라우팅)
    ├── 인시던트(I) → SOP Agent
    ├── 개선(C) → 변경관리 Agent
    ├── 데이터(D) → DB Agent
    └── 계정/단순 → ITS 내부 처리
```

### 8.2 SOP → Report → Knowledge RAG 플로우

```
[SOP 처리 완료] → (장애보고서 작성?) 
    → [Report Agent] → (보고서 생성) 
    → (Knowledge RAG 저장?) → [저장 완료]
    → (ITS 완료 처리?) → [ITS 완료]
```

### 8.3 모니터링 → SOP 플로우

```
[모니터링 실행] → (6가지 체크 순차 실행)
    → (비정상 감지?) → [비정상 감지 등록]
    → (SOP 처리?) → [SOP Agent로 라우팅]
```

### 8.4 Biz.Support → ITS 요청 등록 플로우

```
[현업 문의 채팅] → (ITS 요청 등록?)
    → (요청 타입 선택) → (요약 생성)
    → (등록 확인) → [ITS 미접수에 등록]
```

---

## 9. UI 컴포넌트 구조

### 9.1 레이아웃

```
┌─────────────────────────────────────────────────────────┐
│ Sidebar (280px)              │ Main Content Area        │
│ ┌─────────────────────────┐  │ ┌─────────────────────┐  │
│ │ AI Worker 로고          │  │ │ Agent Dashboard     │  │
│ │ Worker/My Agent/Assist  │  │ │ (7:3 비율)          │  │
│ │ Agent List              │  │ │ ┌───────┬───────┐   │  │
│ │ - ITS Agent             │  │ │ │ Main  │ Chat  │   │  │
│ │ - SOP Agent             │  │ │ │ 7     │ Panel │   │  │
│ │ - ...                   │  │ │ │       │ 3     │   │  │
│ │                         │  │ │ └───────┴───────┘   │  │
│ │ ─────────────────────── │  │ └─────────────────────┘  │
│ │ 관리자 페이지           │  │                          │
│ │ 사용자 프로필           │  │                          │
│ └─────────────────────────┘  │                          │
└─────────────────────────────────────────────────────────┘
```

### 9.2 Agent 대시보드 공통 패턴

- **상태 섹션**: 미접수/접수/처리중/완료 개수 및 목록
- **시스템 필터**: e-총무, BiOn, SATIS 토글
- **요청 목록**: 2열 그리드, 아이콘+제목+요청번호+시스템배지+날짜
- **처리 Chat 이력**: 세션 목록
- **Chat 패널**: 우측 3 비율 차지

### 9.3 Admin 모듈 구조

| 모듈 | 기능 |
|------|------|
| 사용자 관리 | CRUD, 역할/시스템 할당 |
| 시스템 관리 | CRUD, 환경별 상세정보 |
| 권한 관리 | Agent/Tool 접근 권한 |
| 지침 관리 | 공용/시스템별/Worker 지침 |
| Agent 마켓 관리 | 공유 Agent 템플릿 |
| MCP 서버/Tool 관리 | MCP 연동 설정 |
| Knowledge RAG 관리 | RAG 데이터 관리 |
| Knowledge Graph 관리 | Graph 데이터 관리 |
| 시스템 모니터링 관리 | 모니터링 체크 설정 |

---

## 10. 테마 및 스타일

### 10.1 다크 사이버 테마

- **Primary**: Cyan/Teal 계열 (`hsl(var(--primary))`)
- **Background**: 다크 계열 (`hsl(var(--background))`)
- **Glassmorphism**: 반투명 배경 + 블러 효과
- **Animations**: pulse-glow, float, slide-up, fade-in

### 10.2 상태 색상

| 상태 | 색상 변수 |
|------|----------|
| Online/Active | `--status-online` (Green) |
| Busy/InProgress | `--status-busy` (Yellow) |
| Error/Critical | `--destructive` (Red) |

### 10.3 폰트

- **본문**: Noto Sans KR
- **코드**: JetBrains Mono

---

## 11. 다국어 지원

| 언어 | 코드 |
|------|------|
| 한국어 | `ko` |
| English | `en` |
| Tiếng Việt | `vi` |

번역 파일 위치: `src/i18n/locales/`

---

## 12. API 엔드포인트 (Backend 설계 참고)

### 12.1 인증

```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### 12.2 시스템

```
GET    /api/systems
GET    /api/systems/:id
POST   /api/systems
PUT    /api/systems/:id
DELETE /api/systems/:id
```

### 12.3 요청

```
GET    /api/requests
GET    /api/requests/:id
POST   /api/requests
PUT    /api/requests/:id
PUT    /api/requests/:id/status
```

### 12.4 채팅 세션

```
GET    /api/sessions
GET    /api/sessions/:id
POST   /api/sessions
PUT    /api/sessions/:id
POST   /api/sessions/:id/messages
```

### 12.5 Agent

```
GET    /api/agents/market
GET    /api/agents/my
POST   /api/agents/my
PUT    /api/agents/my/:id
DELETE /api/agents/my/:id
POST   /api/agents/my/:id/registered
```

### 12.6 지침

```
GET    /api/instructions
GET    /api/instructions/:id
POST   /api/instructions
PUT    /api/instructions/:id
DELETE /api/instructions/:id
```

### 12.7 모니터링

```
GET    /api/monitoring/checks
POST   /api/monitoring/checks
PUT    /api/monitoring/checks/:id
DELETE /api/monitoring/checks/:id
POST   /api/monitoring/execute/:systemId
GET    /api/monitoring/detections
```

### 12.8 Knowledge

```
GET    /api/knowledge/rag
POST   /api/knowledge/rag
GET    /api/knowledge/graph
POST   /api/knowledge/graph
```

---

## 13. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2024-12-15 | 초기 문서 작성 |

---

*이 문서는 UI 설계를 기반으로 작성되었으며, DB 및 Backend 설계 시 참고 자료로 활용됩니다.*
