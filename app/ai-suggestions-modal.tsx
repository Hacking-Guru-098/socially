import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Sparkles, CheckCircle, Copy, ThumbsUp, ThumbsDown, Lightbulb, Hash, MessageSquare, X } from 'lucide-react-native';

// Mock data for AI suggestions
const CAPTION_SUGGESTIONS = [
  {
    id: '1',
    text: "Embracing the journey, one step at a time. There's beauty in the process, not just the destination. What are you working towards today? ✨ #PersonalGrowth #Journey",
  },
  {
    id: '2',
    text: "Finding moments of peace in the chaos. Sometimes the smallest rituals become our biggest anchors. Coffee, sunrise, and a moment to breathe. What's your morning ritual? ☕️ #MorningRituals #MindfulMoments",
  },
  {
    id: '3',
    text: "New places, new perspectives. Traveling isn't just about seeing new sights—it's about seeing with new eyes. Where has travel changed your perspective? 🌍 #TravelDeeper #Wanderlust",
  },
];

const HASHTAG_SUGGESTIONS = [
  { id: '1', text: '#ContentCreator', count: '24.5M posts' },
  { id: '2', text: '#SustainableLiving', count: '5.2M posts' },
  { id: '3', text: '#MindfulContent', count: '1.8M posts' },
  { id: '4', text: '#AuthenticSelf', count: '3.4M posts' },
  { id: '5', text: '#CreativeMinds', count: '7.6M posts' },
  { id: '6', text: '#DigitalCreator', count: '12.1M posts' },
  { id: '7', text: '#LifestyleContent', count: '8.3M posts' },
  { id: '8', text: '#CreatorEconomy', count: '2.9M posts' },
];

