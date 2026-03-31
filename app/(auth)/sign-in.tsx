import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function SignIn() {
  return (
    <View className="flex-1 justify-center items-center">
      <Text>Sign In</Text>
      <Link href="/(auth)/sign-up">Create Account</Link>
      <Link href="/">Go Home</Link>
    </View>
  );
}
