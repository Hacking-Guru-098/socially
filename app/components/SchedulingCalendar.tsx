import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar, Clock, ChevronDown, CheckCircle } from 'lucide-react-native';

// Types
export type ScheduledPost = {
  id: string;
  title: string;
  date: Date;
  platform: string;
  image?: string;
  status: 'scheduled' | 'posted' | 'failed';
};

type CalendarViewProps = {
  posts: ScheduledPost[];
  onSelectDate: (date: Date) => void;
  selectedDate: Date;
};

type TimePickerProps = {
  selectedTime: string;
  onTimeChange: (time: string) => void;
};

// Mock data for best times to post
const BEST_TIMES = {
  instagram: ['9:00 AM', '12:00 PM', '8:00 PM'],
  twitter: ['8:00 AM', '10:00 AM', '6:00 PM'],
  facebook: ['1:00 PM', '3:00 PM', '9:00 PM'],
  tiktok: ['11:00 AM', '2:00 PM', '7:00 PM'],
};

const TIME_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
  '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM',
];

// Calendar view component
export const CalendarView: React.FC<CalendarViewProps> = ({ 
  posts, 
  onSelectDate, 
  selectedDate 
}) => {
  // Generate calendar days for the current month
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  // Get month name and year
  const monthNames = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];
  
  const monthName = monthNames[currentMonth.getMonth()];
  const year = currentMonth.getFullYear();

  // Navigation to previous and next month
  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  // Check if a date has posts scheduled
  const hasPostsOnDate = (date: number) => {
    const fullDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      date
    );
    
    return posts.some(post => {
      const postDate = new Date(post.date);
      return (
        postDate.getDate() === fullDate.getDate() &&
        postDate.getMonth() === fullDate.getMonth() &&
        postDate.getFullYear() === fullDate.getFullYear()
      );
    });
  };

  // Check if a date is selected
  const isDateSelected = (date: number) => {
    const fullDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      date
    );
    
    return (
      selectedDate.getDate() === fullDate.getDate() &&
      selectedDate.getMonth() === fullDate.getMonth() &&
      selectedDate.getFullYear() === fullDate.getFullYear()
    );
  };

  // Check if a date is today
  const isToday = (date: number) => {
    const today = new Date();
    const fullDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      date
    );
    
    return (
      today.getDate() === fullDate.getDate() &&
      today.getMonth() === fullDate.getMonth() &&
      today.getFullYear() === fullDate.getFullYear()
    );
  };

  // Handle date selection
  const handleDateSelect = (date: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      date
    );
    onSelectDate(newDate);
  };

  // Render the calendar grid
  const renderCalendarDays = () => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Render day names
    dayNames.forEach(day => {
      days.push(
        <View key={`header-${day}`} style={styles.calendarHeaderCell}>
          <Text style={styles.calendarHeaderText}>{day}</Text>
        </View>
      );
    });
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarCell} />);
    }
    
    // Add cells for each day of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const hasScheduledPosts = hasPostsOnDate(i);
      const isSelectedDate = isDateSelected(i);
      const isTodayDate = isToday(i);
      
      days.push(
        <TouchableOpacity
          key={`day-${i}`}
          style={[
            styles.calendarCell,
            isSelectedDate && styles.selectedDateCell,
            isTodayDate && styles.todayCell,
          ]}
          onPress={() => handleDateSelect(i)}
        >
          <Text
            style={[
              styles.calendarDate,
              isSelectedDate && styles.selectedDateText,
              isTodayDate && styles.todayText,
            ]}
          >
            {i}
          </Text>
          {hasScheduledPosts && (
            <View
              style={[
                styles.scheduledIndicator,
                isSelectedDate && styles.selectedScheduledIndicator,
              ]}
            />
          )}
        </TouchableOpacity>
      );
    }
    
    return days;
  };

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={goToPreviousMonth}>
          <Text style={styles.calendarNavButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.calendarTitle}>{`${monthName} ${year}`}</Text>
        <TouchableOpacity onPress={goToNextMonth}>
          <Text style={styles.calendarNavButton}>→</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.calendarGrid}>
        {renderCalendarDays()}
      </View>
    </View>
  );
};

