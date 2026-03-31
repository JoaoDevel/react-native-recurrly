import { Link, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function SubscriptionDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View>
      <Text>SubscriptionDetails : {id}</Text>
      <Link href="/">Go back</Link>
    </View>
  );
}
