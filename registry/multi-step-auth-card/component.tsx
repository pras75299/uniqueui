"use client";

import React, { useState, useEffect, useRef, useId, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Check, X, ArrowLeft, Loader2, Mail, Lock, Shield, AlertCircle } from "lucide-react";

export type AuthState = "email" | "unregistered" | "first-time" | "create-password" | "password-login" | "otp";

/** All user-visible strings; pass `strings` partial to override for i18n or branding. */
export const MULTI_STEP_AUTH_DEFAULT_STRINGS = {
  email: {
    titleSignIn: "Sign in to your account",
    subtitleSignIn: "Enter your corporate email to continue.",
    titleFirstTime: "Welcome aboard",
    subtitleFirstTime: "Looks like you're new here. Let's get you set up.",
    fieldLabel: "Work Email",
    placeholder: "name@company.com",
    continue: "Continue with Email",
    consentLead: "I agree to the ",
    terms: "Terms of Service",
    and: " and ",
    privacy: "Privacy Policy",
    emptyEmail: "Please enter your email.",
    consentRequired:
      "Please accept the Terms of Service and Privacy Policy to continue.",
    genericError: "Something went wrong. Please try again.",
    invalidLookup: "Something went wrong. Please try again.",
  },
  unregistered: {
    banner: "This email is not registered in our system.",
    retry: "Try a different email",
  },
  firstTime: {
    submit: "Create Password",
    back: "Back to Sign In",
  },
  createPassword: {
    title: "Secure your account",
    newPasswordLabel: "Create Password",
    confirmLabel: "Confirm Password",
    ruleLength: "At least 8 characters",
    ruleNumber: "Contains a number",
    ruleSpecial: "Contains a special character",
    mismatch: "Passwords do not match.",
    submit: "Save and Continue",
  },
  passwordLogin: {
    title: "Welcome back",
    fieldLabel: "Password",
    forgot: "Forgot password?",
    placeholder: "••••••••",
    submit: "Sign In",
  },
  otp: {
    title: "Verify your identity",
    sentPrefix: "We sent a code to ",
    fallbackEmail: "your email",
    legend: "One-time passcode, 6 digits",
    groupLabel: "Enter 6-digit verification code",
    digitLabel: (n: number) => `Digit ${n} of 6`,
    verify: "Verify Code",
    resendWait: "Resend code in ",
    resendSuffix: "s",
    resend: "Resend Code",
    maxResends: "Maximum attempts reached.",
  },
  errors: {
    createPasswordFail: "Could not save password. Please try again.",
    loginIncorrect: "Incorrect password. Please try again.",
    loginFailed: "Sign in failed. Please try again.",
    otpInvalid: "Invalid code. Please try again.",
    otpGeneric: "Something went wrong. Please try again.",
  },
} as const;

export type MultiStepAuthStrings = typeof MULTI_STEP_AUTH_DEFAULT_STRINGS;
export type MultiStepAuthStringsPartial = {
  [K in keyof MultiStepAuthStrings]?: Partial<MultiStepAuthStrings[K]>;
};

function mergeAuthStrings(overrides?: MultiStepAuthStringsPartial): MultiStepAuthStrings {
  if (!overrides) return MULTI_STEP_AUTH_DEFAULT_STRINGS;
  const e = { ...MULTI_STEP_AUTH_DEFAULT_STRINGS.email, ...overrides.email };
  const u = { ...MULTI_STEP_AUTH_DEFAULT_STRINGS.unregistered, ...overrides.unregistered };
  const f = { ...MULTI_STEP_AUTH_DEFAULT_STRINGS.firstTime, ...overrides.firstTime };
  const c = { ...MULTI_STEP_AUTH_DEFAULT_STRINGS.createPassword, ...overrides.createPassword };
  const p = { ...MULTI_STEP_AUTH_DEFAULT_STRINGS.passwordLogin, ...overrides.passwordLogin };
  const o = { ...MULTI_STEP_AUTH_DEFAULT_STRINGS.otp, ...overrides.otp };
  const err = { ...MULTI_STEP_AUTH_DEFAULT_STRINGS.errors, ...overrides.errors };
  return { email: e, unregistered: u, firstTime: f, createPassword: c, passwordLogin: p, otp: o, errors: err };
}

