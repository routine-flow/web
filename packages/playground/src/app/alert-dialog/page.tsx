import React from "react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogAction,
} from "@routine-flow/ui/components/ui/alert-dialog";
import { Button } from "@routine-flow/ui/components/ui/button";
import { getUserAgent } from "@/utils/userAgent";

const AlertDialogPage = async () => {
  const ua = await getUserAgent();

  return (
    <div>
      <pre>User Agent Info: {JSON.stringify(ua, null, 2)}</pre>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline">Web Alert Dialog</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AlertDialogPage;
