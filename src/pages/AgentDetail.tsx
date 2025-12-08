import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Bot, Settings, Info } from "lucide-react";
import { SOPAgentDashboard } from "@/components/agent/SOPAgentDashboard";
import { ITSAgentDashboard } from "@/components/agent/ITSAgentDashboard";
import { MonitoringAgentDashboard, type DetectionItem, type SystemInfo } from "@/components/agent/MonitoringAgentDashboard";
import { DBAgentDashboard } from "@/components/agent/DBAgentDashboard";
import { BizSupportAgentDashboard } from "@/components/agent/BizSupportAgentDashboard";
import { ChangeManagementAgentDashboard } from "@/components/agent/ChangeManagementAgentDashboard";
import { ReportAgentDashboard, type GeneratedReport } from "@/components/agent/ReportAgentDashboard";
import { AgentChatPanel } from "@/components/agent/AgentChatPanel";

interface ProcessingStep { id: string; step: string; status: "pending" | "running" | "completed"; detail?: string; }
interface MessageLink { label: string; agentId: string; }
interface Message { role: "user" | "agent"; content: string; processingSteps?: ProcessingStep[]; link?: MessageLink; }
interface AgentDetailProps { agentId: string; agentName: string; onNavigateToAgent?: (agentId: string) => void; }
type AgentType = "sop" | "its" | "monitoring" | "db" | "biz-support" | "change-management" | "report";

// RequestItem 타입 (ITSAgentDashboard와 동일)
type RequestType = "I" | "C" | "D" | "A" | "S";
interface RequestItem {
  id: string;
  requestNo: string;
  type: RequestType;
  title: string;
  date: string;
  status: "open" | "in-progress" | "resolved";
}

// 활성 요청 타입 (채팅 패널용)
interface ActiveRequest {
  id: string;
  requestNo: string;
  type: RequestType;
  title: string;
  date: string;
}

// 채팅 세션 타입
export interface ChatSession {
  id: string;
  request: ActiveRequest;
  messages: Message[];
  status: "pending-approval" | "pending-process-start" | "in-progress" | "completed" | "rejected" | "pending-report-confirm" | "pending-report-start" | "pending-report-review" | "pending-knowledge-save" | "pending-its-complete";
  createdAt: string;
  sourceIncidentSession?: string; // Report Agent에서 원본 인시던트 세션 ID 저장
  originalITSRequestNo?: string; // 원본 ITS 요청번호 저장
}

const requestTypeLabels: Record<RequestType, string> = {
  "I": "인시던트 요청",
  "C": "개선 요청",
  "D": "데이터 요청",
  "A": "계정/권한 요청",
  "S": "단순 요청",
};