export interface MultiStepAuthCardProps {
  className?: string;
  /** Starting step; updates when this prop changes (e.g. reset from parent). */
  initialState?: AuthState;
  onStateChange?: (state: AuthState) => void;
  onSubmitEmail?: (email: string) => Promise<{ exists: boolean; registered: boolean }>;
  /** Return `false` to show an error and stay on the password step; otherwise OTP follows. */
  onSubmitPassword?: (password: string) => Promise<boolean | void>;
  /** Return `false` to show an error and stay on create-password; otherwise OTP follows. */
  onCreatePassword?: (password: string) => Promise<boolean | void>;
  /** Return `false` to show an invalid-code message; any other result clears loading without changing step. */
  onSubmitOTP?: (otp: string) => Promise<boolean | void>;
  /** Return `false` to abort resend without incrementing the attempt counter. */
  onResendOTP?: () => Promise<boolean | void>;
  /** Override copy for i18n / product branding. */
  strings?: MultiStepAuthStringsPartial;
  /** Seconds before “Resend code” is enabled (default 30). */
  otpResendCooldownSeconds?: number;
  /** Max resend taps before locking (default 3). */
  otpMaxResends?: number;
  /** Simulated delay when using built-in demo paths (no `onSubmitEmail`), ms. */
  demoEmailDelayMs?: number;
  /** Simulated delay after password submit when no API handler, ms. */
  demoPasswordDelayMs?: number;
  /**
   * When true (default), the initial email step shows a terms checkbox and blocks submit until checked.
   * Set false to omit it (e.g. internal or B2B-only flows).
   */
  requireTermsConsent?: boolean;
  /** URL for the Terms of Service consent link (default "#"). */
  termsUrl?: string;
  /** URL for the Privacy Policy consent link (default "#"). */
  privacyUrl?: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  exit: { opacity: 0, y: -6, scale: 0.98, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

const errorAlertClass =
  "bg-red-50 dark:bg-red-500/10 border border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm px-3 py-2 rounded-lg flex items-center gap-2 overflow-hidden";

const consentLinkClass = "underline hover:text-neutral-800 dark:hover:text-neutral-200";
const stepHeaderSpacingClass = "mb-8";
const stepFieldSpacingClass = "space-y-5";
const stepActionSpacingClass = "mt-8";

function AuthErrorAlert({ message }: { message: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          className={errorAlertClass}
        >
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden />
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const backBtnClass =
  "w-10 h-10 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0";

function StepHeader({ onBack, title, detail }: { onBack: () => void; title: string; detail?: React.ReactNode }) {
  return (
    <div className={cn("flex items-center gap-3", stepHeaderSpacingClass)}>
      <button type="button" onClick={onBack} aria-label="Go back" className={backBtnClass}>
        <ArrowLeft className="w-4 h-4" />
      </button>
      {detail !== undefined ? (
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight text-balance">{title}</h2>
          {detail}
        </div>
      ) : (
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight text-balance">{title}</h2>
      )}
    </div>
  );
}

const baseInputClass =
  "w-full py-3 bg-white dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-[border-color,box-shadow,background-color,color] text-sm dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-600";

interface PasswordInputRowProps {
  id: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  show: boolean;
  onToggleShow: () => void;
  autoComplete: string;
  autoFocus?: boolean;
  placeholder?: string;
  leftPadClass?: string;
  rightPadClass?: string;
  error?: boolean;
}

function PasswordInputRow({
  id,
  value,
  onChange,
  disabled,
  show,
  onToggleShow,
  autoComplete,
  autoFocus,
  placeholder,
  leftPadClass = "pl-9 pr-10",
  rightPadClass,
  error,
}: PasswordInputRowProps) {
  const padding = rightPadClass ?? leftPadClass;
  return (
    <div className="relative">
      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" aria-hidden />
      <input
        id={id}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(baseInputClass, padding, error && "border-red-400")}
      />
      <button
        type="button"
        onClick={onToggleShow}
        disabled={disabled}
        aria-disabled={disabled || undefined}
        aria-pressed={show}
        aria-label={show ? "Hide password" : "Show password"}
        className={cn(
          "absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <span className="relative h-4 w-4">
          <motion.span
            className="absolute inset-0 flex items-center justify-center"
            initial={false}
            animate={{
              opacity: show ? 0 : 1,
              scale: show ? 0.25 : 1,
              filter: show ? "blur(4px)" : "blur(0px)",
            }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            aria-hidden
          >
            <Eye className="w-4 h-4" />
          </motion.span>
          <motion.span
            className="absolute inset-0 flex items-center justify-center"
            initial={false}
            animate={{
              opacity: show ? 1 : 0,
              scale: show ? 1 : 0.25,
              filter: show ? "blur(0px)" : "blur(4px)",
            }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            aria-hidden
          >
            <EyeOff className="w-4 h-4" />
          </motion.span>
        </span>
      </button>
    </div>
  );
}

export function MultiStepAuthCard({
  className,
  initialState = "email",
  onStateChange,
  onSubmitEmail,
  onSubmitPassword,
  onCreatePassword,
  onSubmitOTP,
  onResendOTP,
  strings: stringsProp,
  otpResendCooldownSeconds = 30,
  otpMaxResends = 3,
  demoEmailDelayMs = 800,
  demoPasswordDelayMs = 1000,
  requireTermsConsent = true,
  termsUrl = "#",
  privacyUrl = "#",
}: MultiStepAuthCardProps) {
  const str = useMemo(() => mergeAuthStrings(stringsProp), [stringsProp]);
  const [authState, setAuthState] = useState<AuthState>(initialState);
  const [email, setEmail] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [otpErrorText, setOtpErrorText] = useState("");
  const otpReturnRef = useRef<"create-password" | "password-login">("password-login");
  const formId = useId();

  useEffect(() => {
    setAuthState(initialState);
  }, [initialState]);

  const updateState = (s: AuthState) => {
    setAuthState(s);
    setConsentChecked(false);
    setErrorText("");
    setPasswordError("");
    setOtpErrorText("");
    onStateChange?.(s);
  };

  const handleConsentChange = (checked: boolean) => {
    setConsentChecked(checked);
    if (checked && errorText === str.email.consentRequired) setErrorText("");
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorText(str.email.emptyEmail);
      return;
    }
    if (authState === "email" && requireTermsConsent && !consentChecked) {
      setErrorText(str.email.consentRequired);
      return;
    }
    setIsLoading(true);
    setErrorText("");
    try {
      if (onSubmitEmail) {
        const r = await onSubmitEmail(email.trim());
        if (!r || typeof r.exists !== "boolean" || typeof r.registered !== "boolean") {
          setErrorText(str.email.invalidLookup);
          return;
        }
        if (!r.exists) updateState("unregistered");
        else if (!r.registered) updateState("first-time");
        else updateState("password-login");
      } else {
        await new Promise((r) => setTimeout(r, demoEmailDelayMs));
        const em = email.trim().toLowerCase();
        if (em.includes("new")) updateState("first-time");
        else if (em.includes("err")) updateState("unregistered");
        else updateState("password-login");
      }
    } catch {
      setErrorText(str.email.genericError);
    } finally {
      setIsLoading(false);
    }
  };

  const runPasswordThenOtp = async (
    pw: string,
    handler: MultiStepAuthCardProps["onCreatePassword"] | MultiStepAuthCardProps["onSubmitPassword"],
    returnStep: "create-password" | "password-login",
    failMessage: string,
    catchMessage: string,
    demoDelay: number,
  ) => {
    setIsLoading(true);
    setPasswordError("");
    try {
      let ok = true;
      if (handler) ok = (await handler(pw)) !== false;
      else await new Promise((r) => setTimeout(r, demoDelay));
      if (ok) {
        otpReturnRef.current = returnStep;
        updateState("otp");
      } else {
        setPasswordError(failMessage);
      }
    } catch {
      setPasswordError(catchMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const submitOtp = async (otp: string) => {
    setIsLoading(true);
    setOtpErrorText("");
    try {
      let ok = true;
      if (onSubmitOTP) ok = (await onSubmitOTP(otp)) !== false;
      else await new Promise((r) => setTimeout(r, demoPasswordDelayMs));
      if (!ok) setOtpErrorText(str.errors.otpInvalid);
    } catch {
      setOtpErrorText(str.errors.otpGeneric);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("w-full max-w-md mx-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-[0_1px_0_rgba(255,255,255,0.35),0_16px_40px_rgba(2,6,23,0.12)] dark:shadow-[0_1px_0_rgba(255,255,255,0.08),0_18px_42px_rgba(0,0,0,0.32)] overflow-hidden antialiased", className)}>
      <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
      <div className="px-8 py-8 relative min-h-[360px]">
        <AnimatePresence mode="wait" initial={false}>
          {authState === "email" && (
            <motion.div key="email" variants={cardVariants} initial="hidden" animate="visible" exit="exit" className="will-change-transform">
              <EmailStep
                str={str}
                mode="sign-in"
                emailId={`${formId}-email`}
                consentId={`${formId}-consent`}
                termsConsent={
                  requireTermsConsent
                    ? {
                        checked: consentChecked,
                        onChange: handleConsentChange,
                        invalid: errorText === str.email.consentRequired,
                      }
                    : undefined
                }
                email={email}
                setEmail={setEmail}
                onSubmit={handleEmailSubmit}
                isLoading={isLoading}
                error={errorText}
                termsUrl={termsUrl}
                privacyUrl={privacyUrl}
              />
            </motion.div>
          )}
          {authState === "unregistered" && (
            <motion.div key="unreg" variants={cardVariants} initial="hidden" animate="visible" exit="exit" className="will-change-transform">
              <EmailStep
                str={str}
                mode="unregistered"
                emailId={`${formId}-email`}
                email={email}
                setEmail={setEmail}
                onSubmit={handleEmailSubmit}
                isLoading={isLoading}
                error={str.unregistered.banner}
                onRetry={() => {
                  setEmail("");
                  updateState("email");
                }}
              />
            </motion.div>
          )}
          {authState === "first-time" && (
            <motion.div key="first" variants={cardVariants} initial="hidden" animate="visible" exit="exit" className="will-change-transform">
              <EmailStep
                str={str}
                mode="first-time"
                emailId={`${formId}-email`}
                email={email}
                setEmail={setEmail}
                onSubmit={(e) => {
                  e.preventDefault();
                  updateState("create-password");
                }}
                isLoading={isLoading}
                onBack={() => updateState("email")}
              />
            </motion.div>
          )}
          {authState === "create-password" && (
            <motion.div key="create-pw" variants={cardVariants} initial="hidden" animate="visible" exit="exit" className="will-change-transform">
              <CreatePasswordStep
                str={str}
                fieldIds={{ password: `${formId}-create-pw`, confirm: `${formId}-confirm-pw` }}
                onBack={() => updateState("first-time")}
                onSubmit={(pw) =>
                  runPasswordThenOtp(
                    pw,
                    onCreatePassword,
                    "create-password",
                    str.errors.createPasswordFail,
                    str.errors.createPasswordFail,
                    demoPasswordDelayMs,
                  )
                }
                isLoading={isLoading}
                error={passwordError}
                onDismissError={() => setPasswordError("")}
              />
            </motion.div>
          )}
          {authState === "password-login" && (
            <motion.div key="pw-login" variants={cardVariants} initial="hidden" animate="visible" exit="exit" className="will-change-transform">
              <PasswordLoginStep
                str={str}
                passwordId={`${formId}-login-pw`}
                email={email}
                onBack={() => updateState("email")}
                onSubmit={(pw) =>
                  runPasswordThenOtp(
                    pw,
                    onSubmitPassword,
                    "password-login",
                    str.errors.loginIncorrect,
                    str.errors.loginFailed,
                    demoPasswordDelayMs,
                  )
                }
                isLoading={isLoading}
                error={passwordError}
                onDismissError={() => setPasswordError("")}
              />
            </motion.div>
          )}
          {authState === "otp" && (
            <motion.div key="otp" variants={cardVariants} initial="hidden" animate="visible" exit="exit" className="will-change-transform">
              <OTPStep
                str={str}
                formId={formId}
                email={email}
                onBack={() => updateState(otpReturnRef.current)}
                onSubmit={submitOtp}
                onResend={onResendOTP}
                isLoading={isLoading}
                serverError={otpErrorText}
                onClearServerError={() => setOtpErrorText("")}
                resendCooldownSeconds={otpResendCooldownSeconds}
                maxResends={otpMaxResends}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- EmailStep ---
type EmailMode = "sign-in" | "unregistered" | "first-time";

interface EmailStepProps {
  str: MultiStepAuthStrings;
  mode: EmailMode;
  emailId: string;
  /** Used with `termsConsent` for the sign-in step checkbox id. */
  consentId?: string;
  /** Controlled terms checkbox; only the sign-in step passes this when `requireTermsConsent` is true. */
  termsConsent?: { checked: boolean; onChange: (checked: boolean) => void; invalid?: boolean };
  email: string;
  setEmail: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error?: string;
  onBack?: () => void;
  onRetry?: () => void;
  termsUrl?: string;
  privacyUrl?: string;
}

function EmailStep({ str, mode, emailId, consentId, termsConsent, email, setEmail, onSubmit, isLoading, error, onBack, onRetry, termsUrl = "#", privacyUrl = "#" }: EmailStepProps) {
  const isUnregistered = mode === "unregistered";
  const isFirstTime = mode === "first-time";
  const title = isFirstTime ? str.email.titleFirstTime : str.email.titleSignIn;
  const subtitle = isFirstTime ? str.email.subtitleFirstTime : str.email.subtitleSignIn;

  return (
    <form onSubmit={onSubmit} className="flex flex-col">
      <div className={stepHeaderSpacingClass}>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight text-balance">{title}</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5 text-pretty">{subtitle}</p>
      </div>
      <AuthErrorAlert message={error ?? ""} />
      <div className={stepFieldSpacingClass}>
        <div className="space-y-3">
          <label htmlFor={emailId} className="block pb-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {str.email.fieldLabel}
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" aria-hidden />
            <input
              id={emailId}
              type="email"
              autoComplete="email"
              autoFocus
              placeholder={str.email.placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || isUnregistered || isFirstTime}
              className={cn(
                baseInputClass,
                "pl-9 pr-3",
                error && "border-red-400 focus:border-red-400 focus:ring-red-400/20",
                (isLoading || isUnregistered || isFirstTime) && "disabled:opacity-50",
              )}
            />
          </div>
        </div>
        {!isUnregistered && !isFirstTime && termsConsent && consentId && (
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id={consentId}
              checked={termsConsent.checked}
              onChange={(e) => termsConsent.onChange(e.target.checked)}
              required
              aria-invalid={termsConsent.invalid || undefined}
              className={cn(
                "w-4 h-4 shrink-0 rounded border-neutral-300",
                termsConsent.invalid && "border-red-400 ring-1 ring-red-400/30",
              )}
            />
            <label htmlFor={consentId} className="text-xs text-neutral-500 dark:text-neutral-400 leading-snug">
              {str.email.consentLead}
              <a href={termsUrl} className={consentLinkClass}>
                {str.email.terms}
              </a>
              {str.email.and}
              <a href={privacyUrl} className={consentLinkClass}>
                {str.email.privacy}
              </a>
            </label>
          </div>
        )}
      </div>
      <div className={cn(stepActionSpacingClass, "flex flex-col gap-3")}>
        {isUnregistered ? (
          <AuthButton type="button" onClick={onRetry} variant="secondary">
            {str.unregistered.retry}
          </AuthButton>
        ) : isFirstTime ? (
          <>
            <AuthButton type="submit" isLoading={isLoading}>
              {str.firstTime.submit}
            </AuthButton>
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
            >
              {str.firstTime.back}
            </button>
          </>
        ) : (
          <AuthButton type="submit" isLoading={isLoading}>
            {str.email.continue}
          </AuthButton>
        )}
      </div>
    </form>
  );
}

// --- CreatePasswordStep ---
interface CreatePasswordStepProps {
  str: MultiStepAuthStrings;
  fieldIds: { password: string; confirm: string };
  onBack: () => void;
  onSubmit: (pw: string) => void | Promise<void>;
  isLoading: boolean;
  error?: string;
  onDismissError?: () => void;
}

function CreatePasswordStep({ str, fieldIds, onBack, onSubmit, isLoading, error, onDismissError }: CreatePasswordStepProps) {
  const [pw, setPw] = useState("");
  const [cpw, setCpw] = useState("");
  const [show, setShow] = useState(false);
  const rules = useMemo(
    () => [
      { text: str.createPassword.ruleLength, met: pw.length >= 8 },
      { text: str.createPassword.ruleNumber, met: /\d/.test(pw) },
      { text: str.createPassword.ruleSpecial, met: /[^a-zA-Z0-9]/.test(pw) },
    ],
    [pw, str.createPassword],
  );
  const allMet = rules.every((r) => r.met);
  const match = pw.length > 0 && pw === cpw;
  const valid = allMet && match;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) void onSubmit(pw);
      }}
      className="flex flex-col"
    >
      <StepHeader onBack={onBack} title={str.createPassword.title} />
      <AuthErrorAlert message={error ?? ""} />
      <div className={stepFieldSpacingClass}>
        <div className="space-y-3">
          <label htmlFor={fieldIds.password} className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {str.createPassword.newPasswordLabel}
          </label>
          <PasswordInputRow
            id={fieldIds.password}
            value={pw}
            onChange={(v) => {
              onDismissError?.();
              setPw(v);
            }}
            disabled={isLoading}
            show={show}
            onToggleShow={() => setShow((s) => !s)}
            autoComplete="new-password"
            autoFocus
            leftPadClass="pl-9 pr-10"
          />
        </div>
        <div className="space-y-2">
          {rules.map((r, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div
                className={cn(
                  "flex items-center justify-center w-4 h-4 rounded-full transition-colors",
                  r.met ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500",
                )}
              >
                {r.met ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
              </div>
              <span className={cn("transition-colors", r.met ? "text-neutral-700 dark:text-neutral-300" : "text-neutral-400 dark:text-neutral-500")}>{r.text}</span>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <label htmlFor={fieldIds.confirm} className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {str.createPassword.confirmLabel}
          </label>
          <div className="relative">
            <Shield className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" aria-hidden />
            <input
              id={fieldIds.confirm}
              type={show ? "text" : "password"}
              autoComplete="new-password"
              value={cpw}
              onChange={(e) => {
                onDismissError?.();
                setCpw(e.target.value);
              }}
              disabled={isLoading}
              className={cn(baseInputClass, "pl-9 pr-3", cpw && !match && "border-red-400")}
            />
          </div>
          <AnimatePresence>
            {cpw && !match && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-red-500 mt-1"
              >
                {str.createPassword.mismatch}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className={stepActionSpacingClass}>
        <AuthButton type="submit" disabled={!valid} isLoading={isLoading}>
          {str.createPassword.submit}
        </AuthButton>
      </div>
    </form>
  );
}

// --- PasswordLoginStep ---
interface PasswordLoginStepProps {
  str: MultiStepAuthStrings;
  passwordId: string;
  email?: string;
  onBack: () => void;
  onSubmit: (pw: string) => void | Promise<void>;
  isLoading: boolean;
  error?: string;
  onDismissError?: () => void;
}

function PasswordLoginStep({ str, passwordId, email, onBack, onSubmit, isLoading, error, onDismissError }: PasswordLoginStepProps) {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (pw) void onSubmit(pw);
      }}
      className="flex flex-col"
    >
      <StepHeader
        onBack={onBack}
        title={str.passwordLogin.title}
        detail={
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 truncate max-w-48" title={email}>
            {email}
          </p>
        }
      />
      <AuthErrorAlert message={error ?? ""} />
      <div className={stepFieldSpacingClass}>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label htmlFor={passwordId} className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {str.passwordLogin.fieldLabel}
            </label>
            <a
              href="#"
              className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              {str.passwordLogin.forgot}
            </a>
          </div>
          <PasswordInputRow
            id={passwordId}
            value={pw}
            onChange={(v) => {
              onDismissError?.();
              setPw(v);
            }}
            disabled={isLoading}
            show={show}
            onToggleShow={() => setShow((s) => !s)}
            autoComplete="current-password"
            autoFocus
            placeholder={str.passwordLogin.placeholder}
            leftPadClass="pl-9 pr-10"
          />
        </div>
      </div>
      <div className={stepActionSpacingClass}>
        <AuthButton type="submit" disabled={!pw} isLoading={isLoading}>
          {str.passwordLogin.submit}
        </AuthButton>
      </div>
    </form>
  );
}

// --- OTPStep ---
interface OTPStepProps {
  str: MultiStepAuthStrings;
  formId: string;
  email: string;
  onBack: () => void;
  onSubmit: (otp: string) => void | Promise<void>;
  onResend?: () => Promise<boolean | void>;
  isLoading: boolean;
  serverError?: string;
  onClearServerError?: () => void;
  resendCooldownSeconds: number;
  maxResends: number;
}

function OTPStep({
  str,
  formId,
  email,
  onBack,
  onSubmit,
  onResend,
  isLoading,
  serverError,
  onClearServerError,
  resendCooldownSeconds,
  maxResends,
}: OTPStepProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(resendCooldownSeconds);
  const [resendCount, setResendCount] = useState(0);

  useEffect(() => {
    setTimeLeft(resendCooldownSeconds);
  }, [resendCooldownSeconds]);

  useEffect(() => {
    if (timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timeLeft]);

  const applyDigitsFrom = (raw: string, startIndex: number) => {
    const digits = raw.replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    onClearServerError?.();
    setOtp((prev) => {
      const n = [...prev];
      for (let j = 0; j < digits.length && startIndex + j < 6; j++) {
        n[startIndex + j] = digits[j]!;
      }
      queueMicrotask(() => {
        const nextEmpty = n.findIndex((x) => !x);
        (nextEmpty !== -1 ? inputsRef.current[nextEmpty] : inputsRef.current[5])?.focus();
      });
      return n;
    });
  };

  const handleChange = (i: number, v: string) => {
    if (v.length > 1) {
      applyDigitsFrom(v, i);
      return;
    }
    if (v && !/^\d$/.test(v)) return;
    onClearServerError?.();
    setOtp((prev) => {
      const n = [...prev];
      n[i] = v;
      if (v && i < 5) queueMicrotask(() => inputsRef.current[i + 1]?.focus());
      return n;
    });
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      e.preventDefault();
      inputsRef.current[i - 1]?.focus();
      return;
    }
    if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault();
      inputsRef.current[i - 1]?.focus();
    }
    if (e.key === "ArrowRight" && i < 5) {
      e.preventDefault();
      inputsRef.current[i + 1]?.focus();
    }
  };

  const handlePaste = (i: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    applyDigitsFrom(e.clipboardData.getData("text"), i);
  };

  const handleResend = async () => {
    if (resendCount >= maxResends) return;
    try {
      if (onResend) {
        const ok = await onResend();
        if (ok === false) return;
      }
      setOtp(["", "", "", "", "", ""]);
      setTimeLeft(resendCooldownSeconds);
      setResendCount((c) => c + 1);
      onClearServerError?.();
      requestAnimationFrame(() => inputsRef.current[0]?.focus());
    } catch {
      // Do not consume resend attempts on failure
    }
  };

  const otpDetail = (
    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-1">
      {str.otp.sentPrefix}
      <span className="font-medium text-neutral-700 dark:text-neutral-300">{email || str.otp.fallbackEmail}</span>
    </p>
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const c = otp.join("");
        if (c.length === 6) void onSubmit(c);
      }}
      className="flex flex-col"
    >
      <StepHeader onBack={onBack} title={str.otp.title} detail={otpDetail} />
      <fieldset className="border-0 p-0 m-0 min-w-0">
        <legend className="sr-only">{str.otp.legend}</legend>
        <AuthErrorAlert message={serverError ?? ""} />
        <div className="flex justify-between gap-2 my-4" role="group" aria-label={str.otp.groupLabel}>
          {otp.map((d, i) => (
            <input
              key={i}
              id={`${formId}-otp-${i}`}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={d}
              autoFocus={i === 0}
              autoComplete={i === 0 ? "one-time-code" : "off"}
              aria-label={str.otp.digitLabel(i + 1)}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={(e) => handlePaste(i, e)}
              disabled={isLoading}
              className="w-10 sm:w-14 h-14 text-center text-xl sm:text-2xl font-semibold bg-white dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-[border-color,box-shadow,background-color,color] dark:text-neutral-100 placeholder:text-neutral-300 dark:placeholder:text-neutral-600"
              placeholder="‒"
            />
          ))}
        </div>
      </fieldset>
      <div className={cn(stepActionSpacingClass, "flex flex-col gap-4")}>
        <AuthButton type="submit" disabled={otp.join("").length < 6} isLoading={isLoading}>
          {str.otp.verify}
        </AuthButton>
        <div className="text-center text-sm">
          {resendCount >= maxResends ? (
            <span className="text-red-500">{str.otp.maxResends}</span>
          ) : timeLeft > 0 ? (
            <span className="text-neutral-500">
              {str.otp.resendWait}
              <span className="font-medium tabular-nums">
                {timeLeft}
                {str.otp.resendSuffix}
              </span>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => void handleResend()}
              className="text-neutral-700 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 font-medium transition-colors"
            >
              {str.otp.resend}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

// --- AuthButton ---
interface AuthButtonProps {
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary";
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

function AuthButton({ className, variant = "primary", isLoading, disabled, children, ...rest }: AuthButtonProps) {
  const p = variant === "primary";
  const inactive = disabled || isLoading;
  return (
    <motion.button
      whileHover={inactive ? undefined : { scale: 1.01 }}
      whileTap={inactive ? undefined : { scale: 0.96 }}
      disabled={inactive}
      className={cn(
        "relative w-full py-3 rounded-xl font-semibold text-sm transition-[transform,opacity,background-color,box-shadow,color] flex items-center justify-center gap-2 cursor-pointer",
        p
          ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-500/20 dark:shadow-indigo-500/10"
          : "bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 dark:bg-transparent dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800/50",
        (disabled || isLoading) && "opacity-50 cursor-not-allowed",
        className,
      )}
      {...rest}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, width: 0 }}
            animate={{ opacity: 1, scale: 1, width: "auto" }}
            exit={{ opacity: 0, scale: 0.5, width: 0 }}
            className="mr-1"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </motion.button>
  );
}
