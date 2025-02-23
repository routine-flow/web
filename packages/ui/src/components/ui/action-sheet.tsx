"use client";

import * as React from "react";
import { Drawer as ActionSheetPrimitive } from "vaul";

import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { UIConfig } from "@/types";
import { Button } from "./button";

type ActionSheetProps = React.ComponentProps<
  typeof ActionSheetPrimitive.Root
> & {
  shouldScaleBackground?: boolean;
};

const ActionSheet = ({
  shouldScaleBackground = true,
  children,
  ...props
}: React.PropsWithChildren<ActionSheetProps>) => {
  return (
    <ActionSheetPrimitive.Root
      shouldScaleBackground={shouldScaleBackground}
      {...props}
    >
      {children}
    </ActionSheetPrimitive.Root>
  );
};
ActionSheet.displayName = "ActionSheet";

const ActionSheetTrigger = ActionSheetPrimitive.Trigger;

const ActionSheetPortal = ActionSheetPrimitive.Portal;

const actionSheetCloseVariants = cva("", {
  variants: {
    device: {
      ios: "h-14 bg-background text-foreground rounded-none shadow-slate-400 text-md",
      android: "",
      web: "",
    },
  },
});

const ActionSheetClose = React.forwardRef<
  React.ElementRef<typeof ActionSheetPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ActionSheetPrimitive.Close> & {
    ui: UIConfig;
  }
>(({ className, ui = { device: "web" }, ...props }, ref) => {
  return (
    <ActionSheetPrimitive.Close
      ref={ref}
      className={cn(actionSheetCloseVariants({ device: ui.device }), className)}
      {...props}
    />
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
  React.ComponentPropsWithoutRef<typeof ActionSheetPrimitive.Content>
>(({ className, children, ...props }, ref) => (
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
      <div className="mx-auto w-full max-w-sm">{children}</div>
    </ActionSheetPrimitive.Content>
  </ActionSheetPortal>
));
ActionSheetContent.displayName = "ActionSheetContent";

const actionSheetHeaderVariants = cva("", {
  variants: {
    device: {
      ios: "grid rounded-lg overflow-hidden mx-4 text-center sm:text-left ",
      android: "",
      web: "",
    },
  },
});

const ActionSheetHeader = ({
  ui = { device: "web" },
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { ui: UIConfig }) => {
  return (
    <div
      className={cn(
        actionSheetHeaderVariants({ device: ui.device }),
        className
      )}
      {...props}
    />
  );
};
ActionSheetHeader.displayName = "ActionSheetHeader";

const actionSheetFooterVariants = cva("", {
  variants: {
    device: {
      ios: "flex flex-col gap-2 mx-4 mb-4 mt-2 rounded-lg overflow-hidden",
      android: "",
      web: "",
    },
  },
});
const ActionSheetFooter = ({
  ui = { device: "web" },
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { ui: UIConfig }) => (
  <div
    className={cn(actionSheetFooterVariants({ device: ui.device }), className)}
    {...props}
  />
);
ActionSheetFooter.displayName = "ActionSheetFooter";

const actionSheetTitleVariants = cva("", {
  variants: {
    device: {
      ios: "w-full inline-flex items-center justify-center py-2 px-4 text-xs text-muted-foreground leading-4 bg-muted h-14",
      android: "",
      web: "",
    },
  },
});

const ActionSheetTitle = React.forwardRef<
  React.ElementRef<typeof ActionSheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ActionSheetPrimitive.Title> & {
    ui: UIConfig;
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

const actionSheetItemVariants = cva("", {
  variants: {
    device: {
      ios: "h-14 bg-muted text-foreground rounded-none shadow-slate-400 text-md",
      android: "",
      web: "",
    },
  },
});
const ActionSheetItem = ({
  ui = { device: "web" },
  className,
  ...props
}: React.HTMLAttributes<HTMLButtonElement> & { ui: UIConfig }) => (
  <Button
    variant="secondary"
    className={cn(actionSheetItemVariants({ device: ui.device }), className)}
    {...props}
  />
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
