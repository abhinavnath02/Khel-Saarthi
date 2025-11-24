# Fix for Event Creation Date Format Error

## Problem
When creating an event, you're getting this error:
```
ValidationError: Event validation failed: date: Cast to date failed for value "23/11/2025" (type string) at path "date"
```

## Root Cause
The frontend is sending the date in DD/MM/YYYY format (e.g., "23/11/2025"), but MongoDB expects an ISO format date (YYYY-MM-DD, e.g., "2025-11-23").

## Solution

### Option 1: Update Frontend to Convert Date Format (Recommended)

Edit `frontend/screens/CreateEventScreen.js` and replace the `handleCreateEvent` function (lines 23-45) with:

```javascript
const handleCreateEvent = async () => {
    if (!title || !description || !date || !location || !category || !skillLevel) {
        Alert.alert('Error', 'Please fill in all fields and select a location, category, and skill level.');
        return;
    }

    // Convert date from DD/MM/YYYY to ISO format (YYYY-MM-DD)
    let formattedDate;
    try {
        const dateParts = date.split('/');
        if (dateParts.length === 3) {
            const day = dateParts[0].padStart(2, '0');
            const month = dateParts[1].padStart(2, '0');
            const year = dateParts[2];
            formattedDate = `${year}-${month}-${day}`;
        } else {
            Alert.alert('Error', 'Please enter date in DD/MM/YYYY format (e.g., 25/12/2025)');
            return;
        }
    } catch (err) {
        Alert.alert('Error', 'Invalid date format. Please use DD/MM/YYYY');
        return;
    }

    try {
        await api.post('/events', {
            title,
            description,
            date: formattedDate,  // Use the converted date
            location: { type: 'Point', coordinates: [location.longitude, location.latitude] },
            category,
            skillLevel,
            entryFee: parseInt(entryFee),
        });
        Alert.alert('Success', 'Event created successfully!');
        navigation.goBack();
    } catch (error) {
        console.error(error.response?.data);
        const errorMessage = error.response?.data?.message || 'Could not create event.';
        Alert.alert('Error', errorMessage);
    }
};
```

Also update the placeholder text on line 64:
```javascript
placeholder="Date (DD/MM/YYYY)"  // Changed from "Date (YYYY-MM-DD)"
```

### Option 2: Quick Test - Use YYYY-MM-DD Format

For a quick test, just enter the date in YYYY-MM-DD format (e.g., "2025-11-23") when creating an event.

## Testing

After making the changes:
1. Restart the frontend: `npx expo start --lan`
2. Try creating an event with date in DD/MM/YYYY format (e.g., "25/12/2025")
3. The event should be created successfully!

## What the Fix Does

1. **Splits the date** by "/" to get day, month, year
2. **Pads with zeros** if needed (e.g., "5" becomes "05")
3. **Rearranges** to YYYY-MM-DD format
4. **Sends** the properly formatted date to the backend
5. **Shows helpful error** if the format is wrong
