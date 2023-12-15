import React from "react";
import { Text, StatusBar, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type LoginInput, loginInput } from "@org/api-contracts";
import { type LoginScreenProps } from "../../lib/types/screens.type";
import { Header } from "../../components/layouts/header";
import { useAuthStore } from "../../lib/stores/user.store";
import { useSession } from "../../lib/hooks/use-session";
import { api } from "../../lib/utils/api";
import { TextInput } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const form = useForm<LoginInput>({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(loginInput),
    mode: "onSubmit",
  });

  const authStore = useAuthStore();
  const session = useSession();
  const loginMutation = api.auth.login.useMutation({
    onSuccess: (res) => {
      authStore.set({
        status: "authenticated",
        user: res.user,
      });
      navigation.navigate("Home");
    },
  });

  function handleSubmit(data: LoginInput): void {
    loginMutation.mutate(data);
  }

  return (
    <View className="flex-1 bg-background">
      <Header />

      <StatusBar barStyle="dark-content" />

      <Text className="text-4xl text-center mt-16 text-primary font-bold">Axionet</Text>

      <View className="flex flex-col w-3/4 justify-center mt-16 mx-auto">
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <View className="flex flex-col gap-1">
              <TextInput
                placeholder="Email"
                className="mb-1"
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                value={field.value}
              />

              {fieldState.error !== undefined && (
                <Text className="text-destructive text-sm mb-2" role="alert">
                  {fieldState.error.message}
                </Text>
              )}
            </View>
          )}
        />

        <Button
          loading={
            session.status === "loading" ||
            session.status === "authenticated" ||
            loginMutation.isLoading
          }
          disabled={!form.formState.isValid}
          onPress={form.handleSubmit(handleSubmit)}
        >
          <Button.Text>Login</Button.Text>
        </Button>

        <Text className="text-center text-muted-foreground mt-4">
          Don't have an account? <Text className="text-blue-600">Sign up</Text>
        </Text>

        <Text className="text-center mt-4 text-blue-600 cursor-pointer">Forgot Password?</Text>
      </View>
    </View>
  );
};
