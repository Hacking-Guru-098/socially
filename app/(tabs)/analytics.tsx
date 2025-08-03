import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { 
  Users, TrendingUp, BarChart2, ChevronDown, Eye, 
  MessageCircle, Heart, Clock, Calendar, ArrowUp, ArrowDown, Filter
} from 'lucide-react-native';

// Screen width for responsive layouts
const screenWidth = Dimensions.get('window').width;

// Mock data for analytics
const GROWTH_DATA = [
  { 
    id: 'followers',
    title: 'Followers',
    count: '25.4K',
    growth: 12.5,
    isPositive: true,
    icon: Users,
    color: '#6C63FF',
  },
  { 
    id: 'engagement',
    title: 'Engagement',
    count: '5.7%',
    growth: 3.2,
    isPositive: true,
    icon: TrendingUp,
    color: '#FF9800',
  },
  { 
    id: 'reach',
    title: 'Reach',
    count: '150K',
    growth: 18.3,
    isPositive: true,
    icon: Eye,
    color: '#4CAF50',
  },
  { 
    id: 'views',
    title: 'Views',
    count: '75.4K',
    growth: -3.4,
    isPositive: false,
    icon: BarChart2,
    color: '#2196F3',
  },
];

// Content performance data
const CONTENT_PERFORMANCE = [
  {
    id: '1',
    title: 'Summer Fashion Tips',
    type: 'Post',
    platform: 'Instagram',
    date: '2 days ago',
    stats: {
      views: 12450,
      likes: 843,
      comments: 65,
      shares: 124,
    },
    engagement: 4.5,
  },
  {
    id: '2',
    title: 'Behind the Scenes',
    type: 'Reel',
    platform: 'Instagram',
    date: '5 days ago',
    stats: {
      views: 18730,
      likes: 1256,
      comments: 98,
      shares: 275,
    },
    engagement: 6.2,
  },
  {
    id: '3',
    title: 'Morning Routine',
    type: 'Video',
    platform: 'TikTok',
    date: '1 week ago',
    stats: {
      views: 32150,
      likes: 2530,
      comments: 187,
      shares: 450,
    },
    engagement: 7.8,
  },
];

// Audience demographics
const AUDIENCE_DEMOGRAPHICS = {
  age: [
    { label: '18-24', percentage: 45 },
    { label: '25-34', percentage: 30 },
    { label: '35-44', percentage: 15 },
    { label: '45+', percentage: 10 },
  ],
  gender: [
    { label: 'Female', percentage: 65 },
    { label: 'Male', percentage: 35 },
  ],
  location: [
    { label: 'United States', percentage: 40 },
    { label: 'United Kingdom', percentage: 15 },
    { label: 'Canada', percentage: 12 },
    { label: 'Australia', percentage: 8 },
    { label: 'Other', percentage: 25 },
  ],
};

