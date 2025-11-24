# Event Banner Image Upload Feature - Implementation Guide

## Overview
This guide explains how to add custom banner image upload functionality for events, allowing hosts to upload their own event banners instead of using default category images.

---

## Current Status

### ✅ Backend Model Updated
The `eventModel.js` has been updated with two new fields:
- `bannerImage`: Stores the Cloudinary URL of the uploaded banner
- `bannerImagePublicId`: Stores the Cloudinary public ID for image management

---

## Implementation Steps

### Step 1: Update Backend Controller

You need to add image upload handling to the event controller.

**File:** `backend/controllers/eventController.js`

Add Cloudinary upload logic similar to how profile pictures are handled in `userController.js`.

```javascript
const cloudinary = require('../config/cloudinary'); // You'll need to create this config
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Update createEvent to handle banner upload
const createEvent = asyncHandler(async (req, res) => {
    const { title, description, date, location, category, skillLevel, entryFee } = req.body;
    
    if (req.user.role !== 'host') {
        res.status(403);
        throw new Error('User is not a host');
    }

    let bannerImage = '';
    let bannerImagePublicId = '';

    // If banner image is uploaded
    if (req.file) {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload_stream(
            { folder: 'event-banners' },
            (error, result) => {
                if (error) throw error;
                return result;
            }
        ).end(req.file.buffer);

        bannerImage = result.secure_url;
        bannerImagePublicId = result.public_id;
    }

    const event = new Event({
        title,
        description,
        date,
        location,
        category,
        skillLevel,
        entryFee,
        host: req.user._id,
        bannerImage,
        bannerImagePublicId
    });

    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
});
```

### Step 2: Update Event Routes

**File:** `backend/routes/eventRoutes.js`

```javascript
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Update routes to handle file uploads
router.route('/').post(protect, upload.single('bannerImage'), createEvent);
router.route('/:id').put(protect, upload.single('bannerImage'), updateEvent);
```

### Step 3: Create Cloudinary Config (if not exists)

**File:** `backend/config/cloudinary.js`

```javascript
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
```

---

## Frontend Implementation

### Step 1: Update CreateEventScreen

**File:** `frontend/screens/CreateEventScreen.js`

Add image picker functionality:

```javascript
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';

const CreateEventScreen = ({ navigation }) => {
    const [bannerImage, setBannerImage] = useState(null);

    // Request permissions
    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please grant camera roll permissions');
            }
        })();
    }, []);

    // Pick image function
    const pickBannerImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [16, 9], // Banner aspect ratio
                quality: 0.8,
            });

            if (!result.canceled) {
                setBannerImage(result.assets[0]);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    // Update handleCreateEvent to include banner
    const handleCreateEvent = async () => {
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('date', date);
            formData.append('location', JSON.stringify({
                type: 'Point',
                coordinates: [location.longitude, location.latitude]
            }));
            formData.append('category', category);
            formData.append('skillLevel', skillLevel);
            formData.append('entryFee', entryFee);

            // Add banner image if selected
            if (bannerImage) {
                formData.append('bannerImage', {
                    uri: bannerImage.uri,
                    type: 'image/jpeg',
                    name: 'banner.jpg',
                });
            }

            await api.post('/events', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            Alert.alert('Success', 'Event created successfully!');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Could not create event.');
        }
    };

    return (
        <ScrollView>
            {/* Banner Image Picker */}
            <View style={styles.bannerSection}>
                <Text style={styles.label}>Event Banner (Optional)</Text>
                <TouchableOpacity 
                    style={styles.bannerPicker}
                    onPress={pickBannerImage}
                >
                    {bannerImage ? (
                        <Image 
                            source={{ uri: bannerImage.uri }} 
                            style={styles.bannerPreview}
                        />
                    ) : (
                        <View style={styles.bannerPlaceholder}>
                            <Ionicons name="image-outline" size={48} color="#999" />
                            <Text style={styles.bannerPlaceholderText}>
                                Tap to upload banner
                            </Text>
                            <Text style={styles.bannerHint}>
                                Recommended: 1600x900px
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
                {bannerImage && (
                    <TouchableOpacity 
                        style={styles.removeBannerButton}
                        onPress={() => setBannerImage(null)}
                    >
                        <Text style={styles.removeBannerText}>Remove Banner</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Rest of your form fields */}
            {/* ... */}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    bannerSection: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        color: '#333',
    },
    bannerPicker: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed',
    },
    bannerPreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    bannerPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bannerPlaceholderText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    bannerHint: {
        marginTop: 5,
        fontSize: 12,
        color: '#999',
    },
    removeBannerButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#ff3b30',
        borderRadius: 8,
        alignItems: 'center',
    },
    removeBannerText: {
        color: '#fff',
        fontWeight: '600',
    },
});
```

### Step 2: Update EditEventScreen

**File:** `frontend/screens/EditEventScreen.js`

Add similar image picker functionality to allow hosts to change the banner when editing events.

### Step 3: Update Event Display Components

**File:** `frontend/screens/EventDetailsScreen.js` and `frontend/components/EventCard.js`

Update to use custom banner if available, otherwise fall back to category image:

```javascript
// In EventDetailsScreen.js
<ImageBackground
    source={{ uri: event.bannerImage || getSportImage(event.category) }}
    style={styles.headerImage}
    imageStyle={styles.headerImageStyle}
>
    {/* ... */}
</ImageBackground>

// In EventCard.js
<ImageBackground
    source={{ uri: event.bannerImage || getSportImage(event.category, 'w=400') }}
    style={styles.imageBackground}
    imageStyle={styles.backgroundImage}
>
    {/* ... */}
</ImageBackground>
```

---

## Required Dependencies

### Backend
```bash
cd backend
npm install cloudinary multer
```

### Frontend
```bash
cd frontend
npx expo install expo-image-picker
```

---

## Environment Variables

Add to `backend/.env`:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Testing Checklist

- [ ] Create event with custom banner
- [ ] Create event without banner (uses default category image)
- [ ] Edit event and change banner
- [ ] Edit event and remove banner
- [ ] View event details with custom banner
- [ ] View event card in list with custom banner
- [ ] Delete event (ensure Cloudinary image is also deleted)

---

## Current Workaround (Until Full Implementation)

**For now, events use default category-based images from Unsplash:**

The `getSportImage()` function in `utils/constants.js` automatically assigns images based on the sport category:
- Badminton → Badminton court image
- Cricket → Cricket field image
- Football → Football field image
- etc.

**To change the default images:**
1. Open `frontend/utils/constants.js`
2. Update the `SPORT_IMAGES` object with your preferred Unsplash URLs
3. Or use any other image hosting service URLs

```javascript
export const SPORT_IMAGES = {
  'Badminton': 'https://your-custom-badminton-image-url.jpg',
  'Cricket': 'https://your-custom-cricket-image-url.jpg',
  // ... etc
};
```

---

## Next Steps

1. ✅ Backend model updated (DONE)
2. ⏳ Implement Cloudinary upload in backend controller
3. ⏳ Add image picker to CreateEventScreen
4. ⏳ Add image picker to EditEventScreen
5. ⏳ Update display components to use custom banners
6. ⏳ Test end-to-end functionality

---

## Support

If you need help implementing any of these steps, let me know which part you'd like me to code for you!
