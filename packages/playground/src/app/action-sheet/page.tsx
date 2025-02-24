import React from "react";
import { Button } from "@routine-flow/ui/components/ui/button";
import {
  ActionSheet,
  ActionSheetContent,
  ActionSheetFooter,
  ActionSheetHeader,
  ActionSheetTitle,
  ActionSheetTrigger,
  ActionSheetClose,
  ActionSheetItem,
} from "@routine-flow/ui/components/ui/action-sheet";
import { osToDeviceVariant, getUserAgent } from "@/utils/userAgent";

export default async function ActionSheetPage() {
  const ua = await getUserAgent();

  return (
    <div>
      <pre>{JSON.stringify(ua, null, 2)}</pre>
      <ActionSheet>
        <ActionSheetTrigger asChild>
          <Button variant="outline">Open ActionSheet</Button>
        </ActionSheetTrigger>
        <ActionSheetContent>
          <ActionSheetHeader ui={{ device: osToDeviceVariant(ua.os) }}>
            <ActionSheetTitle ui={{ device: osToDeviceVariant(ua.os) }}>
              Title
            </ActionSheetTitle>
            <Button variant="secondary">Label</Button>
            <Button variant="secondary">Label</Button>
          </ActionSheetHeader>
          <ActionSheetFooter ui={{ device: osToDeviceVariant(ua.os) }}>
            <ActionSheetClose ui={{ device: osToDeviceVariant(ua.os) }}>
              Cancel
            </ActionSheetClose>
          </ActionSheetFooter>
        </ActionSheetContent>
      </ActionSheet>

      <ActionSheet ui={{ device: "ios" }}>
        <ActionSheetTrigger asChild>
          <Button variant="outline">Open ActionSheet</Button>
        </ActionSheetTrigger>
        <ActionSheetContent>
          <ActionSheetHeader>
            <ActionSheetTitle>Title</ActionSheetTitle>
            <ActionSheetItem>Label</ActionSheetItem>
            <ActionSheetItem>Label</ActionSheetItem>
          </ActionSheetHeader>
          <ActionSheetFooter>
            <ActionSheetClose>Cancel</ActionSheetClose>
          </ActionSheetFooter>
        </ActionSheetContent>
      </ActionSheet>
    </div>
  );
}
