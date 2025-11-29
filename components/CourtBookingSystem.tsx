import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { BookingCalendar } from './BookingCalendar';
import { CourtScheduleView } from './CourtScheduleView';
import { MyBookings } from './MyBookings';
import { CourtAvailability } from './CourtAvailability';
import { Calendar, ListChecks, LayoutGrid, List } from 'lucide-react';
import type { ConnectedAccount } from './ConnectedAccountsSection';

export interface Booking {
  id: string;
  courtNumber: number;
  date: Date;
  timeSlot: string;
  status: 'booked' | 'scheduled' | 'watching' | 'cancelled';
  scheduledFor?: Date; // When booking window opens
  autoCancelEnabled?: boolean;
  autoRebookEnabled?: boolean;
  onlyBookWhenBusy?: boolean; // True if created with "Only Book When Busy" feature
  busyThreshold?: number; // The threshold setting when "Only Book When Busy" was used
  cancelReason?: 'weather' | 'availability' | 'manual';
  cost: number;
  recurringGroupId?: string; // ID to group recurring bookings together
  recurringIndex?: number; // Position in the recurring series (e.g., 1, 2, 3...)
  recurringTotal?: number; // Total number of bookings in the series
  accountId?: string; // ID of the connected account used for this booking
}

export interface AutoCancelSettings {
  weatherEnabled: boolean;
  minTempEnabled: boolean;
  minTemp: number;
  maxTempEnabled: boolean;
  maxTemp: number;
  rainProbabilityEnabled: boolean;
  rainProbability: number;
  recentRainEnabled: boolean; // Cancel if it rained recently (wet courts)
  recentRainHours: number; // Check rain in the last X hours
  maxWindEnabled: boolean; // Cancel if wind is too strong
  maxWind: number; // Maximum wind speed in mph
  availabilityEnabled: boolean;
  minAvailableCourts: number;
  autoRebookEnabled: boolean;
  maxAvailableCourtsForRebook: number;
}

export interface WeatherData {
  temp: number;
  condition: 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy';
  rainProbability: number;
  rainedInLastHours?: number; // Hours since last rain (0 if currently raining)
  windSpeed?: number; // Wind speed in mph
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  numCourts: number;
  latitude: number;
  longitude: number;
  timezone: string; // IANA timezone identifier (e.g., 'Europe/London', 'America/New_York')
}

export const VENUES: Venue[] = [
  { id: 'riverside', name: 'Riverside Tennis Club', address: '123 River Road, London SW1', numCourts: 4, latitude: 51.4975, longitude: -0.1357, timezone: 'Europe/London' },
  { id: 'parkside', name: 'Parkside Sports Centre', address: '456 Park Avenue, London N1', numCourts: 4, latitude: 51.5422, longitude: -0.1036, timezone: 'Europe/London' },
  { id: 'central', name: 'Central Courts', address: '789 High Street, London EC1', numCourts: 4, latitude: 51.5174, longitude: -0.0927, timezone: 'Europe/London' },
  { id: 'westend', name: 'West End Tennis', address: '321 Oxford Street, London W1', numCourts: 4, latitude: 51.5155, longitude: -0.1415, timezone: 'Europe/London' },
];

