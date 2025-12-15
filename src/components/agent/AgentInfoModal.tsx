import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  FileText, 
  Wrench, 
  BookOpen, 
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap
} from "lucide-react";

interface AgentInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  agentName: string;
}

interface AgentInfo {
  description: string;
  features: string[];
  usageSteps: string[];
  tips: string[];
  relatedAgents?: string[];
}

// Agent별 정보 데이터
const agentInfoData: Record<string, AgentInfo> = {
  its: {
    description: "ITS Agent는 IT 서비스 요청을 접수하고 처리하는 Agent입니다. 인시던트, 개선요청, 데이터요청, 계정/권한요청, 단순요청 등 5가지 유형의 요청을 관리합니다.",
    features: [
      "5가지 요청 유형 자동 분류 (I/C/D/A/S)",
      "요청 접수 및 승인/반려 처리",
      "요청 유형에 따른 담당 Agent 자동 라우팅",
      "업무량 등록, 방화벽 신청, DB Safer 신청, Cloud 신청 지원",
      "시스템별 요청 필터링"
    ],
    usageSteps: [
      "미접수 요청의 ▶ 버튼을 클릭하여 요청 상세 내용을 확인합니다.",
      "요청 내용 검토 후 '접수' 또는 '반려' 버튼을 클릭합니다.",
      "인시던트(I)는 SOP Agent로, 개선(C)은 변경관리 Agent로, 데이터(D)는 DB Agent로 자동 전달됩니다.",
      "처리 Chat 이력에서 이전 처리 내용을 확인할 수 있습니다."
    ],
    tips: [
      "시스템 필터를 사용하면 특정 시스템의 요청만 확인할 수 있습니다.",
      "요청번호 형식: ITS-YYYY-XXXX",
      "설정 버튼에서 시스템별 Worker 지침을 설정할 수 있습니다."
    ],
    relatedAgents: ["SOP Agent", "변경관리 Agent", "DB Agent"]
  },
  sop: {
    description: "SOP Agent는 인시던트 장애 처리를 담당하는 Agent입니다. 표준 운영 절차(SOP)에 따라 장애를 분석하고 복구 작업을 수행합니다.",
    features: [
      "인시던트 장애 접수 및 처리",
      "SOP 기반 장애 분석 및 복구",
      "처리 완료 후 장애보고서 작성 연계",
      "장애 지식 RAG 저장 지원"
    ],
    usageSteps: [
      "접수된 인시던트의 '시작' 버튼을 클릭합니다.",
      "요청 내용 확인 후 '처리' 버튼으로 작업을 시작합니다.",
      "처리 완료 후 장애보고서 작성 여부를 선택합니다.",
      "보고서 작성 시 Report Agent로 이동하여 작성을 진행합니다."
    ],
    tips: [
      "장애보고서 작성 후 Knowledge RAG에 저장하면 유사 장애 시 참조할 수 있습니다.",
      "ITS Agent에서 인시던트(I) 요청이 자동으로 전달됩니다."
    ],
    relatedAgents: ["ITS Agent", "Report Agent", "모니터링 Agent"]
  },
  monitoring: {
    description: "모니터링 Agent는 시스템 상태를 실시간으로 모니터링하고 비정상 상태를 감지하는 Agent입니다. 6가지 모니터링 항목을 순차적으로 점검합니다.",
    features: [
      "HTTP API, DB, IF, BATCH, LOG, 성능 모니터링",
      "비정상 상태 자동 감지 및 등록",
      "SOP Agent 연계 처리 또는 직접 처리 선택",
      "시스템별 모니터링 설정 관리"
    ],
    usageSteps: [
      "모니터링할 시스템의 '모니터링 실행' 버튼을 클릭합니다.",
      "6가지 항목에 대한 모니터링이 순차적으로 실행됩니다.",
      "결과 확인 후 '비정상감지 등록' 또는 '정상완료'를 선택합니다.",
      "비정상 감지 시 SOP 처리 또는 직접 처리를 선택합니다."
    ],
    tips: [
      "설정 버튼에서 모니터링 항목별 세부 설정을 관리할 수 있습니다.",
      "감지된 비정상 항목은 '비정상 감지 현황'에서 관리됩니다."
    ],
    relatedAgents: ["SOP Agent"]
  },
  db: {
    description: "DB Agent는 데이터베이스 관련 요청을 처리하는 Agent입니다. 데이터 추출, 조회, 분석 등의 작업을 수행합니다.",
    features: [
      "데이터 추출 및 조회 요청 처리",
      "SQL 쿼리 실행 및 결과 제공",
      "데이터 분석 리포트 생성",
      "시스템별 DB 접근 관리"
    ],
    usageSteps: [
      "접수된 데이터 요청의 '시작' 버튼을 클릭합니다.",
      "요청 내용 확인 후 '처리' 버튼으로 작업을 시작합니다.",
      "데이터 추출이 완료되면 결과를 확인합니다.",
      "필요 시 추가 조건을 채팅으로 전달할 수 있습니다."
    ],
    tips: [
      "ITS Agent에서 데이터(D) 요청이 자동으로 전달됩니다.",
      "대용량 데이터 추출 시 시간이 소요될 수 있습니다."
    ],
    relatedAgents: ["ITS Agent"]
  },
  "change-management": {
    description: "변경관리 Agent는 시스템 개선 및 변경 요청을 관리하는 Agent입니다. 변경 계획 수립부터 실행, 결과 보고까지 전체 변경 프로세스를 지원합니다.",
    features: [
      "변경 요청 접수 및 영향도 분석",
      "변경 계획서 작성 지원",
      "테스트 시나리오 관리",
      "변경 결과 보고서 생성"
    ],
    usageSteps: [
      "접수된 개선 요청의 '시작' 버튼을 클릭합니다.",
      "요청 내용 확인 후 '처리' 버튼으로 작업을 시작합니다.",
      "변경 계획 수립 및 승인 절차를 진행합니다.",
      "변경 완료 후 결과 보고서를 작성합니다."
    ],
    tips: [
      "ITS Agent에서 개선(C) 요청이 자동으로 전달됩니다.",
      "Report Agent와 연계하여 변경계획서/결과보고서를 작성할 수 있습니다."
    ],
    relatedAgents: ["ITS Agent", "Report Agent"]
  },
  report: {
    description: "Report Agent는 각종 보고서를 작성하고 관리하는 Agent입니다. 장애보고서, 변경계획서, 테스트시나리오, 변경결과보고서, 취합문서 등을 지원합니다.",
    features: [
      "5가지 보고서 유형 지원",
      "마크다운 형식 보고서 작성",
      "Knowledge RAG 저장 연계",
      "생성된 보고서 이력 관리"
    ],
    usageSteps: [
      "작성할 보고서 유형의 '실행' 버튼을 클릭합니다.",
      "'작성시작' 버튼으로 보고서 작성을 시작합니다.",
      "생성된 보고서를 검토하고 필요 시 '재작성'합니다.",
      "완료 후 Knowledge RAG 저장 여부를 선택합니다."
    ],
    tips: [
      "SOP Agent에서 장애 처리 완료 시 장애보고서 작성으로 연계됩니다.",
      "'생성된 보고서' 섹션에서 이전 보고서를 확인할 수 있습니다."
    ],
    relatedAgents: ["SOP Agent", "변경관리 Agent"]
  },
  "biz-support": {
    description: "Biz.Support Agent는 현업 사용자의 시스템 관련 문의를 1차 지원하는 Agent입니다. 시스템 사용법, 오류 해결, 권한 문의 등 다양한 질문에 답변하며, 처리가 어려운 경우 ITS에 요청서를 대신 등록해 드립니다.",
    features: [
      "시스템 사용법 안내",
      "오류 및 장애 1차 대응",
      "권한 및 계정 문의 처리",
      "FAQ 기반 자동 응답",
      "ITS 요청서 자동 등록 (대화 내용 기반)"
    ],
    usageSteps: [
      "'새 채팅' 버튼으로 새로운 문의를 시작합니다.",
      "문의 내용을 채팅으로 입력합니다.",
      "Agent의 답변을 확인하고 추가 질문이 있으면 이어서 대화합니다.",
      "처리가 어려운 경우 'ITS 요청 등록하기' 버튼을 클릭합니다.",
      "요청 유형(인시던트/개선/데이터/계정권한/단순)을 선택합니다.",
      "대화 내용이 요약되어 표시되면 확인 후 등록합니다.",
      "ITS 담당자의 승인 후 요청이 처리됩니다."
    ],
    tips: [
      "명확하고 구체적인 질문일수록 정확한 답변을 받을 수 있습니다.",
      "ITS 요청 등록 시 대화 내용이 자동으로 요약되어 전달됩니다.",
      "등록된 ITS 요청은 ITS Agent에서 승인 후 처리됩니다."
    ],
    relatedAgents: ["ITS Agent"]
  },
  infra: {
    description: "Infra Agent는 인프라 관련 작업을 관리하는 Agent입니다. 서버, 네트워크, 스토리지, 클라우드, 보안 등 인프라 전반의 설정과 관리를 지원합니다.",
    features: [
      "서버/네트워크/스토리지 설정 관리",
      "클라우드 인프라 관리",
      "보안 설정 관리",
      "시스템별 인프라 정보 조회"
    ],
    usageSteps: [
      "작업할 시스템의 '채팅 시작' 버튼을 클릭합니다.",
      "인프라 관련 작업 내용을 채팅으로 전달합니다.",
      "Agent의 안내에 따라 작업을 진행합니다.",
      "설정 버튼에서 인프라 상세 정보를 확인/수정할 수 있습니다."
    ],
    tips: [
      "시스템 설정 버튼에서 서버, 네트워크, 스토리지 등의 상세 설정을 관리할 수 있습니다.",
      "Worker 지침 설정에서 시스템별 작업 지침을 설정할 수 있습니다."
    ],
    relatedAgents: ["모니터링 Agent"]
  }
};

