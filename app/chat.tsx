import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MessageCircle, Send, Search, Plus, MoreVertical } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

// Mock data for chats
const DEMO_CHATS = [
  {
    id: '1',
    user: {
      name: 'Emma Roberts',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    lastMessage: 'Would love to collaborate on a fashion post next month!',
    timestamp: '10:30 AM',
    unread: 2,
  },
  {
    id: '2',
    user: {
      name: 'Marcus Chen',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    lastMessage: 'Thanks for sharing my post, I really appreciate it!',
    timestamp: 'Yesterday',
    unread: 0,
  },
  {
    id: '3',
    user: {
      name: 'Style Collective',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    },
    lastMessage: 'We\'d like to offer you a brand ambassadorship. Let me know if you\'re interested.',
    timestamp: 'Yesterday',
    unread: 1,
  },
  {
    id: '4',
    user: {
      name: 'Travel Brands Network',
      avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    },
    lastMessage: 'Check out the campaign details I just sent over.',
    timestamp: 'Monday',
    unread: 0,
  },
  {
    id: '5',
    user: {
      name: 'Sarah Johnson',
      avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    },
    lastMessage: 'Hey! Loved your latest video. How did you edit the intro?',
    timestamp: 'Monday',
    unread: 0,
  },
  {
    id: '6',
    user: {
      name: 'Beauty Connect',
      avatar: 'https://randomuser.me/api/portraits/women/40.jpg',
    },
    lastMessage: 'Your content proposal has been approved! Next steps inside.',
    timestamp: 'Last week',
    unread: 0,
  },
];

export default function ChatScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Filter chats based on search query
  const filteredChats = searchQuery 
    ? DEMO_CHATS.filter(chat => 
        chat.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : DEMO_CHATS;

  // Go to a specific chat conversation
  const goToChat = (chatId: string) => {
    // In a real app, navigate to an individual chat screen
    console.log(`Navigate to chat ${chatId}`);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Messages',
          headerTitleStyle: styles.headerTitle,
        }}
      />
      <StatusBar style="dark" />

      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={18} color="#A4B0BE" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search conversations"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#A4B0BE"
            />
          </View>
          <TouchableOpacity style={styles.newChatButton}>
            <Plus size={22} color="#6C63FF" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.chatList}
          showsVerticalScrollIndicator={false}
        >
          {filteredChats.map(chat => (
            <TouchableOpacity 
              key={chat.id}
              style={styles.chatItem}
              onPress={() => goToChat(chat.id)}
            >
              <Image 
                source={{ uri: chat.user.avatar }} 
                style={styles.avatar} 
              />
              
              <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                  <Text style={styles.userName}>{chat.user.name}</Text>
                  <Text style={styles.timestamp}>{chat.timestamp}</Text>
                </View>
                
                <View style={styles.messageContainer}>
                  <Text 
                    style={[
                      styles.lastMessage,
                      chat.unread > 0 && styles.unreadMessage
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {chat.lastMessage}
                  </Text>
                  
                  {chat.unread > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadCount}>{chat.unread}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.fab}>
            <MessageCircle size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#2F3542',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 15,
    color: '#2F3542',
  },
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F3542',
  },
  timestamp: {
    fontSize: 12,
    color: '#A4B0BE',
  },
  messageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#747D8C',
    marginRight: 8,
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#2F3542',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
}); 