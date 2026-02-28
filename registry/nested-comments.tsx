"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "motion/react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

export type Comment = {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  timestamp: string;
  likes: number;
  replies?: Comment[];
};

type NestedCommentsProps = {
  comments: Comment[];
  maxDepth?: number;
  className?: string;
  accentColor?: string;
  onReply?: (commentId: string, content: string) => void;
  onLike?: (commentId: string) => void;
};

// ─── Avatar ──────────────────────────────────────────────────────────────────

function Avatar({
  author,
  avatar,
  size = 36,
}: {
  author: string;
  avatar?: string;
  size?: number;
}) {
  const initials = author
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const colors = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600",
    "from-indigo-500 to-blue-600",
  ];
  const color = colors[author.charCodeAt(0) % colors.length];

  return (
    <div
      className="relative flex-shrink-0 rounded-full overflow-hidden ring-2 ring-white/10"
      style={{ width: size, height: size }}
    >
      {avatar ? (
        <img src={avatar} alt={author} className="w-full h-full object-cover" />
      ) : (
        <div
          className={cn("w-full h-full flex items-center justify-center bg-gradient-to-br", color)}
        >
          <span className="text-white font-semibold" style={{ fontSize: size * 0.35 }}>
            {initials}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Like Button ─────────────────────────────────────────────────────────────

function LikeButton({
  count,
  onLike,
  accentColor,
}: {
  count: number;
  onLike?: () => void;
  accentColor: string;
}) {
  const [liked, setLiked] = useState(false);
  const [displayCount, setDisplayCount] = useState(count);
  const scale = useSpring(1, { stiffness: 600, damping: 15 });

  const handleLike = () => {
    if (liked) return;
    setLiked(true);
    setDisplayCount((c) => c + 1);
    scale.set(1.4);
    setTimeout(() => scale.set(1), 200);
    onLike?.();
  };

  return (
    <button
      onClick={handleLike}
      className={cn(
        "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-all duration-200",
        liked
          ? "text-rose-400 bg-rose-500/10"
          : "text-neutral-500 hover:text-neutral-300 hover:bg-white/5"
      )}
    >
      <motion.span style={{ scale }} className="inline-flex">
        <svg
          viewBox="0 0 24 24"
          fill={liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={2}
          className="w-3.5 h-3.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      </motion.span>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={displayCount}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 8, opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {displayCount}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

// ─── Reply Box ────────────────────────────────────────────────────────────────

function ReplyBox({
  onSubmit,
  onCancel,
  accentColor,
}: {
  onSubmit: (text: string) => void;
  onCancel: () => void;
  accentColor: string;
}) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && text.trim()) {
      onSubmit(text.trim());
    }
    if (e.key === "Escape") onCancel();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scaleY: 0.9 }}
      animate={{ opacity: 1, y: 0, scaleY: 1 }}
      exit={{ opacity: 0, y: -8, scaleY: 0.9 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      style={{ transformOrigin: "top" }}
      className="mt-2 rounded-xl border border-white/10 bg-white/5 overflow-hidden"
    >
      <textarea
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Write a reply… (⌘+Enter to send, Esc to cancel)"
        rows={2}
        className="w-full bg-transparent px-3 pt-3 pb-1 text-sm text-neutral-200 placeholder-neutral-600 resize-none outline-none"
      />
      <div className="flex items-center justify-between px-3 pb-2 gap-2">
        <span className="text-xs text-neutral-600">⌘+Enter to submit</span>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1 text-xs rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => text.trim() && onSubmit(text.trim())}
            disabled={!text.trim()}
            className={cn(
              "px-3 py-1 text-xs rounded-lg font-medium transition-all duration-200",
              text.trim()
                ? "text-white bg-violet-600 hover:bg-violet-500"
                : "text-neutral-600 bg-white/5 cursor-not-allowed"
            )}
          >
            Reply
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Connector Line ───────────────────────────────────────────────────────────

function ConnectorLine({ height }: { height: number }) {
  return (
    <motion.div
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
      style={{ transformOrigin: "top", height }}
      className="absolute left-0 top-0 w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent"
    />
  );
}

// ─── Single Comment ───────────────────────────────────────────────────────────

function CommentNode({
  comment,
  depth,
  maxDepth,
  accentColor,
  onReply,
  onLike,
  isLast,
}: {
  comment: Comment;
  depth: number;
  maxDepth: number;
  accentColor: string;
  onReply?: (id: string, content: string) => void;
  onLike?: (id: string) => void;
  isLast: boolean;
}) {
  const [replying, setReplying] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [localReplies, setLocalReplies] = useState<Comment[]>(comment.replies ?? []);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasReplies = localReplies.length > 0;
  const canReply = depth < maxDepth;
  const avatarSize = depth === 0 ? 36 : 28;

  const handleReply = (content: string) => {
    const newReply: Comment = {
      id: `local-${Date.now()}`,
      author: "You",
      content,
      timestamp: "just now",
      likes: 0,
    };
    setLocalReplies((prev) => [...prev, newReply]);
    setReplying(false);
    setCollapsed(false);
    onReply?.(comment.id, content);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
      ref={containerRef}
      className="relative"
    >
      {/* Main comment row */}
      <div className="flex gap-3">
        {/* Avatar + thread line column */}
        <div className="relative flex flex-col items-center">
          <Avatar author={comment.author} avatar={comment.avatar} size={avatarSize} />
          {/* Vertical thread line */}
          {hasReplies && !collapsed && (
            <div className="flex-1 mt-1.5 w-px bg-gradient-to-b from-white/15 via-white/8 to-transparent min-h-[16px]" />
          )}
        </div>

        {/* Comment body */}
        <div className="flex-1 min-w-0 pb-3">
          {/* Header */}
          <div className="flex items-baseline gap-2 flex-wrap mb-1.5">
            <span className="text-sm font-semibold text-neutral-100">{comment.author}</span>
            <span className="text-xs text-neutral-600">{comment.timestamp}</span>
            {depth > 0 && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: `${accentColor}20`, color: accentColor }}
              >
                reply
              </span>
            )}
          </div>

          {/* Content */}
          <p className="text-sm text-neutral-300 leading-relaxed mb-2">
            {comment.content}
          </p>

          {/* Action bar */}
          <div className="flex items-center gap-1 flex-wrap">
            <LikeButton
              count={comment.likes}
              onLike={() => onLike?.(comment.id)}
              accentColor={accentColor}
            />

            {canReply && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setReplying((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full text-neutral-500 hover:text-neutral-300 hover:bg-white/5 transition-all duration-200"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Reply
              </motion.button>
            )}

            {hasReplies && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setCollapsed((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full text-neutral-500 hover:text-neutral-300 hover:bg-white/5 transition-all duration-200"
              >
                <motion.svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="w-3.5 h-3.5"
                  animate={{ rotate: collapsed ? -90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </motion.svg>
                {collapsed
                  ? `${localReplies.length} repl${localReplies.length === 1 ? "y" : "ies"}`
                  : "Collapse"}
              </motion.button>
            )}
          </div>

          {/* Reply box */}
          <AnimatePresence>
            {replying && (
              <ReplyBox
                onSubmit={handleReply}
                onCancel={() => setReplying(false)}
                accentColor={accentColor}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nested replies */}
      <AnimatePresence>
        {hasReplies && !collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
            className="ml-[18px] pl-5 border-l border-white/10 overflow-hidden"
          >
            {localReplies.map((reply, i) => (
              <CommentNode
                key={reply.id}
                comment={reply}
                depth={depth + 1}
                maxDepth={maxDepth}
                accentColor={accentColor}
                onReply={onReply}
                onLike={onLike}
                isLast={i === localReplies.length - 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export function NestedComments({
  comments,
  maxDepth = 4,
  className,
  accentColor = "#8b5cf6",
  onReply,
  onLike,
}: NestedCommentsProps) {
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const count = localComments.length;

  const handlePost = () => {
    if (!newComment.trim()) return;
    const c: Comment = {
      id: `local-root-${Date.now()}`,
      author: "You",
      content: newComment.trim(),
      timestamp: "just now",
      likes: 0,
    };
    setPosting(true);
    setTimeout(() => {
      setLocalComments((prev) => [c, ...prev]);
      setNewComment("");
      setPosting(false);
    }, 300);
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-neutral-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
        <span className="text-base font-semibold text-neutral-200">
          {count} {count === 1 ? "Comment" : "Comments"}
        </span>
      </div>

      {/* New comment composer */}
      <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost();
          }}
          placeholder="Share your thoughts… (⌘+Enter to post)"
          rows={3}
          className="w-full bg-transparent px-4 pt-4 pb-2 text-sm text-neutral-200 placeholder-neutral-600 resize-none outline-none"
        />
        <div className="flex items-center justify-between px-4 pb-3">
          <span className="text-xs text-neutral-600">{newComment.length > 0 ? `${newComment.length} chars` : "⌘+Enter to post"}</span>
          <motion.button
            whileTap={{ scale: 0.95 }}
            animate={posting ? { scale: [1, 0.97, 1] } : {}}
            onClick={handlePost}
            disabled={!newComment.trim() || posting}
            className={cn(
              "px-4 py-1.5 text-xs rounded-lg font-semibold transition-all duration-200",
              newComment.trim() && !posting
                ? "text-white bg-violet-600 hover:bg-violet-500"
                : "text-neutral-600 bg-white/5 cursor-not-allowed"
            )}
          >
            {posting ? "Posting…" : "Post Comment"}
          </motion.button>
        </div>
      </div>

      {/* Comment list */}
      <motion.div layout className="space-y-1">
        <AnimatePresence initial={false}>
          {localComments.map((comment, i) => (
            <CommentNode
              key={comment.id}
              comment={comment}
              depth={0}
              maxDepth={maxDepth}
              accentColor={accentColor}
              onReply={onReply}
              onLike={onLike}
              isLast={i === localComments.length - 1}
            />
          ))}
        </AnimatePresence>

        {localComments.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-neutral-600 text-sm"
          >
            No comments yet. Be the first to share your thoughts!
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
