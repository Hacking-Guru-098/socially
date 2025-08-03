import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Sparkles, Calendar, TrendingUp } from 'lucide-react-native';

// Mock data for AI-suggested content
const CONTENT_IDEAS = [
  {
    id: '1',
    title: 'Morning Routine For Productive Days',
    type: 'Video',
    platform: 'Instagram Reel',
    image: 'https://picsum.photos/seed/morning/400/300',
    bestTime: 'Weekday mornings (7-9 AM)',
  },
  {
    id: '2',
    title: 'Summer Fashion Essentials 2023',
    type: 'Carousel',
    platform: 'Instagram Post',
    image: 'https://picsum.photos/seed/fashion/400/300',
    bestTime: 'Weekends (11 AM-2 PM)',
  },
  {
    id: '3',
    title: 'Quick 15-Minute Healthy Meal Prep',
    type: 'Short Video',
    platform: 'TikTok',
    image: 'https://picsum.photos/seed/food/400/300',
    bestTime: 'Sunday evenings (6-8 PM)',
  },
];

export default function AISuggestionsScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'AI Content Suggestions',
          headerTitleStyle: styles.headerTitle,
        }}
      />
      <StatusBar style="dark" />

      <View style={styles.container}>
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.headerText}>
              AI-powered content suggestions based on your audience preferences and trends
            </Text>
            <TouchableOpacity style={styles.refreshButton}>
              <Text style={styles.refreshButtonText}>Generate New Ideas</Text>
            </TouchableOpacity>
          </View>
          
          {CONTENT_IDEAS.map(idea => (
            <View key={idea.id} style={styles.ideaCard}>
              <Image 
                source={{ uri: idea.image }} 
                style={styles.ideaImage} 
              />
              
              <View style={styles.ideaContent}>
                <View style={styles.ideaTypeContainer}>
                  <View style={styles.ideaTypeBadge}>
                    <Text style={styles.ideaTypeText}>{idea.type}</Text>
                  </View>
                  <View style={styles.ideaPlatformBadge}>
                    <Text style={styles.ideaPlatformText}>{idea.platform}</Text>
                  </View>
                </View>
                
                <Text style={styles.ideaTitle}>{idea.title}</Text>
                
                <View style={styles.ideaDetailItem}>
                  <Calendar size={14} color="#A4B0BE" />
                  <Text style={styles.ideaDetailText}>Best time: {idea.bestTime}</Text>
                </View>
                
                <TouchableOpacity style={styles.generateButton}>
                  <Sparkles size={16} color="#FFFFFF" />
                  <Text style={styles.generateButtonText}>Create Content</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
            
          <View style={styles.insightsSection}>
            <Text style={styles.sectionTitle}>Content Insights</Text>
            
            <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>Visual Content Performance</Text>
              <Text style={styles.insightText}>
                Images with people perform 38% better than landscapes or objects in your feed
              </Text>
            </View>
            
            <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>Caption Length Analysis</Text>
              <Text style={styles.insightText}>
                Posts with 70-100 word captions receive 23% more engagement
              </Text>
            </View>
            
            <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>Hashtag Effectiveness</Text>
              <Text style={styles.insightText}>
                Using 5-9 targeted hashtags increases reach by 41% compared to 10+ general hashtags
              </Text>
            </View>
          </View>
        </ScrollView>
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
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerText: {
    fontSize: 14,
    color: '#747D8C',
    marginBottom: 12,
    lineHeight: 20,
  },
  refreshButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ideaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ideaImage: {
    width: '100%',
    height: 180,
  },
  ideaContent: {
    padding: 16,
  },
  ideaTypeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  ideaTypeBadge: {
    backgroundColor: '#F0EEFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  ideaTypeText: {
    fontSize: 12,
    color: '#6C63FF',
    fontWeight: '500',
  },
  ideaPlatformBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  ideaPlatformText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  ideaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F3542',
    marginBottom: 8,
  },
  ideaDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ideaDetailText: {
    fontSize: 14,
    color: '#747D8C',
    marginLeft: 8,
  },
  generateButton: {
    backgroundColor: '#6C63FF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  generateButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 6,
    fontWeight: '600',
  },
  insightsSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F3542',
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F3542',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#747D8C',
    lineHeight: 20,
  },
}); 