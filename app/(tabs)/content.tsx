import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Platform,
  SafeAreaView,
  Modal,
  ActivityIndicator
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth, Post } from '../../providers/AuthProvider';
import {
  Image as ImageIcon,
  Video,
  FilePlus,
  Type,
  Crop,
  RotateCcw,
  Sliders,
  Hash,
  Smile,
  Calendar,
  Clock,
  Instagram,
  Twitter,
  Facebook,
  MapPin,
  SwitchCamera,
  X,
  Send,
  Save,
  CheckCircle
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import SchedulingCalendar, { ScheduledPost } from '../components/SchedulingCalendar';

// Demo content options
const FILTER_OPTIONS = ['Original', 'Vivid', 'Mono', 'Warm', 'Cool', 'Vintage'];
const PLATFORM_OPTIONS = ['Instagram', 'TikTok', 'Twitter', 'Facebook', 'YouTube'];
const DEMO_HASHTAGS = ['travel', 'lifestyle', 'fashion', 'photography', 'nature', 'food', 'fitness'];

// Demo scheduled posts
const DEMO_SCHEDULED_POSTS: ScheduledPost[] = [
  {
    id: '1',
    title: 'Beach sunset photo',
    date: new Date(new Date().setDate(new Date().getDate() + 2)),
    platform: 'Instagram',
    image: 'https://picsum.photos/seed/beach/200/200',
    status: 'scheduled'
  },
  {
    id: '2',
    title: 'New product review',
    date: new Date(new Date().setDate(new Date().getDate() + 4)),
    platform: 'YouTube',
    image: 'https://picsum.photos/seed/product/200/200',
    status: 'scheduled'
  },
  {
    id: '3',
    title: 'Travel tips thread',
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    platform: 'Twitter',
    image: 'https://picsum.photos/seed/travel/200/200',
    status: 'scheduled'
  }
];

// Define Post Status options
const POST_STATUS_OPTIONS: { label: string; value: Post['status'] | 'post_now'; icon: React.ElementType }[] = [
  { label: 'Post Now', value: 'post_now', icon: Send },
  { label: 'Schedule', value: 'scheduled', icon: Clock },
  { label: 'Save Draft', value: 'draft', icon: Save },
];

export default function ContentScreen() {
  const router = useRouter();
  const { user, uploadMedia, createPost } = useAuth();
  const [activeTab, setActiveTab] = useState('create');
  const [mediaPicked, setMediaPicked] = useState(false);
  const [pickedMediaUri, setPickedMediaUri] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Original');
  const [selectedPlatform, setSelectedPlatform] = useState('Instagram');
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [postStatus, setPostStatus] = useState<'post_now' | Post['status']>('post_now');
  const [location, setLocation] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  
  // Scheduling state (consolidate)
  const [scheduleDateTime, setScheduleDateTime] = useState(new Date(Date.now() + 60 * 60 * 1000)); // Default to 1 hour from now
  const [showScheduleDatePicker, setShowScheduleDatePicker] = useState(false);
  const [showScheduleTimePicker, setShowScheduleTimePicker] = useState(false);
  
  // Actual image picker function
  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    // Launch image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.All, // Allow images and videos
      allowsEditing: true,
      aspect: [4, 5], // Common social media aspect ratio
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPickedMediaUri(result.assets[0].uri);
      setMediaPicked(true);
      setIsEditing(false);
    } else {
      setPickedMediaUri(null);
      setMediaPicked(false);
    }
  };

  // Toggle hashtag selection
  const toggleHashtag = (tag: string) => {
    if (selectedHashtags.includes(tag)) {
      setSelectedHashtags(selectedHashtags.filter(t => t !== tag));
    } else {
      setSelectedHashtags([...selectedHashtags, tag]);
    }
  };

  // Navigate to settings
  const navigateToSettings = () => {
    router.push('/settings');
  };

  // Navigate to admin dashboard
  const navigateToAdminDashboard = () => {
    router.push('/admin-dashboard');
  };

  // Helper to format date/time for display
  const formatScheduleDateTime = (date: Date): string => {
      return date.toLocaleString(undefined, { 
          month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
      });
  };

  // Handle combined date/time picker changes
  const onScheduleDateTimeChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || scheduleDateTime;
    // Close both pickers on Android after selection/dismiss
    if (Platform.OS === 'android') {
        setShowScheduleDatePicker(false);
        setShowScheduleTimePicker(false);
    }
    // Update state only if a date was selected
    if (selectedDate) {
        // Prevent scheduling in the past (allow some buffer e.g., 1 minute)
        if (currentDate.getTime() < Date.now() - 60000) {
            alert("Cannot schedule posts in the past.");
        } else {
            setScheduleDateTime(currentDate);
        }
    }
    // For iOS, keep the specific picker open until user dismisses it
    // No change needed here as separate states control visibility
  };

  const showDatePicker = () => {
      setShowScheduleDatePicker(true);
      setShowScheduleTimePicker(false); // Ensure only one picker is conceptually open
  };

  const showTimePicker = () => {
      setShowScheduleTimePicker(true);
      setShowScheduleDatePicker(false);
  };

  // Consolidated submit handler
  const handleSubmitPost = async () => {
    if (!mediaPicked || !pickedMediaUri || !user) {
        alert('Please select media to post.');
        return;
    }
    
    // Validate schedule date if scheduling
    if (postStatus === 'scheduled' && scheduleDateTime.getTime() < Date.now()) {
       alert('Scheduled time must be in the future.');
       return;
    }

    setIsPosting(true);
    try {
      // 1. Upload Media (only if not a draft without media? TBD)
      // Let's assume media is required for now
      const mediaUrl = await uploadMedia(pickedMediaUri);

      // 2. Prepare Post Data based on status
      const postData: Omit<Post, 'user_id'> = {
        media_url: mediaUrl,
        caption: caption,
        platform: selectedPlatform,
        status: postStatus === 'post_now' ? 'posted' : postStatus, // Map 'post_now' to 'posted' for DB
        scheduled_at: postStatus === 'scheduled' ? scheduleDateTime.toISOString() : null,
        // Add hashtags, location etc. if your Post type includes them
      };

      // 3. Create Post Record
      await createPost(postData);

      // 4. Reset Form & Update UI
      let successMessage = 'Post created successfully!';
      if (postStatus === 'scheduled') successMessage = 'Post scheduled successfully!';
      if (postStatus === 'draft') successMessage = 'Post saved as draft!';
      alert(successMessage);
      resetForm();
      // Optionally navigate somewhere or refresh a feed/list

    } catch (error: any) {
      console.error("Failed to submit post:", error);
      alert(`Failed to submit post: ${error.message}`);
    } finally {
      setIsPosting(false);
    }
  };

  // Helper function to reset the form state
  const resetForm = () => {
    setMediaPicked(false);
    setPickedMediaUri(null);
    setIsEditing(false);
    setCaption('');
    setSelectedFilter('Original');
    setSelectedPlatform('Instagram');
    setSelectedHashtags([]);
    setPostStatus('post_now');
    setLocation('');
    setIsPosting(false);
    setScheduleDateTime(new Date(Date.now() + 60 * 60 * 1000)); // Reset schedule time
    setShowScheduleDatePicker(false);
    setShowScheduleTimePicker(false);
  };

  // --- Image Manipulation Functions ---
  const handleCrop = async () => {
    if (!pickedMediaUri) return;
    setIsEditing(true);
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        pickedMediaUri,
        [{ crop: { originX: 0, originY: 0, width: 1080, height: 1350 } }],
        { compress: 1, format: ImageManipulator.SaveFormat.PNG } 
      );
      setPickedMediaUri(manipResult.uri);
    } catch (error) {
      console.error("Error cropping image:", error);
      alert("Failed to crop image.");
    } finally {
      setIsEditing(false);
    }
  };

  const handleRotate = async () => {
    if (!pickedMediaUri) return;
    setIsEditing(true);
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        pickedMediaUri,
        [{ rotate: 90 }],
        { compress: 1, format: ImageManipulator.SaveFormat.PNG }
      );
      setPickedMediaUri(manipResult.uri);
    } catch (error) {
      console.error("Error rotating image:", error);
      alert("Failed to rotate image.");
    } finally {
      setIsEditing(false);
    }
  };
  // --- End Image Manipulation ---

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Content Studio',
          headerRight: () => (
            <View style={{ flexDirection: 'row' }}>
              {user?.user_metadata?.role === 'admin' && (
                <TouchableOpacity onPress={navigateToAdminDashboard} style={[styles.headerButton, { marginRight: 10 }]}>
                  <Text style={styles.headerButtonText}>Admin</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={navigateToSettings} style={styles.headerButton}>
                <Text style={styles.headerButtonText}>Settings</Text>
              </TouchableOpacity>
            </View>
          ),
          headerBackVisible: false
        }}
      />
      <StatusBar style="dark" />

      {/* Content Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'create' && styles.activeTab]}
          onPress={() => setActiveTab('create')}
        >
          <FilePlus
            size={18}
            color={activeTab === 'create' ? '#6C63FF' : '#A4B0BE'}
          />
          <Text style={[styles.tabText, activeTab === 'create' && styles.activeTabText]}>
            Create
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'schedule' && styles.activeTab]}
          onPress={() => setActiveTab('schedule')}
        >
          <Calendar
            size={18}
            color={activeTab === 'schedule' ? '#6C63FF' : '#A4B0BE'}
          />
          <Text style={[styles.tabText, activeTab === 'schedule' && styles.activeTabText]}>
            Schedule
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'drafts' && styles.activeTab]}
          onPress={() => setActiveTab('drafts')}
        >
          <FilePlus
            size={18}
            color={activeTab === 'drafts' ? '#6C63FF' : '#A4B0BE'}
          />
          <Text style={[styles.tabText, activeTab === 'drafts' && styles.activeTabText]}>
            Drafts
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'create' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Media Upload Section */}
          <View style={styles.uploadSection}>
            {!mediaPicked ? (
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <View style={styles.uploadContent}>
                  <ImageIcon size={32} color="#6C63FF" />
                  <Text style={styles.uploadText}>Tap to upload media</Text>
                  <Text style={styles.uploadSubtext}>
                    JPG, PNG, MP4, MOV
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.mediaPreview}>
                {pickedMediaUri && (
                  <Image
                    source={{ uri: pickedMediaUri }}
                    style={styles.previewImage}
                  />
                )}
                
                <View style={styles.mediaControls}>
                  <TouchableOpacity style={styles.mediaControl} onPress={handleCrop}>
                    <Crop size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.mediaControl} onPress={handleRotate}>
                    <RotateCcw size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.mediaControl} onPress={pickImage}>
                    <SwitchCamera size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Filter Options */}
          {mediaPicked && (
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Filters</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filtersScrollView}
              >
                {FILTER_OPTIONS.map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterOption,
                      selectedFilter === filter && styles.selectedFilterOption,
                    ]}
                    onPress={() => setSelectedFilter(filter)}
                  >
                    <Text style={styles.filterText}>{filter}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Caption Section */}
          <View style={styles.captionSection}>
            <Text style={styles.sectionTitle}>Caption</Text>
            <TextInput
              style={styles.captionInput}
              multiline
              placeholder="Write a caption..."
              value={caption}
              onChangeText={setCaption}
            />
          </View>

          {/* Hashtags Section */}
          <View style={styles.hashtagsSection}>
            <Text style={styles.sectionTitle}>Hashtags</Text>
            <View style={styles.hashtagsContainer}>
              {DEMO_HASHTAGS.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.hashtagButton,
                    selectedHashtags.includes(tag) && styles.selectedHashtagButton,
                  ]}
                  onPress={() => toggleHashtag(tag)}
                >
                  <Text
                    style={[
                      styles.hashtagButtonText,
                      selectedHashtags.includes(tag) && styles.selectedHashtagButtonText,
                    ]}
                  >
                    #{tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Platform Settings */}
          <View style={styles.platformSection}>
            <Text style={styles.sectionTitle}>Platform</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.platformScrollView}
            >
              {PLATFORM_OPTIONS.map((platform) => (
                <TouchableOpacity
                  key={platform}
                  style={[
                    styles.platformOption,
                    selectedPlatform === platform && styles.selectedPlatformOption,
                  ]}
                  onPress={() => setSelectedPlatform(platform)}
                >
                  <View style={styles.platformIcon}>
                    {platform === 'Instagram' && <Instagram size={18} color={selectedPlatform === platform ? '#FFFFFF' : '#6C63FF'} />}
                    {platform === 'Twitter' && <Twitter size={18} color={selectedPlatform === platform ? '#FFFFFF' : '#6C63FF'} />}
                    {platform === 'Facebook' && <Facebook size={18} color={selectedPlatform === platform ? '#FFFFFF' : '#6C63FF'} />}
                    {platform === 'TikTok' && <Video size={18} color={selectedPlatform === platform ? '#FFFFFF' : '#6C63FF'} />}
                    {platform === 'YouTube' && <Video size={18} color={selectedPlatform === platform ? '#FFFFFF' : '#6C63FF'} />}
                  </View>
                  <Text
                    style={[
                      styles.platformText,
                      selectedPlatform === platform && styles.selectedPlatformText,
                    ]}
                  >
                    {platform}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Location */}
          <View style={styles.locationSection}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationInputContainer}>
              <MapPin size={18} color="#A4B0BE" style={styles.locationIcon} />
              <TextInput
                style={styles.locationInput}
                placeholder="Add location"
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>

          {/* Publishing Options */}
          <View style={styles.publishSection}>
            <Text style={styles.sectionTitle}>Publish Options</Text>
            <View style={styles.statusSelector}>
               {POST_STATUS_OPTIONS.map((option) => (
                   <TouchableOpacity 
                       key={option.value}
                       style={[
                           styles.statusButton,
                           postStatus === option.value && styles.statusButtonActive
                       ]}
                       onPress={() => setPostStatus(option.value)}
                   >
                       <option.icon size={18} color={postStatus === option.value ? '#6C63FF' : '#747D8C'} />
                       <Text 
                          style={[
                              styles.statusButtonText,
                              postStatus === option.value && styles.statusButtonTextActive
                          ]}>
                               {option.label}
                           </Text>
                   </TouchableOpacity>
               ))}
            </View>
            
            {postStatus === 'scheduled' && (
                <View style={styles.scheduleDateTimeContainer}>
                   <Text style={styles.scheduleLabel}>Schedule Date & Time:</Text>
                   <TouchableOpacity onPress={showDatePicker} style={styles.dateTimePickerButton}>
                       <Text style={styles.dateTimePickerText}>{formatScheduleDateTime(scheduleDateTime)}</Text>
                       <Calendar size={18} color="#6C63FF" />
                   </TouchableOpacity>
                   {/* Conditional Date Picker */} 
                   {showScheduleDatePicker && (
                       <TextInput
                         style={styles.dateTimePickerText}
                         value={scheduleDateTime.toLocaleDateString()}
                         onChangeText={(text) => {
                           const newDate = new Date(text);
                           if (newDate.getTime() < Date.now() - 60000) {
                             alert("Cannot schedule posts in the past.");
                           } else {
                             setScheduleDateTime(newDate);
                           }
                         }}
                         onFocus={() => {
                           setShowScheduleDatePicker(true);
                           setShowScheduleTimePicker(false);
                         }}
                         onBlur={() => {
                           if (scheduleDateTime.getTime() < Date.now() - 60000) {
                             setScheduleDateTime(new Date(Date.now() + 60 * 60 * 1000));
                           }
                         }}
                       />
                   )}
                   {/* Conditional Time Picker */} 
                   {showScheduleTimePicker && (
                       <TextInput
                         style={styles.dateTimePickerText}
                         value={scheduleDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         onChangeText={(text) => {
                           const [hours, minutes] = text.split(':');
                           const newDate = new Date(scheduleDateTime);
                           newDate.setHours(parseInt(hours, 10));
                           newDate.setMinutes(parseInt(minutes, 10));
                           if (newDate.getTime() < Date.now() - 60000) {
                             alert("Cannot schedule posts in the past.");
                           } else {
                             setScheduleDateTime(newDate);
                           }
                         }}
                         onFocus={() => {
                           setShowScheduleDatePicker(false);
                           setShowScheduleTimePicker(true);
                         }}
                         onBlur={() => {
                           if (scheduleDateTime.getTime() < Date.now() - 60000) {
                             setScheduleDateTime(new Date(Date.now() + 60 * 60 * 1000));
                           }
                         }}
                       />
                   )}
                   {/* Show time picker button on iOS after date selected? Better UX might be needed */} 
                   {Platform.OS === 'ios' && !showScheduleTimePicker && (
                      <TouchableOpacity onPress={showTimePicker} style={[styles.dateTimePickerButton, {marginTop: 5}]}>
                          <Text style={styles.dateTimePickerText}>Set Time</Text>
                          <Clock size={18} color="#6C63FF" />
                      </TouchableOpacity>
                   )}
                </View>
            )}
          </View>

          {/* Action Button */}
          <TouchableOpacity 
             style={[styles.postButton, isPosting && styles.postButtonDisabled]}
             onPress={handleSubmitPost}
             disabled={isPosting}
           >
            {isPosting ? (
               <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.postButtonText}>
                 {postStatus === 'draft' ? 'Save Draft' : postStatus === 'scheduled' ? 'Schedule Post' : 'Post Now'}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.discardButton} onPress={resetForm}>
             <Text style={styles.discardButtonText}>Discard</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {activeTab === 'schedule' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {DEMO_SCHEDULED_POSTS.length > 0 ? (
            <>
              <SchedulingCalendar.CalendarView 
                posts={DEMO_SCHEDULED_POSTS}
                onSelectDate={(date) => {
                  // Handle date selection
                }}
                selectedDate={new Date()}
              />
              
              <View style={styles.scheduledPostsContainer}>
                <Text style={styles.sectionTitle}>
                  Posts for {new Date().toLocaleDateString()}
                </Text>
                
                {DEMO_SCHEDULED_POSTS.map((post) => (
                  <View key={post.id} style={styles.scheduledPostCard}>
                    <Image 
                      source={{ uri: post.image }} 
                      style={styles.scheduledPostImage} 
                    />
                    <View style={styles.scheduledPostDetails}>
                      <Text style={styles.scheduledPostTitle}>{post.title}</Text>
                      <View style={styles.scheduledPostMeta}>
                        <Text style={styles.scheduledPostPlatform}>{post.platform}</Text>
                        <Text style={styles.scheduledPostTime}>
                          {new Date(post.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                      <View style={[
                        styles.scheduledPostStatus,
                        post.status === 'scheduled' && styles.statusScheduled,
                        post.status === 'posted' && styles.statusPosted,
                        post.status === 'failed' && styles.statusFailed
                      ]}>
                        <Text style={styles.scheduledPostStatusText}>
                          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={64} color="#DDDDDD" />
              <Text style={styles.emptyStateTitle}>No Scheduled Posts</Text>
              <Text style={styles.emptyStateText}>
                Your scheduled posts will appear here
              </Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => setActiveTab('create')}
              >
                <Text style={styles.emptyStateButtonText}>Create New Post</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {activeTab === 'drafts' && (
        <View style={styles.emptyState}>
          <FilePlus size={64} color="#DDDDDD" />
          <Text style={styles.emptyStateTitle}>No Drafts Found</Text>
          <Text style={styles.emptyStateText}>
            Save drafts to pick up where you left off
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerButton: {
    paddingHorizontal: 10,
  },
  headerButtonText: {
    color: '#6C63FF',
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#6C63FF',
  },
  tabText: {
    fontSize: 14,
    color: '#A4B0BE',
  },
  activeTabText: {
    color: '#6C63FF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  uploadSection: {
    marginBottom: 20,
  },
  uploadButton: {
    height: 250,
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadContent: {
    alignItems: 'center',
  },
  uploadText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#6C63FF',
  },
  uploadSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: '#A4B0BE',
  },
  mediaPreview: {
    height: 350,
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  mediaControls: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  mediaControl: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2F3542',
  },
  filtersScrollView: {
    flexDirection: 'row',
  },
  filterOption: {
    marginRight: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5F6FA',
    borderRadius: 20,
  },
  selectedFilterOption: {
    backgroundColor: '#6C63FF',
  },
  filterText: {
    fontSize: 14,
    color: '#2F3542',
  },
  selectedFilterText: {
    color: '#FFFFFF',
  },
  captionSection: {
    marginBottom: 20,
  },
  captionInput: {
    height: 100,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  hashtagsSection: {
    marginBottom: 20,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hashtagButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
  },
  selectedHashtagButton: {
    backgroundColor: '#6C63FF',
  },
  hashtagButtonText: {
    fontSize: 14,
    color: '#2F3542',
  },
  selectedHashtagButtonText: {
    color: '#FFFFFF',
  },
  platformSection: {
    marginBottom: 20,
  },
  platformScrollView: {
    flexDirection: 'row',
  },
  platformOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    gap: 8,
  },
  selectedPlatformOption: {
    backgroundColor: '#6C63FF',
  },
  platformIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  platformText: {
    fontSize: 14,
    color: '#2F3542',
  },
  selectedPlatformText: {
    color: '#FFFFFF',
  },
  locationSection: {
    marginBottom: 20,
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  locationIcon: {
    marginRight: 8,
  },
  locationInput: {
    flex: 1,
    height: 46,
    fontSize: 14,
  },
  publishSection: {
    marginBottom: 20,
  },
  statusSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    marginTop: 5,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E9ECEF',
    backgroundColor: '#F8F9FA',
  },
  statusButtonActive: {
    borderColor: '#6C63FF',
    backgroundColor: '#F0EEFF',
  },
  statusButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#747D8C',
  },
  statusButtonTextActive: {
    color: '#6C63FF',
    fontWeight: '600',
  },
  scheduleDateTimeContainer: {
      marginTop: 15,
      padding: 15,
      backgroundColor: '#F8F9FA',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#E9ECEF',
  },
  scheduleLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: '#747D8C',
      marginBottom: 10,
  },
  dateTimePickerButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#CED4DA',
  },
  dateTimePickerText: {
      fontSize: 16,
      color: '#2F3542',
  },
  postButton: {
    marginTop: 20,
    backgroundColor: '#6C63FF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: '#A4B0BE',
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  discardButton: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
  },
  discardButtonText: {
    color: '#FF6B6B',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F3542',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#A4B0BE',
    textAlign: 'center',
  },
  emptyStateButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#6C63FF',
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  scheduledPostsContainer: {
    marginBottom: 20,
  },
  scheduledPostCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduledPostImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  scheduledPostDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  scheduledPostTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F3542',
    marginBottom: 4,
  },
  scheduledPostMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scheduledPostPlatform: {
    fontSize: 14,
    color: '#6C63FF',
  },
  scheduledPostTime: {
    fontSize: 14,
    color: '#A4B0BE',
  },
  scheduledPostStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusScheduled: {
    backgroundColor: '#E3F2FD',
  },
  statusPosted: {
    backgroundColor: '#E8F5E9',
  },
  statusFailed: {
    backgroundColor: '#FFEBEE',
  },
  scheduledPostStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});