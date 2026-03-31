// Type definitions for the project

import type { ImageSourcePropType } from "react-native";

declare global {
  interface TabIconProps {
    focused: boolean;
    icon: ImageSourcePropType;
  }
}

export {};
