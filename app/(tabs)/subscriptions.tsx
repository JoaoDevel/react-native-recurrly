import SubscriptionCard from "@/components/SubscriptionCard";
import { colors } from "@/constants/theme";
import { posthog } from "@/lib/posthog";
import { useSubscriptions } from "@/lib/subscription-context";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function Subscriptions() {
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { subscriptions } = useSubscriptions();

  const filteredSubscriptions = useMemo(() => {
    if (!searchQuery.trim()) {
      return subscriptions;
    }

    const query = searchQuery.toLowerCase();
    return subscriptions.filter(
      (subscription) =>
        subscription.name.toLowerCase().includes(query) ||
        subscription.category?.toLowerCase().includes(query) ||
        subscription.plan?.toLowerCase().includes(query),
    );
  }, [searchQuery, subscriptions]);

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="mb-4 text-2xl font-sans-bold text-primary">
        Subscriptions
      </Text>

      <View className="mb-4 flex-row items-center rounded-lg bg-primary/5 px-3">
        <TextInput
          placeholder="Search subscriptions..."
          placeholderTextColor={colors.primary + "60"}
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 py-3 text-base text-primary"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Text className="text-lg text-primary">×</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => {
              setExpandedSubscriptionId((currentId) => {
                const next = currentId === item.id ? null : item.id;
                if (next !== null) {
                  posthog.capture("subscription_card_expanded", {
                    subscription_id: item.id,
                    subscription_name: item.name,
                  });
                }
                return next;
              });
            }}
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4"></View>}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="mt-4 text-center text-primary">
            {searchQuery.trim()
              ? "No subscriptions match your search."
              : "No subscription yet."}
          </Text>
        }
        contentContainerClassName="pb-10"
      />
    </SafeAreaView>
  );
}
