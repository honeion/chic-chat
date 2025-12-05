import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChatMessage, Message } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import { Bot, Sparkles } from "lucide-react";

interface ChatAreaProps {
  selectedChatId: string | null;
}

export function ChatArea({ selectedChatId }: ChatAreaProps) {
  const { t } = useTranslation();
  
  const initialMessages: Message[] = [
    {
      id: "1",
      role: "system",
      content: t("chat.conversationStarted"),
      timestamp: new Date(Date.now() - 60000 * 5),
    },
    {
      id: "2",
      role: "assistant",
      content: t("chat.greeting"),
      timestamp: new Date(Date.now() - 60000 * 4),
    },
  ];

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getAIResponse(content),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const getAIResponse = (input: string): string => {
    const responses: Record<string, string> = {
      [t("chat.quickActions.summarize")]: "물론이죠! 요약할 내용을 보내주시면 핵심 내용을 정리해드리겠습니다. 📝",
      [t("chat.quickActions.writeCode")]: "어떤 언어로 어떤 기능의 코드를 작성해드릴까요? 예를 들어 Python, JavaScript, TypeScript 등 다양한 언어를 지원합니다. 💻",
      [t("chat.quickActions.translate")]: "번역할 텍스트와 목표 언어를 알려주세요. 영어, 한국어, 일본어, 중국어 등 다양한 언어 간 번역이 가능합니다. 🌐",
      [t("chat.quickActions.analyze")]: "분석할 데이터나 문서를 공유해주세요. 텍스트 분석, 데이터 분석, 코드 리뷰 등 다양한 분석을 도와드릴 수 있습니다. 📊",
    };
    return responses[input] || `"${input}"에 대해 이해했습니다.\n\n해당 요청을 처리하고 있습니다. 더 구체적인 정보가 필요하시면 말씀해주세요!`;
  };

  if (!selectedChatId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-2xl gradient-primary flex items-center justify-center shadow-glow animate-float">
            <Bot className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-2">{t("chat.startConversation")}</h2>
            <p className="text-muted-foreground max-w-md whitespace-pre-line">
              {t("chat.selectChatHint")}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {[t("chat.aiAssistant"), t("chat.workflowRun"), t("chat.ragSearch")].map((label) => (
              <button
                key={label}
                className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-primary/20 hover:text-primary transition-colors text-sm"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      <ChatHeader />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto py-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              isLast={index === messages.length - 1}
            />
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 py-4 px-4 animate-fade-in">
              <div className="w-9 h-9 rounded-xl bg-secondary text-primary flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1 px-4 py-3 bg-chat-assistant rounded-2xl rounded-tl-md">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput onSend={handleSendMessage} disabled={isTyping} showToolSelector={true} />
    </div>
  );
}
