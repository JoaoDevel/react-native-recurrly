import { formatCurrency } from "@/lib/utils";
import { Image, Text, View } from "react-native";

export default function UpcomingSubscriptionCard({
  name,
  price,
  daysLeft,
  icon,
  currency,
}: UpcomingSubscription) {
  return (
    <View className="mr-4 w-44 rounded-2xl border border-black/10 bg-background p-4">
      <View className="flex-row items-center gap-3">
        <Image source={icon} className="h-15 w-15" />

        <View>
          <Text className="text-lg font-sans-bold text-primary">
            {formatCurrency(price, currency)}
          </Text>

          <Text
            className="text-sm font-sans-semibold text-muted-foreground"
            numberOfLines={1}
          >
            {daysLeft > 1 ? `${daysLeft} days left` : `Last day`}
          </Text>
        </View>
      </View>

      <Text className="mt-2 text-lg font-sans-bold text-primary">{name}</Text>
    </View>
  );
}
