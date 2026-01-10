// Test script for AI-powered booking feature
// Run with: node testAIBooking.js

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001';

// Test scenarios
const tests = [
    {
        name: "Test 1: Basic venue inquiry (no auth)",
        endpoint: '/api/chat',
        data: {
            message: "Show me cricket venues in the city"
        },
        headers: {}
    },
    {
        name: "Test 2: Booking request with all details (requires auth)",
        endpoint: '/api/chat/auth',
        data: {
            message: "I want to book Green Park Stadium for tomorrow at 5 PM for 2 hours"
        },
        headers: {
            Authorization: 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with actual token
        }
    },
    {
        name: "Test 3: Multi-turn booking conversation",
        endpoint: '/api/chat/auth',
        data: {
            message: "I want to play badminton tomorrow"
        },
        headers: {
            Authorization: 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with actual token
        }
    },
    {
        name: "Test 4: Follow-up message with context",
        endpoint: '/api/chat/auth',
        data: {
            message: "6 PM for 2 hours",
            conversationContext: {
                pendingBooking: {
                    isBookingRequest: true,
                    venueId: "VENUE_ID_HERE", // Replace with actual venue ID
                    venueName: "Sports Complex",
                    date: "2026-01-11",
                    startTime: null,
                    duration: null,
                    needsMoreInfo: ["startTime", "duration"]
                }
            }
        },
        headers: {
            Authorization: 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with actual token
        }
    }
];

async function runTest(test) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 ${test.name}`);
    console.log(`${'='.repeat(60)}`);

    try {
        const response = await axios.post(
            `${API_BASE_URL}${test.endpoint}`,
            test.data,
            { headers: test.headers }
        );

        console.log('\n✅ Response:');
        console.log('Reply:', response.data.reply);
        console.log('Booking Created:', response.data.bookingCreated);

        if (response.data.booking) {
            console.log('\n📋 Booking Details:');
            console.log(JSON.stringify(response.data.booking, null, 2));
        }

        if (response.data.pendingBooking) {
            console.log('\n⏳ Pending Booking Info:');
            console.log(JSON.stringify(response.data.pendingBooking, null, 2));
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
    console.log('\n🚀 Starting AI Booking Feature Tests...\n');

    for (const test of tests) {
        await runTest(test);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between tests
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('✨ All tests completed!');
    console.log(`${'='.repeat(60)}\n`);
}

// Instructions
console.log(`
╔════════════════════════════════════════════════════════════╗
║  AI-Powered Booking Feature - Test Script                 ║
╚════════════════════════════════════════════════════════════╝

📝 SETUP INSTRUCTIONS:

1. Make sure your backend server is running on port 5001
   → cd backend && npm run dev

2. Replace placeholder values in this file:
   → YOUR_JWT_TOKEN_HERE: Get from login response
   → VENUE_ID_HERE: Get from /api/venues endpoint

3. Run the tests:
   → node testAIBooking.js

4. For authenticated tests, first login to get a token:
   → POST /api/users/login
   → Copy the 'token' from response

═══════════════════════════════════════════════════════════

Press Ctrl+C to cancel, or wait 5 seconds to start tests...
`);

// Auto-run after 5 seconds (comment out if you want manual control)
setTimeout(() => {
    runAllTests().catch(console.error);
}, 5000);

// Or run immediately (uncomment this line and comment out setTimeout)
// runAllTests().catch(console.error);
