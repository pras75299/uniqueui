"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Check, X, ArrowLeft, Loader2, Mail, Lock, Shield, AlertCircle } from "lucide-react";

export type AuthState = "email" | "unregistered" | "first-time" | "create-password" | "password-login" | "otp";

export interface MultiStepAuthCardProps {
  className?: string;
  initialState?: AuthState;
  onStateChange?: (state: AuthState) => void;
  onSubmitEmail?: (email: string) => Promise<{ exists: boolean; registered: boolean }>;
  onSubmitPassword?: (password: string) => Promise<boolean>;
  onCreatePassword?: (password: string) => Promise<boolean>;
  onSubmitOTP?: (otp: string) => Promise<boolean>;
  onResendOTP?: () => Promise<boolean>;
}

const cardVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.15 } },
};

export function MultiStepAuthCard({ className, initialState = "email", onStateChange, onSubmitEmail, onSubmitPassword, onCreatePassword, onSubmitOTP, onResendOTP }: MultiStepAuthCardProps) {
  const [authState, setAuthState] = useState<AuthState>(initialState);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const otpReturnRef = useRef<"create-password" | "password-login">("password-login");

  const updateState = (s: AuthState) => { setAuthState(s); setErrorText(""); onStateChange?.(s); };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setErrorText("Please enter your email."); return; }
    setIsLoading(true); setErrorText("");
    try {
      if (onSubmitEmail) {
        const r = await onSubmitEmail(email);
        if (!r.exists) updateState("unregistered");
        else if (!r.registered) updateState("first-time");
        else updateState("password-login");
      } else {
        await new Promise((r) => setTimeout(r, 800));
        if (email.includes("new")) updateState("first-time");
        else if (email.includes("err")) updateState("unregistered");
        else updateState("password-login");
      }
    } finally { setIsLoading(false); }
  };

  return (
    <div className={cn("w-full max-w-md mx-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] overflow-hidden", className)}>
      <div className="p-8 relative min-h-[340px]">
        <AnimatePresence mode="wait">
          {authState === "email" && (
            <motion.div key="email" variants={cardVariants} initial="hidden" animate="visible" exit="exit">
              <EmailStep email={email} setEmail={setEmail} onSubmit={handleEmailSubmit} isLoading={isLoading} error={errorText} />
            </motion.div>
          )}
          {authState === "unregistered" && (
            <motion.div key="unreg" variants={cardVariants} initial="hidden" animate="visible" exit="exit">
              <EmailStep email={email} setEmail={setEmail} onSubmit={handleEmailSubmit} isLoading={isLoading} error="This email is not registered in our system." isUnregistered onRetry={() => { setEmail(""); updateState("email"); }} />
            </motion.div>
          )}
          {authState === "first-time" && (
            <motion.div key="first" variants={cardVariants} initial="hidden" animate="visible" exit="exit">
              <EmailStep email={email} setEmail={setEmail} onSubmit={() => updateState("create-password")} isLoading={isLoading} isFirstTime onBack={() => updateState("email")} />
            </motion.div>
          )}
          {authState === "create-password" && (
            <motion.div key="create-pw" variants={cardVariants} initial="hidden" animate="visible" exit="exit">
              <CreatePasswordStep onBack={() => updateState("first-time")} onSubmit={async (pw: string) => { setIsLoading(true); if (onCreatePassword) await onCreatePassword(pw); else await new Promise((r) => setTimeout(r, 1000)); setIsLoading(false); otpReturnRef.current = "create-password"; updateState("otp"); }} isLoading={isLoading} />
            </motion.div>
          )}
          {authState === "password-login" && (
            <motion.div key="pw-login" variants={cardVariants} initial="hidden" animate="visible" exit="exit">
              <PasswordLoginStep email={email} onBack={() => updateState("email")} onSubmit={async (pw: string) => { setIsLoading(true); if (onSubmitPassword) await onSubmitPassword(pw); else await new Promise((r) => setTimeout(r, 1000)); setIsLoading(false); otpReturnRef.current = "password-login"; updateState("otp"); }} isLoading={isLoading} />
            </motion.div>
          )}
          {authState === "otp" && (
            <motion.div key="otp" variants={cardVariants} initial="hidden" animate="visible" exit="exit">
              <OTPStep email={email} onBack={() => updateState(otpReturnRef.current)} onSubmit={async (otp: string) => { setIsLoading(true); if (onSubmitOTP) await onSubmitOTP(otp); else await new Promise((r) => setTimeout(r, 1000)); setIsLoading(false); }} onResend={onResendOTP} isLoading={isLoading} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- EmailStep ---
interface EmailStepProps { email: string; setEmail: (v: string) => void; onSubmit: (e: React.FormEvent) => void; isLoading: boolean; error?: string; isUnregistered?: boolean; isFirstTime?: boolean; onBack?: () => void; onRetry?: () => void; }

function EmailStep({ email, setEmail, onSubmit, isLoading, error, isUnregistered, isFirstTime, onBack, onRetry }: EmailStepProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">{isFirstTime ? "Welcome aboard" : "Sign in to your account"}</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{isFirstTime ? "Looks like you're new here. Let's get you set up." : "Enter your corporate email to continue."}</p>
      </div>
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0, marginBottom: 0 }} animate={{ opacity: 1, height: "auto", marginBottom: 16 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }} className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm px-3 py-2.5 rounded-xl flex items-center gap-2 overflow-hidden">
            <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="auth-email" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Work Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input id="auth-email" type="email" autoFocus placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading || isUnregistered || isFirstTime} className={cn("w-full pl-9 pr-3 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-white/10 focus:border-neutral-900 dark:focus:border-white outline-none transition-all text-sm disabled:opacity-50 dark:text-neutral-200", error && "border-red-400 focus:border-red-400 focus:ring-red-400/20")} />
          </div>
        </div>
        {!isUnregistered && !isFirstTime && (
          <div className="flex items-start gap-2 pt-2">
            <input type="checkbox" id="auth-consent" className="mt-1 w-4 h-4 rounded border-neutral-300" />
            <label htmlFor="auth-consent" className="text-xs text-neutral-500 dark:text-neutral-400 leading-snug">I agree to the <a href="#" className="underline hover:text-neutral-800 dark:hover:text-neutral-200">Terms of Service</a> and <a href="#" className="underline hover:text-neutral-800 dark:hover:text-neutral-200">Privacy Policy</a></label>
          </div>
        )}
      </div>
      <div className="mt-8 flex flex-col gap-3">
        {isUnregistered ? <AuthButton type="button" onClick={onRetry} variant="secondary">Try a different email</AuthButton>
         : isFirstTime ? (<><AuthButton type="submit" isLoading={isLoading}>Create Password</AuthButton><button type="button" onClick={onBack} className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors">Back to Sign In</button></>)
         : <AuthButton type="submit" isLoading={isLoading}>Continue with Email</AuthButton>}
      </div>
    </form>
  );
}

