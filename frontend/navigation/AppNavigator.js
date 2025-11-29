import React, { useContext, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { io } from 'socket.io-client';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import api from '../api/api';
import AuthContext from '../context/AuthContext';
import FloatingTabBar from '../components/FloatingTabBar';

// Import all Screens
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import CreateEventScreen from '../screens/CreateEventScreen';
import EditEventScreen from '../screens/EditEventScreen';
import EventDetailsScreen from '../screens/EventDetailsScreen';
import ParticipantsScreen from '../screens/ParticipantsScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BadmintonProfileScreen from '../screens/BadmintonProfileScreen';
import AiChatScreen from '../screens/AiChatScreen';
import NewsScreen from '../screens/NewsScreen';
import VenueListScreen from '../screens/VenueListScreen';
import VenueDetailsScreen from '../screens/VenueDetailsScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import AddVenueScreen from '../screens/AddVenueScreen';
import EditVenueScreen from '../screens/EditVenueScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const VenueStack = createStackNavigator();

function HomeStack({ navigation }) {
    React.useEffect(() => {
        const unsubscribe = navigation.addListener('state', (e) => {
            const routes = e.data.state.routes;
            const currentRoute = routes[routes.length - 1];
            
            // Hide tab bar for sub-screens
            if (currentRoute.name !== 'Home') {
                navigation.setOptions({ tabBarStyle: { display: 'none' } });
            } else {
                navigation.setOptions({ tabBarStyle: undefined });
            }
        });
        
        return unsubscribe;
    }, [navigation]);

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: '#FFFFFF', elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
                headerTitleStyle: { fontSize: 18, fontWeight: '600', color: '#1D1D1F' },
                headerTintColor: '#007AFF',
                headerBackTitleVisible: false,
                cardStyle: { backgroundColor: '#F8F9FA' },
            }}
        >
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CreateEvent" component={CreateEventScreen} options={{ title: 'Create Event', headerBackTitle: 'Back' }} />
            <Stack.Screen name="EditEvent" component={EditEventScreen} options={{ title: 'Edit Event', headerBackTitle: 'Back' }} />
            <Stack.Screen name="EventDetails" component={EventDetailsScreen} options={{ title: 'Event Details' }} />
            <Stack.Screen name="Participants" component={ParticipantsScreen} options={{ title: 'Participants', headerBackTitle: 'Back' }} />
            <Stack.Screen name="Chat" component={ChatScreen} options={({ route }) => ({ title: route.params?.eventTitle || 'Chat', headerBackTitle: 'Back' })} />
            <Stack.Screen name="BadmintonProfile" component={BadmintonProfileScreen} options={{ title: 'Badminton Profile' }} />
            <Stack.Screen name="AiChat" component={AiChatScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}

function ProfileStack({ navigation }) {
    React.useEffect(() => {
        const unsubscribe = navigation.addListener('state', (e) => {
            const routes = e.data.state.routes;
            const currentRoute = routes[routes.length - 1];
            
            // Hide tab bar for sub-screens
            if (currentRoute.name !== 'Profile') {
                navigation.setOptions({ tabBarStyle: { display: 'none' } });
            } else {
                navigation.setOptions({ tabBarStyle: undefined });
            }
        });
        
        return unsubscribe;
    }, [navigation]);

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: '#FFFFFF', elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
                headerTitleStyle: { fontSize: 18, fontWeight: '600', color: '#1D1D1F' },
                headerTintColor: '#007AFF',
                headerBackTitleVisible: false,
                cardStyle: { backgroundColor: '#F8F9FA' },
            }}
        >
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
            <Stack.Screen name="BadmintonProfile" component={BadmintonProfileScreen} options={{ title: 'Badminton Profile', headerBackTitle: 'Profile' }} />
        </Stack.Navigator>
    );
}

function NewsStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: '#FFFFFF', elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
                headerTitleStyle: { fontSize: 18, fontWeight: '600', color: '#1D1D1F' },
                headerTintColor: '#007AFF',
                headerBackTitleVisible: false,
                cardStyle: { backgroundColor: '#F8F9FA' },
            }}
        >
            <Stack.Screen name="News" component={NewsScreen} options={{ title: 'Sports News' }} />
        </Stack.Navigator>
    );
}

function VenueStackScreen({ navigation }) {
    React.useEffect(() => {
        const unsubscribe = navigation.addListener('state', (e) => {
            const routes = e.data.state.routes;
            const currentRoute = routes[routes.length - 1];
            
            // Hide tab bar for sub-screens
            if (currentRoute.name !== 'VenueList') {
                navigation.setOptions({ tabBarStyle: { display: 'none' } });
            } else {
                navigation.setOptions({ tabBarStyle: undefined });
            }
        });
        
        return unsubscribe;
    }, [navigation]);

    return (
        <VenueStack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: '#FFFFFF', elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
                headerTitleStyle: { fontSize: 18, fontWeight: '600', color: '#1D1D1F' },
                headerTintColor: '#007AFF',
                headerBackTitleVisible: false,
                cardStyle: { backgroundColor: '#F8F9FA' },
            }}
        >
            <VenueStack.Screen name="VenueList" component={VenueListScreen} options={{ title: 'Book Venues', headerShown: false }} />
            <VenueStack.Screen name="VenueDetails" component={VenueDetailsScreen} options={{ title: 'Venue Details' }} />
            <VenueStack.Screen name="AddVenue" component={AddVenueScreen} options={{ title: 'List New Venue' }} />
            <VenueStack.Screen name="EditVenue" component={EditVenueScreen} options={{ title: 'Edit Venue' }} />
            <VenueStack.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: 'My Bookings' }} />
        </VenueStack.Navigator>
    );
}

const AppNavigator = () => {
    const { user, loading } = useContext(AuthContext);

    useEffect(() => {
        let socket;
        if (user) {
            const hostUri = Constants.expoConfig.hostUri;
            const ipAddress = hostUri.split(':')[0];
            const SERVER_URL = `http://${ipAddress}:5001`;
            socket = io(SERVER_URL);

            const subscribeToNotifications = async () => {
                try {
                    const { data: eventIds } = await api.get('/users/myevents');
                    socket.emit('subscribeToNotifications', eventIds);
                } catch (error) {
                    console.error("Could not subscribe to notifications", error);
                }
            };
            subscribeToNotifications();

            socket.on('notification', ({ title, message }) => {
                Toast.show({
                    type: 'info',
                    text1: title,
                    text2: message,
                    onPress: () => { /* Optional: navigate to chat on tap */ }
                });
            });

            return () => socket.disconnect();
        }
    }, [user]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {user ? (
                <Tab.Navigator
                    tabBar={(props) => <FloatingTabBar {...props} />}
                    screenOptions={{
                        headerShown: false,
                    }}
                >
                    <Tab.Screen name="HomeStack" component={HomeStack} options={{ title: 'Home' }} />
                    <Tab.Screen name="VenueStack" component={VenueStackScreen} options={{ title: 'Venues' }} />
                    <Tab.Screen name="NewsStack" component={NewsStack} options={{ title: 'News' }} />
                    <Tab.Screen name="ProfileStack" component={ProfileStack} options={{ title: 'Profile' }} />
                </Tab.Navigator>
            ) : (
                <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#FFFFFF' } }}>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                </Stack.Navigator>
            )}
        </NavigationContainer>
    );
};

export default AppNavigator;
