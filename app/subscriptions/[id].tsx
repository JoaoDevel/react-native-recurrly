import { posthog } from "@/lib/posthog";
import { Link, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function SubscriptionDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    posthog.capture("subscription_details_viewed", { subscription_id: id });
  }, [id]);

  return (
    <View>
      <Text>SubscriptionDetails : {id}</Text>
      <Link href="/">Go back</Link>
    </View>
  );
}
