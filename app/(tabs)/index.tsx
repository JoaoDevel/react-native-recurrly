import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
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
    </View>
  );
}