// 초기 채팅 세션 데이터 (기존 처리중/완료 요청들)
const initialChatSessions: ChatSession[] = [
  // ITS Agent 세션들
  {
    id: "session-r2",
    request: { id: "r2", requestNo: "ITS-2024-0151", type: "C", title: "대시보드 UI 개선 요청", date: "2024-12-05" },
    messages: [
      { role: "agent", content: "[개선 요청] 대시보드 UI 개선 요청\n일자: 2024-12-05\n\n해당 요청을 분석하고 처리를 시작하겠습니다." },
      { role: "agent", content: "\"대시보드 UI 개선 요청\" 작업을 시작합니다.", processingSteps: [
        { id: "1", step: "요청 분석 중...", status: "completed" },
        { id: "2", step: "데이터 수집 중...", status: "completed" },
        { id: "3", step: "처리 실행 중...", status: "running" },
        { id: "4", step: "결과 생성 중...", status: "pending" },
      ]},
      { role: "user", content: "차트 색상을 좀 더 밝게 변경해주세요." },
      { role: "agent", content: "차트 색상을 밝은 톤으로 변경하는 작업을 진행하겠습니다. 디자인 팀에 검토 요청을 보냈습니다." },
    ],
    status: "in-progress",
    createdAt: "2024-12-05T11:00:00Z",
  },
  {
    id: "session-r3",
    request: { id: "r3", requestNo: "ITS-2024-0150", type: "D", title: "월간 매출 데이터 추출 요청", date: "2024-12-04" },
    messages: [
      { role: "agent", content: "[데이터 요청] 월간 매출 데이터 추출 요청\n일자: 2024-12-04\n\n해당 요청을 분석하고 처리를 시작하겠습니다." },
      { role: "agent", content: "\"월간 매출 데이터 추출 요청\" 작업을 시작합니다.", processingSteps: [
        { id: "1", step: "요청 분석 중...", status: "completed" },
        { id: "2", step: "데이터 수집 중...", status: "completed" },
        { id: "3", step: "처리 실행 중...", status: "running" },
        { id: "4", step: "결과 생성 중...", status: "pending" },
      ]},
      { role: "user", content: "데이터 추출 범위를 11월로 지정해주세요." },
      { role: "agent", content: "11월 매출 데이터로 범위를 지정하여 추출 작업을 진행하겠습니다." },
    ],
    status: "in-progress",
    createdAt: "2024-12-04T10:30:00Z",
  },
  {
    id: "session-r5",
    request: { id: "r5", requestNo: "ITS-2024-0148", type: "S", title: "프린터 용지 교체 요청", date: "2024-12-03" },
    messages: [
      { role: "agent", content: "[단순 요청] 프린터 용지 교체 요청\n일자: 2024-12-03\n\n해당 요청을 분석하고 처리를 시작하겠습니다." },
      { role: "agent", content: "\"프린터 용지 교체 요청\" 작업을 시작합니다.", processingSteps: [
        { id: "1", step: "요청 분석 중...", status: "completed" },
        { id: "2", step: "데이터 수집 중...", status: "completed" },
        { id: "3", step: "처리 실행 중...", status: "completed" },
        { id: "4", step: "결과 생성 중...", status: "completed" },
      ]},
      { role: "agent", content: "\"프린터 용지 교체 요청\" 작업이 완료되었습니다." },
      { role: "user", content: "감사합니다. 잘 처리되었습니다." },
      { role: "agent", content: "도움이 되어 기쁩니다. 추가 요청사항이 있으시면 언제든 말씀해주세요!" },
    ],
    status: "completed",
    createdAt: "2024-12-03T14:00:00Z",
  },
  // 모니터링 Agent 세션들 - 처리중 감지 항목과 연결
  {
    id: "session-d4",
    request: { id: "d4", requestNo: "MON-2024-0044", type: "I", title: "네트워크 대역폭 포화 상태", date: "2024-12-05" },
    messages: [
      { role: "agent", content: "🔍 **e-총무시스템 모니터링 시작**\n\n모니터링 대상 시스템: **e-총무시스템**\n실행 시각: 2024-12-05 10:30:00\n\n다음 항목들에 대한 모니터링을 실시합니다:\n• HTTP API Check\n• DB 모니터링\n• IF 모니터링\n• BATCH 모니터링\n• LOG 모니터링\n• 성능 모니터링\n\n모니터링을 시작합니다..." },
      { role: "agent", content: "모니터링 항목 점검 중...", processingSteps: [
        { id: "1", step: "HTTP API Check", status: "completed" },
        { id: "2", step: "DB 모니터링", status: "completed" },
        { id: "3", step: "IF 모니터링", status: "completed" },
        { id: "4", step: "BATCH 모니터링", status: "completed" },
        { id: "5", step: "LOG 모니터링", status: "completed" },
        { id: "6", step: "성능 모니터링", status: "completed" },
      ]},
      { role: "agent", content: "📊 **모니터링 결과 요약**\n\n✅ HTTP API Check: 정상\n✅ DB 모니터링: 정상\n⚠️ IF 모니터링: **네트워크 대역폭 포화 감지**\n✅ BATCH 모니터링: 정상\n✅ LOG 모니터링: 정상\n✅ 성능 모니터링: 정상\n\n---\n\n**발견된 이슈:**\n• 네트워크 대역폭 포화 - 임계치(80%) 초과" },
      { role: "user", content: "비정상감지 등록" },
      { role: "agent", content: "✅ 비정상 감지로 등록되었습니다.\n\n**감지 번호:** MON-2024-0044\n\n해당 비정상 상태에 대해 SOP Agent로 이동하여 처리하시겠습니까?\n아니면 운영자가 직접 처리하시겠습니까?" },
      { role: "user", content: "직접 처리" },
      { role: "agent", content: "운영자가 직접 처리하는 것으로 진행합니다.\n\n처리가 완료되면 아래 '처리 완료' 버튼을 눌러주세요." },
    ],
    status: "pending-direct-complete" as any,
    createdAt: "2024-12-05T10:30:00Z",
  },
  {
    id: "session-d5",
    request: { id: "d5", requestNo: "MON-2024-0043", type: "I", title: "SSL 인증서 만료 임박", date: "2024-12-04" },
    messages: [
      { role: "agent", content: "🔍 **구매시스템 모니터링 시작**\n\n모니터링 대상 시스템: **구매시스템**\n실행 시각: 2024-12-04 14:20:00\n\n다음 항목들에 대한 모니터링을 실시합니다:\n• HTTP API Check\n• DB 모니터링\n• IF 모니터링\n• BATCH 모니터링\n• LOG 모니터링\n• 성능 모니터링\n\n모니터링을 시작합니다..." },
      { role: "agent", content: "모니터링 항목 점검 중...", processingSteps: [
        { id: "1", step: "HTTP API Check", status: "completed" },
        { id: "2", step: "DB 모니터링", status: "completed" },
        { id: "3", step: "IF 모니터링", status: "completed" },
        { id: "4", step: "BATCH 모니터링", status: "completed" },
        { id: "5", step: "LOG 모니터링", status: "completed" },
        { id: "6", step: "성능 모니터링", status: "completed" },
      ]},
      { role: "agent", content: "📊 **모니터링 결과 요약**\n\n⚠️ HTTP API Check: **SSL 인증서 만료 7일 이내**\n✅ DB 모니터링: 정상\n✅ IF 모니터링: 정상\n✅ BATCH 모니터링: 정상\n✅ LOG 모니터링: 정상\n✅ 성능 모니터링: 정상\n\n---\n\n**발견된 이슈:**\n• SSL 인증서 2024-12-11 만료 예정" },
      { role: "user", content: "비정상감지 등록" },
      { role: "agent", content: "✅ 비정상 감지로 등록되었습니다.\n\n**감지 번호:** MON-2024-0043\n\n해당 비정상 상태에 대해 SOP Agent로 이동하여 처리하시겠습니까?\n아니면 운영자가 직접 처리하시겠습니까?" },
      { role: "user", content: "SOP 처리" },
      { role: "agent", content: "✅ SOP Agent로 요청을 전달합니다.\n\n**SOP Agent**의 접수 항목에서 해당 비정상 감지 건을 확인하실 수 있습니다.", link: { label: "SOP Agent로 이동", agentId: "a2" } },
    ],
    status: "in-progress",
    createdAt: "2024-12-04T14:20:00Z",
  },
  // 완료된 모니터링 세션
  {
    id: "session-d6",
    request: { id: "d6", requestNo: "MON-2024-0042", type: "I", title: "DB-01 백업 완료", date: "2024-12-03" },
    messages: [
      { role: "agent", content: "🔍 **영업/물류시스템 모니터링 시작**\n\n모니터링 대상 시스템: **영업/물류시스템**\n실행 시각: 2024-12-03 09:00:00" },
      { role: "agent", content: "모니터링 항목 점검 중...", processingSteps: [
        { id: "1", step: "HTTP API Check", status: "completed" },
        { id: "2", step: "DB 모니터링", status: "completed" },
        { id: "3", step: "IF 모니터링", status: "completed" },
        { id: "4", step: "BATCH 모니터링", status: "completed" },
        { id: "5", step: "LOG 모니터링", status: "completed" },
        { id: "6", step: "성능 모니터링", status: "completed" },
      ]},
      { role: "agent", content: "📊 **모니터링 결과 요약**\n\n✅ 모든 모니터링 항목이 정상입니다.\nℹ️ DB-01 야간 백업이 정상 완료되었습니다." },
      { role: "user", content: "정상완료" },
      { role: "agent", content: "✅ 정상 완료 처리되었습니다.\n\n모니터링 결과가 정상으로 기록되었습니다." },
    ],
    status: "completed",
    createdAt: "2024-12-03T09:00:00Z",
  },
  {
    id: "session-d7",
    request: { id: "d7", requestNo: "MON-2024-0041", type: "I", title: "WEB-01 응답 지연 해결", date: "2024-12-02" },
    messages: [
      { role: "agent", content: "📋 **비정상 감지 상세**\n\n**심각도:** 경고\n**감지 번호:** MON-2024-0041\n**제목:** WEB-01 응답 지연\n**출처:** WEB-01\n**감지 일시:** 2024-12-02" },
      { role: "user", content: "직접 처리" },
      { role: "agent", content: "운영자가 직접 처리하는 것으로 진행합니다.\n\n처리가 완료되면 아래 '처리 완료' 버튼을 눌러주세요." },
      { role: "user", content: "처리 완료" },
      { role: "agent", content: "✅ **WEB-01 응답 지연** 건이 완료 처리되었습니다.\n\n비정상 감지 현황의 완료 목록에서 확인하실 수 있습니다." },
    ],
    status: "completed",
    createdAt: "2024-12-02T11:30:00Z",
  },
  // Biz.Support Agent 세션들
  {
    id: "session-biz1",
    request: { id: "biz1", requestNo: "BIZ-2024-0023", type: "S" as RequestType, title: "e-총무 시스템 접속 오류 문의", date: "2024-12-05" },
    messages: [
      { role: "agent", content: "안녕하세요! Biz.Support Agent입니다. e-총무 시스템 접속 오류에 대해 문의해 주셨네요.\n\n어떤 오류 메시지가 표시되나요?" },
      { role: "user", content: "로그인 후 '세션이 만료되었습니다' 메시지가 계속 나타납니다." },
      { role: "agent", content: "확인 감사합니다. 해당 증상은 브라우저 캐시 문제로 발생할 수 있습니다.\n\n다음 방법을 시도해 주세요:\n1. 브라우저 캐시 및 쿠키 삭제\n2. 시크릿 모드에서 접속 시도\n3. 다른 브라우저로 접속 시도\n\n위 방법으로도 해결되지 않으면 말씀해 주세요." },
      { role: "user", content: "캐시 삭제 후 정상 접속됩니다. 감사합니다!" },
      { role: "agent", content: "다행입니다! 추가 문의사항이 있으시면 언제든 말씀해 주세요." },
    ],
    status: "completed",
    createdAt: "2024-12-05T14:30:00Z",
  },
  {
    id: "session-biz2",
    request: { id: "biz2", requestNo: "BIZ-2024-0024", type: "S" as RequestType, title: "구매시스템 결재 프로세스 문의", date: "2024-12-05" },
    messages: [
      { role: "agent", content: "안녕하세요! Biz.Support Agent입니다. 구매시스템 결재 프로세스에 대해 문의해 주셨네요.\n\n어떤 부분이 궁금하신가요?" },
      { role: "user", content: "결재라인 변경 방법을 알고 싶습니다." },
      { role: "agent", content: "결재라인 변경은 다음 경로에서 가능합니다:\n\n**구매시스템 > 설정 > 결재관리 > 결재라인 설정**\n\n해당 메뉴에서 기존 결재라인을 수정하거나 새로운 결재라인을 추가할 수 있습니다.\n\n단, 결재라인 변경 권한은 팀장 이상에게만 부여되어 있습니다." },
    ],
    status: "in-progress",
    createdAt: "2024-12-05T11:20:00Z",
  },
  {
    id: "session-biz3",
    request: { id: "biz3", requestNo: "BIZ-2024-0022", type: "S" as RequestType, title: "영업시스템 데이터 조회 권한 요청", date: "2024-12-04" },
    messages: [
      { role: "agent", content: "안녕하세요! Biz.Support Agent입니다. 영업시스템 데이터 조회 권한 요청이시군요.\n\n어떤 데이터에 대한 조회 권한이 필요하신가요?" },
      { role: "user", content: "월별 매출 현황 리포트 조회 권한이 필요합니다." },
      { role: "agent", content: "매출 현황 리포트 조회 권한 신청을 위해 다음 정보가 필요합니다:\n\n• 사번\n• 부서\n• 신청 사유\n• 필요 기간\n\n정보를 알려주시면 권한 신청을 진행해 드리겠습니다." },
    ],
    status: "in-progress",
    createdAt: "2024-12-04T16:45:00Z",
  },
  {
    id: "session-biz4",
    request: { id: "biz4", requestNo: "BIZ-2024-0021", type: "S" as RequestType, title: "물류시스템 재고 현황 조회 방법 안내", date: "2024-12-04" },
    messages: [
      { role: "agent", content: "안녕하세요! Biz.Support Agent입니다. 물류시스템 재고 현황 조회 방법을 안내해 드리겠습니다.\n\n**물류시스템 > 재고관리 > 재고현황조회**\n\n해당 메뉴에서 창고별, 품목별 재고 현황을 확인하실 수 있습니다." },
      { role: "user", content: "감사합니다. 잘 확인했습니다." },
      { role: "agent", content: "도움이 되었다니 다행입니다. 추가 문의사항이 있으시면 언제든 말씀해 주세요!" },
    ],
    status: "completed",
    createdAt: "2024-12-04T09:15:00Z",
  },
  {
    id: "session-biz5",
    request: { id: "biz5", requestNo: "BIZ-2024-0020", type: "S" as RequestType, title: "SAP 연동 오류 해결 지원", date: "2024-12-03" },
    messages: [
      { role: "agent", content: "안녕하세요! Biz.Support Agent입니다. SAP 연동 오류에 대해 지원해 드리겠습니다.\n\n어떤 오류가 발생하고 있나요?" },
      { role: "user", content: "SAP에서 데이터 전송 시 'Connection timeout' 오류가 발생합니다." },
      { role: "agent", content: "Connection timeout 오류는 네트워크 연결 문제일 가능성이 높습니다.\n\n해당 건은 ITS팀으로 에스컬레이션하여 네트워크 점검을 요청하겠습니다.\n\n처리 완료 시 별도 안내드리겠습니다." },
      { role: "user", content: "확인 감사합니다." },
      { role: "agent", content: "ITS팀 점검 결과, 방화벽 정책 변경으로 인한 일시적 오류였으며 현재 정상화되었습니다.\n\n다시 시도해 보시기 바랍니다." },
    ],
    status: "completed",
    createdAt: "2024-12-03T15:40:00Z",
  },
];

