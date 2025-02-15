import { cn } from "@routine-flow/ui/lib/utils";
import React, { PropsWithChildren } from "react";

interface MobileFrameProps extends PropsWithChildren {
  className?: string;
}

const MobileFrame = ({ className, children }: MobileFrameProps) => {
  return (
    <body
      className={cn(
        "relative my-0 mx-auto w-full max-w-xl min-h-screen",
        className
      )}
    >
      <main className="w-full h-full">{children}</main>
    </body>
  );
};

export default MobileFrame;
