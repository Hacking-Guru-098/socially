import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker'; // Ensure this is installed
import { Expense } from '../../providers/AuthProvider'; // Import Expense type
import { X, Calendar, Save } from 'lucide-react-native';

type ExpenseFormModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (expenseData: Omit<Expense, 'id' | 'user_id' | 'created_at'>) => Promise<void>; // Function to handle submission
  initialData?: Expense | null; // For editing
};

// Helper to format date to YYYY-MM-DD for input
const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export default function ExpenseFormModal({ isVisible, onClose, onSubmit, initialData }: ExpenseFormModalProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form if initialData is provided (for editing)
  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString());
      setCategory(initialData.category);
      setDescription(initialData.description || '');
      setExpenseDate(new Date(initialData.expense_date));
    } else {
      // Reset form for adding new
      setAmount('');
      setCategory('');
      setDescription('');
      setExpenseDate(new Date());
    }
    setError(null); // Clear errors when modal opens or data changes
  }, [initialData, isVisible]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS until dismissed
    if (selectedDate) {
      setExpenseDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!amount || !category) {
      setError('Amount and Category are required.');
      return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const expenseDataToSubmit = {
      amount: numericAmount,
      category,
      description: description || null, // Send null if empty
      expense_date: expenseDate.toISOString(),
    };

    try {
      await onSubmit(expenseDataToSubmit);
      onClose(); // Close modal on successful submission
    } catch (err: any) {
      console.error("ExpenseFormModal: Submit error:", err);
      setError(err.message || 'Failed to save expense.');
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
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#747D8C" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{initialData ? 'Edit Expense' : 'Add New Expense'}</Text>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Amount (e.g., 49.99)"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            placeholderTextColor="#A4B0BE"
          />
          <TextInput
            style={styles.input}
            placeholder="Category (e.g., Software, Travel)"
            value={category}
            onChangeText={setCategory}
            placeholderTextColor="#A4B0BE"
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description (Optional)"
            value={description}
            onChangeText={setDescription}
            multiline
            placeholderTextColor="#A4B0BE"
          />

          {/* Date Picker */}
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>Expense Date:</Text>
            <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.datePickerText}>{formatDateForInput(expenseDate)}</Text>
              <Calendar size={18} color="#6C63FF" />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={expenseDate}
              mode="date"
              display="default" // Or "spinner"
              onChange={handleDateChange}
              maximumDate={new Date()} // Cannot select future date
            />
          )}

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Save size={18} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Saving...' : (initialData ? 'Update Expense' : 'Add Expense')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'stretch', // Stretch items to fill width
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%', // Make modal wider
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
  textArea: {
    height: 80,
    textAlignVertical: 'top', // Align text to top for multiline
    paddingTop: 15,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  dateLabel: {
    fontSize: 16,
    color: '#747D8C',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EEFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  datePickerText: {
    fontSize: 16,
    color: '#6C63FF',
    marginRight: 8,
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