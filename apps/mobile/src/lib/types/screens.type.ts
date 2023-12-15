import { type NativeStackScreenProps } from "@react-navigation/native-stack";

export type StackParamList = {
  Home: undefined;
  Login: undefined;
  Chat: { email: string };
};

export type HomeScreenProps = NativeStackScreenProps<StackParamList, "Home">;
export type LoginScreenProps = NativeStackScreenProps<StackParamList, "Login">;
export type ChatScreenProps = NativeStackScreenProps<StackParamList, "Chat">;
