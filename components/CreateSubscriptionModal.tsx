import { icons } from "@/constants/icons";
import clsx from "clsx";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export type Frequency = "Monthly" | "Yearly";

const CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: "#ff6b6b",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#f5c542",
  Productivity: "#a8e6cf",
  Cloud: "#dda0dd",
  Music: "#87ceeb",
  Other: "#d3d3d3",
};

export interface CreateSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (subscription: NewSubscription) => void;
}

export interface NewSubscription {
  id: string;
  name: string;
  price: number;
  currency: string;
  frequency: Frequency;
  category: string;
  status: "active" | "paused" | "cancelled";
  startDate: string;
  renewalDate: string;
  icon: any;
  billing: string;
  color: string;
  plan: string;
  paymentMethod: string;
}

export default function CreateSubscriptionModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateSubscriptionModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("Monthly");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>(
    CATEGORIES[0],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = useMemo(() => {
    const nameValid = name.trim().length > 0;
    const priceValid = !isNaN(parseFloat(price)) && parseFloat(price) > 0;
    return nameValid && priceValid;
  }, [name, price]);

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Subscription name is required";
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = "Price must be a positive number";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const now = dayjs();
      const startDate = now.toISOString();
      const renewalDate = now
        .add(
          frequency === "Monthly" ? 1 : 12,
          frequency === "Monthly" ? "month" : "year",
        )
        .toISOString();

      const newSubscription: NewSubscription = {
        id: `subscription-${Date.now()}`,
        name: name.trim(),
        price: parseFloat(price),
        currency: "USD",
        frequency,
        category,
        status: "active",
        startDate,
        renewalDate,
        icon: icons.wallet,
        billing: frequency,
        color: CATEGORY_COLORS[category] || CATEGORY_COLORS.Other,
        plan: frequency === "Monthly" ? "Monthly Plan" : "Yearly Plan",
        paymentMethod: "Credit Card",
      };

      onSubmit(newSubscription);
      resetForm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory(CATEGORIES[0]);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-black/30"
      >
        <View className="flex-1 justify-end">
          <View className="rounded-t-3xl bg-background px-5 pb-8 pt-6">
            {/* Header */}
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-2xl font-sans-bold text-primary">
                New Subscription
              </Text>
              <Pressable onPress={handleClose}>
                <Text className="text-2xl text-primary">✕</Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              className="max-h-96"
            >
              {/* Name Input */}
              <View className="mb-5">
                <Text className="mb-2 font-sans-semibold text-lg text-primary">
                  Name
                </Text>
                <TextInput
                  className="rounded-2xl border border-border bg-card px-4 py-3 font-sans text-base text-primary"
                  placeholder="Enter subscription name"
                  placeholderTextColor="rgba(8,17,38,0.45)"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (text.trim()) setErrors({ ...errors, name: "" });
                  }}
                />
                {errors.name && (
                  <Text className="mt-2 font-sans text-sm text-destructive">
                    {errors.name}
                  </Text>
                )}
              </View>

              {/* Price Input */}
              <View className="mb-5">
                <Text className="mb-2 font-sans-semibold text-lg text-primary">
                  Price
                </Text>
                <TextInput
                  className="rounded-2xl border border-border bg-card px-4 py-3 font-sans text-base text-primary"
                  placeholder="0.00"
                  placeholderTextColor="rgba(8,17,38,0.45)"
                  keyboardType="decimal-pad"
                  value={price}
                  onChangeText={(text) => {
                    setPrice(text);
                    if (
                      text &&
                      !isNaN(parseFloat(text)) &&
                      parseFloat(text) > 0
                    )
                      setErrors({ ...errors, price: "" });
                  }}
                />
                {errors.price && (
                  <Text className="mt-2 font-sans text-sm text-destructive">
                    {errors.price}
                  </Text>
                )}
              </View>

              {/* Frequency Toggle */}
              <View className="mb-5">
                <Text className="mb-3 font-sans-semibold text-lg text-primary">
                  Frequency
                </Text>
                <View className="flex-row gap-3">
                  {(["Monthly", "Yearly"] as const).map((freq) => (
                    <Pressable
                      key={freq}
                      onPress={() => setFrequency(freq)}
                      className={clsx(
                        "flex-1 rounded-xl border border-border py-3 px-4",
                        frequency === freq ? "bg-accent" : "bg-card",
                      )}
                    >
                      <Text
                        className={clsx(
                          "text-center font-sans-semibold text-base",
                          frequency === freq ? "text-white" : "text-primary",
                        )}
                      >
                        {freq}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Category Chips */}
              <View className="mb-6">
                <Text className="mb-3 font-sans-semibold text-lg text-primary">
                  Category
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat}
                      onPress={() => setCategory(cat)}
                      className={clsx(
                        "rounded-full border border-border px-4 py-2",
                        category === cat
                          ? "border-accent bg-accent"
                          : "bg-card",
                      )}
                    >
                      <Text
                        className={clsx(
                          "font-sans-semibold text-sm",
                          category === cat ? "text-white" : "text-primary",
                        )}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Submit Button */}
              <Pressable
                className={clsx(
                  "items-center rounded-2xl py-4 px-5",
                  isFormValid ? "bg-accent" : "bg-accent/50",
                )}
                disabled={!isFormValid || isSubmitting}
                onPress={handleSubmit}
              >
                <Text className="font-sans-bold text-lg text-white">
                  {isSubmitting ? "Creating..." : "Add Subscription"}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
