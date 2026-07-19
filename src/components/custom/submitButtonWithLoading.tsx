"use client";

import type { FunctionComponent } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubmitButtonWithLoadingProps {
  text: string;
  loadingText?: string;
  className?: string;
}

/** Toont een spinner zolang de omvattende `<form>`'s server action bezig is. */
const SubmitButtonWithLoading: FunctionComponent<SubmitButtonWithLoadingProps> = ({
  text,
  loadingText,
  className,
}) => {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit" className={className}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? (loadingText ?? "Bezig…") : text}
    </Button>
  );
};

export default SubmitButtonWithLoading;
