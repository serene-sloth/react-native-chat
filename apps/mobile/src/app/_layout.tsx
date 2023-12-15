import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoginScreen } from "./login";
import { HomeScreen } from "./home/home.screen";
import { useSession } from "../lib/hooks/use-session";
import { Loader } from "../components/ui/loader";
import { type StackParamList } from "../lib/types/screens.type";
import { Header } from "../components/layouts/header";
import { ChatScreen } from "./chat/chat.screen";
import { ChatHeader } from "./chat/_lib/components/chat-header";

const Stack = createNativeStackNavigator<StackParamList>();

export const Layout: React.FC = () => {
  const session = useSession();

  if (session.status === "loading") {
    return <Loader />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {session.status === "unauthenticated" ? (
          <Stack.Screen name="Login" options={{ headerShown: false }} component={LoginScreen} />
        ) : (
          <React.Fragment>
            <Stack.Screen name="Home" options={{ header: Header }}>
              {(props) => <HomeScreen {...props} />}
            </Stack.Screen>

            <Stack.Screen
              name="Chat"
              options={({ route }) => ({
                header: () => <ChatHeader {...route.params} />,
              })}
            >
              {(props) => <ChatScreen {...props} />}
            </Stack.Screen>
          </React.Fragment>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
