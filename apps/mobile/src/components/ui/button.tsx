import React from "react";
import { Pressable, type PressableProps, type TextProps, Text as RNText } from "react-native";
import { Loader } from "./loader";
import { cn } from "../../lib/utils/cn";

export type ButtonProps = {
  loading?: boolean;
} & PressableProps;
const RootButton: React.FC<ButtonProps> = ({ className, loading = false, children, ...rest }) => {
  const isDisabled: boolean = loading || (rest.disabled ?? false);

  return (
    <Pressable
      {...rest}
      className={cn(
        "bg-primary rounded-md whitespace-nowrap px-4 py-2 flex flex-row items-center justify-center",
        isDisabled && "opacity-50",
        className,
      )}
      disabled={isDisabled}
    >
      <>
        {loading && <Loader className="h-5 w-5 mr-2" />}
        {children}
      </>
    </Pressable>
  );
};

const Text: React.FC<TextProps> = ({ className, children, ...rest }) => {
  return (
    <RNText {...rest} className={cn("text-white", className)}>
      {children}
    </RNText>
  );
};

export const Button = Object.assign(RootButton, { Text });