const getAgentType = (agentName: string): AgentType => {
  const name = agentName.toLowerCase();
  if (name.includes("sop")) return "sop";
  if (name.includes("its")) return "its";
  if (name.includes("모니터링") || name.includes("monitoring") || name.includes("giám sát")) return "monitoring";
  if (name.includes("db") || name.includes("database")) return "db";
  if (name.includes("biz") || name.includes("support") || name.includes("비즈")) return "biz-support";
  if (name.includes("변경") || name.includes("change") || name.includes("quản lý thay đổi")) return "change-management";
  if (name.includes("보고서") || name.includes("report") || name.includes("báo cáo")) return "report";
  return "sop";
};

// 라우팅된 요청 타입
interface RoutedRequest {
  id: string;
  requestNo: string;
  type: RequestType;
  title: string;
  date: string;
  sourceAgent: string;
}

interface AgentDetailExtendedProps extends AgentDetailProps {
  onRouteToAgent?: (request: ActiveRequest, targetAgentType: AgentType) => void;
}

export function AgentDetail({ agentId, agentName, onNavigateToAgent }: AgentDetailProps) {
  const { t } = useTranslation();
  const agentType = getAgentType(agentName);
  
  // 각 Agent별 라우팅된 요청 목록
  const [routedRequestsToSOP, setRoutedRequestsToSOP] = useState<RoutedRequest[]>([]);
  const [routedRequestsToChangeManagement, setRoutedRequestsToChangeManagement] = useState<RoutedRequest[]>([]);
  const [routedRequestsToDB, setRoutedRequestsToDB] = useState<RoutedRequest[]>([]);
  
  // 모니터링 Agent 감지 목록
  const [monitoringDetections, setMonitoringDetections] = useState<DetectionItem[]>([
    { id: "d1", detectionNo: "MON-2024-0045", severity: "critical", title: "API-01 CPU 사용률 임계치 초과", source: "API-01", date: "2024-12-05", status: "detected" },
    { id: "d2", detectionNo: "MON-2024-0046", severity: "warning", title: "WEB-02 메모리 사용률 높음", source: "WEB-02", date: "2024-12-05", status: "detected" },
    { id: "d3", detectionNo: "MON-2024-0047", severity: "critical", title: "DB-01 디스크 I/O 지연", source: "DB-01", date: "2024-12-06", status: "detected" },
    { id: "d4", detectionNo: "MON-2024-0044", severity: "warning", title: "네트워크 대역폭 포화 상태", source: "NETWORK", date: "2024-12-05", status: "in-progress" },
    { id: "d5", detectionNo: "MON-2024-0043", severity: "critical", title: "SSL 인증서 만료 임박", source: "WEB-01", date: "2024-12-04", status: "in-progress" },
    { id: "d6", detectionNo: "MON-2024-0042", severity: "info", title: "DB-01 백업 완료", source: "DB-01", date: "2024-12-03", status: "resolved" },
    { id: "d7", detectionNo: "MON-2024-0041", severity: "warning", title: "WEB-01 응답 지연 해결", source: "WEB-01", date: "2024-12-02", status: "resolved" },
  ]);

  // 생성된 보고서 목록
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);

  // Agent로 요청 라우팅
  const handleRouteToAgent = (request: ActiveRequest, targetAgentType: AgentType) => {
    const routedRequest: RoutedRequest = {
      ...request,
      sourceAgent: "ITS Agent"
    };
    
    switch (targetAgentType) {
      case "sop":
        setRoutedRequestsToSOP(prev => [routedRequest, ...prev]);
        break;
      case "change-management":
        setRoutedRequestsToChangeManagement(prev => [routedRequest, ...prev]);
        break;
      case "db":
        setRoutedRequestsToDB(prev => [routedRequest, ...prev]);
        break;
    }
  };

  const getQuickActions = () => {
    switch (agentType) {
      case "sop": return [{ label: t("agentDetail.quickActions.status"), action: "status" }, { label: t("agentDetail.quickActions.logs"), action: "logs" }, { label: t("agentDetail.quickActions.report"), action: "report" }];
      case "its": return [{ label: t("agentDetail.quickActions.tickets"), action: "tickets" }, { label: t("agentDetail.quickActions.requests"), action: "requests" }, { label: t("agentDetail.quickActions.stats"), action: "stats" }];
      case "monitoring": return [{ label: t("agentDetail.quickActions.overview"), action: "overview" }, { label: t("agentDetail.quickActions.alerts"), action: "alerts" }, { label: t("agentDetail.quickActions.resources"), action: "resources" }];
      case "db": return [{ label: t("agentDetail.quickActions.dbStatus"), action: "db-status" }, { label: t("agentDetail.quickActions.query"), action: "query" }, { label: t("agentDetail.quickActions.backup"), action: "backup" }];
      case "biz-support": return [{ label: t("agentDetail.quickActions.tasks"), action: "tasks" }, { label: t("agentDetail.quickActions.report"), action: "report" }, { label: t("agentDetail.quickActions.kpi"), action: "kpi" }];
      case "change-management": return [{ label: t("agentDetail.quickActions.request"), action: "request" }, { label: t("agentDetail.quickActions.schedule"), action: "schedule" }, { label: t("agentDetail.quickActions.approvals"), action: "approvals" }];
      case "report": return [{ label: t("agentDetail.quickActions.list"), action: "list" }, { label: t("agentDetail.quickActions.create"), action: "create" }, { label: t("agentDetail.quickActions.schedule"), action: "schedule" }];
      default: return [];
    }
  };

  const quickActions = getQuickActions();
  
  // 채팅 세션 관리 - 초기 데이터 포함
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(initialChatSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  
  // 현재 활성 세션의 메시지
  const activeSession = chatSessions.find(s => s.id === activeSessionId);
  const currentMessages = activeSession?.messages || [{ role: "agent" as const, content: t("agentDetail.hello", { agentName }) }];
  const activeRequest = activeSession?.request || null;

  // 메시지 업데이트 함수
  const updateSessionMessages = (sessionId: string, updater: (messages: Message[]) => Message[]) => {
    setChatSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, messages: updater(session.messages) }
        : session
    ));
  };

  const simulateProcessing = (taskName: string, sessionId: string) => {
    const steps: ProcessingStep[] = [
      { id: "1", step: t("agentDetail.processing.analyzing"), status: "pending" },
      { id: "2", step: t("agentDetail.processing.collecting"), status: "pending" },
      { id: "3", step: t("agentDetail.processing.executing"), status: "pending" },
      { id: "4", step: t("agentDetail.processing.generating"), status: "pending" },
    ];
    
    updateSessionMessages(sessionId, prev => [...prev, { role: "agent", content: t("agentDetail.taskStart", { task: taskName }), processingSteps: steps }]);
    
    steps.forEach((_, index) => {
      setTimeout(() => {
        updateSessionMessages(sessionId, prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg.processingSteps) {
            lastMsg.processingSteps = lastMsg.processingSteps.map((step, i) => ({ ...step, status: i < index ? "completed" : i === index ? "running" : "pending" }));
          }
          return [...updated];
        });
      }, (index + 1) * 800);
    });
    
    setTimeout(() => {
      updateSessionMessages(sessionId, prev => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg.processingSteps) { 
          lastMsg.processingSteps = lastMsg.processingSteps.map(step => ({ ...step, status: "completed" as const })); 
        }
        return [...updated];
      });
      setTimeout(() => { 
        updateSessionMessages(sessionId, prev => [...prev, { role: "agent", content: t("agentDetail.taskComplete", { task: taskName }) }]); 
        
        // SOP Agent의 인시던트 처리 완료 시 장애보고서 작성 여부 확인
        // SOP Agent는 인시던트 유형(I)이면 보고서 작성 여부를 묻는다 (SOP- 또는 ITS-로 시작하는 요청번호 포함)
        const session = chatSessions.find(s => s.id === sessionId);
        const isSOPIncident = session && session.request.type === "I" && 
          (session.request.requestNo.startsWith("SOP-") || session.request.requestNo.startsWith("ITS-"));
        if (isSOPIncident) {
          setTimeout(() => {
            updateSessionMessages(sessionId, prev => [...prev, { 
              role: "agent", 
              content: "✅ 인시던트 처리가 완료되었습니다.\n\n📝 해당 인시던트에 대한 **장애보고서**를 작성하시겠습니까?" 
            }]);
            setChatSessions(prev => prev.map(s => 
              s.id === sessionId ? { ...s, status: "pending-report-confirm" as const } : s
            ));
          }, 800);
        }
      }, 500);
    }, steps.length * 800 + 500);
  };

  const handleSendMessage = (message: string) => { 
    if (activeSessionId) {
      // Biz Agent의 "새 문의" 세션인 경우 제목 업데이트
      const session = chatSessions.find(s => s.id === activeSessionId);
      if (session && session.request.title === "새 문의" && session.request.requestNo.startsWith("BIZ-")) {
        setChatSessions(prev => prev.map(s => 
          s.id === activeSessionId 
            ? { ...s, request: { ...s.request, title: message.slice(0, 30) + (message.length > 30 ? "..." : "") } }
            : s
        ));
      }
      
      updateSessionMessages(activeSessionId, prev => [...prev, { role: "user", content: message }]); 
      
      // Biz Agent는 즉각적인 응답 방식 (processing step 없이)
      if (session?.request.requestNo.startsWith("BIZ-")) {
        setTimeout(() => {
          updateSessionMessages(activeSessionId, prev => [...prev, { 
            role: "agent", 
            content: "네, 말씀하신 내용 확인했습니다. 해당 건에 대해 확인 후 안내드리겠습니다.\n\n추가 정보가 필요하시면 말씀해 주세요." 
          }]);
        }, 800);
      } else {
        simulateProcessing(message, activeSessionId); 
      }
    }
  };
  
  const handleQuickAction = (action: string) => {
    if (activeSessionId) {
      const label = t(`agentDetail.actionLabels.${action}`) || action;
      updateSessionMessages(activeSessionId, prev => [...prev, { role: "user", content: label }]); 
      simulateProcessing(label, activeSessionId);
    }
  };
  
  const handleApprove = (_: string, incident: { title: string }) => { 
    if (activeSessionId) {
      simulateProcessing(`${incident.title} ${t("common.confirm")}`, activeSessionId); 
    }
  };
  
  const handleReject = () => { 
    if (activeSessionId) {
      updateSessionMessages(activeSessionId, prev => [...prev, { role: "agent", content: t("agentDetail.rejected") }]); 
    }
  };
  
  const handleITSRequest = (requestType: string) => {
    const label = t(`agentDetail.requestTypes.${requestType}`) || requestType;
    // 새로운 세션 생성
    const newSessionId = `session-${Date.now()}`;
    const requestNo = `ITS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    
    // 요청 타입에 따른 RequestType 매핑
    const getRequestType = (type: string): RequestType => {
      switch (type) {
        case "account": return "A";
        case "data": return "D";
        case "firewall": return "C"; // 방화벽 신청 → 개선요청
        case "workload": return "I"; // 업무량 등록 → 인시던트
        case "dbsafer": return "D"; // DB Safer → 데이터요청
        case "cloud": return "C"; // Cloud 신청 → 개선요청
        default: return "S";
      }
    };
    
    const newRequest: ActiveRequest = {
      id: `req-${Date.now()}`,
      requestNo,
      type: getRequestType(requestType),
      title: label,
      date: new Date().toISOString().split('T')[0],
    };
    
    const typeLabel = requestTypeLabels[newRequest.type];
    const chatIntro = `[${typeLabel}] ${newRequest.title}\n일자: ${newRequest.date}\n\n해당 요청을 분석하고 처리를 시작하겠습니다.`;
    
    const newSession: ChatSession = {
      id: newSessionId,
      request: newRequest,
      messages: [{ role: "agent", content: chatIntro }],
      status: "in-progress",
      createdAt: new Date().toISOString(),
    };
    
    setChatSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
    
    setTimeout(() => simulateProcessing(label, newSessionId), 100);
  };

  // ITS 요청 채팅 시작 핸들러 (미접수 → 접수 확인 흐름)
  const handleStartChat = (request: RequestItem) => {
    // 기존 세션 확인
    const existingSession = chatSessions.find(s => s.request.id === request.id);
    if (existingSession) {
      setActiveSessionId(existingSession.id);
      return;
    }
    
    // 새로운 세션 생성 - 요청 상세 내용과 접수/반려 안내
    const newSessionId = `session-${Date.now()}`;
    const typeLabel = requestTypeLabels[request.type];
    
    // 요청 상세 내용을 보여주는 메시지
    const requestDetailMessage = `📋 **요청 상세 정보**

**요청 유형:** ${typeLabel}
**요청 번호:** ${request.requestNo}
**요청 제목:** ${request.title}
**요청 일자:** ${request.date}

---

**요청 내용:**
${getRequestDetailContent(request)}

---

위 요청 내용을 확인하시고, 접수 여부를 결정해 주세요.`;
    
    const newSession: ChatSession = {
      id: newSessionId,
      request: { id: request.id, requestNo: request.requestNo, type: request.type, title: request.title, date: request.date },
      messages: [{ role: "agent", content: requestDetailMessage }],
      status: "pending-approval", // 승인 대기 상태
      createdAt: new Date().toISOString(),
    };
    
    setChatSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
  };
  
  // 요청 타입별 상세 내용 (mock)
  const getRequestDetailContent = (request: RequestItem): string => {
    switch (request.type) {
      case "I":
        return `• 증상: 서버 응답 시간이 평균 5초 이상 지연되고 있습니다.
• 영향 범위: 전체 사용자
• 발생 시점: 2024-12-05 09:30 경
• 긴급도: 높음`;
      case "C":
        return `• 개선 요청 사항: 대시보드 UI 레이아웃 변경
• 요청 사유: 사용성 개선을 위한 디자인 변경 필요
• 희망 완료일: 2024-12-15`;
      case "D":
        return `• 요청 데이터: 월간 매출 현황
• 추출 기간: 2024년 11월
• 데이터 형식: Excel
• 용도: 월간 보고서 작성`;
      case "A":
        return `• 요청 유형: 신규 계정 발급
• 대상자: 홍길동 (신규 입사자)
• 필요 권한: 일반 사용자 권한
• 부서: 개발팀`;
      case "S":
        return `• 요청 내용: 프린터 용지 교체
• 위치: 3층 개발팀 프린터
• 비고: A4 용지 부족`;
      default:
        return "요청 상세 내용이 없습니다.";
    }
  };
  
  // 요청 타입에 따른 라우팅 Agent 결정
  const getTargetAgentInfo = (requestType: RequestType): { agentName: string; agentType: AgentType; agentId: string } | null => {
    switch (requestType) {
      case "I": return { agentName: "SOP Agent", agentType: "sop", agentId: "a2" };
      case "C": return { agentName: "변경관리 Agent", agentType: "change-management", agentId: "a3" };
      case "D": return { agentName: "DB Agent", agentType: "db", agentId: "a4" };
      default: return null;
    }
  };

  // 접수 승인 핸들러
  const handleApproveRequest = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (!session) return;

    const targetAgent = getTargetAgentInfo(session.request.type);
    
    setChatSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return { ...s, status: "in-progress" as const };
      }
      return s;
    }));
    
    if (targetAgent) {
      // 다른 Agent로 라우팅되는 경우 - 링크 정보 포함
      updateSessionMessages(sessionId, prev => [...prev, 
        { role: "user", content: "접수" },
        { 
          role: "agent", 
          content: `✅ 요청이 접수되었습니다.\n\n📌 **${targetAgent.agentName}**로 요청을 전달합니다.\n해당 Agent의 접수 항목에서 처리 현황을 확인하실 수 있습니다.`,
          link: {
            label: `${targetAgent.agentName}로 이동`,
            agentId: targetAgent.agentId
          }
        }
      ]);
      
      // 해당 Agent의 접수 목록에 추가
      handleRouteToAgent(session.request, targetAgent.agentType);
    } else {
      // 계정/권한, 단순 요청 등 ITS에서 직접 처리
      updateSessionMessages(sessionId, prev => [...prev, 
        { role: "user", content: "접수" },
        { role: "agent", content: "✅ 요청이 접수되었습니다. 처리를 시작합니다." }
      ]);
      setTimeout(() => simulateProcessing(session.request.title, sessionId), 500);
    }
  };
  
  // 반려 핸들러
  const handleRejectRequest = (sessionId: string) => {
    setChatSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        return { ...session, status: "rejected" as const };
      }
      return session;
    }));
    
    updateSessionMessages(sessionId, prev => [...prev, 
      { role: "user", content: "반려" },
      { role: "agent", content: "❌ 요청이 반려되었습니다. 반려 사유가 필요하시면 입력해 주세요." }
    ]);
  };

  const handleCloseRequest = () => {
    setActiveSessionId(null);
  };

  // 이력에서 세션 선택
  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
  };

  // DB Agent 채팅 시작 핸들러 - 요청 요약 및 처리 확인 흐름
  const handleDBStartChat = (task: { id: string; title: string; description?: string; requestNo?: string; type?: RequestType; timestamp: string; priority?: string }) => {
    // 기존 세션 확인 - 기존 세션이 있으면 상태를 pending-process-start로 리셋하고 활성화
    const existingSession = chatSessions.find(s => s.request.id === task.id);
    if (existingSession) {
      if (existingSession.status !== "pending-process-start") {
        setChatSessions(prev => prev.map(s => 
          s.id === existingSession.id 
            ? { ...s, status: "pending-process-start" as const }
            : s
        ));
      }
      setActiveSessionId(existingSession.id);
      return;
    }
    
    // 새로운 세션 생성
    const newSessionId = `session-${Date.now()}`;
    const typeLabel = task.type ? requestTypeLabels[task.type] : "데이터 요청";
    
    // 요청 내용 요약 메시지
    const requestSummaryMessage = `📋 **DB 요청 요약**

**유형:** ${typeLabel}
**요청 번호:** ${task.requestNo || `DB-${Date.now()}`}
**제목:** ${task.title}
**일시:** ${task.timestamp}
**우선순위:** ${task.priority === "high" ? "긴급" : task.priority === "medium" ? "보통" : "낮음"}

---

**요청 내용:**
${task.description || "해당 DB 작업에 대한 처리가 필요합니다."}

---

위 요청 내용을 확인하시고, 처리 여부를 결정해 주세요.`;
    
    const newSession: ChatSession = {
      id: newSessionId,
      request: { 
        id: task.id, 
        requestNo: task.requestNo || `DB-${Date.now()}`, 
        type: task.type || "D", 
        title: task.title, 
        date: task.timestamp 
      },
      messages: [{ role: "agent", content: requestSummaryMessage }],
      status: "pending-process-start", // 처리 시작 대기 상태
      createdAt: new Date().toISOString(),
    };
    
    setChatSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
  };

  // 변경관리 Agent 채팅 시작 핸들러 - 요청 요약 및 처리 확인 흐름
  const handleChangeManagementStartChat = (request: { id: string; title: string; description?: string; requestNo?: string; requestType?: RequestType; scheduledDate: string; priority?: string }) => {
    // 기존 세션 확인 - 기존 세션이 있으면 상태를 pending-process-start로 리셋하고 활성화
    const existingSession = chatSessions.find(s => s.request.id === request.id);
    if (existingSession) {
      if (existingSession.status !== "pending-process-start") {
        setChatSessions(prev => prev.map(s => 
          s.id === existingSession.id 
            ? { ...s, status: "pending-process-start" as const }
            : s
        ));
      }
      setActiveSessionId(existingSession.id);
      return;
    }
    
    // 새로운 세션 생성
    const newSessionId = `session-${Date.now()}`;
    const typeLabel = request.requestType ? requestTypeLabels[request.requestType] : "개선 요청";
    
    // 요청 내용 요약 메시지
    const requestSummaryMessage = `📋 **변경 요청 요약**

**유형:** ${typeLabel}
**요청 번호:** ${request.requestNo || `CM-${Date.now()}`}
**제목:** ${request.title}
**예정일:** ${request.scheduledDate}
**우선순위:** ${request.priority === "high" ? "긴급" : request.priority === "medium" ? "보통" : "낮음"}

---

**요청 내용:**
${request.description || "해당 변경 작업에 대한 처리가 필요합니다."}

---

위 요청 내용을 확인하시고, 처리 여부를 결정해 주세요.`;
    
    const newSession: ChatSession = {
      id: newSessionId,
      request: { 
        id: request.id, 
        requestNo: request.requestNo || `CM-${Date.now()}`, 
        type: request.requestType || "C", 
        title: request.title, 
        date: request.scheduledDate 
      },
      messages: [{ role: "agent", content: requestSummaryMessage }],
      status: "pending-process-start", // 처리 시작 대기 상태
      createdAt: new Date().toISOString(),
    };
    
    setChatSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
  };

  // SOP Agent 채팅 시작 핸들러 - 요청 요약 및 처리 확인 흐름
  const handleSOPStartChat = (incident: { id: string; title: string; description?: string; requestNo?: string; type?: RequestType; timestamp: string; priority?: string }) => {
    console.log("handleSOPStartChat called with incident:", incident);
    
    // 기존 세션 확인 - 기존 세션이 있으면 상태를 pending-process-start로 리셋하고 활성화
    const existingSession = chatSessions.find(s => s.request.id === incident.id);
    if (existingSession) {
      console.log("Existing session found:", existingSession.id);
      // 기존 세션의 상태가 pending-process-start가 아니면 리셋
      if (existingSession.status !== "pending-process-start") {
        setChatSessions(prev => prev.map(s => 
          s.id === existingSession.id 
            ? { ...s, status: "pending-process-start" as const }
            : s
        ));
      }
      setActiveSessionId(existingSession.id);
      return;
    }
    
    console.log("Creating new session for incident:", incident.id);
    
    // 새로운 세션 생성
    const newSessionId = `session-${Date.now()}`;
    const typeLabel = incident.type ? requestTypeLabels[incident.type] : "인시던트";
    
    // 요청 내용 요약 메시지
    const requestSummaryMessage = `📋 **인시던트 요청 요약**

**유형:** ${typeLabel}
**요청 번호:** ${incident.requestNo || `SOP-${Date.now()}`}
**제목:** ${incident.title}
**일시:** ${incident.timestamp}
**우선순위:** ${incident.priority === "high" ? "긴급" : incident.priority === "medium" ? "보통" : "낮음"}

---

**요청 내용:**
${incident.description || "해당 인시던트에 대한 처리가 필요합니다."}

---

위 인시던트 내용을 확인하시고, 처리 여부를 결정해 주세요.`;
    
    const newSession: ChatSession = {
      id: newSessionId,
      request: { 
        id: incident.id, 
        requestNo: incident.requestNo || `SOP-${Date.now()}`, 
        type: incident.type || "I", 
        title: incident.title, 
        date: incident.timestamp 
      },
      messages: [{ role: "agent", content: requestSummaryMessage }],
      status: "pending-process-start", // 처리 시작 대기 상태
      createdAt: new Date().toISOString(),
    };
    
    setChatSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
  };

  // 모니터링 Agent 채팅 시작 핸들러 - SOP Agent 이동 여부 확인
  const handleMonitoringStartChat = (detection: DetectionItem) => {
    const existingSession = chatSessions.find(s => s.request.id === detection.id);
    if (existingSession) {
      setActiveSessionId(existingSession.id);
      return;
    }
    
    const newSessionId = `session-${Date.now()}`;
    const severityLabel = detection.severity === "critical" ? "심각" : detection.severity === "warning" ? "경고" : "정보";
    
    const requestSummaryMessage = `📋 **비정상 감지 상세**

**심각도:** ${severityLabel}
**감지 번호:** ${detection.detectionNo}
**제목:** ${detection.title}
**출처:** ${detection.source}
**감지 일시:** ${detection.date}

---

해당 비정상 상태에 대해 SOP Agent로 이동하여 처리하시겠습니까?
아니면 운영자가 직접 처리하시겠습니까?`;
    
    const newSession: ChatSession = {
      id: newSessionId,
      request: { 
        id: detection.id, 
        requestNo: detection.detectionNo, 
        type: "I", 
        title: detection.title, 
        date: detection.date 
      },
      messages: [{ role: "agent", content: requestSummaryMessage }],
      status: "pending-detection-action" as any, // SOP 이동 또는 직접 처리 대기 상태
      createdAt: new Date().toISOString(),
    };
    
    setChatSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
  };

  // 모니터링 감지 → SOP Agent로 이동 핸들러
  const handleRouteToSOP = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (!session) return;
    
    // 세션 상태를 in-progress로 변경
    setChatSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, status: "in-progress" as const } : s
    ));
    
    // 메시지 추가 - SOP Agent로 라우팅
    updateSessionMessages(sessionId, prev => [...prev, 
      { role: "user", content: "SOP 처리" },
      { 
        role: "agent", 
        content: `✅ SOP Agent로 요청을 전달합니다.\n\n**SOP Agent**의 접수 항목에서 해당 비정상 감지 건을 확인하실 수 있습니다.`,
        link: {
          label: "SOP Agent로 이동",
          agentId: "a2"
        }
      }
    ]);
    
    // 감지 항목을 SOP Agent로 라우팅
    const routedRequest: RoutedRequest = {
      id: session.request.id,
      requestNo: session.request.requestNo,
      type: "I",
      title: session.request.title,
      date: session.request.date,
      sourceAgent: "모니터링 Agent"
    };
    setRoutedRequestsToSOP(prev => [routedRequest, ...prev]);
    
    // 감지 항목 상태를 in-progress로 변경
    setMonitoringDetections(prev => prev.map(d => 
      d.id === session.request.id ? { ...d, status: "in-progress" as const } : d
    ));
  };

  // 모니터링 감지 → 운영자 직접 처리 핸들러
  const handleDirectProcess = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (!session) return;
    
    // 세션 상태를 pending-direct-complete로 변경
    setChatSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, status: "pending-direct-complete" as any } : s
    ));
    
    // 감지 항목 상태를 in-progress로 변경
    setMonitoringDetections(prev => prev.map(d => 
      d.id === session.request.id ? { ...d, status: "in-progress" as const } : d
    ));
    
    // 메시지 추가
    updateSessionMessages(sessionId, prev => [...prev, 
      { role: "user", content: "직접 처리" },
      { role: "agent", content: "운영자가 직접 처리하는 것으로 진행합니다.\n\n처리가 완료되면 아래 '처리 완료' 버튼을 눌러주세요." }
    ]);
  };

  // 모니터링 감지 → 직접 처리 완료 핸들러
  const handleDirectProcessComplete = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (!session) return;
    
    // 세션 상태를 completed로 변경
    setChatSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, status: "completed" as const } : s
    ));
    
    // 감지 항목 상태를 resolved로 변경
    setMonitoringDetections(prev => prev.map(d => 
      d.id === session.request.id ? { ...d, status: "resolved" as const } : d
    ));
    
    // 메시지 추가
    updateSessionMessages(sessionId, prev => [...prev, 
      { role: "user", content: "처리 완료" },
      { role: "agent", content: `✅ **${session.request.title}** 건이 완료 처리되었습니다.\n\n비정상 감지 현황의 완료 목록에서 확인하실 수 있습니다.` }
    ]);
  };

  // 모니터링 실행 핸들러
  const handleStartMonitoring = (system: SystemInfo) => {
    const newSessionId = `session-mon-${Date.now()}`;
    const requestNo = `MON-RUN-${Date.now()}`;
    
    const monitoringItems = [
      "HTTP API Check",
      "DB 모니터링",
      "IF 모니터링",
      "BATCH 모니터링",
      "LOG 모니터링",
      "성능 모니터링"
    ];
    
    const introMessage = `🔍 **${system.name} 모니터링 시작**

모니터링 대상 시스템: **${system.name}**
실행 시각: ${new Date().toLocaleString('ko-KR')}

다음 항목들에 대한 모니터링을 실시합니다:
${monitoringItems.map(item => `• ${item}`).join('\n')}

모니터링을 시작합니다...`;
    
    const newSession: ChatSession = {
      id: newSessionId,
      request: { 
        id: `mon-${system.id}-${Date.now()}`, 
        requestNo, 
        type: "I", 
        title: `${system.name} 모니터링`, 
        date: new Date().toISOString().split('T')[0]
      },
      messages: [{ role: "agent", content: introMessage }],
      status: "in-progress",
      createdAt: new Date().toISOString(),
    };
    
    setChatSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
    
    // 모니터링 단계별 진행
    const monitoringSteps: ProcessingStep[] = monitoringItems.map((item, idx) => ({
      id: String(idx + 1),
      step: item,
      status: "pending" as const
    }));
    
    setTimeout(() => {
      updateSessionMessages(newSessionId, prev => [...prev, { 
        role: "agent", 
        content: "모니터링 항목 점검 중...", 
        processingSteps: monitoringSteps 
      }]);
      
      // 각 단계 순차적으로 완료
      monitoringSteps.forEach((_, index) => {
        setTimeout(() => {
          updateSessionMessages(newSessionId, prev => {
            const updated = [...prev];
            const lastMsg = updated[updated.length - 1];
            if (lastMsg.processingSteps) {
              lastMsg.processingSteps = lastMsg.processingSteps.map((step, i) => ({ 
                ...step, 
                status: i < index ? "completed" : i === index ? "running" : "pending" 
              }));
            }
            return [...updated];
          });
        }, (index + 1) * 600);
      });
      
      // 모든 단계 완료 후 결과 표시
      setTimeout(() => {
        updateSessionMessages(newSessionId, prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg.processingSteps) { 
            lastMsg.processingSteps = lastMsg.processingSteps.map(step => ({ ...step, status: "completed" as const })); 
          }
          return [...updated];
        });
        
        // 결과 요약 및 등록 여부 확인
        setTimeout(() => {
          const hasIssue = Math.random() > 0.5; // 랜덤하게 이슈 발생 시뮬레이션
          const resultMessage = hasIssue 
            ? `📊 **모니터링 결과 요약**

✅ HTTP API Check: 정상
⚠️ DB 모니터링: **응답 지연 감지** (평균 응답시간 3.2초)
✅ IF 모니터링: 정상
✅ BATCH 모니터링: 정상
⚠️ LOG 모니터링: **오류 로그 다수 발생** (최근 1시간 내 45건)
✅ 성능 모니터링: 정상

---

**발견된 이슈:**
• DB 응답 지연 - 임계치(2초) 초과
• 오류 로그 급증 - 정상 대비 300% 증가

비정상 감지로 등록하시겠습니까?`
            : `📊 **모니터링 결과 요약**

✅ HTTP API Check: 정상
✅ DB 모니터링: 정상
✅ IF 모니터링: 정상
✅ BATCH 모니터링: 정상
✅ LOG 모니터링: 정상
✅ 성능 모니터링: 정상

---

모든 모니터링 항목이 정상입니다.

비정상 감지로 등록하시겠습니까? (정상 완료 처리도 가능합니다)`;
          
          updateSessionMessages(newSessionId, prev => [...prev, { role: "agent", content: resultMessage }]);
          
          // 세션 상태를 pending-monitoring-result로 변경
          setChatSessions(prev => prev.map(s => 
            s.id === newSessionId ? { ...s, status: "pending-monitoring-result" as any } : s
          ));
        }, 500);
      }, monitoringSteps.length * 600 + 500);
    }, 300);
  };

  // 비정상 감지 등록 핸들러
  const handleAddDetection = (detection: DetectionItem) => {
    setMonitoringDetections(prev => [detection, ...prev]);
  };

  // 모니터링 결과 - 비정상 감지 등록
  const handleRegisterDetection = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (!session) return;
    
    const detectionId = `d-${Date.now()}`;
    const detectionNo = `MON-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`;
    
    const newDetection: DetectionItem = {
      id: detectionId,
      detectionNo,
      severity: "warning",
      title: session.request.title,
      source: session.request.title.split(' ')[0],
      date: new Date().toISOString().split('T')[0],
      status: "detected"
    };
    
    setMonitoringDetections(prev => [newDetection, ...prev]);
    
    // 세션의 request.id를 새 감지 항목 ID로 업데이트하여 연결 유지
    setChatSessions(prev => prev.map(s => 
      s.id === sessionId ? { 
        ...s, 
        status: "pending-detection-action" as any,
        request: { ...s.request, id: detectionId, requestNo: detectionNo }
      } : s
    ));
    
    updateSessionMessages(sessionId, prev => [...prev, 
      { role: "user", content: "비정상감지 등록" },
      { role: "agent", content: `✅ 비정상 감지로 등록되었습니다.\n\n**감지 번호:** ${detectionNo}\n\n해당 비정상 상태에 대해 SOP Agent로 이동하여 처리하시겠습니까?\n아니면 운영자가 직접 처리하시겠습니까?` }
    ]);
  };

  // 모니터링 결과 - 정상 완료
  const handleCompleteNormal = (sessionId: string) => {
    setChatSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, status: "completed" as const } : s
    ));
    
    updateSessionMessages(sessionId, prev => [...prev, 
      { role: "user", content: "정상완료" },
      { role: "agent", content: "✅ 정상 완료 처리되었습니다.\n\n모니터링 결과가 정상으로 기록되었습니다." }
    ]);
  };

  // 보고서 Agent 보고서 생성 핸들러
  const handleStartReport = (reportType: { id: string; name: string }) => {
    const newSessionId = `session-rpt-${Date.now()}`;
    const requestNo = `RPT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`;
    
    const introMessage = `📝 **${reportType.name} 생성 시작**

보고서 유형: **${reportType.name}**
생성 시각: ${new Date().toLocaleString('ko-KR')}

보고서 생성을 시작합니다...`;
    
    const newSession: ChatSession = {
      id: newSessionId,
      request: { 
        id: `rpt-${reportType.id}-${Date.now()}`, 
        requestNo, 
        type: "S" as const, 
        title: `${reportType.name} 생성`, 
        date: new Date().toISOString().split('T')[0]
      },
      messages: [{ role: "agent", content: introMessage }],
      status: "in-progress",
      createdAt: new Date().toISOString(),
    };
    
    setChatSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
    
    // 보고서 생성 프로세싱 시뮬레이션
    setTimeout(() => simulateProcessing(`${reportType.name} 생성`, newSessionId), 300);
  };

  // Biz.Support 새 채팅 핸들러
  const handleBizNewChat = () => {
    const newSessionId = `session-biz-${Date.now()}`;
    const requestNo = `BIZ-2024-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    
    const newSession: ChatSession = {
      id: newSessionId,
      request: { 
        id: `biz-${Date.now()}`, 
        requestNo, 
        type: "S" as const, 
        title: "새 문의", 
        date: new Date().toISOString().split('T')[0]
      },
      messages: [{ 
        role: "agent", 
        content: "안녕하세요! Biz.Support Agent입니다. 시스템 관련 문의사항이나 업무 지원이 필요하시면 말씀해 주세요.\n\n• e-총무, 구매, 영업/물류 시스템 사용 문의\n• 시스템 오류 및 접속 문제 해결\n• 업무 프로세스 안내\n• 권한 및 계정 관련 지원" 
      }],
      status: "in-progress",
      createdAt: new Date().toISOString(),
    };
    
    setChatSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
  };

  const handleStartProcess = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (!session) return;

    // 상태를 in-progress로 변경
    setChatSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, status: "in-progress" as const } : s
    ));

    // 처리 시작 메시지 추가 및 프로세싱 시뮬레이션
    updateSessionMessages(sessionId, prev => [...prev, { 
      role: "agent", 
      content: `"${session.request.title}" 인시던트 처리를 시작합니다.` 
    }]);

    setTimeout(() => simulateProcessing(session.request.title, sessionId), 100);
  };

  // SOP Agent 처리 취소 핸들러
  const handleCancelProcess = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (!session) return;

    // 상태를 rejected로 변경
    setChatSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, status: "rejected" as const } : s
    ));

    // 취소 메시지 추가
    updateSessionMessages(sessionId, prev => [...prev, { 
      role: "agent", 
      content: "인시던트 처리가 취소되었습니다. 필요시 다시 처리를 시작할 수 있습니다." 
    }]);
  };

  // SOP Agent 장애보고서 작성 선택 핸들러
  const handleCreateReport = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (!session) return;

    // 새로운 보고서 요청번호 생성
    const reportRequestNo = `RPT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`;
    
    const reportIntroMessage = `📋 **장애보고서 작성 준비**

**원본 인시던트:** ${session.request.title}
**인시던트 번호:** ${session.request.requestNo}
**처리 일시:** ${new Date().toLocaleString('ko-KR')}

---

인시던트 처리 내용을 기반으로 장애보고서를 작성합니다.
아래 '작성시작' 버튼을 클릭하면 AI가 자동으로 보고서를 생성합니다.`;

    // 원본 ITS 요청번호 저장 (ITS-로 시작하는 경우)
    const originalITSRequestNo = session.request.requestNo.startsWith("ITS-") 
      ? session.request.requestNo 
      : undefined;

    // 기존 세션 업데이트: 메시지 추가 + 요청번호를 RPT-로 변경 + 상태를 pending-report-start로 변경
    setChatSessions(prev => prev.map(s => 
      s.id === sessionId 
        ? { 
            ...s, 
            request: {
              ...s.request,
              requestNo: reportRequestNo,
              title: `장애보고서 - ${s.request.title}`
            },
            messages: [
              ...s.messages,
              { role: "user" as const, content: "작성하기" },
              { role: "agent" as const, content: reportIntroMessage }
            ],
            status: "pending-report-start" as const,
            sourceIncidentSession: sessionId,
            originalITSRequestNo
          } 
        : s
    ));
    
    // 기존 세션을 유지하고 보고서 Agent로 자동 이동
    if (onNavigateToAgent) {
      onNavigateToAgent("a6");
    }
  };

  // SOP Agent 장애보고서 작성 건너뛰기 핸들러
  const handleSkipReport = (sessionId: string) => {
    // 상태를 completed로 변경
    setChatSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, status: "completed" as const } : s
    ));

    // 메시지 추가
    updateSessionMessages(sessionId, prev => [...prev, 
      { role: "user", content: "건너뛰기" },
      { role: "agent", content: "✅ 인시던트 처리가 완료되었습니다. 장애보고서 작성은 건너뛰었습니다." }
    ]);
  };

  // 보고서 Agent 장애보고서 작성 시작 핸들러
  const handleStartReportWriting = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (!session) return;

    // 상태를 in-progress로 변경
    setChatSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, status: "in-progress" as const } : s
    ));

    // 메시지 추가
    updateSessionMessages(sessionId, prev => [...prev, { 
      role: "user", 
      content: "작성시작" 
    }]);

    // 보고서 생성 프로세싱 시뮬레이션
    const reportSteps: ProcessingStep[] = [
      { id: "1", step: "인시던트 정보 수집 중...", status: "pending" },
      { id: "2", step: "처리 이력 분석 중...", status: "pending" },
      { id: "3", step: "원인 분석 작성 중...", status: "pending" },
      { id: "4", step: "조치 내용 정리 중...", status: "pending" },
      { id: "5", step: "보고서 생성 중...", status: "pending" },
    ];

    setTimeout(() => {
      updateSessionMessages(sessionId, prev => [...prev, { 
        role: "agent", 
        content: "장애보고서 작성 중...", 
        processingSteps: reportSteps 
      }]);

      // 각 단계 순차적으로 완료
      reportSteps.forEach((_, index) => {
        setTimeout(() => {
          updateSessionMessages(sessionId, prev => {
            const updated = [...prev];
            const lastMsg = updated[updated.length - 1];
            if (lastMsg.processingSteps) {
              lastMsg.processingSteps = lastMsg.processingSteps.map((step, i) => ({ 
                ...step, 
                status: i < index ? "completed" : i === index ? "running" : "pending" 
              }));
            }
            return [...updated];
          });
        }, (index + 1) * 600);
      });

      // 모든 단계 완료 후 보고서 내용 표시
      setTimeout(() => {
        updateSessionMessages(sessionId, prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg.processingSteps) { 
            lastMsg.processingSteps = lastMsg.processingSteps.map(step => ({ ...step, status: "completed" as const })); 
          }
          return [...updated];
        });

        setTimeout(() => {
          const reportContent = `📄 **장애보고서**

---

## 1. 장애 개요
- **장애 제목:** ${session.request.title}
- **장애 번호:** ${session.request.requestNo}
- **발생 일시:** ${session.request.date}
- **복구 일시:** ${new Date().toLocaleString('ko-KR')}
- **영향 범위:** 전체 사용자

## 2. 장애 원인
- 시스템 리소스 과부하로 인한 서비스 응답 지연
- 동시 접속자 급증에 따른 DB 커넥션 풀 고갈

## 3. 조치 내용
1. 서버 리소스 모니터링 및 임계치 조정
2. DB 커넥션 풀 확장 (50 → 100)
3. 캐시 서버 추가 배포
4. 로드밸런서 설정 최적화

## 4. 재발 방지 대책
- 자동 스케일링 정책 수립
- 리소스 사용량 알림 임계치 강화
- 정기적인 부하 테스트 수행

## 5. 담당자
- 처리자: 운영팀
- 검토자: 팀장

---

보고서 검토 후 **추가의견 반영 재작성** 또는 **완료**를 선택해 주세요.`;

          updateSessionMessages(sessionId, prev => [...prev, { role: "agent", content: reportContent }]);
          
          // 상태를 pending-report-review로 변경
          setChatSessions(prev => prev.map(s => 
            s.id === sessionId ? { ...s, status: "pending-report-review" as const } : s
          ));
        }, 500);
      }, reportSteps.length * 600 + 500);
    }, 300);
  };

  // 보고서 Agent 추가의견 반영 재작성 핸들러
  const handleRewriteReport = (sessionId: string) => {
    // 상태를 in-progress로 변경
    setChatSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, status: "in-progress" as const } : s
    ));

    // 메시지 추가
    updateSessionMessages(sessionId, prev => [...prev, 
      { role: "user", content: "추가의견 반영 재작성" },
      { role: "agent", content: "추가 의견을 입력해 주세요. 해당 내용을 반영하여 보고서를 재작성하겠습니다." }
    ]);
  };

  // 보고서 Agent 완료 핸들러
  const handleCompleteReport = (sessionId: string) => {
    // 메시지 추가
    updateSessionMessages(sessionId, prev => [...prev, 
      { role: "user", content: "완료" },
      { role: "agent", content: "✅ 장애보고서가 완료되었습니다.\n\n📚 해당 장애 정보를 **장애지식 RAG**에 저장하시겠습니까?\n저장하시면 향후 유사 장애 발생 시 참조할 수 있습니다." }
    ]);

    // 상태를 pending-knowledge-save로 변경
    setChatSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, status: "pending-knowledge-save" as const } : s
    ));
  };

  // 보고서 Agent 장애지식RAG 저장 핸들러
  const handleSaveToKnowledge = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (!session) return;

    // 생성된 보고서 목록에 추가
    const newReport: GeneratedReport = {
      id: `gr-${Date.now()}`,
      typeId: "incident",
      typeName: "장애보고서",
      title: session.request.title,
      generatedAt: new Date().toLocaleString('ko-KR'),
      size: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 9)}MB`,
      status: "ready",
      savedToRAG: true
    };
    setGeneratedReports(prev => [newReport, ...prev]);

    // 메시지 추가
    updateSessionMessages(sessionId, prev => [...prev, 
      { role: "user", content: "저장하기" },
      { role: "agent", content: "✅ 장애지식 RAG에 성공적으로 저장되었습니다.\n\n📌 **저장된 정보:**\n- 장애 유형: 서비스 장애\n- 원인: 리소스 과부하\n- 해결 방법: 리소스 확장 및 최적화\n\n향후 유사 장애 발생 시 AI가 이 정보를 참조하여 더 빠른 해결을 지원합니다." }
    ]);

    // 원본 ITS 요청 여부 확인 후 ITS 완료 처리 상태로 전환
    if (session.originalITSRequestNo) {
      setTimeout(() => {
        updateSessionMessages(sessionId, prev => [...prev, 
          { role: "agent", content: `📋 원본 ITS 요청 건(**${session.originalITSRequestNo}**)의 완료 처리를 진행하시겠습니까?\n\nITS Agent에서 해당 요청을 완료 상태로 변경합니다.` }
        ]);
        setChatSessions(prev => prev.map(s => 
          s.id === sessionId ? { ...s, status: "pending-its-complete" as const } : s
        ));
      }, 800);
    } else {
      // ITS 요청이 아닌 경우 바로 완료
      setChatSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, status: "completed" as const } : s
      ));
    }
  };

  // 보고서 Agent 장애지식RAG 저장 건너뛰기 핸들러
  const handleSkipKnowledgeSave = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (!session) return;

    // 생성된 보고서 목록에 추가 (RAG 미저장)
    const newReport: GeneratedReport = {
      id: `gr-${Date.now()}`,
      typeId: "incident",
      typeName: "장애보고서",
      title: session.request.title,
      generatedAt: new Date().toLocaleString('ko-KR'),
      size: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 9)}MB`,
      status: "ready",
      savedToRAG: false
    };
    setGeneratedReports(prev => [newReport, ...prev]);

    // 메시지 추가
    updateSessionMessages(sessionId, prev => [...prev, 
      { role: "user", content: "건너뛰기" },
      { role: "agent", content: "✅ 장애보고서 작성이 완료되었습니다." }
    ]);

    // 원본 ITS 요청 여부 확인 후 ITS 완료 처리 상태로 전환
    if (session.originalITSRequestNo) {
      setTimeout(() => {
        updateSessionMessages(sessionId, prev => [...prev, 
          { role: "agent", content: `📋 원본 ITS 요청 건(**${session.originalITSRequestNo}**)의 완료 처리를 진행하시겠습니까?\n\nITS Agent에서 해당 요청을 완료 상태로 변경합니다.` }
        ]);
        setChatSessions(prev => prev.map(s => 
          s.id === sessionId ? { ...s, status: "pending-its-complete" as const } : s
        ));
      }, 800);
    } else {
      // ITS 요청이 아닌 경우 바로 완료
      setChatSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, status: "completed" as const } : s
      ));
    }
  };

  // ITS 완료 처리 핸들러
  const handleCompleteITS = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (!session) return;

    // 메시지 추가
    updateSessionMessages(sessionId, prev => [...prev, 
      { role: "user", content: "ITS 완료 처리" },
      { 
        role: "agent", 
        content: `✅ ITS 요청 건(**${session.originalITSRequestNo}**)이 완료 처리되었습니다.\n\nITS Agent에서 해당 요청의 상태가 "완료"로 변경되었습니다.`,
        link: {
          label: "ITS Agent로 이동",
          agentId: "a1"
        }
      }
    ]);

    // 상태를 completed로 변경
    setChatSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, status: "completed" as const } : s
    ));

    // ITS Agent로 자동 이동
    if (onNavigateToAgent) {
      onNavigateToAgent("a1");
    }
  };

  // ITS 완료 처리 건너뛰기 핸들러
  const handleSkipITSComplete = (sessionId: string) => {
    // 메시지 추가
    updateSessionMessages(sessionId, prev => [...prev, 
      { role: "user", content: "건너뛰기" },
      { role: "agent", content: "✅ 장애보고서 작성 워크플로우가 완료되었습니다.\n\nITS 요청 건은 수동으로 완료 처리해 주세요." }
    ]);

    // 상태를 completed로 변경
    setChatSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, status: "completed" as const } : s
    ));
  };

  const renderDashboard = () => {
    switch (agentType) {
      case "sop": return (
        <SOPAgentDashboard 
          onApprove={handleApprove} 
          onReject={handleReject} 
          routedRequests={routedRequestsToSOP}
          onStartChat={handleSOPStartChat}
          chatSessions={chatSessions}
          onSelectSession={handleSelectSession}
          activeSessionId={activeSessionId}
        />
      );
      case "its": return (
        <ITSAgentDashboard 
          onRequest={handleITSRequest} 
          onStartChat={handleStartChat}
          chatSessions={chatSessions}
          onSelectSession={handleSelectSession}
          activeSessionId={activeSessionId}
        />
      );
      case "monitoring": {
        // 모니터링 관련 세션만 필터링 (MON- 으로 시작하는 요청번호)
        const monitoringSessions = chatSessions.filter(s => 
          s.request.requestNo.startsWith("MON-")
        );
        return (
          <MonitoringAgentDashboard 
            onStartChat={handleMonitoringStartChat}
            onStartMonitoring={handleStartMonitoring}
            chatSessions={monitoringSessions}
            onSelectSession={handleSelectSession}
            activeSessionId={activeSessionId}
            detections={monitoringDetections}
            onAddDetection={handleAddDetection}
          />
        );
      }
      case "db": return (
        <DBAgentDashboard 
          routedRequests={routedRequestsToDB}
          onStartChat={handleDBStartChat}
          chatSessions={chatSessions}
          onSelectSession={handleSelectSession}
          activeSessionId={activeSessionId}
        />
      );
      case "biz-support": {
        const bizSessions = chatSessions.filter(s => 
          s.request.requestNo.startsWith("BIZ-")
        );
        return (
          <BizSupportAgentDashboard 
            onNewChat={handleBizNewChat}
            onSelectSession={handleSelectSession}
            chatSessions={bizSessions}
            activeSessionId={activeSessionId}
          />
        );
      }
      case "change-management": return (
        <ChangeManagementAgentDashboard 
          routedRequests={routedRequestsToChangeManagement}
          onStartChat={handleChangeManagementStartChat}
          chatSessions={chatSessions}
          onSelectSession={handleSelectSession}
          activeSessionId={activeSessionId}
        />
      );
      case "report": {
        // 보고서 관련 세션만 필터링 (RPT- 으로 시작하는 요청번호)
        const reportSessions = chatSessions.filter(s => 
          s.request.requestNo.startsWith("RPT-")
        );
        return (
          <ReportAgentDashboard 
            onStartReport={handleStartReport}
            chatSessions={reportSessions}
            onSelectSession={handleSelectSession}
            activeSessionId={activeSessionId}
            generatedReports={generatedReports}
          />
        );
      }
      default: return (
        <SOPAgentDashboard 
          onApprove={handleApprove} 
          onReject={handleReject} 
          routedRequests={routedRequestsToSOP}
          onStartChat={handleSOPStartChat}
          chatSessions={chatSessions}
          onSelectSession={handleSelectSession}
          activeSessionId={activeSessionId}
        />
      );
    }
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      <div className="w-[70%] p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center"><Bot className="w-6 h-6 text-primary" /></div>
            <div><h1 className="text-2xl font-bold">{agentName}</h1><p className="text-sm text-muted-foreground">Agent ID: {agentId}</p></div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors flex items-center gap-2 text-sm"><Info className="w-4 h-4" />{t("common.info")}</button>
            <button className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors flex items-center gap-2 text-sm"><Settings className="w-4 h-4" />{t("common.settings")}</button>
          </div>
        </div>
        {renderDashboard()}
      </div>
      <AgentChatPanel 
        agentName={agentName} 
        messages={currentMessages} 
        onSendMessage={handleSendMessage} 
        onQuickAction={handleQuickAction} 
        quickActions={quickActions}
        activeRequest={activeRequest}
        onCloseRequest={handleCloseRequest}
        isPendingApproval={activeSession?.status === "pending-approval"}
        onApproveRequest={() => activeSessionId && handleApproveRequest(activeSessionId)}
        onRejectRequest={() => activeSessionId && handleRejectRequest(activeSessionId)}
        onNavigateToAgent={onNavigateToAgent}
        isPendingProcessStart={activeSession?.status === "pending-process-start"}
        onStartProcess={() => activeSessionId && handleStartProcess(activeSessionId)}
        onCancelProcess={() => activeSessionId && handleCancelProcess(activeSessionId)}
        isPendingMonitoringResult={(activeSession?.status as string) === "pending-monitoring-result"}
        onRegisterDetection={() => activeSessionId && handleRegisterDetection(activeSessionId)}
        onCompleteNormal={() => activeSessionId && handleCompleteNormal(activeSessionId)}
        isPendingDetectionAction={(activeSession?.status as string) === "pending-detection-action"}
        onRouteToSOP={() => activeSessionId && handleRouteToSOP(activeSessionId)}
        onDirectProcess={() => activeSessionId && handleDirectProcess(activeSessionId)}
        isPendingDirectComplete={(activeSession?.status as string) === "pending-direct-complete"}
        onDirectProcessComplete={() => activeSessionId && handleDirectProcessComplete(activeSessionId)}
        isPendingReportConfirm={activeSession?.status === "pending-report-confirm"}
        onCreateReport={() => activeSessionId && handleCreateReport(activeSessionId)}
        onSkipReport={() => activeSessionId && handleSkipReport(activeSessionId)}
        isPendingReportStart={activeSession?.status === "pending-report-start"}
        onStartReportWriting={() => activeSessionId && handleStartReportWriting(activeSessionId)}
        isPendingReportReview={activeSession?.status === "pending-report-review"}
        onRewriteReport={() => activeSessionId && handleRewriteReport(activeSessionId)}
        onCompleteReport={() => activeSessionId && handleCompleteReport(activeSessionId)}
        isPendingKnowledgeSave={activeSession?.status === "pending-knowledge-save"}
        onSaveToKnowledge={() => activeSessionId && handleSaveToKnowledge(activeSessionId)}
        onSkipKnowledgeSave={() => activeSessionId && handleSkipKnowledgeSave(activeSessionId)}
        isPendingITSComplete={activeSession?.status === "pending-its-complete"}
        onCompleteITS={() => activeSessionId && handleCompleteITS(activeSessionId)}
        onSkipITSComplete={() => activeSessionId && handleSkipITSComplete(activeSessionId)}
      />
    </div>
  );
}
