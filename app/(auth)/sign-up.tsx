import {
  toClerkFieldErrors,
  validateCode,
  validateEmail,
  validatePassword,
} from "@/lib/auth";
import { useAuth, useSignUp } from "@clerk/expo";
import { Link, type Href, useRouter } from "expo-router";
import { useMemo, useState } from "react";
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

  const isSubmitting = fetchStatus === "fetching";
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

      await signUp.verifications.sendEmailCode();
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
      const { error } = await signUp.verifications.verifyEmailCode({
        code: verificationCode.trim(),
      });

      if (error) {
        const parsedErrors = toClerkFieldErrors(error);
        setFieldErrors((current) => ({ ...current, ...parsedErrors }));
        setFormError(parsedErrors.form ?? null);
        return;
      }

      if (signUp.status === "complete") {
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
              className="mt-3 items-center rounded-2xl border border-border bg-background py-3"
              onPress={() => signUp.verifications.sendEmailCode()}
            >
              <Text className="font-sans-semibold text-base text-primary">Send new code</Text>
            </Pressable>
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