export function AgentInfoModal({
  isOpen,
  onClose,
  agentId,
  agentName,
}: AgentInfoModalProps) {
  const info = agentInfoData[agentId] || {
    description: `${agentName}의 상세 정보입니다.`,
    features: [],
    usageSteps: [],
    tips: [],
    relatedAgents: []
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-lg flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            {agentName} 정보
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* 설명 */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <FileText className="w-4 h-4" />
              설명
            </h3>
            <p className="text-sm leading-relaxed">{info.description}</p>
          </div>

          {/* 주요 기능 */}
          {info.features.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Zap className="w-4 h-4" />
                주요 기능
              </h3>
              <ul className="space-y-1.5">
                {info.features.map((feature, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 사용 방법 */}
          {info.usageSteps.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <BookOpen className="w-4 h-4" />
                사용 방법
              </h3>
              <ol className="space-y-2">
                {info.usageSteps.map((step, index) => (
                  <li key={index} className="text-sm flex items-start gap-3">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-medium shrink-0">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* 팁 */}
          {info.tips.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Lightbulb className="w-4 h-4" />
                팁
              </h3>
              <ul className="space-y-1.5">
                {info.tips.map((tip, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 관련 Agent */}
          {info.relatedAgents && info.relatedAgents.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                관련 Agent
              </h3>
              <div className="flex flex-wrap gap-2">
                {info.relatedAgents.map((agent, index) => (
                  <Badge key={index} variant="secondary">
                    {agent}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
