"use client";

import * as React from "react";
import { Drawer as ActionSheetPrimitive } from "vaul";

import { cn } from "@/lib/utils";

const ActionSheet = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof ActionSheetPrimitive.Root>) => (
  <ActionSheetPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  />
);
ActionSheet.displayName = "ActionSheet";

const ActionSheetTrigger = ActionSheetPrimitive.Trigger;

const ActionSheetPortal = ActionSheetPrimitive.Portal;

const ActionSheetClose = ActionSheetPrimitive.Close;

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

const ActionSheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "grid rounded-lg overflow-hidden mx-4 text-center sm:text-left [&>button]:h-14 [&>button]:bg-muted [&>button]:text-foreground [&>button]:rounded-none [&>button]:shadow-slate-400 [&>button]:text-md",
      className
    )}
    {...props}
  />
);
ActionSheetHeader.displayName = "ActionSheetHeader";

const ActionSheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col gap-2 mx-4 mb-4 mt-2 rounded-lg overflow-hidden [&>button]:h-14 [&>button]:bg-background [&>button]:text-foreground [&>button]:rounded-none [&>button]:shadow-slate-400 [&>button]:text-md",
      className
    )}
    {...props}
  />
);
ActionSheetFooter.displayName = "ActionSheetFooter";

const ActionSheetTitle = React.forwardRef<
  React.ElementRef<typeof ActionSheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ActionSheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ActionSheetPrimitive.Title
    ref={ref}
    className={cn(
      "w-full inline-flex items-center justify-center py-2 px-4 text-xs text-muted-foreground leading-4 bg-muted h-14",
      className
    )}
    {...props}
  />
));
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
};