export function CourtBookingSystem({ connectedAccounts }: { connectedAccounts: ConnectedAccount[] }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedVenue, setSelectedVenue] = useState<string>(VENUES[0].id);
  const [autoCancelSettings, setAutoCancelSettings] = useState<AutoCancelSettings>({
    weatherEnabled: false,
    minTempEnabled: false,
    minTemp: 10,
    maxTempEnabled: false,
    maxTemp: 30,
    rainProbabilityEnabled: false,
    rainProbability: 30,
    recentRainEnabled: false,
    recentRainHours: 24,
    maxWindEnabled: false,
    maxWind: 20,
    availabilityEnabled: false,
    minAvailableCourts: 3,
    autoRebookEnabled: false,
    maxAvailableCourtsForRebook: 2,
  });

  // Simulate court availability (4 courts)
  const [courtAvailability, setCourtAvailability] = useState<Record<string, number[]>>({});
  const [weatherForecast, setWeatherForecast] = useState<Record<string, WeatherData>>({});
  
  // Helper function to get current time in a specific timezone
  const getCurrentTimeInTimezone = (timezone: string): Date => {
    // Get current time as a string in the specified timezone
    const dateString = new Date().toLocaleString('en-US', { timeZone: timezone });
    return new Date(dateString);
  };
  
  // Helper function to check if a time slot is in the past for a given venue
  const isSlotInPast = (slotDate: Date, slotTime: string, venueId: string): boolean => {
    const venue = VENUES.find(v => v.id === venueId);
    if (!venue) return false;
    
    // Get current time in venue's timezone
    const now = getCurrentTimeInTimezone(venue.timezone);
    
    // Create slot datetime
    const [hours, minutes] = slotTime.split(':').map(Number);
    const slotDateTime = new Date(slotDate);
    slotDateTime.setHours(hours, minutes, 0, 0);
    
    return slotDateTime < now;
  };
  
  // Helper function to calculate booking window opening time
  const getBookingWindowOpens = (slotDate: Date, slotTime: string): Date => {
    const [hours, minutes] = slotTime.split(':').map(Number);
    const slotDateTime = new Date(slotDate);
    slotDateTime.setHours(hours, minutes, 0, 0);
    
    // Booking window opens 7 days before at 8pm
    const windowOpens = new Date(slotDateTime);
    windowOpens.setDate(windowOpens.getDate() - 7);
    windowOpens.setHours(20, 0, 0, 0); // 8pm
    
    return windowOpens;
  };
  
  // Helper function to check if booking window is open for a slot
  const isBookingWindowOpen = (slotDate: Date, slotTime: string): boolean => {
    const windowOpens = getBookingWindowOpens(slotDate, slotTime);
    return new Date() >= windowOpens;
  };
  
  // Helper function to calculate cost based on time slot
  const getSlotCost = (timeSlot: string): number => {
    const [hours] = timeSlot.split(':').map(Number);
    
    // Peak hours: 4pm-8pm = £15 per 30min slot
    // Off-peak hours: 8am-4pm = £10 per 30min slot
    if (hours >= 16 && hours < 20) {
      return 15; // Peak hours
    }
    return 10; // Off-peak hours
  };

  // Initialize some sample availability
  useEffect(() => {
    const availability: Record<string, number[]> = {}; const weather: Record<string, WeatherData> = {};
    const today = new Date();
    
    for (let day = 0; day < 14; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() + day);
      const dateKey = date.toISOString().split('T')[0];
      
      // Generate base weather for the day (varies throughout day)
      const baseTemp = Math.floor(Math.random() * 20) + 5; // 5-25°C
      const dayCondition = Math.random();
      
      const timeSlots = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
      ];
      
      timeSlots.forEach((slot, index) => {
        const key = `${dateKey}-${slot}`;
        
        // Temperature varies throughout the day
        const [hours] = slot.split(':').map(Number);
        let tempVariation = 0;
        if (hours >= 8 && hours < 12) {
          tempVariation = (hours - 8) * 2; // Morning warming
        } else if (hours >= 12 && hours < 16) {
          tempVariation = 8; // Peak warmth
        } else {
          tempVariation = 8 - (hours - 16) * 1.5; // Evening cooling
        }
        
        const temp = Math.round(baseTemp + tempVariation);
        
        // Weather condition
        let condition: WeatherData['condition'];
        let rainProbability: number;
        let windSpeed: number;
        
        if (dayCondition < 0.4) {
          condition = 'sunny';
          rainProbability = Math.floor(Math.random() * 10);
          windSpeed = Math.floor(Math.random() * 10) + 3; // 3-12 mph
        } else if (dayCondition < 0.6) {
          condition = 'partly-cloudy';
          rainProbability = Math.floor(Math.random() * 20) + 10;
          windSpeed = Math.floor(Math.random() * 13) + 6; // 6-19 mph
        } else if (dayCondition < 0.8) {
          condition = 'cloudy';
          rainProbability = Math.floor(Math.random() * 30) + 20;
          windSpeed = Math.floor(Math.random() * 16) + 9; // 9-25 mph
        } else if (dayCondition < 0.95) {
          condition = 'rainy';
          rainProbability = Math.floor(Math.random() * 40) + 50;
          windSpeed = Math.floor(Math.random() * 19) + 12; // 12-31 mph
        } else {
          condition = 'stormy';
          rainProbability = Math.floor(Math.random() * 20) + 80;
          windSpeed = Math.floor(Math.random() * 25) + 25; // 25-50 mph
        }
        
        weather[key] = {
          temp,
          condition,
          rainProbability,
          windSpeed,
        };
        
        // Check if booking window is open
        if (!isBookingWindowOpen(date, slot)) {
          // Booking window not open yet
          availability[key] = [];
        } else {
          // Random number of available courts (0-4)
          availability[key] = Array.from(
            { length: Math.floor(Math.random() * 5) },
            (_, i) => i + 1
          );
        }
      });
    }
    
    setCourtAvailability(availability);
    setWeatherForecast(weather);
  }, []);

  // Simulate checking for auto-book opportunities
  useEffect(() => {
    const interval = setInterval(() => {
      setBookings(prev => {
        const updated = [...prev];
        let hasChanges = false;

        prev.forEach((booking, index) => {
          if (booking.status === 'watching') {
            const dateKey = booking.date.toISOString().split('T')[0];
            const key = `${dateKey}-${booking.timeSlot}`;
            const available = courtAvailability[key] || [];
            
            // Check if a court becomes available (someone cancelled)
            if (available.length > 0 && Math.random() > 0.95) {
              updated[index] = {
                ...booking,
                status: 'booked',
                courtNumber: available[0],
              };
              hasChanges = true;
            }
          }

          // Check scheduled bookings (booking window opened)
          if (booking.status === 'scheduled' && booking.scheduledFor) {
            if (new Date() >= booking.scheduledFor) {
              const dateKey = booking.date.toISOString().split('T')[0];
              const key = `${dateKey}-${booking.timeSlot}`;
              const available = courtAvailability[key] || [];
              
              if (available.length > 0) {
                updated[index] = {
                  ...booking,
                  status: 'booked',
                  courtNumber: available[0],
                };
                hasChanges = true;
              }
            }
          }

          // Auto-cancel logic
          if (booking.status === 'booked' && booking.autoCancelEnabled) {
            const dateKey = booking.date.toISOString().split('T')[0];
            const key = `${dateKey}-${booking.timeSlot}`;
            const available = courtAvailability[key] || [];
            const weather = weatherForecast[key];

            // Check weather conditions
            if (autoCancelSettings.weatherEnabled && weather) {
              let shouldCancel = false;
              
              // Check minimum temperature
              if (autoCancelSettings.minTempEnabled && weather.temp < autoCancelSettings.minTemp) {
                shouldCancel = true;
              }
              
              // Check maximum temperature
              if (autoCancelSettings.maxTempEnabled && weather.temp > autoCancelSettings.maxTemp) {
                shouldCancel = true;
              }
              
              // Check rain probability
              if (autoCancelSettings.rainProbabilityEnabled && weather.rainProbability > autoCancelSettings.rainProbability) {
                shouldCancel = true;
              }
              
              // Check recent rain
              if (autoCancelSettings.recentRainEnabled && weather.rainedInLastHours !== undefined && weather.rainedInLastHours <= autoCancelSettings.recentRainHours) {
                shouldCancel = true;
              }
              
              // Check wind speed
              if (autoCancelSettings.maxWindEnabled && weather.windSpeed !== undefined && weather.windSpeed > autoCancelSettings.maxWind) {
                shouldCancel = true;
              }
              
              if (shouldCancel && Math.random() > 0.98) {
                updated[index] = { ...booking, status: 'cancelled', cancelReason: 'weather' };
                hasChanges = true;
              }
            }

            // Check availability conditions
            if (autoCancelSettings.availabilityEnabled) {
              if (available.length >= autoCancelSettings.minAvailableCourts) {
                if (Math.random() > 0.98) {
                  updated[index] = { ...booking, status: 'cancelled', cancelReason: 'availability' };
                  hasChanges = true;
                }
              }
            }
          }

          // Auto-rebook logic for availability-based cancellations
          if (booking.status === 'cancelled' && 
              booking.autoRebookEnabled && 
              booking.cancelReason === 'availability' &&
              autoCancelSettings.autoRebookEnabled) {
            const dateKey = booking.date.toISOString().split('T')[0];
            const key = `${dateKey}-${booking.timeSlot}`;
            const available = courtAvailability[key] || [];
            
            // Re-book if courts drop to or below the threshold
            if (available.length > 0 && available.length <= autoCancelSettings.maxAvailableCourtsForRebook) {
              if (Math.random() > 0.95) {
                updated[index] = { 
                  ...booking, 
                  status: 'booked', 
                  courtNumber: available[0],
                  cancelReason: undefined 
                };
                hasChanges = true;
              }
            }
          }
        });

        return hasChanges ? updated : prev;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [courtAvailability, autoCancelSettings]);

  const addBooking = (booking: Booking) => {
    setBookings(prev => [...prev, booking]);
    
    // Update availability
    if (booking.status === 'booked') {
      const dateKey = booking.date.toISOString().split('T')[0];
      const key = `${dateKey}-${booking.timeSlot}`;
      setCourtAvailability(prev => ({
        ...prev,
        [key]: (prev[key] || []).filter(c => c !== booking.courtNumber),
      }));
    }
  };

  const cancelBooking = (bookingId: string) => {
    setBookings(prev => {
      const booking = prev.find(b => b.id === bookingId);
      if (booking && booking.status === 'booked') {
        const dateKey = booking.date.toISOString().split('T')[0];
        const key = `${dateKey}-${booking.timeSlot}`;
        setCourtAvailability(prevAvail => ({
          ...prevAvail,
          [key]: [...(prevAvail[key] || []), booking.courtNumber].sort(),
        }));
      }
      return prev.filter(b => b.id !== bookingId);
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <CourtAvailability courtAvailability={courtAvailability} />
      </div>

      <Tabs defaultValue="book" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="book" className="flex items-center gap-2">
            <Calendar className="size-4" />
            Book Court
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <ListChecks className="size-4" />
            My Bookings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="book" className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-slate-900">
                  {viewMode === 'list' ? 'Time Slot View' : 'Court Schedule View'}
                </h3>
                <p className="text-slate-600">
                  {viewMode === 'list' 
                    ? 'Select a time slot to book any available court' 
                    : 'View all 4 courts and their availability at a glance'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="flex items-center gap-2"
                >
                  <List className="size-4" />
                  Time Slots
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="flex items-center gap-2"
                >
                  <LayoutGrid className="size-4" />
                  Court Grid
                </Button>
              </div>
            </div>
          </Card>

          {viewMode === 'list' ? (
            <BookingCalendar 
              courtAvailability={courtAvailability}
              weatherForecast={weatherForecast}
              onBooking={addBooking}
              existingBookings={bookings}
              isBookingWindowOpen={isBookingWindowOpen}
              getBookingWindowOpens={getBookingWindowOpens}
              getSlotCost={getSlotCost}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              onCancelBooking={cancelBooking}
              connectedAccounts={connectedAccounts}
              selectedVenue={selectedVenue}
              onVenueChange={setSelectedVenue}
              venues={VENUES}
              isSlotInPast={isSlotInPast}
            />
          ) : (
            <CourtScheduleView
              courtAvailability={courtAvailability}
              weatherForecast={weatherForecast}
              onBooking={addBooking}
              existingBookings={bookings}
              isBookingWindowOpen={isBookingWindowOpen}
              getBookingWindowOpens={getBookingWindowOpens}
              getSlotCost={getSlotCost}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              onCancelBooking={cancelBooking}
              connectedAccounts={connectedAccounts}
              selectedVenue={selectedVenue}
              onVenueChange={setSelectedVenue}
              venues={VENUES}
              isSlotInPast={isSlotInPast}
            />
          )}
        </TabsContent>

        <TabsContent value="bookings">
          <MyBookings 
            bookings={bookings}
            onCancel={cancelBooking}
            autoCancelSettings={autoCancelSettings}
            connectedAccounts={connectedAccounts}
            onUpdateAutoCancelSettings={setAutoCancelSettings}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}