import CreateSubscriptionModal, {
  type NewSubscription,
} from "@/components/CreateSubscriptionModal";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { HOME_BALANCE, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import { colors } from "@/constants/theme";
import { posthog } from "@/lib/posthog";
import { useSubscriptions } from "@/lib/subscription-context";
import { formatCurrency } from "@/lib/utils";
import { useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

function displayNameFromUser(
  user: NonNullable<ReturnType<typeof useUser>["user"]>,
): string {
  const combined = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return (
    user.fullName ||
    combined ||
    user.username ||
    user.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Usuario"
  );
}

function initialsFromDisplayName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  const single = parts[0];
  if (single && single.length >= 2) return single.slice(0, 2).toUpperCase();
  if (single) return single[0]!.toUpperCase();
  return "?";
}

export default function App() {
  const { user, isLoaded } = useUser();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { subscriptions, addSubscription } = useSubscriptions();

  const displayName = useMemo(
    () => (user ? displayNameFromUser(user) : ""),
    [user],
  );

  const avatarInitials = useMemo(
    () => initialsFromDisplayName(displayName),
    [displayName],
  );

  const handleAddSubscription = (newSubscription: NewSubscription) => {
    addSubscription(newSubscription as unknown as Subscription);
    posthog.capture("subscription_created", {
      subscription_name: newSubscription.name,
      category: newSubscription.category,
      frequency: newSubscription.frequency,
    });
  };

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
    <SafeAreaView className="flex-1  bg-background p-5">
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="mb-2.5 flex-row items-center justify-between gap-3">
              <View className="min-w-0 flex-1 flex-row items-center">
                {!isLoaded || !user ? (
                  <>
                    <View className="h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <ActivityIndicator size="small" color={colors.accent} />
                    </View>
                    <View className="ml-3 h-7 flex-1 max-w-[70%] rounded-md bg-primary/10" />
                  </>
                ) : (
                  <>
                    {user.imageUrl ? (
                      <Image
                        source={{ uri: user.imageUrl }}
                        className="h-12 w-12 rounded-full"
                      />
                    ) : (
                      <View className="h-12 w-12 items-center justify-center rounded-full bg-accent/25">
                        <Text className="text-base font-sans-bold text-accent">
                          {avatarInitials}
                        </Text>
                      </View>
                    )}
                    <Text
                      className="ml-3 flex-1 text-xl font-sans-bold text-primary"
                      numberOfLines={1}
                    >
                      {displayName}
                    </Text>
                  </>
                )}
              </View>

              <Pressable
                onPress={() => {
                  setIsModalOpen(true);
                  posthog.capture("add_subscription_tapped");
                }}
              >
                <Image source={icons.add} className="h-6 w-6 shrink-0" />
              </Pressable>
            </View>

            <View className="my-2.5 min-h-50 justify-between rounded-bl-4xl rounded-tr-4xl bg-accent p-6">
              <Text className="text-xl font-sans-semibold text-white/80">
                Balance
              </Text>

              <View className="flex-row items-center justify-between">
                <Text className="text-4xl font-sans-extrabold text-white">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>

                <Text className="text-lg font-sans-medium text-white">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format("MMM/DD")}
                </Text>
              </View>
            </View>

            <View>
              <ListHeading title="Upcoming" />
              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard {...item} />
                )}
                keyExtractor={(item) => item.id}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={<Text>No upcoming rewals yet</Text>}
              />
            </View>

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

            <ListHeading
              title={`All Subscriptions ${filteredSubscriptions.length > 0 ? `(${filteredSubscriptions.length})` : ""}`}
            />
          </>
        )}
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
        contentContainerClassName="pb-30"
      />

      <CreateSubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddSubscription}
      />
    </SafeAreaView>
  );
}
