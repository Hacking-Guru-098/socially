import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Alert, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BrandDeal } from '../../providers/AuthProvider'; // Import BrandDeal type
import { X, Calendar, Save, List, CheckCircle, Clock, AlertCircle, DollarSign, Paperclip } from 'lucide-react-native';

// Define available statuses
const DEAL_STATUSES: BrandDeal['status'][] = ['pending', 'negotiating', 'active', 'completed'];

type DealFormModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (dealData: Omit<BrandDeal, 'id'>) => Promise<void>;
  initialData?: BrandDeal | null;
};

// Helper to format date to YYYY-MM-DD
const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export default function DealFormModal({ isVisible, onClose, onSubmit, initialData }: DealFormModalProps) {
  const [brandName, setBrandName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [status, setStatus] = useState<BrandDeal['status']>('pending');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [amount, setAmount] = useState('');
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [currentDeliverable, setCurrentDeliverable] = useState('');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setBrandName(initialData.brandName);
      setLogoUrl(initialData.logo || '');
      setStatus(initialData.status);
      setDueDate(initialData.dueDate ? new Date(initialData.dueDate) : null);
      setAmount(initialData.amount.toString());
      setDeliverables(initialData.deliverables || []);
    } else {
      // Reset form
      setBrandName('');
      setLogoUrl('');
      setStatus('pending');
      setDueDate(null);
      setAmount('');
      setDeliverables([]);
    }
    setCurrentDeliverable('');
    setError(null);
  }, [initialData, isVisible]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    } else if (Platform.OS !== 'ios') { // On Android, closing picker without selection resets date sometimes
       // If you want to allow clearing the date, handle it here or add a clear button
    }
  };

  const addDeliverable = () => {
    if (currentDeliverable.trim()) {
      setDeliverables([...deliverables, currentDeliverable.trim()]);
      setCurrentDeliverable('');
    }
  };

  const removeDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!brandName || !amount) {
      setError('Brand Name and Amount are required.');
      return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount < 0) { // Allow 0 amount?
      setError('Please enter a valid amount.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const dealDataToSubmit: Omit<BrandDeal, 'id'> = {
      brandName,
      logo: logoUrl || null,
      status,
      dueDate: dueDate ? dueDate.toISOString() : null,
      amount: numericAmount,
      deliverables,
    };

    try {
      await onSubmit(dealDataToSubmit);
      onClose();
    } catch (err: any) {
      console.error("DealFormModal: Submit error:", err);
      setError(err.message || 'Failed to save deal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ScrollView contentContainerStyle={{ paddingBottom: 50 }}> 
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#747D8C" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{initialData ? 'Edit Deal' : 'Add New Deal'}</Text>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Brand Name"
              value={brandName}
              onChangeText={setBrandName}
              placeholderTextColor="#A4B0BE"
            />
            <TextInput
              style={styles.input}
              placeholder="Logo URL (Optional)"
              value={logoUrl}
              onChangeText={setLogoUrl}
              keyboardType="url"
              placeholderTextColor="#A4B0BE"
            />
             <TextInput
                style={styles.input}
                placeholder="Amount (e.g., 1500.00)"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                placeholderTextColor="#A4B0BE"
              />

            {/* Status Picker */}
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusSelectorContainer}>
              {DEAL_STATUSES.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.statusButton, status === s && styles.statusButtonActive]}
                  onPress={() => setStatus(s)}
                >
                  {/* Add icons later if desired */}
                  <Text style={[styles.statusButtonText, status === s && styles.statusButtonTextActive]}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Due Date Picker */}
            <Text style={styles.label}>Due Date (Optional)</Text>
            <View style={styles.dateContainer}>
              <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.datePickerText}>{dueDate ? formatDateForInput(dueDate) : 'Select Date'}</Text>
                <Calendar size={18} color="#6C63FF" />
              </TouchableOpacity>
              {dueDate && (
                   <TouchableOpacity onPress={() => setDueDate(null)} style={{padding: 5}}> 
                      <X size={18} color="#FF6B6B" />
                   </TouchableOpacity>
              )}
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={dueDate || new Date()} // Default to today if null
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

            {/* Deliverables */} 
            <Text style={styles.label}>Deliverables</Text>
             <View style={styles.deliverableInputContainer}>
                <TextInput
                  style={styles.deliverableInput}
                  placeholder="Add a deliverable (e.g., 1 Instagram Post)"
                  value={currentDeliverable}
                  onChangeText={setCurrentDeliverable}
                  onSubmitEditing={addDeliverable} // Add on submit
                  placeholderTextColor="#A4B0BE"
                />
                <TouchableOpacity onPress={addDeliverable} style={styles.addDeliverableButton}>
                    <Text style={{color: '#6C63FF', fontWeight: 'bold'}}>Add</Text>
                </TouchableOpacity>
            </View>
            {deliverables.length > 0 && (
                <View style={styles.deliverablesList}>
                    {deliverables.map((item, index) => (
                        <View key={index} style={styles.deliverableItem}>
                            <Text style={styles.deliverableText}>{item}</Text>
                            <TouchableOpacity onPress={() => removeDeliverable(index)}>
                                <X size={16} color="#FF6B6B" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}
            
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Save size={18} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Saving...' : (initialData ? 'Update Deal' : 'Add Deal')}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end', // Position modal at the bottom
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 25,
    paddingTop: 35, // More space at top
    paddingBottom: 20, // Space for submit button
    maxHeight: '85%', // Limit height
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  modalTitle: {
    marginBottom: 25,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2F3542',
  },
  label: {
      fontSize: 15,
      fontWeight: '500',
      color: '#747D8C',
      marginBottom: 8,
      marginTop: 10,
  },
  input: {
    height: 50,
    borderColor: '#E9ECEF',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    color: '#2F3542',
  },
  statusSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    backgroundColor: '#F8F9FA',
  },
  statusButtonActive: {
    borderColor: '#6C63FF',
    backgroundColor: '#F0EEFF',
  },
  statusButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#747D8C',
  },
  statusButtonTextActive: {
    color: '#6C63FF',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderColor: '#E9ECEF',
    borderWidth: 1,
    flex: 1, // Take available space
    marginRight: 10,
  },
  datePickerText: {
    fontSize: 16,
    color: '#2F3542',
    marginRight: 8,
  },
   deliverableInputContainer: {
      flexDirection: 'row',
      marginBottom: 10,
  },
  deliverableInput: {
    flex: 1,
    height: 50,
    borderColor: '#E9ECEF',
    borderWidth: 1,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    color: '#2F3542',
  },
  addDeliverableButton: {
      height: 50,
      paddingHorizontal: 15,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F0EEFF',
      borderWidth: 1,
      borderColor: '#E9ECEF',
      borderLeftWidth: 0,
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
  },
  deliverablesList: {
      marginBottom: 15,
      borderWidth: 1,
      borderColor: '#E9ECEF',
      borderRadius: 8,
      paddingVertical: 5,
  },
  deliverableItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#F8F9FA',
  },
  deliverableText: {
      color: '#2F3542',
      fontSize: 15,
      flex: 1, // Allow wrapping
      marginRight: 10,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    paddingVertical: 15,
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#A4B0BE',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
    marginLeft: 10,
  },
  errorText: {
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
  },
}); 