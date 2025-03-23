"use client";
import {
  PropsWithChildren,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@routine-flow/ui/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@routine-flow/ui/components/ui/radio-group";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@routine-flow/ui/components/ui/avatar";
import { cn } from "@routine-flow/ui/lib/utils";
import { Input } from "@routine-flow/ui/components/ui/input";

interface ChatProps {
  children: React.ReactNode;
  onChatComplete?: () => void;
}

export const Chat = ({ children, onChatComplete }: ChatProps) => {
  const [visibleText, setVisibleText] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const animationTimeout = useRef<NodeJS.Timeout | null>(null);
  const indexRef = useRef(0);
  const lastTypingTimeRef = useRef(Date.now());
  const hasCompletedRef = useRef(false);

  const allCharacters = useMemo(() => {
    const lines = children
      ?.toString()
      .split("\n")
      .map((line) => line.trim());
    const texts =
      lines?.map((line, index) => `${index ? "\n" : ""}${line}`) || [];
    return texts.join("").split("");
  }, [children]);

  const getNextDelay = (char: string) => {
    const baseSpeed = 30;
    if (char === " ") {
      return baseSpeed + Math.random() * 40;
    } else if (char === "\n") {
      return baseSpeed + Math.random() * 150 + 150;
    } else {
      return baseSpeed + Math.random() * 20;
    }
  };

  const completeAnimation = useCallback(() => {
    if (!hasCompletedRef.current && onChatComplete) {
      hasCompletedRef.current = true;
      onChatComplete();
    }
  }, [onChatComplete]);

  const runAnimation = useCallback(() => {
    if (isComplete) return;

    if (indexRef.current >= allCharacters.length) {
      setIsComplete(true);
      completeAnimation();
      return;
    }

    if (document.visibilityState !== "visible") {
      return;
    }

    const currentChar = allCharacters[indexRef.current];
    const now = Date.now();
    const timeSinceLastType = now - lastTypingTimeRef.current;
    const delay = Math.max(0, getNextDelay(currentChar) - timeSinceLastType);

    animationTimeout.current = setTimeout(() => {
      lastTypingTimeRef.current = Date.now();
      setVisibleText((prev) => prev + currentChar);
      indexRef.current += 1;
      runAnimation();
    }, delay);
  }, [allCharacters, isComplete, completeAnimation]);

  useEffect(() => {
    if (isInitialized) {
      return;
    }

    setIsInitialized(true);

    const startTimerId = setTimeout(() => {
      if (!isComplete) {
        runAnimation();
      }
    }, 1500);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (animationTimeout.current) {
          clearTimeout(animationTimeout.current);
          animationTimeout.current = null;
        }
      } else if (document.visibilityState === "visible") {
        if (!isComplete) {
          runAnimation();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(startTimerId);
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    if (children !== allCharacters.join("") && isInitialized) {
      indexRef.current = 0;
      setVisibleText("");
      setIsComplete(false);
      hasCompletedRef.current = false;
      setIsInitialized(false);

      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current);
        animationTimeout.current = null;
      }
    }
  }, [allCharacters, isInitialized, children]);

  return (
    <div className="flex gap-4">
      <Avatar className="my-2">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>RF</AvatarFallback>
      </Avatar>
      <div className="w-2/3 relative">
        <pre className="w-full rounded-lg bg-gray-50 p-4 font-mono text-sm whitespace-pre-wrap">
          {visibleText}
          {!isComplete && <span className="animate-pulse">|</span>}
        </pre>
      </div>
    </div>
  );
};

export const ChatSending = ({ children }: PropsWithChildren) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-2/3 flex bg-gray-200 rounded-xl p-4"
      >
        <span className={cn("duration-1000", !children && "animate-pulse")}>
          {children || "..."}
        </span>
      </motion.div>
    </AnimatePresence>
  );
};

interface ChatInputProps
  extends PropsWithChildren,
    React.ComponentProps<"input"> {}

export const ChatInput = (props: ChatInputProps) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-2/3 flex bg-gray-200 rounded-xl p-4"
      >
        <Input {...props} />
      </motion.div>
    </AnimatePresence>
  );
};

export const ChatSection = ({ children }: PropsWithChildren) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3,
          },
        },
      }}
      initial="hidden"
      animate="show"
    >
      <RadioGroup className="gap-3">{children}</RadioGroup>
    </motion.div>
  );
};

interface ChatSectionItemProps extends PropsWithChildren {
  value: string;
  id: string;
  onSelected?: (value: string) => void;
}

export const ChatSectionItem = (props: ChatSectionItemProps) => {
  return (
    <motion.div
      className="flex items-center space-x-2"
      variants={{
        hidden: { opacity: 0, x: -20 },
        show: {
          opacity: 1,
          x: 0,
          transition: {
            type: "spring",
            stiffness: 260,
            damping: 20,
          },
        },
      }}
    >
      <RadioGroupItem
        value={props.value}
        id={props.id}
        onClick={() => props.onSelected?.(props.children as string)}
      />
      <Label htmlFor={props.id}>{props.children}</Label>
    </motion.div>
  );
};
