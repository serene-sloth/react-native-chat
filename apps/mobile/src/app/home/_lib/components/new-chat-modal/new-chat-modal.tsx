import React from "react";
import { View, TouchableOpacity, Modal, Animated, PanResponder, Text } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextInput } from "../../../../../components/ui/input";
import { Button } from "../../../../../components/ui/button";
import { useSession } from "../../../../../lib/hooks/use-session";

const formSchema = z.object({
  recipient: z.string().email(),
});
type FormValues = z.infer<typeof formSchema>;

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
};

export const NewChatModal: React.FC<Props> = ({ open, onClose: originalOnClose, onSubmit }) => {
  const session = useSession();
  const form = useForm<FormValues>({
    resolver: zodResolver(
      formSchema.refine((data) => data.recipient !== session.user?.email, {
        message: "You can't start a chat with yourself",
      }),
    ),
  });
  const panY = React.useRef(new Animated.Value(0)).current;
  const springAnim = React.useRef<Animated.CompositeAnimation | null>(null);

  function onClose(): void {
    springAnim.current?.stop();
    originalOnClose();
    panY.setValue(0);
  }

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dy: panY }], { useNativeDriver: false }),
      onPanResponderRelease: (_e, gs) => {
        if (gs.dy > 50) {
          onClose();
        } else {
          springAnim.current = Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: false,
          });
          springAnim.current.start();
        }
      },
    }),
  ).current;

  return (
    <React.Fragment>
      {open === true && (
        <TouchableOpacity
          style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
          onPress={() => {
            onClose();
          }}
          activeOpacity={1}
        >
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} />
        </TouchableOpacity>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={open}
        onRequestClose={() => {
          onClose();
        }}
      >
        <Animated.View
          style={{
            transform: [{ translateY: panY }],
            height: "100%",
            justifyContent: "flex-end",
          }}
          {...panResponder.panHandlers}
        >
          <View className="flex-1 justify-end">
            <View className="bg-background rounded-t-xl px-4 h-1/3 pb-16 w-full">
              <TouchableOpacity
                onPress={() => {
                  onClose();
                }}
                className="pb-4 py-3 mb-6"
              >
                <View className="self-center bg-black/70 h-1 rounded-full w-3/4" />
              </TouchableOpacity>

              <View className="flex justify-center flex-col px-4">
                <Controller
                  render={({ field }) => (
                    <View>
                      <TextInput
                        onChangeText={field.onChange}
                        value={field.value}
                        onBlur={field.onBlur}
                        placeholder="Enter recipient's email"
                        className="border-b border-border mb-2"
                        onPressIn={(e) => {
                          e.stopPropagation();
                        }}
                      />

                      {form.formState.errors.recipient !== undefined && (
                        <Text className="text-destructive text-sm">
                          {form.formState.errors.recipient.message}
                        </Text>
                      )}
                    </View>
                  )}
                  name="recipient"
                  control={form.control}
                />

                <Button
                  className="w-full self-center"
                  disabled={!form.formState.isValid}
                  onPress={form.handleSubmit((values) => {
                    onClose();
                    onSubmit(values);
                    form.reset();
                  })}
                >
                  <Button.Text>Start Chat</Button.Text>
                </Button>
              </View>
            </View>
          </View>
        </Animated.View>
      </Modal>
    </React.Fragment>
  );
};