export default function AISuggestionsModalScreen() {
  const { tab } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState(tab === 'hashtags' ? 'hashtags' : 'captions');
  const [generating, setGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const router = useRouter();

  const handleGenerateContent = () => {
    setGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setGenerating(false);
    }, 1500);
  };

  const toggleSuggestionSelection = (id) => {
    if (selectedSuggestions.includes(id)) {
      setSelectedSuggestions(selectedSuggestions.filter(item => item !== id));
    } else {
      setSelectedSuggestions([...selectedSuggestions, id]);
    }
  };

  const applyToContent = () => {
    // In a real app, you would pass data back to the calling screen
    router.back();
  };

  const renderTab = (tab, icon, label) => (
    <TouchableOpacity
      style={[styles.tab, activeTab === tab && styles.activeTab]}
      onPress={() => setActiveTab(tab)}
    >
      {icon}
      <Text style={[styles.tabLabel, activeTab === tab && styles.activeTabLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderCaptionSuggestions = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionDescription}>
        Get AI-generated caption suggestions to elevate your content and increase engagement.
      </Text>

      <View style={styles.promptContainer}>
        <TextInput
          style={styles.promptInput}
          placeholder="Describe your content or specific theme (e.g., 'Beach sunset photo')"
          value={customPrompt}
          onChangeText={setCustomPrompt}
        />
        <TouchableOpacity
          style={styles.generateButton}
          onPress={handleGenerateContent}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Sparkles size={16} color="#FFFFFF" />
              <Text style={styles.generateButtonText}>Generate Captions</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.ideasContainer}>
        <Text style={styles.ideasTitle}>Caption Suggestions</Text>
        {CAPTION_SUGGESTIONS.map((caption) => (
          <View key={caption.id} style={styles.captionCard}>
            <Text style={styles.captionText}>{caption.text}</Text>
            <View style={styles.captionActions}>
              <TouchableOpacity 
                style={styles.captionActionButton}
                onPress={() => toggleSuggestionSelection(caption.id)}
              >
                <CheckCircle 
                  size={18} 
                  color={selectedSuggestions.includes(caption.id) ? '#4CAF50' : '#A4B0BE'} 
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.captionActionButton}>
                <Copy size={18} color="#6C63FF" />
              </TouchableOpacity>
              <View style={styles.feedbackButtons}>
                <TouchableOpacity style={styles.feedbackButton}>
                  <ThumbsUp size={18} color="#A4B0BE" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.feedbackButton}>
                  <ThumbsDown size={18} color="#A4B0BE" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
        
        {selectedSuggestions.length > 0 && (
          <TouchableOpacity 
            style={styles.applyButton}
            onPress={applyToContent}
          >
            <CheckCircle size={16} color="#FFFFFF" />
            <Text style={styles.applyButtonText}>
              Apply to Content ({selectedSuggestions.length})
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderHashtagSuggestions = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionDescription}>
        Discover trending and relevant hashtags to increase your content's reach and discoverability.
      </Text>

      <View style={styles.promptContainer}>
        <TextInput
          style={styles.promptInput}
          placeholder="Enter your content topic (e.g., 'Sustainable fashion')"
          value={customPrompt}
          onChangeText={setCustomPrompt}
        />
        <TouchableOpacity
          style={styles.generateButton}
          onPress={handleGenerateContent}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Sparkles size={16} color="#FFFFFF" />
              <Text style={styles.generateButtonText}>Generate Hashtags</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.ideasContainer}>
        <Text style={styles.ideasTitle}>Recommended Hashtags</Text>
        <View style={styles.hashtagsContainer}>
          {HASHTAG_SUGGESTIONS.map((hashtag) => (
            <TouchableOpacity 
              key={hashtag.id} 
              style={[
                styles.hashtagItem,
                selectedSuggestions.includes(hashtag.id) && styles.selectedHashtag
              ]}
              onPress={() => toggleSuggestionSelection(hashtag.id)}
            >
              <Text 
                style={[
                  styles.hashtagText,
                  selectedSuggestions.includes(hashtag.id) && styles.selectedHashtagText
                ]}
              >
                {hashtag.text}
              </Text>
              <Text style={styles.hashtagCount}>{hashtag.count}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity 
          style={[styles.copyAllButton, selectedSuggestions.length === 0 && styles.disabledButton]}
          onPress={selectedSuggestions.length > 0 ? applyToContent : undefined}
          disabled={selectedSuggestions.length === 0}
        >
          {selectedSuggestions.length > 0 ? (
            <>
              <CheckCircle size={16} color="#FFFFFF" />
              <Text style={styles.copyAllButtonText}>
                Apply to Content ({selectedSuggestions.length})
              </Text>
            </>
          ) : (
            <>
              <Copy size={16} color="#FFFFFF" />
              <Text style={styles.copyAllButtonText}>
                Copy Selected (0)
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'AI Suggestions',
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 8 }}>
              <X size={24} color="#2F3542" />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.container}>
        <View style={styles.tabs}>
          {renderTab('captions', <MessageSquare size={20} color={activeTab === 'captions' ? '#6C63FF' : '#A4B0BE'} />, 'Captions')}
          {renderTab('hashtags', <Hash size={20} color={activeTab === 'hashtags' ? '#6C63FF' : '#A4B0BE'} />, 'Hashtags')}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'captions' && renderCaptionSuggestions()}
          {activeTab === 'hashtags' && renderHashtagSuggestions()}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F6FA',
    paddingHorizontal: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#6C63FF',
  },
  tabLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#A4B0BE',
    marginLeft: 6,
  },
  activeTabLabel: {
    color: '#6C63FF',
  },
  content: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  contentSection: {
    padding: 16,
  },
  sectionDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#2F3542',
    lineHeight: 20,
    marginBottom: 16,
  },
  promptContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  promptInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#2F3542',
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  generateButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  ideasContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  ideasTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#2F3542',
    marginBottom: 16,
  },
  captionCard: {
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  captionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#2F3542',
    lineHeight: 22,
    marginBottom: 16,
  },
  captionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  captionActionButton: {
    padding: 8,
    marginRight: 16,
  },
  feedbackButtons: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  feedbackButton: {
    padding: 8,
    marginLeft: 8,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  hashtagItem: {
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedHashtag: {
    backgroundColor: '#F0EFFF',
    borderWidth: 1,
    borderColor: '#6C63FF',
  },
  hashtagText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#2F3542',
  },
  selectedHashtagText: {
    color: '#6C63FF',
  },
  hashtagCount: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#A4B0BE',
    marginTop: 4,
  },
  copyAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  copyAllButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  applyButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
}); 