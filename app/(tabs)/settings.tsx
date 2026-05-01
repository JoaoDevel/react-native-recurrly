import { useAuth } from "@clerk/expo";
import { styled } from "nativewind";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function Settings() {
  const { signOut, isLoaded } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setError(null);
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      setError("Could not sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  };

  const disabled = !isLoaded || signingOut;

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="font-sans-extrabold text-3xl text-primary">Settings</Text>
      <Text className="mt-2 font-sans text-base text-primary/70">
        Account and app preferences.
      </Text>

      <View className="mt-10">
        <Text className="mb-3 font-sans-semibold text-lg text-primary">Session</Text>
        <Pressable
          className="items-center rounded-2xl border border-destructive/40 bg-card py-4 disabled:opacity-50"
          disabled={disabled}
          onPress={handleSignOut}
        >
          {signingOut ? (
            <ActivityIndicator color="#dc2626" />
          ) : (
            <Text className="font-sans-bold text-lg text-destructive">Sign out</Text>
          )}
        </Pressable>
        {!!error && (
          <Text className="mt-3 font-sans text-sm text-destructive">{error}</Text>
        )}
      </View>
    </SafeAreaView>
  );
}
