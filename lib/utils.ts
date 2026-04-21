import dayjs from "dayjs";

export function formatCurrency(
  value: number | string,
  currency = "USD",
): string {
  try {
    const numericValue = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(numericValue)) {
      throw new Error("Invalid numeric value");
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  } catch (error) {
    // Fallback: always format as USD with 2 decimals
    const fallbackValue = Number(value);
    if (!Number.isFinite(fallbackValue)) {
      return "$0.00";
    }

    return `$${fallbackValue.toFixed(2)}`;
  }
}

export const formatSubscriptionDateTime = (value?: string): string => {
  if (!value) return "Not provided";
  const parsedDate = dayjs(value);
  return parsedDate.isValid()
    ? parsedDate.format("MM/DD/YYYY")
    : "Not provided";
};

export const formatStatusLabel = (value?: string): string => {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};
