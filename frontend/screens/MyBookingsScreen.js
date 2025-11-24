import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import api from '../api/api';

const MyBookingsScreen = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const { data } = await api.get('/bookings/my');
                setBookings(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const renderBooking = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.venueName}>{item.venue?.name || 'Unknown Venue'}</Text>
                <Text style={[styles.status, { color: item.status === 'confirmed' ? 'green' : 'orange' }]}>
                    {item.status.toUpperCase()}
                </Text>
            </View>
            <Text style={styles.date}>{new Date(item.date).toDateString()}</Text>
            <Text style={styles.time}>{item.startTime} - {item.endTime}</Text>
            <Text style={styles.amount}>Total: ₹{item.totalAmount}</Text>
        </View>
    );

    if (loading) return <ActivityIndicator size="large" style={styles.centered} />;

    return (
        <View style={styles.container}>
            <FlatList
                data={bookings}
                renderItem={renderBooking}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={styles.empty}>No bookings found</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 15 },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    venueName: { fontSize: 16, fontWeight: 'bold' },
    status: { fontWeight: 'bold', fontSize: 12 },
    date: { color: '#333', marginBottom: 2 },
    time: { color: '#666', marginBottom: 5 },
    amount: { fontWeight: 'bold', color: '#007AFF' },
    empty: { textAlign: 'center', marginTop: 50, color: '#666' }
});

export default MyBookingsScreen;
