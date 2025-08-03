import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, Image, SafeAreaView, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../../providers/AuthProvider';
import { Camera, BarChart2, Briefcase, Plus, Bell, Calendar, Clock, ArrowUp, ArrowUpRight, ChevronRight, Eye, MessageCircle, Heart } from 'lucide-react-native';

// Mock data for dashboard
const RECENT_ACTIVITY = [
  { id: '1', type: 'comment', user: 'Sarah Johnson', content: 'commented on your post', time: '2h ago' },
  { id: '2', type: 'like', user: 'Michael Chen', content: 'liked your photo', time: '4h ago' },
  { id: '3', type: 'mention', user: 'Jessica Williams', content: 'mentioned you in a comment', time: '1d ago' },
];

const TOP_PERFORMING_POSTS = [
  { 
    id: '1', 
    image: 'https://picsum.photos/seed/picsum1/150/150', 
    engagement: 4.5,
    views: 12400,
    likes: 843,
    comments: 65
  },
  { 
    id: '2', 
    image: 'https://picsum.photos/seed/picsum2/150/150', 
    engagement: 6.2,
    views: 18700,
    likes: 1256,
    comments: 98
  },
];

const UPCOMING_TASKS = [
  { id: '1', title: 'Post Brand Collab', deadline: 'Today, 5:00 PM', brand: 'FashionBrand', urgent: true },
  { id: '2', title: 'Review Analytics Report', deadline: 'Tomorrow, 12:00 PM', urgent: false },
  { id: '3', title: 'Finalize Content Calendar', deadline: 'Sep 15, 2023', urgent: false },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const actionButtonScale = new Animated.Value(1);

  // Handle quick action press
  const toggleQuickActions = () => {
    setQuickActionsOpen(!quickActionsOpen);
    Animated.sequence([
      Animated.timing(actionButtonScale, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(actionButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Tab Switching using replace
  const goToTab = (tabPath: string) => {
    router.replace(tabPath as `/(tabs)/${string}`);
    if (quickActionsOpen) setQuickActionsOpen(false);
  };

  // Navigating to a detail screen WITHIN the tabs stack using relative paths
  const goToDetailScreen = (relativePath: string) => {
    // Push using a path relative to the current screen (index.tsx within tabs)
    router.push(relativePath);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerTitle: 'Home',
          headerTitleStyle: styles.headerTitle,
          headerBackVisible: false
        }}
      />
      <StatusBar style="dark" />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>
              Welcome back, {user?.user_metadata?.display_name || 'Creator'}!
            </Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </View>
          
          {/* Performance Summary */}
          <View style={styles.performanceCard}>
            <Text style={styles.cardTitle}>Performance Summary</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={styles.statHeader}>
                  <Text style={styles.statLabel}>Followers</Text>
                  <ArrowUp size={12} color="#4CAF50" />
                </View>
                <Text style={styles.statValue}>24.5K</Text>
                <Text style={styles.statChange}>+12.4%</Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={styles.statHeader}>
                  <Text style={styles.statLabel}>Engagement</Text>
                  <ArrowUpRight size={12} color="#4CAF50" />
                </View>
                <Text style={styles.statValue}>5.7%</Text>
                <Text style={styles.statChange}>+3.2%</Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={styles.statHeader}>
                  <Text style={styles.statLabel}>Revenue</Text>
                  <ArrowUp size={12} color="#4CAF50" />
                </View>
                <Text style={styles.statValue}>$12.4K</Text>
                <Text style={styles.statChange}>+18.5%</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.viewMoreButton}
              onPress={() => goToTab('/(tabs)/analytics')}
            >
              <Text style={styles.viewMoreText}>View detailed analytics</Text>
              <ChevronRight size={16} color="#6C63FF" />
            </TouchableOpacity>
          </View>
          
          {/* Top Performing Posts */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Performing Posts</Text>
              <TouchableOpacity onPress={() => goToDetailScreen('./all-posts')}> 
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.postsScrollView}
            >
              {TOP_PERFORMING_POSTS.map(post => (
                <TouchableOpacity key={post.id} style={styles.postCard} onPress={() => goToDetailScreen(`./post/${post.id}`)}>
                  <Image source={{ uri: post.image }} style={styles.postImage} />
                  <View style={styles.postStats}>
                    <View style={styles.postStat}>
                      <Eye size={14} color="#747D8C" />
                      <Text style={styles.postStatText}>{(post.views / 1000).toFixed(1)}K</Text>
                    </View>
                    <View style={styles.postStat}>
                      <Heart size={14} color="#747D8C" />
                      <Text style={styles.postStatText}>{post.likes}</Text>
                    </View>
                    <View style={styles.postStat}>
                      <MessageCircle size={14} color="#747D8C" />
                      <Text style={styles.postStatText}>{post.comments}</Text>
                    </View>
                  </View>
                  <View style={styles.engagementBadge}>
                    <Text style={styles.engagementText}>{post.engagement}% Engagement</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Upcoming Tasks */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
              <TouchableOpacity onPress={() => goToDetailScreen('./all-tasks')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            {UPCOMING_TASKS.map(task => (
              <TouchableOpacity key={task.id} style={styles.taskCard} onPress={() => goToDetailScreen(`./task/${task.id}`)}>
                <View style={styles.taskIconContainer}>
                  <Calendar size={20} color="#6C63FF" />
                </View>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View style={styles.taskDeadlineRow}>
                    <Clock size={12} color="#747D8C" />
                    <Text style={styles.taskDeadline}>{task.deadline}</Text>
                  </View>
                </View>
                {task.urgent && (
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentText}>Urgent</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Recent Activity */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => goToDetailScreen('./all-activity')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            {RECENT_ACTIVITY.map(activity => (
              <TouchableOpacity key={activity.id} style={styles.activityItem} onPress={() => goToDetailScreen(`./activity/${activity.id}`)}>
                <View style={styles.activityIconContainer}>
                  {activity.type === 'comment' && <MessageCircle size={18} color="#2196F3" />}
                  {activity.type === 'like' && <Heart size={18} color="#F44336" />}
                  {activity.type === 'mention' && <Bell size={18} color="#FF9800" />}
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText} numberOfLines={2}>
                    <Text style={styles.activityUser}>{activity.user}</Text> {activity.content}
                  </Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      
      {/* Quick Actions Menu */}
      <View style={styles.quickActionsContainer}>
        {quickActionsOpen && (
          <>
            <View style={styles.quickActionsBackground} />
            
            <TouchableOpacity 
              style={[styles.quickActionButton, styles.postButton]}
              onPress={() => goToTab('/(tabs)/content')}
            >
              <Camera size={24} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Post</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionButton, styles.statsButton]}
              onPress={() => goToTab('/(tabs)/analytics')}
            >
              <BarChart2 size={24} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Stats</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionButton, styles.dealButton]}
              onPress={() => goToTab('/(tabs)/business')}
            >
              <Briefcase size={24} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Deal</Text>
            </TouchableOpacity>
          </>
        )}
        
        <TouchableOpacity 
          style={styles.mainActionButton}
          onPress={toggleQuickActions}
        >
          <Animated.View style={{ transform: [{ scale: actionButtonScale }] }}>
            <Plus size={32} color="#FFFFFF" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#2F3542',
  },
  notificationButton: {
    padding: 8,
    marginRight: 8,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2F3542',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#747D8C',
  },
  performanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F3542',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#747D8C',
    marginRight: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F3542',
    marginBottom: 2,
  },
  statChange: {
    fontSize: 12,
    color: '#4CAF50',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    marginTop: 8,
  },
  viewMoreText: {
    fontSize: 14,
    color: '#6C63FF',
    marginRight: 4,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F3542',
  },
  seeAllText: {
    fontSize: 14,
    color: '#6C63FF',
  },
  postsScrollView: {
    marginLeft: -8,
    marginRight: -8,
  },
  postCard: {
    width: 150,
    marginHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postStatText: {
    fontSize: 12,
    color: '#747D8C',
    marginLeft: 4,
  },
  engagementBadge: {
    padding: 8,
    alignItems: 'center',
  },
  engagementText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4CAF50',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2F3542',
    marginBottom: 4,
  },
  taskDeadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDeadline: {
    fontSize: 12,
    color: '#747D8C',
    marginLeft: 4,
  },
  urgentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 12,
  },
  urgentText: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: '500',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#2F3542',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  activityUser: {
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    color: '#747D8C',
  },
  quickActionsContainer: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    alignItems: 'center',
  },
  quickActionsBackground: {
    position: 'absolute',
    bottom: 30,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  mainActionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
  },
  quickActionButton: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  postButton: {
    backgroundColor: '#FF4081',
    bottom: 90,
    left: -60,
  },
  statsButton: {
    backgroundColor: '#4CAF50',
    bottom: 130,
  },
  dealButton: {
    backgroundColor: '#2196F3',
    bottom: 90,
    right: -60,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
});