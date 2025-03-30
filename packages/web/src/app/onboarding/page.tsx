"use client";

import {
  Chat,
  ChatSelect,
  ChatInput,
  ChatSection,
  ChatSectionItem,
  ChatSending,
} from "@/components/shared/chat/components";
import { Button } from "@routine-flow/ui/components/ui/button";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

type UserSelected = "positive" | "neutral" | "negative" | "default";

const Onboarding = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [userSelect1, setUserSelect1] = useState<{
    value: string;
    state: UserSelected;
  } | null>(null);
  const [userSelect2, setUserSelect2] = useState<{
    value: string;
    state: UserSelected;
  } | null>(null);
  const [exitSession, setExitSession] = useState<{
    value: string;
    state: UserSelected;
  } | null>(null);

  const [isGoalSession, setIsGoalSession] = useState(false);
  const [isExitSession, setIsExitSession] = useState(false);

  const [goal, setGoal] = useState<{
    title: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: window.innerHeight,
        behavior: "smooth",
      });
    }
  }, [step]);

  return (
    <div ref={ref} className="w-full flex flex-col gap-4 py-8 pb-12">
      <Chat
        onChatComplete={() => {
          setUserSelect1({
            value: "...",
            state: "default",
          });
          setStep(1);
        }}
      >
        {`안녕하세요.
        당신의 목표 달성을 도와드릴 루플 입니다.
        그동안 이루고 싶었던 당신만의 큰 목표가 있었나요?`}
      </Chat>
      {step >= 1 && (
        <ChatSelect
          value={userSelect1?.value || ""}
          options={[
            {
              id: "r1",
              value: "positive",
              label: "응! 난 장기적인 목표가 있지 :)",
              onSelected: (value) => {
                setUserSelect1({
                  value,
                  state: "positive",
                });
                setStep(2);
              },
            },
            {
              id: "r2",
              value: "neutral",
              label: "그렇긴 한데, 그건 왜 묻는거야?",
              onSelected: (value) => {
                setUserSelect1({
                  value,
                  state: "neutral",
                });
                setStep(2);
              },
            },
            {
              id: "r3",
              value: "negative",
              label: "난 그냥 이 앱이 궁금해서 왔어.",
              onSelected: (value) => {
                setUserSelect1({
                  value,
                  state: "negative",
                });
                setStep(10);
              },
            },
          ]}
        />
      )}
      {step >= 2 &&
        (userSelect1?.state === "positive" ||
          userSelect1?.state === "neutral") && (
          <Chat
            onChatComplete={() => {
              setUserSelect2({
                value: "...",
                state: "default",
              });
              setStep(3);
            }}
          >
            {`장기적인 목표는 어느날 한순간에 이루어지기 어렵죠.
              원대한 꿈도 작은 성취가 모이고 모여서 이루어 진답니다.
              저는 그런 당신의 목표를 이룰수 있게 쪼개어진 목표를 루틴화 함으로써 도와 드리고 있어요.
              함께 당신의 멋진 목표를 달성해 볼까요?`}
          </Chat>
        )}
      {step >= 3 &&
        (userSelect1?.state === "positive" ||
          userSelect1?.state === "neutral") && (
          <ChatSelect
            value={userSelect2?.value || ""}
            options={[
              {
                id: "r2-1",
                value: "positive",
                label: "멋진 아이디어야! 그럼 목표를 정해보자!",
                onSelected: (value) => {
                  setUserSelect2({
                    value,
                    state: "positive",
                  });
                  setStep(4);
                  setIsGoalSession(true);
                },
              },
              {
                id: "r2-2",
                value: "negative",
                label:
                  "좋긴한데, 조금 부담스럽네. 일단 그냥 루틴을 계획하고 이용해볼게.",
                onSelected: (value) => {
                  setUserSelect2({
                    value,
                    state: "negative",
                  });
                  setStep(10);
                  setIsGoalSession(false);
                },
              },
            ]}
          />
        )}
      {step >= 10 &&
        (userSelect1?.state === "negative" ||
          userSelect2?.state === "negative") && (
          <Chat
            onChatComplete={() => {
              setExitSession({
                value: "...",
                state: "default",
              });
              setStep(11);
            }}
          >
            {`그렇군요. 처음에는 가볍게 시작해보는것도 좋죠. 원한다면 언제든 목표를 세우고 하위 루틴을 계획할수 있어요.
            그럼, 바로 시작해 볼까요?`}
          </Chat>
        )}
      {step >= 11 &&
        (userSelect1?.state === "negative" ||
          userSelect2?.state === "negative") && (
          <div className="flex flex-col gap-4 items-end">
            <ChatSending>{exitSession?.value}</ChatSending>
            <div className="w-2/3 flex pl-3">
              <ChatSection>
                <ChatSectionItem
                  value="positive"
                  id="r10-1"
                  onSelected={(value) => {
                    setExitSession({
                      value,
                      state: "positive",
                    });
                    setStep(12);
                    setIsExitSession(true);
                  }}
                >
                  그래, 고마워!
                </ChatSectionItem>
                {/* <ChatSectionItem
                  value="negative"
                  id="r10-2"
                  onSelected={(value) => {
                    setExitSession({
                      value,
                      state: "negative",
                    });
                    setIsExitSession(false);
                    setStep(4);
                    setIsGoalSession(true);
                    setUserSelect2((prev) => {
                      return {
                        ...prev,
                        state: "positive",
                      };
                    });
                  }}
                >
                  다시 생각해봤는데, 그냥 한번 목표를 세워볼게.
                </ChatSectionItem> */}
              </ChatSection>
            </div>
          </div>
        )}
      {step >= 12 && isExitSession && (
        <Button asChild>
          <Link href="/">홈으로 이동하기</Link>
        </Button>
      )}
      {step >= 4 &&
        (userSelect2?.state === "positive" ||
          userSelect2?.state === "neutral") && (
          <Chat
            onChatComplete={() => {
              setGoal({
                title: "",
                description: "",
              });
              setStep(5);
            }}
          >
            {`알겠습니다! 시작해 볼까요?
            당신이 현재 가장 달성하고 싶은 목표가 무엇인가요?`}
          </Chat>
        )}
      {step >= 5 && isGoalSession && (
        <div className="flex flex-col gap-4 items-end">
          <ChatInput
            onChange={(e) => {
              setGoal((prev) => ({
                title: e.target.value || "",
                description: prev?.description || "",
              }));
            }}
            placeholder="목표를 입력해주세요."
          />
          {step === 5 && (
            <Button
              onClick={() => {
                setStep(6);
              }}
            >
              확인
            </Button>
          )}
        </div>
      )}
      {step >= 6 && isGoalSession && goal?.title && (
        <Chat
          onChatComplete={() => {
            setStep(7);
          }}
        >
          {`'${goal.title}' 에 대해 설명해 주세요.
            빈 칸을 입력해서 나중에 작성하셔도 괜찮아요.`}
        </Chat>
      )}
      {step >= 7 && isGoalSession && goal?.title && (
        <div className="flex flex-col gap-4 items-end">
          <ChatInput
            value={goal?.description}
            onChange={(e) => {
              setGoal({
                title: goal?.title || "",
                description: e.target.value || "",
              });
            }}
            placeholder="목표에 대해 설명해 주세요."
          />
          {step === 7 && (
            <Button
              onClick={() => {
                setStep(8);
              }}
            >
              확인
            </Button>
          )}
        </div>
      )}
      {step >= 8 && isGoalSession && goal?.title && (
        <Chat
          onChatComplete={() => {
            setStep(9);
          }}
        >
          {`좋아요. 그럼이제 '${goal.title}' 을 달성하기 위한 루틴을 만들러 가볼까요?`}
        </Chat>
      )}
      {step >= 9 && isGoalSession && goal?.title && (
        <Button asChild>
          <Link href="/plans/routine/create">루틴 만들러 가기</Link>
        </Button>
      )}
    </div>
  );
};

export default Onboarding;
