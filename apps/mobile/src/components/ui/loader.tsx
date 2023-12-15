import React from "react";
import { ActivityIndicator, type ActivityIndicatorProps } from "react-native";

export const Loader: React.FC<ActivityIndicatorProps> = ({ ...rest }) => {
  return <ActivityIndicator {...rest} color="#FFFFFF" />;
};
