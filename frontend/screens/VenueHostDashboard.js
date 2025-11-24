import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import api from '../api/api';
import AuthContext from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const VenueHostDashboard = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchHostBookings = async () => {
        try {
            const { data } = await api.get('/venues/bookings/host');
            setBookings(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchHostBookings();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchHostBookings();
    };

    const renderBooking = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.header}>
                <Image
                    source={{ uri: item.venue?.images?.[0] || 'https://via.placeholder.com/100' }}
                    style={styles.venueImage}
                />
                <View style={styles.headerText}>
                    <Text style={styles.venueName}>{item.venue?.name}</Text>
                    <Text style={styles.date}>{new Date(item.date).toDateString()}</Text>
                    <Text style={styles.time}>{item.startTime} - {item.endTime}</Text>
                </View>
                <View style={styles.statusBadge}>
                    <Text style={[styles.statusText, { color: item.status === 'confirmed' ? 'green' : 'orange' }]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.customerInfo}>
                <Image
                    source={{ uri: item.user?.profilePicture || 'https://via.placeholder.com/50' }}
                    style={styles.avatar}
                />
                <View>
                    <Text style={styles.customerName}>{item.user?.name}</Text>
                    <Text style={styles.customerEmail}>{item.user?.email}</Text>
                </View>
                <View style={styles.amountContainer}>
                    <Text style={styles.amountLabel}>Total</Text>
                    <Text style={styles.amount}>₹{item.totalAmount}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.dashboardHeader}>
                <Text style={styles.title}>Venue Dashboard</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AddVenue')} style={styles.addButton}>
                    <Ionicons name="add-circle" size={24} color="#007AFF" />
                    <Text style={styles.addText}>Add Venue</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" style={styles.loader} />
            ) : (
                <FlatList
                    data={bookings}
                    renderItem={renderBooking}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    ListHeaderComponent={<Text style={styles.sectionTitle}>Incoming Bookings</Text>}
                    ListEmptyComponent={<Text style={styles.empty}>No bookings yet</Text>}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    dashboardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    title: { fontSize: 24, fontWeight: 'bold' },
    addButton: { flexDirection: 'row', alignItems: 'center' },
    addText: { color: '#007AFF', fontWeight: '600', marginLeft: 5 },
    list: { padding: 15 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#666' },
    card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 15, padding: 15, elevation: 2 },
    header: { flexDirection: 'row', marginBottom: 15 },
    venueImage: { width: 60, height: 60, borderRadius: 8, marginRight: 15 },
    headerText: { flex: 1, justifyContent: 'center' },
    venueName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    date: { fontSize: 14, color: '#666' },
    time: { fontSize: 14, color: '#666' },
    statusBadge: { justifyContent: 'center' },
    statusText: { fontWeight: 'bold', fontSize: 12 },
    divider: { height: 1, backgroundColor: '#eee', marginBottom: 15 },
    customerInfo: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
    customerName: { fontWeight: '600', fontSize: 14 },
    customerEmail: { fontSize: 12, color: '#888' },
    amountContainer: { marginLeft: 'auto', alignItems: 'flex-end' },
    amountLabel: { fontSize: 12, color: '#888' },
    amount: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },
    loader: { marginTop: 50 },
    empty: { textAlign: 'center', marginTop: 50, color: '#666' }
});

export default VenueHostDashboard;