// --- CreatePasswordStep ---
interface PwStepProps { email?: string; onBack: () => void; onSubmit: (pw: string) => void; isLoading: boolean; }

function CreatePasswordStep({ onBack, onSubmit, isLoading }: PwStepProps) {
  const [pw, setPw] = useState(""); const [cpw, setCpw] = useState(""); const [show, setShow] = useState(false);
  const rules = [{ text: "At least 8 characters", met: pw.length >= 8 }, { text: "Contains a number", met: /\d/.test(pw) }, { text: "Contains a special character", met: /[^a-zA-Z0-9]/.test(pw) }];
  const allMet = rules.every((r) => r.met); const match = pw.length > 0 && pw === cpw; const valid = allMet && match;
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (valid) onSubmit(pw); }} className="flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={onBack} aria-label="Go back" className="p-1 -ml-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">Secure your account</h2>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="auth-create-pw" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Create Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input id="auth-create-pw" type={show ? "text" : "password"} value={pw} autoFocus onChange={(e) => setPw(e.target.value)} disabled={isLoading} className="w-full pl-9 pr-10 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-white/10 focus:border-neutral-900 dark:focus:border-white outline-none transition-all text-sm dark:text-neutral-200" />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
          </div>
        </div>
        <div className="space-y-2">
          {rules.map((r, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div className={cn("flex items-center justify-center w-4 h-4 rounded-full transition-colors", r.met ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500")}>{r.met ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}</div>
              <span className={cn("transition-colors", r.met ? "text-neutral-700 dark:text-neutral-300" : "text-neutral-400 dark:text-neutral-500")}>{r.text}</span>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <label htmlFor="auth-confirm-pw" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Confirm Password</label>
          <div className="relative">
            <Shield className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input id="auth-confirm-pw" type={show ? "text" : "password"} value={cpw} onChange={(e) => setCpw(e.target.value)} disabled={isLoading} className={cn("w-full pl-9 pr-3 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-white/10 focus:border-neutral-900 dark:focus:border-white outline-none transition-all text-sm dark:text-neutral-200", cpw && !match && "border-red-400")} />
          </div>
          <AnimatePresence>{cpw && !match && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-xs text-red-500 mt-1">Passwords do not match.</motion.p>}</AnimatePresence>
        </div>
      </div>
      <div className="mt-8"><AuthButton type="submit" disabled={!valid} isLoading={isLoading}>Save and Continue</AuthButton></div>
    </form>
  );
}

// --- PasswordLoginStep ---
function PasswordLoginStep({ email, onBack, onSubmit, isLoading }: PwStepProps) {
  const [pw, setPw] = useState(""); const [show, setShow] = useState(false);
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (pw) onSubmit(pw); }} className="flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={onBack} aria-label="Go back" className="p-1 -ml-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">Welcome back</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 truncate max-w-48" title={email}>{email}</p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="auth-login-pw" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Password</label>
            <a href="#" className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 transition-colors">Forgot password?</a>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input id="auth-login-pw" type={show ? "text" : "password"} placeholder="••••••••" value={pw} onChange={(e) => setPw(e.target.value)} disabled={isLoading} autoFocus className="w-full pl-9 pr-10 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-white/10 focus:border-neutral-900 dark:focus:border-white outline-none transition-all text-sm dark:text-neutral-200" />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
          </div>
        </div>
      </div>
      <div className="mt-8"><AuthButton type="submit" disabled={!pw} isLoading={isLoading}>Sign In</AuthButton></div>
    </form>
  );
}

// --- OTPStep ---
interface OTPStepProps { email: string; onBack: () => void; onSubmit: (otp: string) => void; onResend?: () => Promise<boolean>; isLoading: boolean; }

function OTPStep({ email, onBack, onSubmit, onResend, isLoading }: OTPStepProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(30); const [resendCount, setResendCount] = useState(0);
  useEffect(() => { if (timeLeft > 0) { const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000); return () => clearTimeout(t); } }, [timeLeft]);

  const handleChange = (i: number, v: string) => {
    if (v.length > 1) { const p = v.replace(/\D/g, "").slice(0, 6).split(""); const n = [...otp]; p.forEach((c, j) => { if (i + j < 6) n[i + j] = c; }); setOtp(n); const ne = n.findIndex((x) => !x); (ne !== -1 ? inputsRef.current[ne] : inputsRef.current[5])?.focus(); return; }
    if (v && !/^\d$/.test(v)) return;
    const n = [...otp]; n[i] = v; setOtp(n); if (v && i < 5) inputsRef.current[i + 1]?.focus();
  };
  const handleKey = (i: number, e: React.KeyboardEvent) => { if (e.key === "Backspace" && !otp[i] && i > 0) inputsRef.current[i - 1]?.focus(); };
  const handleResend = async () => { if (resendCount >= 3) return; if (onResend) await onResend(); setOtp(["","","","","",""]); setTimeLeft(30); setResendCount((c) => c + 1); };

  return (
    <form onSubmit={(e) => { e.preventDefault(); const c = otp.join(""); if (c.length === 6) onSubmit(c); }} className="flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={onBack} aria-label="Go back" className="p-1 -ml-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">Verify your identity</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-1">We sent a code to <span className="font-medium text-neutral-700 dark:text-neutral-300">{email}</span></p>
        </div>
      </div>
      <div className="flex justify-between gap-2 my-4">
        {otp.map((d, i) => (
          <input key={i} ref={(el) => { inputsRef.current[i] = el; }} type="text" inputMode="numeric" maxLength={6} value={d} autoFocus={i === 0} onChange={(e) => handleChange(i, e.target.value)} onKeyDown={(e) => handleKey(i, e)} disabled={isLoading} className="w-11 sm:w-12 h-14 text-center text-xl font-semibold bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-white/10 focus:border-neutral-900 dark:focus:border-white outline-none transition-all dark:text-neutral-100 placeholder:text-neutral-300 dark:placeholder:text-neutral-700" placeholder="‒" />
        ))}
      </div>
      <div className="mt-6 flex flex-col gap-4">
        <AuthButton type="submit" disabled={otp.join("").length < 6} isLoading={isLoading}>Verify Code</AuthButton>
        <div className="text-center text-sm">
          {resendCount >= 3 ? <span className="text-red-500">Maximum attempts reached.</span> : timeLeft > 0 ? <span className="text-neutral-500">Resend code in <span className="font-medium tabular-nums">{timeLeft}s</span></span> : <button type="button" onClick={handleResend} className="text-neutral-700 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 font-medium transition-colors">Resend Code</button>}
        </div>
      </div>
    </form>
  );
}

// --- AuthButton ---
interface AuthButtonProps { type?: "button" | "submit" | "reset"; variant?: "primary" | "secondary"; isLoading?: boolean; disabled?: boolean; onClick?: () => void; children: React.ReactNode; className?: string; }

function AuthButton({ className, variant = "primary", isLoading, disabled, children, ...rest }: AuthButtonProps) {
  const p = variant === "primary";
  return (
    <motion.button whileHover={disabled ? undefined : { scale: 1.01 }} whileTap={disabled ? undefined : { scale: 0.98 }} disabled={disabled || isLoading}
      className={cn("relative w-full py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer", p ? "bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black shadow-sm" : "bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-200 dark:bg-transparent dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-900", (disabled || isLoading) && "opacity-50 cursor-not-allowed", className)} {...rest}>
      <AnimatePresence mode="popLayout" initial={false}>
        {isLoading && <motion.div initial={{ opacity: 0, scale: 0.5, width: 0 }} animate={{ opacity: 1, scale: 1, width: "auto" }} exit={{ opacity: 0, scale: 0.5, width: 0 }} className="mr-1"><Loader2 className="w-4 h-4 animate-spin" /></motion.div>}
      </AnimatePresence>
      {children}
    </motion.button>
  );
}
