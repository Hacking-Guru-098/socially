import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Image, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth, BrandDeal } from '../../providers/AuthProvider';

const formatCurrency = (amount: number) => `$${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
const formatDate = (dateString?: string | null) => dateString ? new Date(dateString).toLocaleDateString() : 'N/A';

export default function DealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { fetchDealById } = useAuth();
  const [dealData, setDealData] = React.useState<BrandDeal | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (id) {
      const loadDeal = async () => {
        console.log(`DEAL DETAIL: Fetching data for deal ID: ${id}`);
        setIsLoading(true);
        setError(null);
        try {
          const data = await fetchDealById(id);
          if (data) {
             setDealData(data);
          } else {
             setError('Deal not found.');
          }
        } catch (err: any) {
           setError(err.message || 'Failed to load deal details.');
        } finally {
           setIsLoading(false);
        }
      };
      loadDeal();
    } else {
        setError('Deal ID not provided.');
        setIsLoading(false);
    }
  }, [id]);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: dealData ? `Deal: ${dealData.brandName}` : 'Deal Details',
          headerBackTitle: 'Deals',
        }}
      />
      <StatusBar style="dark" />

      {isLoading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color="#6C63FF" /></View>
      ) : error ? (
        <View style={styles.centered}><Text style={styles.errorText}>{error}</Text></View>
      ) : dealData ? (
        <ScrollView style={styles.content}>
          <View style={styles.headerSection}>
            <Image source={{ uri: dealData.logo }} style={styles.brandLogo} />
            <Text style={styles.brandName}>{dealData.brandName}</Text>
          </View>
          
          <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Details</Text>
              <Text style={styles.detailItem}><Text style={styles.label}>Status:</Text> {dealData.status}</Text>
              <Text style={styles.detailItem}><Text style={styles.label}>Amount:</Text> {formatCurrency(dealData.amount)}</Text>
              <Text style={styles.detailItem}><Text style={styles.label}>Due Date:</Text> {formatDate(dealData.dueDate)}</Text>
          </View>
          
           <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Deliverables</Text>
              {dealData.deliverables.map((item, index) => (
                  <Text key={index} style={styles.deliverableItem}>- {item}</Text>
              ))}
          </View>
          
           <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.notesText}>
                  Placeholder notes... Add a notes field to your BrandDeal type and database.
              </Text>
          </View>
        </ScrollView>
      ) : (
         <View style={styles.centered}><Text style={styles.errorText}>Deal data could not be loaded.</Text></View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
    textAlign: 'center',
  },
  content: {
    padding: 0,
  },
  headerSection: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    marginBottom: 10,
  },
  brandLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
  },
  brandName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2F3542',
  },
  detailSection: {
     backgroundColor: '#FFF',
     marginHorizontal: 16,
     marginBottom: 16,
     padding: 16,
     borderRadius: 12,
     borderWidth: 1,
     borderColor: '#E9ECEF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2F3542',
  },
  detailItem: {
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 24,
    color: '#57606F',
  },
  label: {
    fontWeight: 'bold',
    color: '#2F3542',
  },
  deliverableItem: {
    fontSize: 16,
    color: '#57606F',
    marginBottom: 5,
    marginLeft: 5,
  },
  notesText: {
      fontSize: 15,
      lineHeight: 22,
      color: '#57606F',
      fontStyle: 'italic',
  },
}); 