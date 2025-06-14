import React, { useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Linking } from 'react-native';

// Screens
import LoginScreen from "./screens/LoginScreen.js";
import HomeScreen from "./screens/HomeScreen";
import RoutesScreen from "./screens/RoutesScreen";
import RouteDetailsScreen from "./screens/RouteDetailsScreen";
import KidDetailsScreen from "./screens/KidDetailsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import ConfirmPasswordScreen from "./screens/ConfirmPasswordScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  useEffect(() => {
    console.log("Navigated to MainTabs");
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let icon;
          if (route.name === "Home") icon = "home-outline";
          else if (route.name === "My Routes") icon = "bus-outline";
          else icon = "person-circle-outline";

          return <Ionicons name={icon} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2A2A72",
        tabBarStyle: {
          backgroundColor: "white",
        },
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="My Routes" component={RoutesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const navigationRef = useRef();
  const routeNameRef = useRef();
  const [isReady, setIsReady] = React.useState(false);
  const [initialState, setInitialState] = React.useState();

  useEffect(() => {
    const restoreState = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();

        if (initialUrl) {
          // Handle deep link URL
          handleDeepLink(initialUrl);
        }
      } catch (e) {
        console.error("Error handling deep link:", e);
      } finally {
        setIsReady(true);
      }
    };

    restoreState();

    // Subscribe to deep link events
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('Deep link received:', url);
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = (url) => {
    if (!url || !navigationRef.current) return;

    // Parse the URL
    const route = url.replace(/.*?:\/\//g, '');
    const [path, queryString] = route.split('?');
    
    console.log('Parsed deep link - Path:', path, 'Query:', queryString);

    // Parse query parameters
    const params = {};
    if (queryString) {
      queryString.split('&').forEach(param => {
        const [key, value] = param.split('=');
        params[key] = decodeURIComponent(value);
      });
    }

    // Handle different paths
    switch (path) {
      case 'forgot-password':
        navigationRef.current?.navigate('ForgotPassword', params);
        break;
      case 'confirm-password':
        navigationRef.current?.navigate('ConfirmPassword', params);
        break;
      case 'login':
        navigationRef.current?.navigate('Login', params);
        break;
      case 'reset-password':
        navigationRef.current?.navigate('ResetPassword', params);
        break;
      default:
        console.log('Unknown deep link path:', path);
    }
  };

  const linking = {
    prefixes: ['kats://', 'kats:'],
    config: {
      initialRouteName: 'Login',
      screens: {
        ForgotPassword: {
          path: 'forgot-password',
          parse: {
            token: (token) => `${token}`,
          },
        },
        ConfirmPassword: {
          path: 'confirm-password',
          parse: {
            token: (token) => `${token}`,
          },
        },
        Login: 'login',
        ResetPassword: 'reset-password',
        Main: {
          screens: {
            Home: 'home',
            'My Routes': 'routes',
            Profile: 'profile'
          }
        },
        RouteDetails: 'route/:id',
        KidDetails: 'kid/:id'
      }
    }
  };

  if (!isReady) {
    return null;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      initialState={initialState}
      onReady={() => {
        routeNameRef.current = navigationRef.current.getCurrentRoute().name;
        console.log('Navigation container is ready');
      }}
      onStateChange={(state) => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = navigationRef.current.getCurrentRoute().name;

        if (previousRouteName !== currentRouteName) {
          console.log('Navigation state changed:', currentRouteName);
        }

        routeNameRef.current = currentRouteName;
      }}
    >
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPasswordScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ConfirmPassword"
          component={ConfirmPasswordScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RouteDetails"
          component={RouteDetailsScreen}
          options={{ title: "Route Details" }}
        />
        <Stack.Screen
          name="KidDetails"
          component={KidDetailsScreen}
          options={{ title: "Kid Details" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
