"use client";
import {
  PropsWithChildren,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

export const Chat = ({ children }: PropsWithChildren) => {
  const lines = children
    ?.toString()
    .split("\n")
    .map((line) => line.trim());

  const texts =
    lines?.map((line, index) => {
      return `${index ? "\n" : ""}${line}`;
    }) || null;

  // 텍스트를 문자 단위로 분리 (단어 단위가 아닌 문자 단위로 변경)
  const allCharacters = texts ? texts.join("").split("") : [];

  // 현재까지 표시된 문자의 인덱스를 추적하는 상태
  const [displayedCharCount, setDisplayedCharCount] = useState(0);
  // 애니메이션이 완료되었는지 여부
  const [isComplete, setIsComplete] = useState(false);
  // 현재까지 표시된 텍스트
  const [visibleText, setVisibleText] = useState("");
  // 애니메이션 일시 정지 여부
  const [isPaused, setIsPaused] = useState(true); // 초기값을 true로 설정 (처음에는 일시정지 상태)
  // 초기 대기 시간이 끝났는지 여부
  const [isInitialDelayComplete, setIsInitialDelayComplete] = useState(false);
  // 페이지가 현재 보이는 상태인지 여부
  const [isPageVisible, setIsPageVisible] = useState(false);
  // 대기 시간 카운트다운 시작 여부
  const [hasStartedCountdown, setHasStartedCountdown] = useState(false);
  // 마지막 타이핑 시간 추적
  const lastTypingTime = useRef(Date.now());
  // 3초 타이머 참조
  const initialDelayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 페이지 가시성 변화 감지
  useEffect(() => {
    // 초기 가시성 상태 설정
    setIsPageVisible(document.visibilityState === "visible");

    // 가시성 변화 이벤트 핸들러
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === "visible";
      setIsPageVisible(isVisible);

      // 페이지가 숨겨지면 타이머 초기화
      if (!isVisible && initialDelayTimerRef.current) {
        clearTimeout(initialDelayTimerRef.current);
        initialDelayTimerRef.current = null;
      }
    };

    // 이벤트 리스너 등록
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 클린업 함수
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (initialDelayTimerRef.current) {
        clearTimeout(initialDelayTimerRef.current);
      }
    };
  }, []);

  // 페이지가 보이고 있을 때 3초 카운트다운 시작
  useEffect(() => {
    // 페이지가 보이고 있고, 아직 카운트다운을 시작하지 않았으며, 대기 시간이 끝나지 않았을 때
    if (isPageVisible && !hasStartedCountdown && !isInitialDelayComplete) {
      setHasStartedCountdown(true);

      initialDelayTimerRef.current = setTimeout(() => {
        setIsInitialDelayComplete(true);
        setIsPaused(false); // 1.5초 후에 애니메이션 시작
      }, 1500); // 1500ms = 1.5초
    }
  }, [isPageVisible, hasStartedCountdown, isInitialDelayComplete]);

  // 다음 타이핑 지연 시간 계산 함수
  const getNextDelay = useCallback((currentChar: string) => {
    // 기본 타이핑 속도 (밀리초)
    const baseSpeed = 30;

    // 공백 후에는 살짝 기다림
    if (currentChar === " ") {
      return baseSpeed + Math.random() * 40;
    }

    // 줄바꿈 후에는 조금 더 기다림
    if (currentChar === "\n") {
      return baseSpeed + Math.random() * 150 + 150;
    }

    // 일반 문자는 약간의 랜덤성을 가진 기본 속도
    return baseSpeed + Math.random() * 20;
  }, []);

  useEffect(() => {
    if (isPaused || isComplete) return;

    // 모든 문자가 표시되었다면 애니메이션 중단
    if (displayedCharCount >= allCharacters.length) {
      setIsComplete(true);
      return;
    }

    const currentChar = allCharacters[displayedCharCount];
    const delay = getNextDelay(currentChar);

    // 현재 시간과 마지막 타이핑 시간의 차이 계산
    const now = Date.now();
    const timeSinceLastType = now - lastTypingTime.current;

    // 지연 시간 조정 (너무 느리게 타이핑되지 않도록)
    const adjustedDelay = Math.max(0, delay - timeSinceLastType);

    const timer = setTimeout(() => {
      lastTypingTime.current = Date.now();

      setVisibleText((prev) => prev + currentChar);
      setDisplayedCharCount((prev) => prev + 1);
    }, adjustedDelay);

    return () => clearTimeout(timer);
  }, [displayedCharCount, allCharacters, isComplete, isPaused, getNextDelay]);

  // 사용자 인터랙션을 처리하는 함수들
  const handlePauseToggle = () => {
    setIsPaused((prev) => !prev);
  };

  const handleSkip = () => {
    setVisibleText(allCharacters.join(""));
    setDisplayedCharCount(allCharacters.length);
    setIsComplete(true);
  };

  return (
    <div className="w-2/3 relative">
      <pre className="w-full rounded-lg bg-gray-50 p-4 font-mono text-sm">
        {visibleText}
        {!isComplete && <span className="animate-pulse">|</span>}
      </pre>

      {/* 컨트롤 버튼 (선택적으로 표시) */}
      <div className="absolute top-2 right-2 flex gap-2 opacity-50 hover:opacity-100 transition-opacity">
        {!isComplete && isInitialDelayComplete && (
          <>
            <button
              onClick={handlePauseToggle}
              className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              {isPaused ? "▶" : "❚❚"}
            </button>
            <button
              onClick={handleSkip}
              className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              ≫
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export const ChatSending = () => {
  return (
    <div className="w-2/3 flex bg-gray-200 rounded-xl p-4">
      <span className="animate-pulse duration-1000">...</span>
    </div>
  );
};
