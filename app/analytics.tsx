import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image, ActivityIndicator, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useAuth, AnalyticsData, ContentPerformance, AudienceDemographic } from '../providers/AuthProvider';
import { LineChart, PieChart } from "react-native-chart-kit";

// No imports that might cause circular dependencies

// Simple component with no navigation or router dependencies
export default function AnalyticsScreen() {
  const { fetchAnalyticsData } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  // Define GrowthMetricCard inside or ensure it's defined elsewhere and imported
  const GrowthMetricCard = ({ label, value, change }: { label: string; value: string; change: number }) => {
    const isPositive = change >= 0;
    return (
      <View style={styles.metricCard}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{value}</Text>
        <View style={[styles.metricChangeContainer, isPositive ? styles.positiveChange : styles.negativeChange]}>
          {isPositive ? <TrendingUp size={14} color="#4CAF50" /> : <TrendingDown size={14} color="#F44336" />}
          <Text style={[styles.metricChangeText, isPositive ? styles.positiveText : styles.negativeText]}>
            {isPositive ? '+' : ''}{change}%
          </Text>
        </View>
      </View>
    );
  };

  useEffect(() => {
    const loadData = async () => {
      console.log('ANALYTICS: Setting loading true');
      setIsLoading(true);
      setError(null);
      setAnalyticsData(null);
      console.log(`ANALYTICS: Fetching data for period: ${selectedPeriod}`);
      try {
        const data = await fetchAnalyticsData(selectedPeriod);
        console.log('ANALYTICS: Data fetched successfully:', !!data);
        setAnalyticsData(data);
      } catch (err: any) {
        console.error("ANALYTICS: Failed to fetch analytics:", err);
        setError(err.message || 'Failed to load analytics data.');
      } finally {
        console.log('ANALYTICS: Setting loading false');
        setIsLoading(false);
      }
    };
    loadData();
  }, [selectedPeriod, fetchAnalyticsData]);

  // Handler for back button that doesn't rely on navigation
  const goBack = () => {
    try {
      // Try to go back in browser history if available
      if (typeof window !== 'undefined') {
        window.history.back();
      }
    } catch (e) {
      console.log('Navigation error:', e);
    }
  };

  // Chart configuration
  const screenWidth = Dimensions.get("window").width;
  const chartConfig = {
    backgroundColor: "#e26a00",
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientTo: "#FFFFFF",
    decimalPlaces: 0, // optional, defaults to 2dp
    color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`, // Primary color #6C63FF
    labelColor: (opacity = 1) => `rgba(116, 125, 140, ${opacity})`, // Secondary text color #747D8C
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#6C63FF",
    },
  };

  // Define available periods
  const PERIODS: { label: string; value: '7d' | '30d' | '90d' }[] = [
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
  ];

  // Data preparation for charts
  console.log('ANALYTICS: Preparing chart data. analyticsData exists:', !!analyticsData);
  
  // Use fixed mock data for line chart if analyticsData is present, otherwise empty.
  // A real implementation needs time-series data from the backend.
  const growthChartData = analyticsData ? {
    labels: selectedPeriod === '7d' ? ["D1", "D2", "D3", "D4", "D5", "D6", "D7"] : 
            selectedPeriod === '90d' ? ["M1", "M2", "M3"] : 
            ["W1", "W2", "W3", "W4"], // Simplified labels based on period
    datasets: [
      {
        data: selectedPeriod === '7d' ? [50, 60, 55, 70, 65, 75, 80] : 
              selectedPeriod === '90d' ? [150, 180, 220] :
              [30, 45, 40, 55], // Different mock data per period
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 2
      }
    ],
    legend: ["Follower Growth"]
  } : { labels: [], datasets: [] };

  const genderData = analyticsData?.audienceDemographics
    .filter(d => d.label === 'Gender')
    .map((d, index) => ({ 
      name: d.value, 
      population: d.percentage, 
      color: index === 0 ? '#FF6B6B' : '#6C63FF', // Example colors
      legendFontColor: "#7F7F7F", 
      legendFontSize: 13
    })) || [];
  console.log('ANALYTICS: genderData prepared:', genderData);

  // --- Log condition before rendering ScrollView ---
  const shouldRenderContent = !isLoading && !error && analyticsData;
  console.log(`ANALYTICS: Rendering ScrollView? isLoading=${isLoading}, error=${!!error}, analyticsData=${!!analyticsData}, shouldRender=${shouldRenderContent}`);
  // --- End logging ---

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Analytics',
          headerTitleStyle: styles.headerTitle,
          headerBackVisible: false
        }}
      />
      <StatusBar style="dark" />
      
      <View style={styles.container}> 
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6C63FF" />
            <Text style={styles.loadingText}>Loading Analytics...</Text>
          </View>
        )} 
        
        {error && !isLoading && (
           <View style={styles.errorContainer}>
             <Text style={styles.errorText}>Error: {error}</Text>
           </View>
        )}

        {/* Use the calculated condition */} 
        {shouldRenderContent && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Period Selector */}
            <View style={styles.periodSelectorContainer}>
              {PERIODS.map(period => (
                <TouchableOpacity
                  key={period.value}
                  style={[
                    styles.periodButton,
                    selectedPeriod === period.value && styles.periodButtonActive
                  ]}
                  onPress={() => setSelectedPeriod(period.value)}
                >
                  <Text style={[
                    styles.periodButtonText,
                    selectedPeriod === period.value && styles.periodButtonTextActive
                  ]}>
                    {period.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Growth Metrics Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Growth Overview</Text>
              <View style={styles.metricsGrid}>
                <GrowthMetricCard label="Followers" {...analyticsData.growthMetrics.followers} />
                <GrowthMetricCard label="Engagement Rate" {...analyticsData.growthMetrics.engagementRate} />
                <GrowthMetricCard label="Reach" {...analyticsData.growthMetrics.reach} />
                <GrowthMetricCard label="Impressions" {...analyticsData.growthMetrics.impressions} />
              </View>
            </View>

            {/* Growth Trends Chart - Replace chart with text */}
            <View style={[styles.section]}> 
              <Text style={styles.sectionTitle}>Growth Trends (Followers)</Text>
              {growthChartData.labels.length > 0 ? (
                 <LineChart
                   data={growthChartData}
                   width={screenWidth - 64} // from react-native
                   height={220}
                   // yAxisLabel="$" // Adjust label based on metric
                   // yAxisSuffix="k"
                   yAxisInterval={1} // optional, defaults to 1
                   chartConfig={chartConfig}
                   bezier // Makes it smooth
                   style={{
                     marginVertical: 8,
                     borderRadius: 16
                   }}
                 />
              ) : (
                  <Text style={styles.placeholderText}>Growth trend data unavailable.</Text>
              )}
            </View>

            {/* Content Performance Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Top Performing Content ({selectedPeriod})</Text>
              {analyticsData.topPerformingContent.length > 0 ? (
                analyticsData.topPerformingContent.map((content: ContentPerformance) => (
                  <View key={content.id} style={styles.contentCard}>
                    <Image source={{ uri: content.thumbnail }} style={styles.contentThumbnail} />
                    <View style={styles.contentDetails}>
                      <Text style={styles.contentType}>{content.type.toUpperCase()}</Text>
                      <Text style={styles.contentMetric}>{content.value.toLocaleString()} {content.metric}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.placeholderText}>No posts found for this period.</Text>
              )}
            </View>

            {/* Audience Demographics Section - Replace chart with text */}
            <View style={[styles.section, {backgroundColor: 'lightblue'}]}> 
              <Text style={styles.sectionTitle}>Audience Demographics</Text>
              {analyticsData.audienceDemographics
                .filter(d => d.label !== 'Gender')
                .map((demo: AudienceDemographic, index: number) => (
                  <View key={index} style={styles.demographicItem}>
                    <Text style={styles.demographicLabel}>{demo.label}: <Text style={styles.demographicValue}>{demo.value}</Text></Text>
                    <Text style={styles.demographicPercentage}>{demo.percentage}%</Text>
                  </View>
                ))}
              {/* Gender Pie Chart */}
              {genderData.length > 0 ? (
                <View style={styles.chartContainer}>
                   <Text style={styles.chartSubTitle}>Gender Distribution</Text>
                   <PieChart
                      data={genderData}
                      width={screenWidth - 64}
                      height={180} // Adjusted height for pie chart
                      chartConfig={chartConfig}
                      accessor={"population"}
                      backgroundColor={"transparent"}
                      paddingLeft={"15"}
                      // center={[10, 0]} // Adjust center if needed
                      absolute // Shows absolute values from data
                      style={{
                        marginVertical: 8,
                        borderRadius: 16
                      }}
                    />
                </View>
              ) : (
                <Text style={styles.placeholderText}>No gender data for chart.</Text>
              )}
              {/* Placeholder for other charts */}
              {/* <Text style={styles.placeholderText}>(Other charts will be added here)</Text> */}
            </View>
          </ScrollView>
        )}

        {!isLoading && !error && !analyticsData && (
          <View style={styles.errorContainer}> 
            <Text style={styles.errorText}>No analytics data available.</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

// Simple styles with no external dependencies
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F3542',
  },
  headerRight: {
    width: 40,
  },
  backButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6C63FF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
  },
  scrollContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2F3542',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 14,
    width: '48%', // Adjust for spacing
    marginBottom: 12,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 13,
    color: '#747D8C',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2F3542',
    marginBottom: 6,
  },
  metricChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  metricChangeText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  positiveChange: {
    backgroundColor: '#E8F5E9',
  },
  negativeChange: {
    backgroundColor: '#FFEBEE',
  },
  positiveText: {
    color: '#4CAF50',
  },
  negativeText: {
    color: '#F44336',
  },
  contentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 8,
  },
  contentThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  contentDetails: {
    flex: 1,
  },
  contentType: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6C63FF',
    marginBottom: 4,
  },
  contentMetric: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2F3542',
  },
  demographicItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  demographicLabel: {
    fontSize: 14,
    color: '#747D8C',
  },
  demographicValue: {
    fontWeight: '600',
    color: '#2F3542',
  },
  demographicPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  placeholderText: {
    marginTop: 12,
    textAlign: 'center',
    color: '#A4B0BE',
    fontStyle: 'italic',
  },
  periodSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#E9ECEF',
    borderRadius: 20,
    padding: 4,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 2,
  },
  periodButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  periodButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#747D8C',
  },
  periodButtonTextActive: {
    color: '#6C63FF',
    fontWeight: 'bold',
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  chartSubTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2F3542',
    marginBottom: 8,
  },
}); 