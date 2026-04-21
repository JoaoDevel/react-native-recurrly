import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import {
  HOME_BALANCE,
  HOME_SUBSCRIPTIONS,
  HOME_USER,
  UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useState } from "react";
import { FlatList, Image, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  return (
    <SafeAreaView className="flex-1  bg-background p-5">
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="mb-2.5 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Image
                  source={images.avatar}
                  className="h-12 w-12 rounded-full"
                />
                <Text className="ml-3 text-xl font-sans-bold text-primary">
                  {HOME_USER.name}
                </Text>
              </View>

              <Image source={icons.add} className="h-6 w-6" />
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

            <ListHeading title="All Subscription" />
          </>
        )}
        data={HOME_SUBSCRIPTIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() =>
              setExpandedSubscriptionId((currentId) =>
                currentId === item.id ? null : item.id,
              )
            }
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4"></View>}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text>No subscription yet.</Text>}
        contentContainerClassName="pb-30"
      />
    </SafeAreaView>
  );
}
