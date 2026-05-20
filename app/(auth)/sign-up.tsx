import {
  toClerkFieldErrors,
  validateCode,
  validateEmail,
  validatePassword,
} from "@/lib/auth";
import { posthog } from "@/lib/posthog";
import { useAuth, useSignUp } from "@clerk/expo";
import { Link, type Href, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

export default function SignUp() {
  const { signUp, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [resendLocked, setResendLocked] = useState(false);
  const resendCooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSubmitting = fetchStatus === "fetching";

  useEffect(() => {
    return () => {
      if (resendCooldownRef.current) clearTimeout(resendCooldownRef.current);
    };
  }, []);

  const waitingForCode =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0;

  const validationErrors = useMemo(
    () => ({
      emailAddress: validateEmail(emailAddress),
      password: validatePassword(password),
      code: validateCode(verificationCode),
    }),
    [emailAddress, password, verificationCode],
  );

  const navigateToApp = async () => {
    await signUp.finalize({
      navigate: ({ decorateUrl }) => {
        const nextUrl = decorateUrl("/(tabs)");
        router.replace(nextUrl as Href);
      },
    });
  };

  const startResendCooldown = (ms: number) => {
    if (resendCooldownRef.current) clearTimeout(resendCooldownRef.current);
    setResendLocked(true);
    resendCooldownRef.current = setTimeout(() => {
      setResendLocked(false);
      resendCooldownRef.current = null;
    }, ms);
  };

  /**
   * Sends the email verification code; handles Clerk API errors and thrown errors.
   * @returns whether the code was sent successfully
   */
  const sendEmailVerificationCode = async (options?: {
    lockResendMs?: number;
  }): Promise<boolean> => {
    try {
      const result = (await signUp.verifications.sendEmailCode()) as
        | { error?: unknown }
        | undefined
        | null;

      if (result && typeof result === "object" && "error" in result && result.error) {
        console.warn("signUp.verifications.sendEmailCode Clerk error", result.error);
        const parsed = toClerkFieldErrors(result.error);
        setFormError(
          parsed.form ??
            "Could not send the verification code. You may be rate-limited—wait a minute and try again.",
        );
        if (options?.lockResendMs) startResendCooldown(options.lockResendMs);
        return false;
      }

      return true;
    } catch (e) {
      console.warn("signUp.verifications.sendEmailCode failed", e);
      setFormError(
        "We could not send the verification email. Wait a moment, then tap \"Send new code\" to try again.",
      );
      if (options?.lockResendMs) startResendCooldown(options.lockResendMs);
      return false;
    }
  };

  const handleCreateAccount = async () => {
    const hasValidationErrors =
      Boolean(validationErrors.emailAddress) || Boolean(validationErrors.password);

    if (hasValidationErrors) {
      setFieldErrors({
        emailAddress: validationErrors.emailAddress ?? "",
        password: validationErrors.password ?? "",
      });
      return;
    }

    setFormError(null);
    setFieldErrors({});

    try {
      const { error } = await signUp.password({
        emailAddress: emailAddress.trim().toLowerCase(),
        password,
      });

      if (error) {
        const parsedErrors = toClerkFieldErrors(error);
        setFieldErrors(parsedErrors);
        setFormError(parsedErrors.form ?? null);
        return;
      }

      posthog.capture("sign_up_started", { email: emailAddress.trim().toLowerCase() });

      const codeSent = await sendEmailVerificationCode();
      if (!codeSent) {
        return;
      }
      posthog.capture("sign_up_email_verification_sent", { email: emailAddress.trim().toLowerCase() });
    } catch {
      setFormError("Could not create your account. Please try again.");
    }
  };

  const handleVerifyCode = async () => {
    const codeError = validationErrors.code;

    if (codeError) {
      setFieldErrors((current) => ({ ...current, code: codeError }));
      return;
    }

    setFormError(null);
    setFieldErrors((current) => ({ ...current, code: "" }));

    try {
      const completeSignUp = await signUp.verifications.verifyEmailCode({
        code: verificationCode.trim(),
      });

      if (completeSignUp.error) {
        const parsedErrors = toClerkFieldErrors(completeSignUp.error);
        setFieldErrors((current) => ({ ...current, ...parsedErrors }));
        setFormError(parsedErrors.form ?? null);
        return;
      }

      // Prefer status from the verify response; typings only expose `error`, but the
      // resource may include `status` immediately after verification.
      const verification = completeSignUp as typeof completeSignUp & { status?: string };
      const statusAfterVerify = verification.status ?? signUp.status;

      if (statusAfterVerify === "complete") {
        posthog.identify(emailAddress.trim().toLowerCase(), {
          $set: { email: emailAddress.trim().toLowerCase() },
          $set_once: { sign_up_date: new Date().toISOString() },
        });
        posthog.capture("sign_up_completed", { email: emailAddress.trim().toLowerCase() });
        await navigateToApp();
      }
    } catch {
      setFormError("Could not verify your code. Please try again.");
    }
  };

  if (isSignedIn || signUp.status === "complete") {
    return null;
  }

  return (
    <View className="flex-1 bg-background px-5 pt-20">
      <View className="mb-8">
        <Text className="font-sans-extrabold text-4xl text-primary">Create account</Text>
        <Text className="mt-2 font-sans text-base text-primary/70">
          Start tracking subscriptions with secure account access.
        </Text>
      </View>

      <View className="rounded-3xl border border-border bg-card p-5">
        {!waitingForCode ? (
          <>
            <Text className="mb-2 font-sans-semibold text-lg text-primary">Email</Text>
            <TextInput
              className="rounded-2xl border border-border bg-background px-4 py-3 font-sans text-base text-primary"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="Enter your email"
              placeholderTextColor="rgba(8,17,38,0.45)"
              value={emailAddress}
              onChangeText={setEmailAddress}
            />
            {!!fieldErrors.emailAddress && (
              <Text className="mt-2 font-sans text-sm text-destructive">
                {fieldErrors.emailAddress}
              </Text>
            )}

            <Text className="mb-2 mt-5 font-sans-semibold text-lg text-primary">Password</Text>
            <TextInput
              className="rounded-2xl border border-border bg-background px-4 py-3 font-sans text-base text-primary"
              secureTextEntry
              placeholder="At least 8 characters"
              placeholderTextColor="rgba(8,17,38,0.45)"
              value={password}
              onChangeText={setPassword}
            />
            {!!fieldErrors.password && (
              <Text className="mt-2 font-sans text-sm text-destructive">{fieldErrors.password}</Text>
            )}

            {!!formError && (
              <Text className="mt-3 font-sans text-sm text-destructive">{formError}</Text>
            )}

            <Pressable
              className="mt-7 items-center rounded-2xl bg-accent py-4 disabled:opacity-50"
              disabled={isSubmitting}
              onPress={handleCreateAccount}
            >
              <Text className="font-sans-bold text-lg text-white">
                {isSubmitting ? "Creating..." : "Create account"}
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text className="font-sans-semibold text-xl text-primary">Verify your email</Text>
            <Text className="mt-2 font-sans text-base text-primary/70">
              Enter the 6-digit code we sent to {emailAddress.trim().toLowerCase()}.
            </Text>

            <TextInput
              className="mt-5 rounded-2xl border border-border bg-background px-4 py-3 font-sans text-base text-primary"
              keyboardType="number-pad"
              placeholder="Enter verification code"
              placeholderTextColor="rgba(8,17,38,0.45)"
              value={verificationCode}
              onChangeText={setVerificationCode}
            />
            {!!fieldErrors.code && (
              <Text className="mt-2 font-sans text-sm text-destructive">{fieldErrors.code}</Text>
            )}
            {!!formError && (
              <Text className="mt-3 font-sans text-sm text-destructive">{formError}</Text>
            )}

            <Pressable
              className="mt-6 items-center rounded-2xl bg-accent py-4 disabled:opacity-50"
              disabled={isSubmitting}
              onPress={handleVerifyCode}
            >
              <Text className="font-sans-bold text-lg text-white">
                {isSubmitting ? "Verifying..." : "Verify code"}
              </Text>
            </Pressable>

            <Pressable
              className="mt-3 items-center rounded-2xl border border-border bg-background py-3 disabled:opacity-50"
              disabled={isSubmitting || resendLocked}
              onPress={async () => {
                setFormError(null);
                await sendEmailVerificationCode({ lockResendMs: 15_000 });
              }}
            >
              <Text className="font-sans-semibold text-base text-primary">
                {resendLocked ? "Wait to resend..." : "Send new code"}
              </Text>
            </Pressable>
            {resendLocked && (
              <Text className="mt-2 font-sans text-center text-sm text-primary/70">
                Too many attempts? Wait a few seconds before requesting another code.
              </Text>
            )}
          </>
        )}

        <View className="mt-5 flex-row items-center justify-center gap-1.5">
          <Text className="font-sans text-base text-primary/75">Already have an account?</Text>
          <Link href="/(auth)/sign-in" asChild>
            <Pressable>
              <Text className="font-sans-bold text-base text-accent">Sign in</Text>
            </Pressable>
          </Link>
        </View>

        <View nativeID="clerk-captcha" />
      </View>
    </View>
  );
}
