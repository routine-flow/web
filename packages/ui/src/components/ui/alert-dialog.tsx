"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { cva, VariantProps } from "class-variance-authority";
import { UIConfig } from "@/types";
import { InjectProps } from "../lib/inject-props";

const AlertDialog = ({
  ui = { device: "web" },
  children,
  ...props
}: React.PropsWithChildren<
  AlertDialogPrimitive.AlertDialogProps & { ui?: UIConfig }
>) => {
  const InjectedAlertDialog = InjectProps(AlertDialogPrimitive.Root, { ui });

  return <InjectedAlertDialog {...props}>{children}</InjectedAlertDialog>;
};
AlertDialog.displayName = AlertDialogPrimitive.Root.displayName;

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const alertDialogContentVariants = cva(
  "fixed left-[50%] top-[50%] z-50 grid max-w-lg translate-x-[-50%] translate-y-[-50%] shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
  {
    variants: {
      device: {
        ios: "w-[95%] bg-muted rounded-lg",
        android: "w-full gap-6 border bg-background p-6 pt-5 pb-4 rounded-2xl",
        web: "w-full gap-4 border bg-background p-6 sm:rounded-lg",
      },
    },
  }
);

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> & {
    ui?: UIConfig;
  }
>(({ className, ui = { device: "web" }, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        alertDialogContentVariants({ device: ui.device }),
        ui.device === "ios" && "max-w-sm",
        ui.device === "android" && "max-w-md",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const alertDialogHeaderVariants = cva("flex flex-col space-y-2 text-center", {
  variants: {
    device: {
      ios: "px-2 gap-2 py-4",
      android: "text-left gap-5",
      web: "sm:text-left",
    },
  },
});

const AlertDialogHeader = ({
  className,
  ui = { device: "web" },
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { ui?: UIConfig }) => (
  <div
    className={cn(
      "",
      alertDialogHeaderVariants({ device: ui.device }),
      className
    )}
    {...props}
  />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const alertDialogFooterVariants = cva("flex", {
  variants: {
    variant: {
      horizontal: "",
      vertical: "",
    },
    device: {
      ios: "",
      android: "gap-2 flex-col flex-row justify-end",
      web: "gap-2 flex-col sm:flex-row sm:justify-end",
    },
  },
  compoundVariants: [
    {
      variant: "horizontal",
      device: "ios",
      className:
        "[&>button]:border-r [&>button]:border-r-slate-200 last:[&>button]:border-r-0",
    },
    {
      variant: "vertical",
      device: "ios",
      className: "flex-col",
    },
  ],
});

const AlertDialogFooter = ({
  className,
  ui = { device: "web" },
  variant = "vertical",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  ui?: UIConfig;
  variant?: VariantProps<typeof alertDialogFooterVariants>["variant"];
}) => (
  <div
    className={cn(
      alertDialogFooterVariants({ device: ui.device, variant }),
      className
    )}
    {...props}
  />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const alertDialogTitleVariants = cva("", {
  variants: {
    device: {
      ios: "text-[1.0625rem] font-medium",
      android: "text-[1.25rem] font-medium",
      web: "text-lg font-semibold",
    },
  },
});

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title> & {
    ui?: UIConfig;
  }
>(({ className, ui = { device: "web" }, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn(alertDialogTitleVariants({ device: ui.device }), className)}
    {...props}
  />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const alertDialogDescriptionVariants = cva("text-sm", {
  variants: {
    device: {
      ios: "text-foreground !mt-0",
      android: "text-foreground leading-5 !mt-0",
      web: "text-muted-foreground",
    },
  },
});

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description> & {
    ui?: UIConfig;
  }
>(({ className, ui = { device: "web" }, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn(
      alertDialogDescriptionVariants({ device: ui.device }),
      className
    )}
    {...props}
  />
));
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName;

const alertDialogActionVariants = cva("", {
  variants: {
    device: {
      ios: "text-primary border-t border-slate-200 rounded-none h-11 w-full font-medium",
      android: "text-primary font-medium px-3",
      web: "",
    },
  },
});

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action> & {
    ui?: UIConfig;
  }
>(({ className, ui = { device: "web" }, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(
      buttonVariants({ variant: ui.device === "web" ? "default" : "ghost" }),
      alertDialogActionVariants({ device: ui.device }),
      className
    )}
    {...props}
  />
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

const alertDialogCancelVariants = cva("", {
  variants: {
    device: {
      ios: "text-primary border-t border-slate-200 rounded-none h-11 w-full font-normal",
      android: "text-primary font-normal px-3",
      web: "",
    },
  },
});

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel> & {
    ui?: UIConfig;
  }
>(({ className, ui = { device: "web" }, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      buttonVariants({ variant: ui.device === "web" ? "outline" : "ghost" }),
      alertDialogCancelVariants({ device: ui.device }),
      "",
      className
    )}
    {...props}
  />
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
