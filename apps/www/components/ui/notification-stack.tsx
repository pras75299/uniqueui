"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  title: string;
  description?: string;
  type?: NotificationType;
  duration?: number;
}

export interface NotificationStackProps {
  className?: string;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  maxVisible?: number;
}

const typeStyles: Record<NotificationType, string> = {
  success: "border-green-800/50 bg-green-950/80",
  error: "border-red-800/50 bg-red-950/80",
  warning: "border-yellow-800/50 bg-yellow-950/80",
  info: "border-blue-800/50 bg-blue-950/80",
};

const typeIcons: Record<NotificationType, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

const typeIconColors: Record<NotificationType, string> = {
  success: "text-green-400",
  error: "text-red-400",
  warning: "text-yellow-400",
  info: "text-blue-400",
};

const positionStyles: Record<string, string> = {
  "top-right": "top-4 right-4",
  "top-left": "top-4 left-4",
  "bottom-right": "bottom-4 right-4",
  "bottom-left": "bottom-4 left-4",
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      setNotifications((prev) => [...prev, { ...notification, id }]);
      return id;
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return { notifications, addNotification, removeNotification, clearAll };
}

export function NotificationStack({
  className,
  position = "top-right",
  maxVisible = 5,
  notifications,
  onRemove,
}: NotificationStackProps & {
  notifications: Notification[];
  onRemove: (id: string) => void;
}) {
  const visible = notifications.slice(-maxVisible);
  const isBottom = position.startsWith("bottom");

  return (
    <div
      className={cn(
        "fixed z-[100] flex flex-col gap-2 w-[380px] max-w-[calc(100vw-2rem)]",
        positionStyles[position],
        isBottom && "flex-col-reverse",
        className
      )}
    >
      <AnimatePresence mode="popLayout">
        {visible.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={onRemove}
            position={position}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function NotificationItem({
  notification,
  onRemove,
  position,
}: {
  notification: Notification;
  onRemove: (id: string) => void;
  position: string;
}) {
  const { id, title, description, type = "info", duration = 5000 } = notification;
  const [progress, setProgress] = useState(100);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (duration <= 0) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onRemove(id);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [id, duration, onRemove]);

  const isRight = position.includes("right");

  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        x: isRight ? 100 : -100,
        scale: 0.95,
      }}
      animate={{
        opacity: 1,
        x: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        x: isRight ? 100 : -100,
        scale: 0.95,
        transition: { duration: 0.2 },
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
      }}
      className={cn(
        "relative overflow-hidden rounded-lg border backdrop-blur-md p-4 shadow-2xl",
        typeStyles[type]
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn("text-lg mt-0.5 font-bold", typeIconColors[type])}>
          {typeIcons[type]}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">{title}</p>
          {description && (
            <p className="text-xs text-neutral-400 mt-1">{description}</p>
          )}
        </div>
        <button
          onClick={() => onRemove(id)}
          className="flex-shrink-0 text-neutral-500 hover:text-white transition-colors text-sm"
        >
          ✕
        </button>
      </div>

      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-800">
          <motion.div
            className={cn(
              "h-full",
              type === "success" && "bg-green-500",
              type === "error" && "bg-red-500",
              type === "warning" && "bg-yellow-500",
              type === "info" && "bg-blue-500"
            )}
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.05 }}
          />
        </div>
      )}
    </motion.div>
  );
}
