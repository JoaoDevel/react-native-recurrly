import { toClerkFieldErrors, validateEmail, validatePassword } from "@/lib/auth";
import { useSignIn } from "@clerk/expo";
import { Link, type Href, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

export default function SignIn() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isSubmitting = fetchStatus === "fetching";
  const isDisabled = isSubmitting || !emailAddress.trim() || !password;

  const validationErrors = useMemo(
    () => ({
      emailAddress: validateEmail(emailAddress),
      password: validatePassword(password),
    }),
    [emailAddress, password],
  );

  const handleSignIn = async () => {
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
      const { error } = await signIn.password({
        emailAddress: emailAddress.trim().toLowerCase(),
        password,
      });

      if (error) {
        const parsedErrors = toClerkFieldErrors(error);
        setFieldErrors(parsedErrors);
        setFormError(parsedErrors.form ?? null);
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ decorateUrl }) => {
            const nextUrl = decorateUrl("/(tabs)");
            router.replace(nextUrl as Href);
          },
        });
      }
    } catch {
      setFormError("Could not sign in. Please try again.");
    }
  };

  return (
    <View className="flex-1 bg-background px-5 pt-24">
      <View className="mb-10">
        <Text className="font-sans-extrabold text-4xl text-primary">Recurly</Text>
        <Text className="mt-2 font-sans text-base text-primary/70">Smart billing</Text>
      </View>

      <View className="mb-8">
        <Text className="font-sans-bold text-4xl text-primary">Welcome back</Text>
        <Text className="mt-2 font-sans text-base text-primary/70">
          Sign in to continue managing your subscriptions.
        </Text>
      </View>

      <View className="rounded-3xl border border-border bg-card p-5">
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
          <Text className="mt-2 font-sans text-sm text-destructive">{fieldErrors.emailAddress}</Text>
        )}

        <Text className="mb-2 mt-5 font-sans-semibold text-lg text-primary">Password</Text>
        <TextInput
          className="rounded-2xl border border-border bg-background px-4 py-3 font-sans text-base text-primary"
          secureTextEntry
          placeholder="Enter your password"
          placeholderTextColor="rgba(8,17,38,0.45)"
          value={password}
          onChangeText={setPassword}
        />
        {!!fieldErrors.password && (
          <Text className="mt-2 font-sans text-sm text-destructive">{fieldErrors.password}</Text>
        )}

        {!!formError && <Text className="mt-3 font-sans text-sm text-destructive">{formError}</Text>}

        <Pressable
          className="mt-7 items-center rounded-2xl bg-accent py-4 disabled:opacity-50"
          disabled={isDisabled}
          onPress={handleSignIn}
        >
          <Text className="font-sans-bold text-lg text-white">
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Text>
        </Pressable>

        <View className="mt-5 flex-row items-center justify-center gap-1.5">
          <Text className="font-sans text-base text-primary/75">New to Recurly?</Text>
          <Link href="/(auth)/sign-up" asChild>
            <Pressable>
              <Text className="font-sans-bold text-base text-accent">Create an account</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}
