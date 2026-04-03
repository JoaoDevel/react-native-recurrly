import { Link } from "expo-router";
import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  return (
    <SafeAreaView className="flex-1  bg-background p-5">
      <Text className="text-5xl font-sans-extrabold">Home</Text>
      <Link
        href="/onboarding"
        className="bg-black rounded mt-4 text-white p-4 font-sans-bold"
      >
        Go to Onboarding
      </Link>

      <Link
        href="/(auth)/sign-up"
        className="bg-black rounded mt-4 text-white p-4 font-sans-bold"
      >
        Go to Sign Up
      </Link>
      <Link
        href="/(auth)/sign-in"
        className="bg-black rounded mt-4 text-white p-4 font-sans-bold"
      >
        Go to Sign In
      </Link>
    </SafeAreaView>
  );
}
