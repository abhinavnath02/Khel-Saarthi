const { GoogleGenerativeAI } = require("@google/generative-ai");
const Event = require("../models/eventModel");
const Venue = require("../models/venueModel");
const Booking = require("../models/bookingModel");

// Access API key from environment variables for security
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.warn("WARNING: GEMINI_API_KEY is not set in .env file. AI Chat features will fail.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
// Using gemini-2.5-flash as requested (fast, free tier available)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Helper function to parse booking intent from AI response
async function parseBookingIntent(userMessage, aiResponse) {
    try {
        const intentPrompt = `
            Analyze if the user wants to book a venue. Extract booking details in JSON format.
            
            User Message: "${userMessage}"
            AI Response: "${aiResponse}"
            
            Return ONLY a JSON object with this exact structure (no additional text):
            {
                "isBookingRequest": true/false,
                "venueId": "extracted venue ID or null",
                "venueName": "extracted venue name or null",
                "date": "YYYY-MM-DD format or null",
                "startTime": "HH:MM format (24hr) or null",
                "duration": "number of hours or null",
                "needsMoreInfo": ["list of missing fields"] or []
            }
            
            Examples:
            - "I want to book Green Park for tomorrow at 5 PM for 2 hours" → extract all details
            - "Book that venue" → isBookingRequest: true, but needs venueId, date, time, duration
            - "Tell me about cricket" → isBookingRequest: false
        `;

        const result = await model.generateContent(intentPrompt);
        const response = await result.response;
        const text = response.text().trim();

        // Extract JSON from response (handle markdown code blocks)
        let jsonText = text;
        if (text.includes('```json')) {
            jsonText = text.split('```json')[1].split('```')[0].trim();
        } else if (text.includes('```')) {
            jsonText = text.split('```')[1].split('```')[0].trim();
        }

        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Intent parsing error:", error);
        return { isBookingRequest: false, needsMoreInfo: [] };
    }
}

// Helper function to check venue availability
async function checkAvailability(venueId, date, startTime, duration) {
    try {
        const [hours, minutes] = startTime.split(':').map(Number);
        const endHours = hours + parseInt(duration);
        const endTime = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

        const existingBooking = await Booking.findOne({
            venue: venueId,
            date: new Date(date),
            status: { $in: ['confirmed', 'pending'] },
            $or: [
                { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
                { startTime: { $gte: startTime, $lt: endTime } },
                { endTime: { $gt: startTime, $lte: endTime } },
                { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
            ]
        });

        return !existingBooking;
    } catch (error) {
        console.error("Availability check error:", error);
        return false;
    }
}

// Helper function to create booking
async function createAIBooking(userId, venueId, date, startTime, duration) {
    try {
        const venue = await Venue.findById(venueId);
        if (!venue) {
            return { success: false, message: "Venue not found" };
        }

        const [hours, minutes] = startTime.split(':').map(Number);
        const endHours = hours + parseInt(duration);
        const endTime = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        const totalAmount = venue.pricePerHour * parseInt(duration);

        const booking = await Booking.create({
            venue: venueId,
            user: userId,
            date: new Date(date),
            startTime,
            endTime,
            durationHours: parseInt(duration),
            totalAmount,
            status: 'confirmed'
        });

        return {
            success: true,
            booking,
            message: `✅ Booking confirmed at ${venue.name}! Date: ${date}, Time: ${startTime}-${endTime}, Total: ₹${totalAmount}`
        };
    } catch (error) {
        console.error("Booking creation error:", error);
        return { success: false, message: "Failed to create booking. Please try again." };
    }
}

async function getChatResponse(userMessage, userId = null, conversationContext = {}) {
    try {
        // 1. Fetch Context Data
        const fetchPromises = [
            Event.find({ date: { $gte: new Date() } })
                .sort({ date: 1 })
                .limit(10)
                .select('title description date location category skillLevel entryFee'),
            Venue.find({})
                .sort({ rating: -1 })
                .limit(10)
                .select('name description city sportTypes pricePerHour rating')
        ];

        // 2. If user is authenticated, fetch their personal data
        let userBookings = [];
        let userEvents = [];

        if (userId) {
            fetchPromises.push(
                Booking.find({ user: userId })
                    .populate('venue', 'name city sportTypes pricePerHour')
                    .sort({ date: -1 })
                    .limit(10),
                Event.find({ registeredParticipants: userId })
                    .populate('host', 'name')
                    .sort({ date: 1 })
                    .limit(10)
                    .select('title category date location skillLevel entryFee host')
            );
        }

        const results = await Promise.all(fetchPromises);
        const [events, venues] = results;

        if (userId) {
            userBookings = results[2] || [];
            userEvents = results[3] || [];
        }

        // Format data for the AI
        const eventStrings = events.map(e =>
            `- Event: ${e.title} (ID: ${e._id}) | Sport: ${e.category} | Level: ${e.skillLevel} | Date: ${new Date(e.date).toDateString()} | Fee: ₹${e.entryFee}`
        );

        const venueStrings = venues.map(v =>
            `- Venue: ${v.name} (ID: ${v._id}) | City: ${v.city} | Sports: ${v.sportTypes.join(', ')} | Rate: ₹${v.pricePerHour}/hr | Rating: ${v.rating}⭐`
        );

        // Format user's personal data
        let userBookingsString = '';
        let userEventsString = '';

        if (userId && userBookings.length > 0) {
            userBookingsString = '\nYOUR CONFIRMED BOOKINGS:\n' + userBookings.map(b =>
                `- ${b.venue?.name || 'Venue'} in ${b.venue?.city || 'Unknown'} | Date: ${new Date(b.date).toDateString()} | Time: ${b.startTime}-${b.endTime} | Duration: ${b.durationHours}hrs | Amount: ₹${b.totalAmount} | Status: ${b.status}`
            ).join('\n');
        }

        if (userId && userEvents.length > 0) {
            userEventsString = '\nYOUR JOINED EVENTS:\n' + userEvents.map(e =>
                `- ${e.title} (${e.category}) | Date: ${new Date(e.date).toDateString()} | Location: ${e.location} | Host: ${e.host?.name || 'Unknown'} | Fee: ₹${e.entryFee}`
            ).join('\n');
        }

        const contextData = [...eventStrings, ...venueStrings].join('\n') + userBookingsString + userEventsString;

        // 2. Construct System Prompt with Booking Capabilities
        const prompt = `
            You are 'Khel-Saarthi AI', an energetic, motivating, and helpful sports companion for the Khel-Saarthi app.
            
            CONTEXT - LIVE APP DATA:
            ${contextData}

            YOUR ROLE:
            - Help users find events and venues based on their interests.
            - Explain event/venue details.
            - **HELP USERS BOOK VENUES DIRECTLY** through conversation.
            - **SHOW USERS THEIR BOOKINGS AND EVENTS** when they ask.
            - Motivate them to play sports.
            - Be friendly and use sports-related emojis (🏏, ⚽, 🏸, 🏃).

            PERSONAL DATA CAPABILITIES:
            ${userId ? `
            - The user is LOGGED IN, so you have access to their personal data above.
            - When they ask "show my bookings", "what have I booked", "my reservations", etc., show them their CONFIRMED BOOKINGS section.
            - When they ask "my events", "what events am I in", "events I joined", etc., show them their JOINED EVENTS section.
            - If they have no bookings or events, encourage them to book a venue or join an event!
            - Be personal and enthusiastic about their activities!
            ` : `
            - The user is NOT logged in, so you cannot show personal bookings/events.
            - If they ask about "my bookings" or "my events", politely tell them to log in first.
            `}

            BOOKING CAPABILITIES:
            - You CAN help users book venues directly!
            - When a user wants to book, collect: venue, date, time, duration
            - Ask for missing information naturally in conversation
            - Confirm all details before finalizing
            - Example: "I'd love to help you book! Which venue interests you? When would you like to play? What time works best?"

            IMPORTANT - LINKING RULES:
            - When you mention a specific event from the context, YOU MUST format it as: [[EVENT:EventID:EventTitle]]
            - When you mention a specific venue from the context, YOU MUST format it as: [[VENUE:VenueID:VenueName]]
            - Example: "You should check out [[EVENT:65a1b2c3:Cricket Match]] at [[VENUE:65x9y8z7:Green Park Stadium]]."
            - Do NOT use markdown links [Title](url). Use the double bracket syntax above.

            RULES:
            1. ONLY use the provided context to answer questions about specific events or venues.
            2. If the user asks for something not in the list, politely say you don't see any upcoming events or venues for that right now.
            3. Keep answers concise (max 2-3 sentences unless detailed info is asked).
            4. For bookings, guide users step-by-step if they're missing information.
            5. Do not make up fake events or venues.
            6. Always be enthusiastic about helping users get active! 💪
            7. When showing user's bookings/events, format them clearly with emojis and be encouraging!

            ${conversationContext.pendingBooking ? `
            PENDING BOOKING CONTEXT:
            - Venue: ${conversationContext.pendingBooking.venueName || 'Not specified'}
            - Date: ${conversationContext.pendingBooking.date || 'Not specified'}
            - Time: ${conversationContext.pendingBooking.startTime || 'Not specified'}
            - Duration: ${conversationContext.pendingBooking.duration || 'Not specified'} hours
            
            Ask for any missing information to complete the booking.
            ` : ''}

            User Question: ${userMessage}
        `;

        // 3. Call Gemini API
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 4. Check if this is a booking request
        if (userId) {
            const intent = await parseBookingIntent(userMessage, text);

            if (intent.isBookingRequest) {
                // Check if we have all required information
                if (intent.needsMoreInfo.length === 0 && intent.venueId && intent.date && intent.startTime && intent.duration) {
                    // Check availability
                    const isAvailable = await checkAvailability(intent.venueId, intent.date, intent.startTime, intent.duration);

                    if (isAvailable) {
                        // Create the booking
                        const bookingResult = await createAIBooking(userId, intent.venueId, intent.date, intent.startTime, intent.duration);

                        if (bookingResult.success) {
                            return {
                                reply: bookingResult.message,
                                bookingCreated: true,
                                booking: bookingResult.booking
                            };
                        } else {
                            return {
                                reply: `❌ ${bookingResult.message}`,
                                bookingCreated: false
                            };
                        }
                    } else {
                        return {
                            reply: `⚠️ Sorry, that time slot is already booked. Would you like to try a different time?`,
                            bookingCreated: false
                        };
                    }
                } else {
                    // Return AI response asking for more info
                    return {
                        reply: text,
                        bookingCreated: false,
                        pendingBooking: intent
                    };
                }
            }
        }

        return { reply: text, bookingCreated: false };

    } catch (error) {
        console.error("AI Service Error:", error);
        return { reply: "I'm having a bit of a cramp! (Service Error - Please check server logs)", bookingCreated: false };
    }
}

module.exports = { getChatResponse };
