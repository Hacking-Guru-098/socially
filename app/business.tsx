import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth, BusinessData, BrandDeal, RateCardItem, Expense } from '../providers/AuthProvider'; // Import context and types
import ExpenseFormModal from '../components/modals/ExpenseFormModal'; // Import the modal
import DealFormModal from '../components/modals/DealFormModal'; // Import Deal Modal
import { Briefcase, DollarSign, Settings, Calendar, List, CheckCircle, Clock, AlertCircle, CreditCard, Edit, Plus, Trash2, Tag, Edit2, MapPin, Package } from 'lucide-react-native';
import { BarChart } from "react-native-chart-kit"; // For financial chart later

// Get screen width for charts
const screenWidth = Dimensions.get("window").width;

// Helper to format currency
const formatCurrency = (amount: number) => {
  return `$${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
};

// Helper to format date
const formatDate = (dateString?: string | null) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (e) {
    return 'Invalid Date';
  }
};

// Map status to icon and color
const getStatusStyle = (status: BrandDeal['status']) => {
  switch (status) {
    case 'active': return { icon: List, color: '#2E86DE' }; // Blue
    case 'completed': return { icon: CheckCircle, color: '#4CAF50' }; // Green
    case 'pending': return { icon: Clock, color: '#FFA500' }; // Orange
    case 'negotiating': return { icon: AlertCircle, color: '#FF6B6B' }; // Red
    default: return { icon: Briefcase, color: '#A4B0BE' };
  }
};

// Business Screen Component
export default function BusinessScreen() {
  const router = useRouter();
  const { fetchBusinessData, fetchExpenses, deleteExpense, addExpense, updateExpense, createDeal, updateDeal } = useAuth();
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('brandDeals'); // 'brandDeals', 'finances', or 'rateCard'
  const [expenses, setExpenses] = useState<Expense[]>([]); // State for expenses
  const [isExpensesLoading, setIsExpensesLoading] = useState(false);
  const [expenseError, setExpenseError] = useState<string | null>(null); // State for expense-specific errors

  // State for modal
  const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Deal Modal State
  const [isDealModalVisible, setIsDealModalVisible] = useState(false);
  const [editingDeal, setEditingDeal] = useState<BrandDeal | null>(null);

  const loadBusinessData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchBusinessData();
      setBusinessData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load business data.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchBusinessData]);

  useEffect(() => {
    loadBusinessData();
  }, [loadBusinessData]);

  // Fetch expenses when finances tab is active or initially
  const loadExpenses = useCallback(async () => {
    if (!isExpensesLoading) {
        setIsExpensesLoading(true);
        setExpenseError(null); // Clear previous errors
        console.log("FINANCES: Fetching real expenses...");
        try {
            const fetchedExpenses = await fetchExpenses();
            setExpenses(fetchedExpenses);
        } catch (err: any) {
            console.error("FINANCES: Failed to fetch expenses:", err);
            setExpenseError(err.message || 'Failed to load expenses.');
        } finally {
            setIsExpensesLoading(false);
        }
    }
  }, [fetchExpenses, isExpensesLoading]);

  useEffect(() => {
    // Fetch expenses immediately if the finances tab is selected by default, or when it becomes active
    if (activeTab === 'finances') {
        loadExpenses();
    }
  }, [activeTab, loadExpenses]); 

  const navigateToSettings = () => {
    router.push('/settings');
  };

  // --- Prepare data for Finance Chart (Mock for now) ---
  const financeChartData = {
    labels: businessData?.financialOverview.monthlyBreakdown.map(m => m.month) || [],
    datasets: [
      {
        data: businessData?.financialOverview.monthlyBreakdown.map(m => m.earnings) || []
      }
    ]
  };

  const chartConfig = { /* Same config as Analytics or define new */
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientTo: "#FFFFFF",
    decimalPlaces: 0, 
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, // Green for finances
    labelColor: (opacity = 1) => `rgba(116, 125, 140, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: "4", strokeWidth: "2", stroke: "#4CAF50" },
  };

  // --- Expense Handlers ---
  const handleAddExpenseClick = () => {
    setEditingExpense(null); // Ensure we are adding, not editing
    setIsExpenseModalVisible(true);
  };

  const handleEditExpenseClick = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseModalVisible(true);
  };
  
  const handleExpenseSubmit = async (expenseData: Omit<Expense, 'id' | 'user_id' | 'created_at'>) => {
      // If editingExpense exists, update it; otherwise, add new
      if (editingExpense) {
          console.log(`EXPENSE: Updating expense ${editingExpense.id}...`);
          const updatedExpense = await updateExpense(editingExpense.id, expenseData);
          // Update the expense in the local state
          setExpenses(prev => 
              prev.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp)
          );
      } else {
          console.log(`EXPENSE: Adding new expense...`);
          const addedExpense = await addExpense(expenseData);
          // Add the new expense to the top of the list
          setExpenses(prev => [addedExpense, ...prev]);
      }
      // Modal closes itself on success, error handled in modal
  };
  
  const handleDeleteExpense = (expenseId: string) => {
      Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
          { text: 'Cancel', style: 'cancel' },
          {
              text: 'Delete', style: 'destructive',
              onPress: async () => {
                  // Optimistic UI update
                  const originalExpenses = [...expenses];
                  setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
                  try {
                      console.log(`EXPENSE: Deleting expense ${expenseId} via provider...`);
                      await deleteExpense(expenseId);
                      console.log(`EXPENSE: Deleted ${expenseId} successfully.`);
                      // Optionally show success message
                  } catch (err: any) {
                      console.error(`EXPENSE: Failed to delete ${expenseId}:`, err);
                      Alert.alert('Error', `Failed to delete expense: ${err.message}`);
                      // Revert UI change on error
                      setExpenses(originalExpenses); 
                  }
              }
          }
      ]);
  };
  // --- End Expense Handlers ---

  // --- Deal Handlers ---
  const handleAddDealClick = () => {
      setEditingDeal(null);
      setIsDealModalVisible(true);
  };
  
  const handleEditDealClick = (deal: BrandDeal) => {
      setEditingDeal(deal);
      setIsDealModalVisible(true);
  };
  
  const handleDealSubmit = async (dealData: Omit<BrandDeal, 'id'>) => {
      if (editingDeal) {
          console.log(`DEAL: Updating deal ${editingDeal.id}...`);
          const updatedDeal = await updateDeal(editingDeal.id, dealData);
          // Update local state
          setBusinessData(prev => prev ? {
              ...prev,
              brandDeals: prev.brandDeals.map(d => d.id === updatedDeal.id ? updatedDeal : d)
          } : null);
      } else {
          console.log(`DEAL: Adding new deal...`);
          const addedDeal = await createDeal(dealData);
          // Add to local state
          setBusinessData(prev => prev ? {
              ...prev,
              brandDeals: [addedDeal, ...prev.brandDeals]
          } : { brandDeals: [addedDeal], financialOverview: {totalEarnings:0, pendingPayments: 0, monthlyBreakdown: []}, rateCard: [] }); // Basic structure if prev is null
      }
      // Consider recalculating financial overview if status/amount changed
      // loadBusinessData(); // Optionally reload all data
  };
  // --- End Deal Handlers ---

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerTitle: 'Business Hub',
          headerTitleStyle: styles.headerTitle,
          headerBackVisible: false, // Hide back button
          headerRight: () => (
            <TouchableOpacity onPress={navigateToSettings} style={styles.settingsButton}>
              <Settings size={22} color="#2F3542" />
            </TouchableOpacity>
          ),
        }}
      />
      <StatusBar style="dark" />

      {isLoading ? (
        <View style={styles.loadingContainer}>{/* ... Loading ... */}</View>
      ) : error ? (
        <View style={styles.errorContainer}>{/* ... Error ... */}</View>
      ) : businessData ? (
        <View style={styles.container}> 
          {/* Tab Selector - Add Rate Card Tab */} 
          <View style={styles.tabSelectorContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'brandDeals' && styles.tabButtonActive]}
              onPress={() => setActiveTab('brandDeals')}
            >
              <Briefcase size={18} color={activeTab === 'brandDeals' ? '#6C63FF' : '#747D8C'} />
              <Text style={[styles.tabButtonText, activeTab === 'brandDeals' && styles.tabButtonTextActive]}>Deals</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'finances' && styles.tabButtonActive]}
              onPress={() => setActiveTab('finances')}
            >
              <DollarSign size={18} color={activeTab === 'finances' ? '#4CAF50' : '#747D8C'} />
              <Text style={[styles.tabButtonText, activeTab === 'finances' && styles.tabButtonTextActive]}>Finances</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'rateCard' && styles.tabButtonActive]}
              onPress={() => setActiveTab('rateCard')}
            >
              <CreditCard size={18} color={activeTab === 'rateCard' ? '#FFA500' : '#747D8C'} />
              <Text style={[styles.tabButtonText, activeTab === 'rateCard' && styles.tabButtonTextActive]}>Rate Card</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {activeTab === 'brandDeals' && (
              <View style={styles.tabContent}>
                 <View style={styles.sectionHeaderRow}> 
                   <Text style={styles.sectionTitle}>Active Brand Deals</Text>
                   <TouchableOpacity style={styles.addDealButton} onPress={handleAddDealClick}>
                       <Plus size={16} color="#6C63FF" />
                       <Text style={styles.addDealButtonText}>New Deal</Text>
                   </TouchableOpacity>
                 </View>

                {businessData.brandDeals.length > 0 ? (
                  businessData.brandDeals.map((deal) => {
                    const StatusIcon = getStatusStyle(deal.status).icon;
                    const statusColor = getStatusStyle(deal.status).color;
                    return (
                      <TouchableOpacity 
                        key={deal.id} 
                        style={styles.dealCard}
                        onPress={() => router.push({ pathname: '/deal/[id]' as any, params: { id: deal.id } })}
                        onLongPress={() => handleEditDealClick(deal)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.dealCardHeader}>
                            <Image source={{ uri: deal.logo || 'https://picsum.photos/seed/defaultlogo/50' }} style={styles.dealLogo} />
                            <View style={styles.dealCardTitleContainer}>
                               <Text style={styles.dealBrandName} numberOfLines={1}>{deal.brandName}</Text>
                               <View style={styles.dealStatusContainer}>
                                    <StatusIcon size={14} color={statusColor} />
                                    <Text style={[styles.dealStatus, { color: statusColor }]}>{deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}</Text>
                                </View>
                            </View>
                             <Text style={styles.dealAmount}>{formatCurrency(deal.amount)}</Text>
                        </View>
                        
                        {deal.deliverables && deal.deliverables.length > 0 && (
                            <View style={styles.deliverablesSection}>
                                <View style={styles.deliverablesHeader}> 
                                    <Package size={14} color="#747D8C" />
                                    <Text style={styles.deliverablesTitle}>Deliverables</Text>
                                </View>
                                {deal.deliverables.map((item, index) => (
                                    <Text key={index} style={styles.deliverableItem}>- {item}</Text>
                                ))}
                            </View>
                        )}
                        
                        {deal.dueDate && (
                             <View style={styles.dueDateContainer}>
                               <Calendar size={14} color="#747D8C" />
                               <Text style={styles.dealDueDate}>Due: {formatDate(deal.dueDate)}</Text>
                            </View>
                        )}
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <Text style={styles.noDataText}>No active brand deals. Tap 'New Deal' to add one.</Text>
                )}
              </View>
            )}

            {activeTab === 'finances' && (
              <View style={styles.tabContent}>
                 {/* Financial Overview */} 
                <Text style={styles.sectionTitle}>Financial Overview</Text>
                <View style={styles.financialSummaryContainer}>
                   <View style={styles.financialMetricBox}> 
                      <Text style={styles.financialMetricLabel}>Total Earnings (YTD)</Text>
                      <Text style={styles.financialMetricValue}>{formatCurrency(businessData.financialOverview.totalEarnings)}</Text>
                   </View>
                   <View style={styles.financialMetricBox}> 
                      <Text style={styles.financialMetricLabel}>Pending Payments</Text>
                      <Text style={[styles.financialMetricValue, { color: '#FFA500' }]}>{formatCurrency(businessData.financialOverview.pendingPayments)}</Text>
                   </View>
                </View>

                 {/* Monthly Earnings Chart */}
                {financeChartData.labels.length > 0 && (
                  <View style={styles.chartSection}>
                     <Text style={styles.sectionTitle}>Monthly Earnings</Text>
                     <BarChart
                       data={financeChartData}
                       width={screenWidth - 64} // Adjust width
                       height={220}
                       yAxisLabel="$"
                       yAxisSuffix=""
                       chartConfig={chartConfig}
                       verticalLabelRotation={30}
                       style={styles.chartStyle}
                     />
                  </View>
                )}
                {/* Expense Management Section */} 
                <View style={styles.section}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Expense Management</Text>
                    <TouchableOpacity style={styles.addExpenseButton} onPress={handleAddExpenseClick}>
                      <Plus size={16} color="#6C63FF" />
                      <Text style={styles.addExpenseButtonText}>Add Expense</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {isExpensesLoading ? (
                      <ActivityIndicator style={{marginVertical: 20}} color="#6C63FF" />
                  ) : expenseError ? ( // Display expense-specific error
                        <Text style={styles.errorText}>{expenseError}</Text>
                   ) : expenses.length > 0 ? (
                      <View style={styles.expenseListContainer}>
                         {expenses.map(expense => (
                             <TouchableOpacity 
                               key={expense.id} 
                               style={styles.expenseItem} 
                               onLongPress={() => handleEditExpenseClick(expense)} // Long press to edit
                               activeOpacity={0.7} // Provide feedback on touch
                             >
                                <View style={styles.expenseDetails}> 
                                     <Text style={styles.expenseDescription}>{expense.description || expense.category}</Text>
                                     <View style={styles.expenseCategoryContainer}>
                                         <Tag size={14} color="#747D8C" />
                                         <Text style={styles.expenseCategory}>{expense.category}</Text>
                                     </View>
                                     <Text style={styles.expenseDate}>{formatDate(expense.expense_date)}</Text>
                                 </View>
                                 <View style={styles.expenseAmountContainer}>
                                     <Text style={styles.expenseAmount}>-{formatCurrency(expense.amount)}</Text>
                                     {/* Edit Icon (Optional) */}
                                      <TouchableOpacity onPress={() => handleEditExpenseClick(expense)} style={styles.editExpenseButton}> 
                                         <Edit2 size={18} color="#6C63FF" />
                                     </TouchableOpacity> 
                                     {/* Delete Button */}
                                     <TouchableOpacity onPress={() => handleDeleteExpense(expense.id)} style={styles.deleteExpenseButton}>
                                         <Trash2 size={18} color="#FF6B6B" />
                                     </TouchableOpacity>
                                 </View>
                             </TouchableOpacity>
                         ))}
                      </View>
                  ) : (
                      <View style={styles.expensePlaceholderContainer}>
                        <Text style={styles.placeholderText}>
                          No expenses logged yet. Tap "Add Expense" to start tracking.
                        </Text>
                      </View>
                  )}
                </View>
              </View>
            )}

            {activeTab === 'rateCard' && (
              <View style={styles.tabContent}>
                <View style={styles.sectionHeaderRow}> 
                  <Text style={styles.sectionTitle}>Your Rate Card</Text>
                  <TouchableOpacity 
                    style={styles.editRateCardButton} 
                    onPress={() => router.push('/rate-card-edit')}
                  > 
                    <Edit size={16} color="#6C63FF" />
                    <Text style={styles.editRateCardButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>

                {businessData.rateCard.length > 0 ? (
                  <View style={styles.rateCardContainer}>
                    {businessData.rateCard.map((item: RateCardItem) => (
                      <View key={item.id} style={styles.rateCardItem}>
                        <Text style={styles.rateCardService}>{item.service}</Text>
                        <Text style={styles.rateCardRate}>{formatCurrency(item.rate)}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noDataText}>No rate card items found. Add your services and rates.</Text>
                )}
              </View>
            )}
          </ScrollView>
          
          {/* Expense Modal */} 
          <ExpenseFormModal 
              isVisible={isExpenseModalVisible}
              onClose={() => setIsExpenseModalVisible(false)}
              onSubmit={handleExpenseSubmit}
              initialData={editingExpense} // Pass expense data if editing
          />
          {/* Deal Modal */} 
          <DealFormModal 
              isVisible={isDealModalVisible}
              onClose={() => setIsDealModalVisible(false)}
              onSubmit={handleDealSubmit}
              initialData={editingDeal}
          />
        </View>
      ) : (
        <View style={styles.errorContainer}>{/* ... No data ... */}</View> // Handle no data case
      )}
    </SafeAreaView>
  );
}

// --- Styles (Add/modify significantly) ---
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
  settingsButton: {
    marginRight: 16,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: '#F44336', textAlign: 'center' },
  tabSelectorContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  tabButtonActive: {
    backgroundColor: '#E9ECEF',
  },
  tabButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#747D8C',
  },
  tabButtonTextActive: {
    color: '#6C63FF',
  },
  scrollContent: {
    padding: 16,
  },
  tabContent: {
    // Styles for the content area of each tab
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F3542',
    marginBottom: 16,
    marginTop: 8, // Add some top margin
  },
  dealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16, // Increase spacing
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, // Slightly larger shadow
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  dealCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12, // Space before deliverables/due date
  },
  dealLogo: {
    width: 40, // Slightly smaller logo
    height: 40,
    borderRadius: 6,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF', // Add border
  },
  dealCardTitleContainer: {
      flex: 1, // Take available space
      marginRight: 10,
  },
  dealBrandName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F3542',
    marginBottom: 4,
  },
  dealStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dealStatus: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  dealAmount: {
    fontSize: 16, // Larger amount text
    fontWeight: 'bold',
    color: '#4CAF50',
    marginLeft: 'auto', // Push amount to the right
  },
  deliverablesSection: {
      marginTop: 8, 
      marginBottom: 8,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: '#F0F0F0',
  },
  deliverablesHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
  },
  deliverablesTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: '#747D8C',
      marginLeft: 6,
  },
  deliverableItem: {
      fontSize: 14,
      color: '#555',
      marginLeft: 10, // Indent items
      marginBottom: 4,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  dealDueDate: {
    marginLeft: 6,
    fontSize: 13,
    color: '#747D8C',
  },
  noDataText: {
    textAlign: 'center',
    color: '#A4B0BE',
    marginTop: 20,
    fontStyle: 'italic',
  },
  financialSummaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  financialMetricBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  financialMetricLabel: {
    fontSize: 13,
    color: '#747D8C',
    marginBottom: 6,
  },
  financialMetricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F3542',
  },
  chartSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
  },
  section: { // Add this if missing from previous edits
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  editRateCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F0EEFF',
    borderRadius: 15,
  },
  editRateCardButtonText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#6C63FF',
  },
  placeholderText: { // Style for expense placeholder
    textAlign: 'center',
    color: '#A4B0BE',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  rateCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    // paddingVertical: 8, // Add vertical padding if needed
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  rateCardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  rateCardItem_last: { // Optional: Remove border for last item
     borderBottomWidth: 0,
  },
  rateCardService: {
    fontSize: 15,
    color: '#2F3542',
    flex: 1, // Allow text to wrap
    marginRight: 10,
  },
  rateCardRate: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  addExpenseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F0EEFF',
    borderRadius: 15,
  },
  addExpenseButtonText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#6C63FF',
  },
  expenseListContainer: {
    marginTop: 10,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  expenseItem_last: {
      borderBottomWidth: 0, // Remove border for the last item if desired
  },
  expenseDetails: {
    flex: 1,
    marginRight: 10,
  },
  expenseDescription: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2F3542',
    marginBottom: 4,
  },
  expenseCategoryContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
  },
  expenseCategory: {
    fontSize: 13,
    color: '#747D8C',
    marginLeft: 5,
  },
  expenseDate: {
    fontSize: 12,
    color: '#A4B0BE',
  },
  expenseAmountContainer: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  editExpenseButton: {
    marginLeft: 10, // Space between amount and edit
    padding: 5,
  },
  deleteExpenseButton: {
      marginLeft: 10, // Adjusted margin
      padding: 5, 
  },
  expensePlaceholderContainer: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    alignItems: 'center',
    marginTop: 10, 
  },
  addDealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F0EEFF',
    borderRadius: 15,
  },
  addDealButtonText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#6C63FF',
  },
}); 