"use client";

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
} from "@routine-flow/ui/components/ui/action-sheet";

export default function ActionSheetPage() {
  return (
    <div>
      <ActionSheet>
        <ActionSheetTrigger asChild>
          <Button variant="outline">Open ActionSheet</Button>
        </ActionSheetTrigger>
        <ActionSheetContent>
          <ActionSheetHeader>
            <ActionSheetTitle>Title</ActionSheetTitle>
            <Button variant="secondary">Label</Button>
            <Button variant="secondary">Label</Button>
          </ActionSheetHeader>
          <ActionSheetFooter>
            <ActionSheetClose asChild>
              <Button variant="secondary">Cancel</Button>
            </ActionSheetClose>
          </ActionSheetFooter>
        </ActionSheetContent>
      </ActionSheet>
    </div>
  );
}
