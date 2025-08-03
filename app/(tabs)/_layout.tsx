import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { Home, PenSquare, BarChart2, Briefcase, User } from 'lucide-react-native';

// Define the possible tab routes for type safety
type TabRouteName = 'index' | 'content' | 'analytics' | 'business' | 'profile';
// Define the actual route paths corresponding to the names
type TabRoutePath = '/(tabs)' | '/(tabs)/content' | '/(tabs)/analytics' | '/(tabs)/business' | '/(tabs)/profile';

const TABS: { name: TabRouteName; path: TabRoutePath; icon: React.ElementType }[] = [
  { name: 'index', path: '/(tabs)', icon: Home },
  { name: 'content', path: '/(tabs)/content', icon: PenSquare },
  { name: 'analytics', path: '/(tabs)/analytics', icon: BarChart2 },
  { name: 'business', path: '/(tabs)/business', icon: Briefcase },
  { name: 'profile', path: '/(tabs)/profile', icon: User },
];

// Create a tab layout following the PRD UI/UX specifications
export default function TabsLayout() {
  const router = useRouter();
  const segments = useSegments();

  // Helper to determine the active tab based on the segments array
  const getCurrentTabName = (): TabRouteName => {
    const currentPath = '/' + segments.join('/'); // Reconstruct path like /a/b/c
    // Find the tab whose path matches the start of the current path
    // For index, the path is '/(tabs)' which should match
    const matchedTab = TABS.find(tab => currentPath.startsWith(tab.path) && (tab.name !== 'index' || currentPath === tab.path));
    
    // If a specific tab matches, return its name, otherwise default to index
    return matchedTab ? matchedTab.name : 'index'; 
  };
  
  const activeTabName = getCurrentTabName();

  // Navigate to the selected tab
  const goToTab = (tab: { name: TabRouteName; path: TabRoutePath }) => {
    // Prevent navigating to the same tab again
    if (activeTabName === tab.name) {
      return;
    }
    
    // Navigate using the predefined, type-safe path
    router.replace(tab.path);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      <View style={styles.content}>
        {/* This is where the screen content will be rendered */}
        <Stack />
      </View>
      
      {/* Custom tab bar based on PRD UI/UX section 5.1 */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTabName === tab.name;
          const Icon = tab.icon;
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => goToTab(tab)}
            >
              <Icon size={22} color={isActive ? '#6C63FF' : '#A4B0BE'} />
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab.name === 'index' ? 'Home' : tab.name.charAt(0).toUpperCase() + tab.name.slice(1)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
    height: 60,
    paddingBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 12,
    color: '#A4B0BE',
    marginTop: 4,
  },
  activeTabText: {
    color: '#6C63FF',
  },
});