// Analytics screen component with tabs and complete data visualization
export default function AnalyticsTab() {
  const [timeRange, setTimeRange] = useState('30 Days');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Simple bar chart component
  const BarChart = ({ data, maxValue }) => {
    return (
      <View style={styles.chartContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.chartRow}>
            <Text style={styles.chartLabel}>{item.label}</Text>
            <View style={styles.barContainer}>
              <View 
                style={[
                  styles.bar, 
                  { width: `${(item.percentage / 100) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.chartValue}>{item.percentage}%</Text>
          </View>
        ))}
      </View>
    );
  };
  
  // Content performance card
  const ContentCard = ({ item }) => (
    <View style={styles.contentCard}>
      <View style={styles.contentHeader}>
        <View>
          <Text style={styles.contentTitle}>{item.title}</Text>
          <View style={styles.contentMeta}>
            <Text style={styles.contentType}>{item.type}</Text>
            <Text style={styles.contentPlatform}> • {item.platform}</Text>
            <Text style={styles.contentDate}> • {item.date}</Text>
          </View>
        </View>
        <View style={styles.engagementBadge}>
          <Text style={styles.engagementText}>{item.engagement}%</Text>
        </View>
      </View>
      
      <View style={styles.contentStats}>
        <View style={styles.statColumn}>
          <Eye size={16} color="#747D8C" />
          <Text style={styles.statValue}>{(item.stats.views / 1000).toFixed(1)}K</Text>
          <Text style={styles.statLabel}>Views</Text>
        </View>
        
        <View style={styles.statColumn}>
          <Heart size={16} color="#747D8C" />
          <Text style={styles.statValue}>{(item.stats.likes / 1000).toFixed(1)}K</Text>
          <Text style={styles.statLabel}>Likes</Text>
        </View>
        
        <View style={styles.statColumn}>
          <MessageCircle size={16} color="#747D8C" />
          <Text style={styles.statValue}>{item.stats.comments}</Text>
          <Text style={styles.statLabel}>Comments</Text>
        </View>
        
        <View style={styles.statColumn}>
          <TrendingUp size={16} color="#747D8C" />
          <Text style={styles.statValue}>{item.stats.shares}</Text>
          <Text style={styles.statLabel}>Shares</Text>
        </View>
      </View>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Analytics',
          headerTitleStyle: styles.headerTitle,
        }}
      />
      
      {/* Period Selector */}
      <View style={styles.periodSelector}>
        <View style={styles.periodRow}>
          <Text style={styles.periodLabel}>Period:</Text>
          <TouchableOpacity style={styles.periodButton}>
            <Text style={styles.periodButtonText}>{timeRange}</Text>
            <ChevronDown size={16} color="#2F3542" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={16} color="#6C63FF" />
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.periodDescription}>
          Data from {new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString()} to {new Date().toLocaleDateString()}
        </Text>
      </View>
      
      {/* Tab Navigation */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'overview' && styles.activeTab
          ]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'overview' && styles.activeTabText
          ]}>
            Overview
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'content' && styles.activeTab
          ]}
          onPress={() => setActiveTab('content')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'content' && styles.activeTabText
          ]}>
            Content
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'audience' && styles.activeTab
          ]}
          onPress={() => setActiveTab('audience')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'audience' && styles.activeTabText
          ]}>
            Audience
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <View>
            {/* Growth Metrics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Growth Metrics</Text>
              <View style={styles.metricsGrid}>
                {GROWTH_DATA.map(item => (
                  <View key={item.id} style={styles.metricCard}>
                    <View style={styles.metricHeader}>
                      <item.icon size={20} color={item.color} />
                      <Text style={styles.metricTitle}>{item.title}</Text>
                    </View>
                    <Text style={styles.metricCount}>{item.count}</Text>
                    <View style={styles.growthContainer}>
                      {item.isPositive ? (
                        <ArrowUp size={14} color="#4CAF50" />
                      ) : (
                        <ArrowDown size={14} color="#F44336" />
                      )}
                      <Text
                        style={[
                          styles.growthText,
                          item.isPositive ? styles.positiveGrowth : styles.negativeGrowth
                        ]}
                      >
                        {item.isPositive ? '+' : ''}{item.growth}%
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
            
            {/* Top Performing Content */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Top Performing Content</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              
              {CONTENT_PERFORMANCE.slice(0, 2).map(item => (
                <ContentCard key={item.id} item={item} />
              ))}
            </View>
            
            {/* Audience Overview */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Audience Overview</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>Details</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.demographicsContainer}>
                <Text style={styles.demographicTitle}>Age Distribution</Text>
                <BarChart data={AUDIENCE_DEMOGRAPHICS.age} />
                
                <Text style={styles.demographicTitle}>Gender</Text>
                <BarChart data={AUDIENCE_DEMOGRAPHICS.gender} />
              </View>
            </View>
          </View>
        )}
        
        {/* Content Tab */}
        {activeTab === 'content' && (
          <View>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Content Performance</Text>
                <TouchableOpacity style={styles.sortButton}>
                  <Text style={styles.sortText}>Sort: Engagement</Text>
                  <ChevronDown size={14} color="#6C63FF" />
                </TouchableOpacity>
              </View>
              
              {CONTENT_PERFORMANCE.map(item => (
                <ContentCard key={item.id} item={item} />
              ))}
            </View>
          </View>
        )}
        
        {/* Audience Tab */}
        {activeTab === 'audience' && (
          <View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Audience Demographics</Text>
              
              <View style={styles.demographicsContainer}>
                <Text style={styles.demographicTitle}>Age Distribution</Text>
                <BarChart data={AUDIENCE_DEMOGRAPHICS.age} />
                
                <Text style={styles.demographicTitle}>Gender</Text>
                <BarChart data={AUDIENCE_DEMOGRAPHICS.gender} />
                
                <Text style={styles.demographicTitle}>Top Locations</Text>
                <BarChart data={AUDIENCE_DEMOGRAPHICS.location} />
              </View>
            </View>
          </View>
        )}
        
        {/* Custom Reporting Section - NEW */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom Reporting</Text>
          
          {/* Report Type Selector */}
          <View style={styles.reportOptionRow}>
             <Text style={styles.reportOptionLabel}>Report Type:</Text>
             {/* Placeholder for a Picker component */}
             <TouchableOpacity style={styles.reportPickerButton}>
                <Text style={styles.reportPickerButtonText}>Performance Summary</Text>
                <ChevronDown size={16} color="#2F3542" />
             </TouchableOpacity>
          </View>
          
          {/* Metrics Selection */}
          <View style={styles.reportOptionRow}>
            <Text style={styles.reportOptionLabel}>Metrics:</Text>
            <View style={styles.metricsSelectionContainer}>
              {['Followers', 'Engagement', 'Reach', 'Views'].map(metric => (
                <TouchableOpacity key={metric} style={styles.metricChipSelected}>
                  <Text style={styles.metricChipTextSelected}>{metric}</Text>
                </TouchableOpacity>
              ))}
               <TouchableOpacity style={styles.metricChip}>
                  <Text style={styles.metricChipText}>Likes</Text>
                </TouchableOpacity>
                 <TouchableOpacity style={styles.metricChip}>
                  <Text style={styles.metricChipText}>Comments</Text>
                </TouchableOpacity>
            </View>
          </View>

           {/* Time Period - Reuse existing selector conceptually */}
           <View style={styles.reportOptionRow}>
             <Text style={styles.reportOptionLabel}>Period:</Text>
             <Text style={styles.reportOptionValue}>{timeRange}</Text> 
             {/* In a real implementation, link this to the main timeRange selector */}
          </View>

          {/* Export Format Selector */}
          <View style={styles.reportOptionRow}>
             <Text style={styles.reportOptionLabel}>Export Format:</Text>
             {/* Placeholder for a Picker component */}
             <TouchableOpacity style={styles.reportPickerButton}>
                <Text style={styles.reportPickerButtonText}>CSV</Text>
                <ChevronDown size={16} color="#2F3542" />
             </TouchableOpacity>
          </View>

          {/* Generate Button */}
          <TouchableOpacity style={styles.generateButton}>
             <Text style={styles.generateButtonText}>Generate Report</Text>
          </TouchableOpacity>
        </View>
        {/* End Custom Reporting Section */}

      </ScrollView>
    </SafeAreaView>
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
  periodSelector: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  periodLabel: {
    fontSize: 14,
    color: '#2F3542',
    marginRight: 8,
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  periodButtonText: {
    fontSize: 14,
    color: '#2F3542',
    marginRight: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  filterText: {
    fontSize: 14,
    color: '#6C63FF',
    marginLeft: 6,
  },
  periodDescription: {
    fontSize: 12,
    color: '#747D8C',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#6C63FF',
  },
  tabText: {
    fontSize: 14,
    color: '#747D8C',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#6C63FF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F3542',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#6C63FF',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    fontSize: 14,
    color: '#6C63FF',
    marginRight: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricTitle: {
    fontSize: 14,
    color: '#747D8C',
    marginLeft: 8,
  },
  metricCount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2F3542',
    marginBottom: 8,
  },
  growthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  growthText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  positiveGrowth: {
    color: '#4CAF50',
  },
  negativeGrowth: {
    color: '#F44336',
  },
  contentCard: {
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2F3542',
    marginBottom: 6,
  },
  contentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentType: {
    fontSize: 13,
    color: '#747D8C',
  },
  contentPlatform: {
    fontSize: 13,
    color: '#747D8C',
  },
  contentDate: {
    fontSize: 13,
    color: '#747D8C',
  },
  engagementBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  engagementText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4CAF50',
  },
  contentStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statColumn: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2F3542',
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#747D8C',
  },
  demographicsContainer: {
    marginTop: 8,
  },
  demographicTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2F3542',
    marginBottom: 12,
    marginTop: 16,
  },
  chartContainer: {
    marginBottom: 16,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartLabel: {
    width: 60,
    fontSize: 12,
    color: '#747D8C',
  },
  barContainer: {
    flex: 1,
    height: 10,
    backgroundColor: '#EEEEEE',
    borderRadius: 5,
    overflow: 'hidden',
    marginRight: 8,
  },
  bar: {
    height: '100%',
    backgroundColor: '#6C63FF',
    borderRadius: 5,
  },
  chartValue: {
    width: 40,
    fontSize: 12,
    color: '#2F3542',
    textAlign: 'right',
  },
  
  // --- NEW Styles for Custom Reporting ---
  reportOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  reportOptionLabel: {
    fontSize: 14,
    color: '#747D8C',
    width: 100, // Fixed width for alignment
  },
   reportOptionValue: {
    fontSize: 14,
    color: '#2F3542',
    fontWeight: '500',
  },
  reportPickerButton: {
    flex: 1, // Take remaining space
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  reportPickerButtonText: {
    fontSize: 14,
    color: '#2F3542',
  },
  metricsSelectionContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  metricChip: {
    backgroundColor: '#E9ECEF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  metricChipSelected: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  metricChipText: {
    fontSize: 12,
    color: '#495057',
  },
   metricChipTextSelected: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  generateButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // --- End NEW Styles ---
}); 