"use client";

import * as React from "react";
import { Drawer as ActionSheetPrimitive } from "vaul";
import { Squircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { UIConfig } from "@/types";
import { Button } from "./button";
import { InjectProps } from "../lib/inject-props";
import type { VariantProps } from "class-variance-authority";

type ActionSheetProps = React.ComponentProps<
  typeof ActionSheetPrimitive.Root
> & {
  ui?: UIConfig;
  shouldScaleBackground?: boolean;
};

const ActionSheet = ({
  ui = { device: "web" },
  shouldScaleBackground = true,
  children,
  ...props
}: React.PropsWithChildren<ActionSheetProps>) => {
  const InjectedActionSheet = InjectProps(ActionSheetPrimitive.Root, { ui });

  return (
    <InjectedActionSheet
      shouldScaleBackground={shouldScaleBackground}
      {...props}
    >
      {children}
    </InjectedActionSheet>
  );
};
ActionSheet.displayName = "ActionSheet";

const ActionSheetTrigger = ActionSheetPrimitive.Trigger;

const ActionSheetPortal = ActionSheetPrimitive.Portal;

const actionSheetCloseVariants = cva(
  "text-foreground rounded-none text-md font-normal bg-background",
  {
    variants: {
      device: {
        ios: "h-14 shadow-slate-400 text-primary text-xl",
        android:
          "h-[3.25rem] py-0 px-4 justify-start shadow-lg gap-8  text-slate-600",
        web: "",
      },
    },
  }
);

const ActionSheetClose = React.forwardRef<
  React.ElementRef<typeof ActionSheetPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ActionSheetPrimitive.Close> & {
    ui?: UIConfig;
  }
>(({ className, children, ui = { device: "web" }, ...props }, ref) => {
  return (
    <ActionSheetPrimitive.Close asChild ref={ref} {...props}>
      <Button
        className={cn(
          actionSheetCloseVariants({ device: ui.device }),
          className
        )}
        variant="secondary"
      >
        {ui.device === "android" && (
          <X className="w-[0.625rem] h-[0.625rem] text-slate-500" />
        )}
        {children}
      </Button>
    </ActionSheetPrimitive.Close>
  );
});
ActionSheetClose.displayName = ActionSheetPrimitive.Close.displayName;

const ActionSheetOverlay = React.forwardRef<
  React.ElementRef<typeof ActionSheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof ActionSheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <ActionSheetPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/30", className)}
    {...props}
  />
));
ActionSheetOverlay.displayName = ActionSheetPrimitive.Overlay.displayName;

const ActionSheetContent = React.forwardRef<
  React.ElementRef<typeof ActionSheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ActionSheetPrimitive.Content> & {
    ui?: UIConfig;
  }
>(({ className, children, ui = { device: "web" }, ...props }, ref) => (
  <ActionSheetPortal>
    <ActionSheetOverlay />
    <ActionSheetPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "mx-auto w-full",
          ui.device === "ios" && "max-w-sm",
          ui.device === "android" && "max-w-md"
        )}
      >
        {children}
      </div>
    </ActionSheetPrimitive.Content>
  </ActionSheetPortal>
));
ActionSheetContent.displayName = "ActionSheetContent";

const actionSheetHeaderVariants = cva("grid", {
  variants: {
    device: {
      ios: "rounded-lg overflow-hidden mx-4 text-center",
      android: "text-left",
      web: "",
    },
  },
});

const ActionSheetHeader = ({
  ui = { device: "web" },
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { ui?: UIConfig }) => {
  return (
    <div
      className={cn(
        actionSheetHeaderVariants({ device: ui.device }),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
ActionSheetHeader.displayName = "ActionSheetHeader";

const actionSheetFooterVariants = cva("flex flex-col", {
  variants: {
    device: {
      ios: "gap-2 mx-4 mb-4 mt-2 rounded-lg overflow-hidden",
      android: "",
      web: "",
    },
  },
});

const ActionSheetFooter = ({
  ui = { device: "web" },
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { ui?: UIConfig }) => {
  return (
    <div
      className={cn(
        actionSheetFooterVariants({ device: ui.device }),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
ActionSheetFooter.displayName = "ActionSheetFooter";

const actionSheetTitleVariants = cva(
  "w-full inline-flex items-center font-normal px-4 ",
  {
    variants: {
      device: {
        ios: "justify-center py-2 text-xs text-muted-foreground bg-muted h-14",
        android:
          "bg-background text-foreground h-[3.25rem] py-0 shadow-lg gap-8 text-slate-600 text-md",
        web: "",
      },
    },
  }
);

const ActionSheetTitle = React.forwardRef<
  React.ElementRef<typeof ActionSheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ActionSheetPrimitive.Title> & {
    ui?: UIConfig;
  }
>(({ className, ui = { device: "web" }, ...props }, ref) => {
  return (
    <ActionSheetPrimitive.Title
      ref={ref}
      className={cn(actionSheetTitleVariants({ device: ui.device }), className)}
      {...props}
    />
  );
});
ActionSheetTitle.displayName = ActionSheetPrimitive.Title.displayName;

const ActionSheetDescription = React.forwardRef<
  React.ElementRef<typeof ActionSheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ActionSheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ActionSheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
ActionSheetDescription.displayName =
  ActionSheetPrimitive.Description.displayName;

const actionSheetItemVariants = cva(
  "text-foreground rounded-none text-md font-normal",
  {
    variants: {
      device: {
        ios: "h-14 bg-muted text-primary text-xl rounded-none shadow-slate-400",
        android:
          "h-[3.25rem] py-0 bg-background justify-start shadow-lg gap-8 text-slate-600",
        web: "",
      },
      variant: {
        destructive: "text-destructive",
      },
    },
  }
);

const ActionSheetItem = ({
  ui = { device: "web" },
  className,
  children,
  variant,
  ...props
}: React.HTMLAttributes<HTMLButtonElement> & {
  ui?: UIConfig;
  variant?: VariantProps<typeof actionSheetItemVariants>["variant"];
}) => (
  <Button
    variant="secondary"
    className={cn(
      actionSheetItemVariants({ device: ui.device, variant }),
      className
    )}
    {...props}
  >
    {ui.device === "android" && (
      <Squircle
        className="w-[0.625rem] h-[0.625rem] text-slate-500"
        fill="#64748b"
      />
    )}
    {children}
  </Button>
);

ActionSheetItem.displayName = "ActionSheetItem";

export {
  ActionSheet,
  ActionSheetPortal,
  ActionSheetOverlay,
  ActionSheetTrigger,
  ActionSheetClose,
  ActionSheetContent,
  ActionSheetHeader,
  ActionSheetFooter,
  ActionSheetTitle,
  ActionSheetDescription,
  ActionSheetItem,
};
