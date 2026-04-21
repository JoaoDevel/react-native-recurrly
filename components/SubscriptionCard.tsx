import {
  formatCurrency,
  formatStatusLabel,
  formatSubscriptionDateTime,
} from "@/lib/utils";

import clsx from "clsx";
import { Image, Pressable, Text, View } from "react-native";

export default function SubscriptionCard({
  name,
  price,
  currency,
  icon,
  billing,
  color,
  category,
  plan,
  renewalDate,
  onPress,
  expanded,
  paymentMethod,
  startDate,
  status,
}: SubscriptionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={clsx(
        `rounded-2xl border border-border p-4 bg-card `,
        expanded ? "bg-subscription" : "bg-card",
      )}
      style={!expanded && color ? { backgroundColor: color } : undefined}
    >
      <View className="flex-row items-center py-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-3">
          <Image source={icon} className="w-11 h-11 rounded-lg" />

          <View className="min-w-0 flex-1">
            <Text
              numberOfLines={1}
              className="mb-1 text-lg font-sans-bold text-primary"
            >
              {name}
            </Text>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              className="text-sm font-sans-semibold text-muted-foreground"
            >
              {category?.trim() ||
                plan?.trim() ||
                (renewalDate ? formatSubscriptionDateTime(renewalDate) : "")}
            </Text>
          </View>
        </View>

        <View className="ml-3 shrink-0 items-end">
          <Text className="mb-1 text-lg font-sans-bold text-primary">
            {formatCurrency(price, currency)}
          </Text>
          <Text className="text-sm font-sans-medium text-muted-foreground">
            {billing}
          </Text>
        </View>
      </View>

      {expanded && (
        <View className="mt-6 gap-4">
          <View className="gap-6">
            <View className="flex-row items-center justify-between gap-3">
              <View className="min-w-0 flex-1 flex-row items-center gap-2">
                <Text className="shrink-0 text-base font-sans-medium text-muted-foreground">
                  Payment:
                </Text>
                <Text className="flex-1 font-sans-bold text-primary">
                  {paymentMethod?.trim()}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between gap-3">
              <View className="min-w-0 flex-1 flex-row items-center gap-2">
                <Text className="shrink-0 text-base font-sans-medium text-muted-foreground">
                  Category:
                </Text>
                <Text className="flex-1 font-sans-bold text-primary">
                  {category?.trim()}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between gap-3">
              <View className="min-w-0 flex-1 flex-row items-center gap-2">
                <Text className="shrink-0 text-base font-sans-medium text-muted-foreground">
                  Started:
                </Text>
                <Text className="flex-1 font-sans-bold text-primary">
                  {startDate ? formatSubscriptionDateTime(startDate) : ""}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between gap-3">
              <View className="min-w-0 flex-1 flex-row items-center gap-2">
                <Text className="shrink-0 text-base font-sans-medium text-muted-foreground">
                  Renewal date:
                </Text>
                <Text className="flex-1 font-sans-bold text-primary">
                  {renewalDate ? formatSubscriptionDateTime(renewalDate) : ""}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between gap-3">
              <View className="min-w-0 flex-1 flex-row items-center gap-2">
                <Text className="shrink-0 text-base font-sans-medium text-muted-foreground">
                  Status:
                </Text>
                <Text className="flex-1 font-sans-bold text-primary">
                  {status ? formatStatusLabel(status) : ""}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
}
