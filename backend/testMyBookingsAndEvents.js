// Test script for My Bookings and My Events endpoints
// Run with: node testMyBookingsAndEvents.js

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001';

// Replace with your actual JWT token after logging in
const YOUR_JWT_TOKEN = 'YOUR_TOKEN_HERE';

async function testMyBookings() {
    console.log('\n' + '='.repeat(60));
    console.log('🏟️  Testing: GET /api/bookings/my');
    console.log('='.repeat(60));

    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/bookings/my`,
            {
                headers: {
                    Authorization: `Bearer ${YOUR_JWT_TOKEN}`
                }
            }
        );

        console.log('\n✅ Success!');
        console.log(`Found ${response.data.length} booking(s)\n`);

        if (response.data.length > 0) {
            response.data.forEach((booking, index) => {
                console.log(`📋 Booking #${index + 1}:`);
                console.log(`   Venue: ${booking.venue?.name || 'N/A'}`);
                console.log(`   City: ${booking.venue?.city || 'N/A'}`);
                console.log(`   Date: ${booking.date}`);
                console.log(`   Time: ${booking.startTime} - ${booking.endTime}`);
                console.log(`   Duration: ${booking.durationHours} hour(s)`);
                console.log(`   Amount: ₹${booking.totalAmount}`);
                console.log(`   Status: ${booking.status}`);
                console.log('');
            });
        } else {
            console.log('   No bookings found. Try booking a venue first!');
        }

    } catch (error) {
        console.log('\n❌ Error:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data);
        } else {
            console.log(error.message);
        }
    }
}

async function testMyEvents() {
    console.log('\n' + '='.repeat(60));
    console.log('🏏  Testing: GET /api/users/myevents');
    console.log('='.repeat(60));

    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/users/myevents`,
            {
                headers: {
                    Authorization: `Bearer ${YOUR_JWT_TOKEN}`
                }
            }
        );

        console.log('\n✅ Success!');
        console.log(`Found ${response.data.length} event(s)\n`);

        if (response.data.length > 0) {
            response.data.forEach((event, index) => {
                console.log(`🎯 Event #${index + 1}:`);
                console.log(`   Title: ${event.title}`);
                console.log(`   Category: ${event.category}`);
                console.log(`   Date: ${new Date(event.date).toLocaleDateString()}`);
                console.log(`   Location: ${event.location}`);
                console.log(`   Skill Level: ${event.skillLevel}`);
                console.log(`   Entry Fee: ₹${event.entryFee}`);
                console.log(`   Host: ${event.host?.name || 'N/A'}`);
                console.log(`   Participants: ${event.registeredParticipants?.length || 0}/${event.maxParticipants}`);
                console.log('');
            });
        } else {
            console.log('   No events found. Try joining an event first!');
        }

    } catch (error) {
        console.log('\n❌ Error:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data);
        } else {
            console.log(error.message);
        }
    }
}

async function runAllTests() {
    console.log('\n🚀 Starting My Bookings & Events Tests...\n');

    if (YOUR_JWT_TOKEN === 'YOUR_TOKEN_HERE') {
        console.log('⚠️  ERROR: Please replace YOUR_TOKEN_HERE with your actual JWT token!');
        console.log('\nHow to get your token:');
        console.log('1. Login via POST /api/users/login');
        console.log('2. Copy the "token" from the response');
        console.log('3. Replace YOUR_TOKEN_HERE in this file\n');
        return;
    }

    await testMyBookings();
    await new Promise(resolve => setTimeout(resolve, 1000));

    await testMyEvents();

    console.log('\n' + '='.repeat(60));
    console.log('✨ All tests completed!');
    console.log('='.repeat(60) + '\n');
}

// Instructions
console.log(`
╔════════════════════════════════════════════════════════════╗
║  My Bookings & Events - Test Script                       ║
╚════════════════════════════════════════════════════════════╝

📝 SETUP INSTRUCTIONS:

1. Make sure your backend server is running on port 5001
   → cd backend && npm run dev

2. Login to get your JWT token:
   → POST /api/users/login
   → Body: { "email": "your@email.com", "password": "yourpassword" }

3. Copy the token from login response and paste it in this file
   → Replace: YOUR_TOKEN_HERE

4. Run the tests:
   → node testMyBookingsAndEvents.js

═══════════════════════════════════════════════════════════

Press Ctrl+C to cancel, or wait 3 seconds to start tests...
`);

setTimeout(() => {
    runAllTests().catch(console.error);
}, 3000);
