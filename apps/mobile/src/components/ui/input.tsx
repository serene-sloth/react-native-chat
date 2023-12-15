import React from "react";
import { type TextInputProps, TextInput as RNTextInput } from "react-native";
import { cn } from "../../lib/utils/cn";

export const TextInput = React.forwardRef<RNTextInput, TextInputProps>(
  ({ className, ...rest }, ref) => {
    return (
      <RNTextInput
        {...rest}
        ref={ref}
        className={cn(
          "rounded-md border border-border flex px-3 py-2 placeholder:text-muted-foreground text-foreground",
          className,
        )}
      />
    );
  },
);
