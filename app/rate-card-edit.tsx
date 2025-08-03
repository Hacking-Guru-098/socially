import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth, RateCardItem } from '../providers/AuthProvider'; // Import useAuth and types
import { Save, Plus, Trash2 } from 'lucide-react-native';

export default function RateCardEditScreen() {
  const router = useRouter();
  const { user, fetchBusinessData, updateRateCard } = useAuth(); 
  const [rateCardItems, setRateCardItems] = React.useState<RateCardItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadRates = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch existing rate card to edit
        const data = await fetchBusinessData(); // Reusing fetchBusinessData for now
        setRateCardItems(data.rateCard || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load rate card.');
      } finally {
        setIsLoading(false);
      }
    };
    loadRates();
  }, []);

  const handleUpdateItem = (id: string, field: keyof RateCardItem, value: string | number) => {
    setRateCardItems(currentItems => 
      currentItems.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleAddItem = () => {
    const newItem: RateCardItem = {
      id: `new-${Date.now()}`,
      service: '',
      rate: 0,
    };
    setRateCardItems(currentItems => [...currentItems, newItem]);
  };

  const handleDeleteItem = (id: string) => {
    setRateCardItems(currentItems => currentItems.filter(item => item.id !== id));
  };

  const handleSaveChanges = async () => {
    console.log("RATE CARD EDIT: Saving changes:", rateCardItems);
    setIsSaving(true);
    setError(null);
    try {
      // Filter out any potentially empty new items before saving
      const validItems = rateCardItems.filter(item => item.service.trim() !== '' && item.rate >= 0);
      await updateRateCard(validItems);
      Alert.alert('Success', 'Rate card saved successfully.');
      router.back();
    } catch (err: any) {
       console.error("RATE CARD EDIT: Failed to save:", err);
       const message = err.message || 'Failed to save rate card.';
       setError(message);
       Alert.alert('Error', message);
    } finally {
       setIsSaving(false);
    }
  };

  const renderItem = ({ item }: { item: RateCardItem }) => (
    <View style={styles.itemContainer}>
      <TextInput
        style={[styles.input, styles.serviceInput]}
        value={item.service}
        onChangeText={(text) => handleUpdateItem(item.id, 'service', text)}
        placeholder="Service Name (e.g., Instagram Post)"
        placeholderTextColor="#A4B0BE"
      />
      <TextInput
        style={[styles.input, styles.rateInput]}
        value={item.rate > 0 ? String(item.rate) : ''}
        onChangeText={(text) => handleUpdateItem(item.id, 'rate', Number(text) || 0)}
        placeholder="Rate ($"
        placeholderTextColor="#A4B0BE"
        keyboardType="numeric"
      />
      <TouchableOpacity onPress={() => handleDeleteItem(item.id)} style={styles.deleteButton}>
        <Trash2 size={20} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Edit Rate Card',
          headerBackTitle: 'Business', 
          headerRight: () => (
            <TouchableOpacity onPress={handleSaveChanges} disabled={isSaving} style={styles.headerButton}>
              <Save size={22} color={isSaving ? "#A4B0BE" : "#6C63FF"} />
            </TouchableOpacity>
          ),
        }}
      />
      <StatusBar style="dark" />
      
      {isLoading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color="#6C63FF" /></View>
      ) : error ? (
        <View style={styles.centered}><Text style={styles.errorText}>{error}</Text></View>
      ) : (
        <FlatList
          data={rateCardItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={
            <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
              <Plus size={18} color="#6C63FF" />
              <Text style={styles.addButtonText}>Add Service</Text>
            </TouchableOpacity>
          }
        />
      )}
      {isSaving && (
          <View style={styles.savingOverlay}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.savingText}>Saving...</Text>
          </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerButton: {
      marginRight: 15,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContent: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#E9ECEF',
    paddingVertical: 8,
    fontSize: 15,
    color: '#2F3542',
  },
  serviceInput: {
    flex: 3, // Takes more space
    marginRight: 8,
  },
  rateInput: {
    flex: 1, // Takes less space
    marginRight: 8,
    textAlign: 'right',
  },
  deleteButton: {
    padding: 5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0EEFF',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#6C63FF',
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
    textAlign: 'center',
  },
  savingOverlay: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      padding: 15,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
  },
  savingText: {
      color: '#FFFFFF',
      marginLeft: 10,
      fontSize: 14,
  },
}); 