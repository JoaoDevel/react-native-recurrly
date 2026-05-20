import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { createContext, useContext, useState, type ReactNode } from "react";

interface SubscriptionContextValue {
  subscriptions: Subscription[];
  addSubscription: (subscription: Subscription) => void;
}

const SubscriptionsContext = createContext<
  SubscriptionContextValue | undefined
>(undefined);

export function SubscriptionsProvider({ children }: { children: ReactNode }) {
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>(HOME_SUBSCRIPTIONS);

  const addSubscription = (subscription: Subscription) => {
    setSubscriptions((prev) => [subscription, ...prev]);
  };

  return (
    <SubscriptionsContext.Provider value={{ subscriptions, addSubscription }}>
      {children}
    </SubscriptionsContext.Provider>
  );
}

export function useSubscriptions() {
  const context = useContext(SubscriptionsContext);
  if (!context) {
    throw new Error(
      "useSubscriptions must be used within a SubscriptionsProvider",
    );
  }
  return context;
}
