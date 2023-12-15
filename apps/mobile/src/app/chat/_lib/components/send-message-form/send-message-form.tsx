import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../../../../../lib/utils/api";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { View } from "react-native";
import { TextInput } from "../../../../../components/ui/input";
import { Button } from "../../../../../components/ui/button";
import { SendIcon } from "lucide-react-native";

const formSchema = z.object({
  content: z.string().trim().min(1),
});
type FormSchema = z.infer<typeof formSchema>;

type Props = {
  recipientEmail: string;
};

export const SendMessageForm: React.FC<Props> = ({ recipientEmail }) => {
  const sendMessageMutation = api.conversations.sendMessage.useMutation();
  const form = useForm<FormSchema>({
    defaultValues: {
      content: "",
    },
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const onSubmit = form.handleSubmit((data: FormSchema) => {
    void sendMessageMutation.mutateAsync({
      recipientEmail,
      content: data.content,
    });
    form.reset();
  });

  return (
    <View style={{ flexDirection: "row", margin: 10 }}>
      <Controller
        control={form.control}
        name="content"
        render={({ field }) => (
          <TextInput
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            value={field.value}
            style={{
              flex: 1,
              borderColor: "gray",
              borderWidth: 1,
              borderRadius: 5,
              marginRight: 10,
              padding: 5,
            }}
            placeholder="Type a message"
          />
        )}
      />

      <Button
        onPress={() => {
          void onSubmit();
        }}
        loading={sendMessageMutation.isLoading}
        disabled={!form.formState.isValid}
      >
        <SendIcon size={24} stroke="white" />
      </Button>
    </View>
  );
};
