import { Text, TouchableOpacity, View } from "react-native";

export default function ListHeading({ title }: ListHeadingProps) {
  return (
    <View className="my-3.5 flex-row items-center justify-between">
      <Text className="text-2xl font-sans-bold text-primary">{title}</Text>

      <TouchableOpacity className="rounded-full border border-black/20 px-4 py-1">
        <Text className="text-lg font-sans-semibold text-primary">
          View All
        </Text>
      </TouchableOpacity>
    </View>
  );
}
