import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Briefcase, DollarSign, Calendar, ChevronRight } from 'lucide-react-native';

// Mock data for brand deals
const BRAND_DEALS = [
  {
    id: '1',
    brand: 'Fashionista',
    logo: 'https://randomuser.me/api/portraits/women/44.jpg',
    status: 'Active',
    dueDate: 'Oct 15, 2023',
    amount: 2400,
    deliverables: ['3 Posts', '2 Stories'],
  },
  {
    id: '2',
    brand: 'TechGadgets',
    logo: 'https://randomuser.me/api/portraits/men/32.jpg',
    status: 'Pending',
    dueDate: 'Oct 30, 2023',
    amount: 3500,
    deliverables: ['1 Video', '5 Stories'],
  },
  {
    id: '3',
    brand: 'TravelEscape',
    logo: 'https://randomuser.me/api/portraits/women/68.jpg',
    status: 'Completed',
    dueDate: 'Sep 28, 2023',
    amount: 1800,
    deliverables: ['2 Posts', '1 Video'],
  },
];

// Mock data for financial overview
const FINANCIAL_DATA = {
  totalEarnings: 28400,
  pendingPayments: 5300,
  thisMonth: 4200,
  lastMonth: 3700,
};

export default function BusinessScreen() {
  const [activeTab, setActiveTab] = useState('deals');
  const router = useRouter();

  // Navigate to settings
  const goToBusiness = () => {
    router.push('/(tabs)/business');
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Business Overview',
          headerTitleStyle: styles.headerTitle,
        }}
      />
      
      <View style={styles.container}>
        <View style={styles.summary}>
          <TouchableOpacity
            style={styles.summaryCard}
            onPress={goToBusiness}
          >
            <View style={styles.summaryIconContainer}>
              <Briefcase size={24} color="#6C63FF" />
            </View>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryTitle}>Brand Deals</Text>
              <Text style={styles.summaryValue}>{BRAND_DEALS.length} Active</Text>
            </View>
            <ChevronRight size={20} color="#A4B0BE" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.summaryCard}
            onPress={goToBusiness}
          >
            <View style={styles.summaryIconContainer}>
              <DollarSign size={24} color="#4CAF50" />
            </View>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryTitle}>Revenue</Text>
              <Text style={styles.summaryValue}>${FINANCIAL_DATA.thisMonth}</Text>
            </View>
            <ChevronRight size={20} color="#A4B0BE" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'deals' ? styles.activeTab : null]}
            onPress={() => setActiveTab('deals')}
          >
            <Text style={[styles.tabText, activeTab === 'deals' ? styles.activeTabText : null]}>
              Brand Deals
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'finances' ? styles.activeTab : null]}
            onPress={() => setActiveTab('finances')}
          >
            <Text style={[styles.tabText, activeTab === 'finances' ? styles.activeTabText : null]}>
              Finances
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {activeTab === 'deals' && (
            <View style={styles.dealsContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Active Brand Deals</Text>
                <TouchableOpacity onPress={goToBusiness}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>

              {BRAND_DEALS.map(deal => (
                <View key={deal.id} style={styles.dealCard}>
                  <View style={styles.dealHeader}>
                    <Image source={{ uri: deal.logo }} style={styles.brandLogo} />
                    <View style={styles.brandInfo}>
                      <Text style={styles.brandName}>{deal.brand}</Text>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(deal.status) + '20' }
                      ]}>
                        <Text style={[
                          styles.statusText,
                          { color: getStatusColor(deal.status) }
                        ]}>
                          {deal.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.dealAmount}>${deal.amount}</Text>
                  </View>

                  <View style={styles.dealDetails}>
                    <View style={styles.dealDetail}>
                      <Calendar size={14} color="#A4B0BE" style={styles.dealDetailIcon} />
                      <Text style={styles.dealDetailText}>Due: {deal.dueDate}</Text>
                    </View>
                    
                    <View style={styles.deliverables}>
                      {deal.deliverables.map((item, index) => (
                        <View key={index} style={styles.deliverableBadge}>
                          <Text style={styles.deliverableText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              ))}

              <TouchableOpacity 
                style={styles.viewFullButton}
                onPress={goToBusiness}
              >
                <Text style={styles.viewFullButtonText}>View Full Business Hub</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'finances' && (
            <View style={styles.financesContainer}>
              <View style={styles.financialOverview}>
                <Text style={styles.financialOverviewTitle}>Financial Overview</Text>
                
                <View style={styles.financialCards}>
                  <View style={styles.financialCard}>
                    <Text style={styles.financialCardTitle}>Total Earnings</Text>
                    <Text style={styles.financialCardValue}>
                      ${FINANCIAL_DATA.totalEarnings.toLocaleString()}
                    </Text>
                  </View>
                  
                  <View style={styles.financialCard}>
                    <Text style={styles.financialCardTitle}>Pending</Text>
                    <Text style={styles.financialCardValue}>
                      ${FINANCIAL_DATA.pendingPayments.toLocaleString()}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.monthlyEarnings}>
                  <View style={styles.monthlyEarningHeader}>
                    <Text style={styles.monthlyEarningTitle}>Monthly Earnings</Text>
                    <TouchableOpacity onPress={goToBusiness}>
                      <Text style={styles.seeAllText}>More</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.monthRow}>
                    <Text style={styles.monthName}>This Month</Text>
                    <Text style={styles.monthValue}>
                      ${FINANCIAL_DATA.thisMonth.toLocaleString()}
                    </Text>
                  </View>
                  
                  <View style={styles.monthRow}>
                    <Text style={styles.monthName}>Last Month</Text>
                    <Text style={styles.monthValue}>
                      ${FINANCIAL_DATA.lastMonth.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.viewFullButton}
                onPress={goToBusiness}
              >
                <Text style={styles.viewFullButtonText}>View Full Business Hub</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}

// Get status color
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Active':
      return '#4CAF50';
    case 'Pending':
      return '#FFC107';
    case 'Completed':
      return '#2196F3';
    default:
      return '#757575';
  }
};

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
  summary: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0EEFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 12,
    color: '#747D8C',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F3542',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 4,
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#F0EEFF',
  },
  tabText: {
    fontSize: 14,
    color: '#747D8C',
  },
  activeTabText: {
    color: '#6C63FF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  dealsContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F3542',
  },
  seeAllText: {
    color: '#6C63FF',
    fontSize: 14,
  },
  dealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  brandInfo: {
    flex: 1,
  },
  brandName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F3542',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dealAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F3542',
  },
  dealDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dealDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dealDetailIcon: {
    marginRight: 4,
  },
  dealDetailText: {
    fontSize: 12,
    color: '#747D8C',
  },
  deliverables: {
    flexDirection: 'row',
    gap: 8,
  },
  deliverableBadge: {
    backgroundColor: '#F5F6FA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  deliverableText: {
    fontSize: 12,
    color: '#2F3542',
  },
  viewFullButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  viewFullButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  financesContainer: {
    marginBottom: 20,
  },
  financialOverview: {
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
  financialOverviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F3542',
    marginBottom: 16,
  },
  financialCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  financialCard: {
    width: '48%',
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    padding: 12,
  },
  financialCardTitle: {
    fontSize: 12,
    color: '#747D8C',
    marginBottom: 4,
  },
  financialCardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F3542',
  },
  monthlyEarnings: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 16,
  },
  monthlyEarningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthlyEarningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2F3542',
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  monthName: {
    fontSize: 14,
    color: '#747D8C',
  },
  monthValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2F3542',
  },
}); 