// Time picker component
export const TimePicker: React.FC<TimePickerProps> = ({ 
  selectedTime, 
  onTimeChange 
}) => {
  const [showBestTimes, setShowBestTimes] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');

  // Get best times for selected platform
  const getBestTimesForPlatform = () => {
    return BEST_TIMES[selectedPlatform as keyof typeof BEST_TIMES] || [];
  };

  return (
    <View style={styles.timePickerContainer}>
      <View style={styles.timePickerHeader}>
        <View style={styles.timePickerTitleContainer}>
          <Clock size={18} color="#6C63FF" style={styles.timePickerIcon} />
          <Text style={styles.timePickerTitle}>Choose Time</Text>
        </View>
        <TouchableOpacity
          style={styles.bestTimesToggle}
          onPress={() => setShowBestTimes(!showBestTimes)}
        >
          <Text
            style={[
              styles.bestTimesToggleText,
              showBestTimes && styles.bestTimesToggleActive,
            ]}
          >
            Best Times
          </Text>
          <ChevronDown size={16} color="#6C63FF" />
        </TouchableOpacity>
      </View>

      {showBestTimes && (
        <View style={styles.bestTimesContainer}>
          <Text style={styles.bestTimesTitle}>Best Times for {selectedPlatform}:</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.bestTimesList}
          >
            {getBestTimesForPlatform().map((time, index) => (
              <TouchableOpacity
                key={`best-time-${index}`}
                style={[
                  styles.bestTimeItem,
                  selectedTime === time && styles.selectedBestTimeItem,
                ]}
                onPress={() => onTimeChange(time)}
              >
                <Text
                  style={[
                    styles.bestTimeText,
                    selectedTime === time && styles.selectedBestTimeText,
                  ]}
                >
                  {time}
                </Text>
                {selectedTime === time && (
                  <CheckCircle size={12} color="#FFFFFF" style={styles.bestTimeCheck} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.platformSelector}>
            {Object.keys(BEST_TIMES).map((platform) => (
              <TouchableOpacity
                key={`platform-${platform}`}
                style={[
                  styles.platformOption,
                  selectedPlatform === platform && styles.selectedPlatformOption,
                ]}
                onPress={() => setSelectedPlatform(platform)}
              >
                <Text
                  style={[
                    styles.platformOptionText,
                    selectedPlatform === platform && styles.selectedPlatformOptionText,
                  ]}
                >
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <ScrollView 
        style={styles.timeSlotContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.timeSlotGrid}>
          {TIME_SLOTS.map((time, index) => (
            <TouchableOpacity
              key={`time-${index}`}
              style={[
                styles.timeSlot,
                selectedTime === time && styles.selectedTimeSlot,
              ]}
              onPress={() => onTimeChange(time)}
            >
              <Text
                style={[
                  styles.timeSlotText,
                  selectedTime === time && styles.selectedTimeSlotText,
                ]}
              >
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// Default export that combines both components
export default {
  CalendarView,
  TimePicker
};

// Styles
const styles = StyleSheet.create({
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F3542',
  },
  calendarNavButton: {
    fontSize: 18,
    color: '#6C63FF',
    padding: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarHeaderCell: {
    width: '14.28%',
    paddingVertical: 8,
    alignItems: 'center',
  },
  calendarHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A4B0BE',
  },
  calendarCell: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  calendarDate: {
    fontSize: 14,
    color: '#2F3542',
  },
  selectedDateCell: {
    backgroundColor: '#6C63FF',
    borderRadius: 20,
  },
  selectedDateText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  todayCell: {
    borderWidth: 1,
    borderColor: '#6C63FF',
    borderRadius: 20,
  },
  todayText: {
    color: '#6C63FF',
    fontWeight: 'bold',
  },
  scheduledIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6C63FF',
  },
  selectedScheduledIndicator: {
    backgroundColor: '#FFFFFF',
  },
  timePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 16,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timePickerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timePickerIcon: {
    marginRight: 8,
  },
  timePickerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F3542',
  },
  bestTimesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  bestTimesToggleText: {
    fontSize: 14,
    color: '#2F3542',
    marginRight: 4,
  },
  bestTimesToggleActive: {
    color: '#6C63FF',
    fontWeight: '500',
  },
  bestTimesContainer: {
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  bestTimesTitle: {
    fontSize: 14,
    color: '#2F3542',
    marginBottom: 8,
  },
  bestTimesList: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bestTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedBestTimeItem: {
    backgroundColor: '#6C63FF',
  },
  bestTimeText: {
    fontSize: 14,
    color: '#2F3542',
  },
  selectedBestTimeText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  bestTimeCheck: {
    marginLeft: 4,
  },
  platformSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  platformOption: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedPlatformOption: {
    backgroundColor: '#6C63FF',
  },
  platformOptionText: {
    fontSize: 12,
    color: '#2F3542',
  },
  selectedPlatformOptionText: {
    color: '#FFFFFF',
  },
  timeSlotContainer: {
    maxHeight: 200,
  },
  timeSlotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    width: '31%',
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedTimeSlot: {
    backgroundColor: '#6C63FF',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#2F3542',
  },
  selectedTimeSlotText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
}); 