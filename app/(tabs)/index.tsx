import { Link } from "expo-router";
import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  return (
    <SafeAreaView className="flex-1  bg-background p-5">
      <Text className="text-xl font-bold text-destructive">
        Welcome to Nativewind!
      </Text>
      <Link href="/onboarding" className="bg-black rounded mt-4 text-white p-4">
        Go to Onboarding
      </Link>

      <Link
        href="/(auth)/sign-up"
        className="bg-black rounded mt-4 text-white p-4"
      >
        Go to Sign Up
      </Link>
      <Link
        href="/(auth)/sign-in"
        className="bg-black rounded mt-4 text-white p-4"
      >
        Go to Sign In
      </Link>

      <Link href="/subscriptions/[id]">Spotify Subscription</Link>
      <Link
        href={{
          pathname: "/subscriptions/[id]",
          params: { id: "claude" },
        }}
      >
        Claude Max Subscription
      </Link>
    </SafeAreaView>
  );
}
