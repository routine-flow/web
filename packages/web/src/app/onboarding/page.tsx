import { Chat, ChatSending } from "@/components/shared/chat/components";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@routine-flow/ui/components/ui/avatar";
import { Label } from "@routine-flow/ui/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@routine-flow/ui/components/ui/radio-group";
import React from "react";

const Onboarding = () => {
  return (
    <div className="w-full flex flex-col gap-4 py-8">
      <div className="flex gap-4">
        <Avatar className="my-2">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>RF</AvatarFallback>
        </Avatar>
        <Chat>
          {`안녕하세요.
            당신의 목표 달성을 도와드릴 루플 입니다.
            그동안 이루고 싶었던 당신만의 큰 목표가 있었나요?`}
        </Chat>
      </div>
      <div className="flex flex-col gap-4 items-end">
        <ChatSending />
        <div className="w-2/3 flex pl-3">
          <RadioGroup className="gap-3">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="default" id="r1" />
              <Label htmlFor="r1">응! 난 장기적인 목표가 있지 :)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="comfortable" id="r2" />
              <Label htmlFor="r2">그렇긴 한데, 그건 왜 묻는거야?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="compact" id="r3" />
              <Label htmlFor="r3">난 그냥 이 앱이 궁금해서 왔어.</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
