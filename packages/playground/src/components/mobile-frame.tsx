import { cn } from "@routine-flow/ui/lib/utils";
import React, { PropsWithChildren } from "react";

interface MobileFrameProps extends PropsWithChildren {
  className?: string;
}

const MobileFrame = ({ className, children }: MobileFrameProps) => {
  return (
    <body className={cn("m-0 max-w-[100svw] min-h-[100svh]", className)}>
      <main className="relative w-[37.5rem] h-full overflow-x-hidden mx-auto">
        {children}
      </main>
    </body>
  );
};

export default MobileFrame;
