import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Calendar } from './ui/calendar';
import { Badge } from './ui/badge';
import { Zap, CalendarClock, Eye, CheckCircle2, ChevronLeft, ChevronRight, CalendarIcon, Sun, Cloud, CloudRain, CloudDrizzle, CloudLightning, Trash2, Edit, Wind, Clock, MapPin } from 'lucide-react';
import { ManageBookingDialog } from './ManageBookingDialog';
import type { Booking, WeatherData, Venue } from './CourtBookingSystem';
import type { ConnectedAccount } from './ConnectedAccountsSection';
import { VenueSelect } from './VenueSelect';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface BookingCalendarProps {
  courtAvailability: Record<string, number[]>;
  weatherForecast: Record<string, WeatherData>;
  onBooking: (booking: Booking) => void;
  existingBookings: Booking[];
  isBookingWindowOpen: (slotDate: Date, slotTime: string) => boolean;
  getBookingWindowOpens: (slotDate: Date, slotTime: string) => Date;
  getSlotCost: (timeSlot: string) => number;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  onCancelBooking: (bookingId: string) => void;
  connectedAccounts: ConnectedAccount[];
  selectedVenue: string;
  onVenueChange: (venueId: string) => void;
  venues: Venue[];
  isSlotInPast: (slotDate: Date, slotTime: string, venueId: string) => boolean;
}

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
];

export function BookingCalendar({ courtAvailability, weatherForecast, onBooking, existingBookings, isBookingWindowOpen, getBookingWindowOpens, getSlotCost, selectedDate, setSelectedDate, onCancelBooking, connectedAccounts, selectedVenue, onVenueChange, venues, isSlotInPast }: BookingCalendarProps) {
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [selectedCourt, setSelectedCourt] = useState<number>(0);
  const [bookingDuration, setBookingDuration] = useState<30 | 60>(30);
  const [autoCancelEnabled, setAutoCancelEnabled] = useState(false);
  const [autoRebookEnabled, setAutoRebookEnabled] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly'>('none');
  const [recurrenceEndType, setRecurrenceEndType] = useState<'occurrences' | 'date' | 'weeks'>('weeks');
  const [recurrenceOccurrences, setRecurrenceOccurrences] = useState(4);
  const [recurrenceWeeks, setRecurrenceWeeks] = useState(4);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date>(new Date(Date.now() + 28 * 24 * 60 * 60 * 1000));
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<number[]>([]);
  const [neverEnds, setNeverEnds] = useState(false);
  const [manageBookingDialogOpen, setManageBookingDialogOpen] = useState(false);
  const [selectedBookingToManage, setSelectedBookingToManage] = useState<Booking | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Check if all slots are in the past and auto-advance to next date
  useEffect(() => {
    if (!selectedDate) return;
    
    const allSlotsInPast = TIME_SLOTS.every(slot => 
      isSlotInPast(selectedDate, slot, selectedVenue)
    );
    
    if (allSlotsInPast) {
      // Move to next day
      const nextDate = new Date(selectedDate);
      nextDate.setDate(nextDate.getDate() + 1);
      setSelectedDate(nextDate);
    }
  }, [selectedDate, selectedVenue, isSlotInPast]);

  // Auto-select the current day of week when weekly/biweekly is selected
  useEffect(() => {
    if ((recurrenceType === 'weekly' || recurrenceType === 'biweekly') && selectedDate) {
      const currentDayOfWeek = selectedDate.getDay();
      setSelectedDaysOfWeek([currentDayOfWeek]);
    } else if (recurrenceType === 'none') {
      setSelectedDaysOfWeek([]);
    }
  }, [recurrenceType]);

  const getWeatherIcon = (condition: WeatherData['condition']) => {
    switch (condition) {
      case 'sunny':
        return Sun;
      case 'partly-cloudy':
        return Cloud;
      case 'cloudy':
        return Cloud;
      case 'rainy':
        return CloudRain;
      case 'stormy':
        return CloudLightning;
      default:
        return Cloud;
    }
  };

  const getWeatherColor = (condition: WeatherData['condition']) => {
    switch (condition) {
      case 'sunny':
        return 'text-yellow-600';
      case 'partly-cloudy':
        return 'text-slate-500';
      case 'cloudy':
        return 'text-slate-600';
      case 'rainy':
        return 'text-blue-600';
      case 'stormy':
        return 'text-purple-600';
      default:
        return 'text-slate-500';
    }
  };

  const getSlotStatus = (date: Date, slot: string) => {
    const dateKey = date.toISOString().split('T')[0];
    const key = `${dateKey}-${slot}`;
    const availableCourts = courtAvailability[key] || [];
    const windowOpen = isBookingWindowOpen(date, slot);
    
    if (!windowOpen) {
      const windowOpens = getBookingWindowOpens(date, slot);
      return { 
        type: 'not-open', 
        icon: CalendarClock, 
        label: 'Not open yet', 
        description: `Opens ${windowOpens.toLocaleString()}`
      };
    } else if (availableCourts.length > 0) {
      return { 
        type: 'available', 
        icon: Zap, 
        label: 'Available now', 
        description: `${availableCourts.length} court${availableCourts.length > 1 ? 's' : ''} available` 
      };
    } else {
      return { 
        type: 'booked', 
        icon: Eye, 
        label: 'Fully booked', 
        description: 'Watch for cancellations' 
      };
    }
  };

  const handleBooking = () => {
    if (!selectedDate || !selectedSlot) return;

    // Check if user has at least one connected account
    if (connectedAccounts.length === 0) {
      alert('Please add at least one Connected Booking Account before making a booking. Go to your Profile page to connect an account.');
      return;
    }

    // Randomly select an account for confirmed bookings
    const randomAccountId = connectedAccounts[Math.floor(Math.random() * connectedAccounts.length)].id;

    const datesToBook = recurrenceType === 'none' 
      ? [selectedDate]
      : generateRecurringDatesWithDays(
          selectedDate,
          recurrenceType,
          selectedDaysOfWeek,
          neverEnds ? 52 * 7 : (recurrenceEndType === 'weeks' ? recurrenceWeeks * 7 : undefined),
          neverEnds ? undefined : (recurrenceEndType === 'occurrences' ? recurrenceOccurrences : undefined)
        );

    // Generate a unique group ID for recurring bookings
    const recurringGroupId = recurrenceType !== 'none' ? Math.random().toString(36).substring(7) : undefined;
    const totalBookings = datesToBook.length;

    // For each date
    datesToBook.forEach((bookingDate, dateIndex) => {
      const dateKey = bookingDate.toISOString().split('T')[0];
      const currentSlotIndex = TIME_SLOTS.indexOf(selectedSlot);
      const slotsToBook = bookingDuration === 60 && currentSlotIndex < TIME_SLOTS.length - 1 
        ? [selectedSlot, TIME_SLOTS[currentSlotIndex + 1]]
        : [selectedSlot];

      // Book each slot
      slotsToBook.forEach((slot) => {
        const key = `${dateKey}-${slot}`;
        const availableCourts = courtAvailability[key] || [];
        const slotStatus = getSlotStatus(bookingDate, slot);
        const cost = getSlotCost(slot);

        let booking: Booking;

        if (slotStatus.type === 'available') {
          if (selectedCourt > 0) {
            // User selected a specific court
            const isCourtAvailable = availableCourts.includes(selectedCourt);
            
            if (isCourtAvailable) {
              // Instant book the selected available court
              booking = {
                id: Math.random().toString(36).substring(7),
                courtNumber: selectedCourt,
                date: bookingDate,
                timeSlot: slot,
                status: 'booked',
                autoCancelEnabled,
                autoRebookEnabled,
                cost,
                recurringGroupId,
                recurringIndex: recurringGroupId ? dateIndex + 1 : undefined,
                recurringTotal: recurringGroupId ? totalBookings : undefined,
                accountId: randomAccountId
              };
            } else {
              // Selected court is booked - create watching booking for that specific court
              booking = {
                id: Math.random().toString(36).substring(7),
                courtNumber: selectedCourt, // Watch for this specific court
                date: bookingDate,
                timeSlot: slot,
                status: 'watching',
                autoCancelEnabled,
                cost,
                recurringGroupId,
                recurringIndex: recurringGroupId ? dateIndex + 1 : undefined,
                recurringTotal: recurringGroupId ? totalBookings : undefined,
              };
            }
          } else {
            // No court selected - book first available
            booking = {
              id: Math.random().toString(36).substring(7),
              courtNumber: availableCourts[0],
              date: bookingDate,
              timeSlot: slot,
              status: 'booked',
              autoCancelEnabled,
              autoRebookEnabled,
              cost,
              recurringGroupId,
              recurringIndex: recurringGroupId ? dateIndex + 1 : undefined,
              recurringTotal: recurringGroupId ? totalBookings : undefined,
              accountId: randomAccountId
            };
          }
        } else if (slotStatus.type === 'not-open') {
          // Scheduled - booking window hasn't opened yet
          const windowOpens = getBookingWindowOpens(bookingDate, slot);
          booking = {
            id: Math.random().toString(36).substring(7),
            courtNumber: 0, // Will be assigned when booking opens
            date: bookingDate,
            timeSlot: slot,
            status: 'scheduled',
            scheduledFor: windowOpens,
            autoCancelEnabled,
            cost,
            recurringGroupId,
            recurringIndex: recurringGroupId ? dateIndex + 1 : undefined,
            recurringTotal: recurringGroupId ? totalBookings : undefined,
          };
        } else {
          // Watching - slot is fully booked, watch for cancellations
          booking = {
            id: Math.random().toString(36).substring(7),
            courtNumber: selectedCourt || 0, // Watch for specific court or any court
            date: bookingDate,
            timeSlot: slot,
            status: 'watching',
            autoCancelEnabled,
            cost,
            recurringGroupId,
            recurringIndex: recurringGroupId ? dateIndex + 1 : undefined,
            recurringTotal: recurringGroupId ? totalBookings : undefined,
          };
        }

        onBooking(booking);
      });
    });

    setIsDialogOpen(false);
    setSelectedSlot('');
    setSelectedCourt(0); // Reset selected court
    setBookingDuration(30); // Reset duration
    setRecurrenceType('none'); // Reset recurrence
  };

  const generateRecurringDatesWithDays = (
    startDate: Date,
    type: 'daily' | 'weekly' | 'biweekly' | 'monthly',
    daysOfWeek: number[],
    weeks?: number,
    occurrences?: number
  ): Date[] => {
    const dates: Date[] = [];
    let currentDate = new Date(startDate);
    const maxIterations = weeks ? weeks : (occurrences ? occurrences * 14 : 365); // Safety limit
    let iterations = 0;
    
    while (iterations < maxIterations) {
      iterations++;
      
      // For weekly/biweekly with specific days selected
      if ((type === 'weekly' || type === 'biweekly') && daysOfWeek.length > 0) {
        // Check if current day matches any selected day of week
        if (daysOfWeek.includes(currentDate.getDay())) {
          dates.push(new Date(currentDate));
          
          if (occurrences !== undefined && dates.length >= occurrences) {
            break;
          }
        }
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      } else {
        // Default behavior - add current date
        dates.push(new Date(currentDate));
        
        if (occurrences !== undefined && dates.length >= occurrences) {
          break;
        }
        
        // Advance by the recurrence interval
        if (type === 'daily') {
          currentDate.setDate(currentDate.getDate() + 1);
        } else if (type === 'weekly') {
          currentDate.setDate(currentDate.getDate() + 7);
        } else if (type === 'biweekly') {
          currentDate.setDate(currentDate.getDate() + 14);
        } else if (type === 'monthly') {
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
      }
      
      // Check week limit
      if (weeks !== undefined) {
        const daysDiff = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff >= weeks) {
          break;
        }
      }
    }
    
    return dates;
  };

  const dateKey = selectedDate?.toISOString().split('T')[0] || '';

  const handlePreviousDay = () => {
    if (!selectedDate) return;
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    if (newDate >= new Date(new Date().setHours(0, 0, 0, 0))) {
      setSelectedDate(newDate);
    }
  };

  const handleNextDay = () => {
    if (!selectedDate) return;
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const isToday = selectedDate?.toDateString() === new Date().toDateString();
  const isPastDate = selectedDate ? selectedDate < new Date(new Date().setHours(0, 0, 0, 0)) : false;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            <VenueSelect
              venues={venues}
              selectedVenue={selectedVenue}
              onVenueChange={onVenueChange}
            />

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousDay}
                disabled={isPastDate || (selectedDate?.toDateString() === new Date().toDateString())}
              >
                <ChevronLeft className="size-4" />
              </Button>
            
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen} modal={true}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 justify-start text-left w-full"
                  >
                    <CalendarIcon className="size-4 mr-2" />
                    <span>
                      {/* Mobile: Abbreviated format */}
                      <span className="inline sm:hidden">
                        {selectedDate.toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric'
                        })}
                      </span>
                      {/* Desktop: Full format */}
                      <span className="hidden sm:inline">
                        {selectedDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      {isToday && <Badge variant="secondary" className="ml-2">Today</Badge>}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                      }
                    }}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextDay}
                >
                  <ChevronRight className="size-4" />
                </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className="size-4 bg-green-100 border-2 border-green-500 rounded"></div>
              <span className="text-slate-600 text-xs sm:text-sm">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-4 bg-red-100 border-2 border-red-500 rounded"></div>
              <span className="text-slate-600 text-xs sm:text-sm">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-4 bg-purple-100 border-2 border-purple-500 rounded"></div>
              <span className="text-slate-600 text-xs sm:text-sm">Not open yet</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-4 bg-blue-100 border-2 border-blue-500 rounded"></div>
              <span className="text-slate-600 text-xs sm:text-sm">Confirmed booking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-4 bg-orange-100 border-2 border-orange-500 rounded"></div>
              <span className="text-slate-600 text-xs sm:text-sm">Pending booking</span>
            </div>
          </div>
        </div>

        <div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {TIME_SLOTS.filter(slot => !isSlotInPast(selectedDate, slot, selectedVenue)).map(slot => {
              const slotStatus = getSlotStatus(selectedDate, slot);
              const dateKey = selectedDate.toISOString().split('T')[0];
              const weatherKey = `${dateKey}-${slot}`;
              const weather = weatherForecast[weatherKey];
              const WeatherIcon = weather ? getWeatherIcon(weather.condition) : Cloud;
              const weatherColor = weather ? getWeatherColor(weather.condition) : 'text-slate-500';
              
              // Check if this slot is in the past
              const isPast = isSlotInPast(selectedDate, slot, selectedVenue);
              
              // Check if user has any booking for this slot (confirmed, scheduled, or watching)
              const userBooking = existingBookings.find(
                b => b.date.toISOString().split('T')[0] === dateKey && 
                     b.timeSlot === slot && 
                     b.status !== 'cancelled'
              );

              return (
                <Dialog key={slot} open={isDialogOpen && selectedSlot === slot} onOpenChange={(open) => {
                  if (!open) {
                    setIsDialogOpen(false);
                    setSelectedSlot('');
                  }
                }}>
                  <DialogTrigger asChild>
                    <button
                      disabled={isPast}
                      onClick={() => {
                        if (isPast) return; // Don't allow clicks on past slots
                        
                        if (userBooking) {
                          // Open manage booking dialog for existing bookings
                          setSelectedBookingToManage(userBooking);
                          setManageBookingDialogOpen(true);
                        } else {
                          // Open create booking dialog for available slots
                          setSelectedSlot(slot);
                          const dateKey = selectedDate.toISOString().split('T')[0];
                          const key = `${dateKey}-${slot}`;
                          const availableCourts = courtAvailability[key] || [];
                          // Set selected court to first available court, or 1 if none available
                          setSelectedCourt(availableCourts.length > 0 ? availableCourts[0] : 1);
                          setIsDialogOpen(true);
                        }
                      }}
                      className={`w-full p-4 rounded-lg border border-slate-200 transition-colors text-left ${
                        isPast 
                          ? 'opacity-40 cursor-not-allowed bg-slate-50' 
                          : userBooking ? 'cursor-pointer hover:bg-slate-100 hover:border-slate-300' : 'hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Clock className={`size-5 ${isPast ? 'text-slate-300' : 'text-slate-400'}`} />
                          <span className={isPast ? 'text-slate-400' : 'text-slate-900'}>{slot}</span>
                          <Badge variant="outline" className={`ml-2 ${isPast ? 'opacity-50' : ''}`}>£{getSlotCost(slot)}</Badge>
                          {isPast && (
                            <Badge variant="secondary" className="opacity-60">Past</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!isPast && userBooking && userBooking.status === 'booked' && (
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                              <CheckCircle2 className="size-3 mr-1" />
                              Confirmed Booking
                            </Badge>
                          )}
                          {!isPast && userBooking && userBooking.status === 'scheduled' && (
                            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                              <CalendarClock className="size-3 mr-1" />
                              Pending (Scheduled)
                            </Badge>
                          )}
                          {!isPast && userBooking && userBooking.status === 'watching' && (
                            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                              <Eye className="size-3 mr-1" />
                              Pending (Watching)
                            </Badge>
                          )}
                          {!isPast && !userBooking && slotStatus.type === 'available' && (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              {slotStatus.description}
                            </Badge>
                          )}
                          {!isPast && !userBooking && slotStatus.type === 'not-open' && (
                            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                              Not open yet
                            </Badge>
                          )}
                          {!isPast && !userBooking && slotStatus.type === 'booked' && (
                            <Badge variant="destructive">Fully booked</Badge>
                          )}
                        </div>
                      </div>
                      {weather && (
                        <div className="flex items-center gap-3 ml-8 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <WeatherIcon className={`size-4 ${weatherColor}`} />
                            <span>{weather.temp}°C</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CloudDrizzle className="size-4 text-slate-400" />
                            <span>{weather.rainProbability}% rain</span>
                          </div>
                          {weather.windSpeed !== undefined && (
                            <div className="flex items-center gap-1.5">
                              <Wind className="size-4 text-slate-400" />
                              <span>{weather.windSpeed}mph</span>
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  </DialogTrigger>

                  <DialogContent aria-describedby={undefined}>
                    <DialogHeader>
                      <DialogTitle>
                        {(() => {
                          const currentSlotIndex = TIME_SLOTS.indexOf(selectedSlot);
                          let endTime: string;
                          
                          if (bookingDuration === 30) {
                            // For 30 minutes, end time is the next slot
                            endTime = currentSlotIndex < TIME_SLOTS.length - 1 
                              ? TIME_SLOTS[currentSlotIndex + 1] 
                              : selectedSlot;
                          } else {
                            // For 60 minutes, end time is two slots ahead
                            endTime = currentSlotIndex < TIME_SLOTS.length - 2 
                              ? TIME_SLOTS[currentSlotIndex + 2] 
                              : TIME_SLOTS[TIME_SLOTS.length - 1];
                          }
                          
                          return `Book Court - ${selectedSlot} - ${endTime}`;
                        })()}
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">{selectedSlot && selectedDate && (() => {
                        const slotStatus = getSlotStatus(selectedDate, selectedSlot);
                        const cost = getSlotCost(selectedSlot);
                        const dateKey = selectedDate.toISOString().split('T')[0];
                        const key = `${dateKey}-${selectedSlot}`;
                        const availableCourts = courtAvailability[key] || [];
                        
                        // Get next slot for 60-minute booking
                        const currentSlotIndex = TIME_SLOTS.indexOf(selectedSlot);
                        const nextSlot = currentSlotIndex < TIME_SLOTS.length - 1 ? TIME_SLOTS[currentSlotIndex + 1] : null;
                        const nextSlotCost = nextSlot ? getSlotCost(nextSlot) : 0;
                        const totalCost = bookingDuration === 60 ? cost + nextSlotCost : cost;
                        
                        return (
                          <>
                            <div>
                              <Label className="mb-3 block">Duration</Label>
                              <div className="grid grid-cols-2 gap-3">
                                <button
                                  onClick={() => setBookingDuration(30)}
                                  className={`p-4 rounded-lg border-2 transition-all ${
                                    bookingDuration === 30
                                      ? 'border-blue-500 bg-blue-50'
                                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="text-center">
                                    <div className={`mb-1 ${bookingDuration === 30 ? 'text-blue-900' : 'text-slate-900'}`}>
                                      30 minutes
                                    </div>
                                    <div className={`${bookingDuration === 30 ? 'text-blue-700' : 'text-slate-600'}`}>
                                      £{cost}
                                    </div>
                                    {bookingDuration === 30 && (
                                      <Badge className="bg-blue-600 hover:bg-blue-600 mt-2">
                                        <CheckCircle2 className="size-3 mr-1" />
                                        Selected
                                      </Badge>
                                    )}
                                  </div>
                                </button>
                                <button
                                  onClick={() => setBookingDuration(60)}
                                  disabled={!nextSlot}
                                  className={`p-4 rounded-lg border-2 transition-all ${
                                    bookingDuration === 60
                                      ? 'border-blue-500 bg-blue-50'
                                      : nextSlot 
                                        ? 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                        : 'border-slate-200 bg-slate-100 opacity-50 cursor-not-allowed'
                                  }`}
                                >
                                  <div className="text-center">
                                    <div className={`mb-1 ${bookingDuration === 60 ? 'text-blue-900' : 'text-slate-900'}`}>
                                      60 minutes
                                    </div>
                                    <div className={`${bookingDuration === 60 ? 'text-blue-700' : 'text-slate-600'}`}>
                                      £{totalCost}
                                    </div>
                                    {bookingDuration === 60 && (
                                      <Badge className="bg-blue-600 hover:bg-blue-600 mt-2">
                                        <CheckCircle2 className="size-3 mr-1" />
                                        Selected
                                      </Badge>
                                    )}
                                  </div>
                                </button>
                              </div>
                              {!nextSlot && (
                                <p className="text-amber-600 mt-2">
                                  60-minute booking not available - no next slot
                                </p>
                              )}
                            </div>

                            {slotStatus.type === 'available' && (() => {
                              const dateKey = selectedDate.toISOString().split('T')[0];
                              const key = `${dateKey}-${selectedSlot}`;
                              const availableCourts = courtAvailability[key] || [];
                              
                              // For 60-minute bookings, check next slot availability too
                              const currentSlotIndex = TIME_SLOTS.indexOf(selectedSlot);
                              const nextSlot = currentSlotIndex < TIME_SLOTS.length - 1 ? TIME_SLOTS[currentSlotIndex + 1] : null;
                              let availableCourtsFor60Min = availableCourts;
                              
                              if (bookingDuration === 60 && nextSlot) {
                                const nextKey = `${dateKey}-${nextSlot}`;
                                const nextSlotAvailableCourts = courtAvailability[nextKey] || [];
                                // Only courts available in BOTH slots
                                availableCourtsFor60Min = availableCourts.filter(court => 
                                  nextSlotAvailableCourts.includes(court)
                                );
                              }
                              
                              const courtsToCheck = bookingDuration === 60 ? availableCourtsFor60Min : availableCourts;
                              
                              return (
                                <div>
                                  <Label className="mb-3 block">Court Selection</Label>
                                  <div className="grid grid-cols-4 gap-2">
                                    {[1, 2, 3, 4].map((courtNum) => {
                                      const isAvailable = courtsToCheck.includes(courtNum);
                                      return (
                                        <button
                                          key={courtNum}
                                          onClick={() => setSelectedCourt(courtNum)}
                                          className={`p-3 rounded-lg border-2 transition-all ${
                                            selectedCourt === courtNum
                                              ? (isAvailable ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-blue-50')
                                              : isAvailable
                                              ? 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                              : 'border-slate-200 bg-slate-100 opacity-60'
                                          }`}
                                        >
                                          <div className="text-center">
                                            <div className={`${selectedCourt === courtNum ? (isAvailable ? 'text-green-900' : 'text-blue-900') : 'text-slate-900'}`}>
                                              {courtNum}
                                            </div>
                                            {selectedCourt === courtNum && (
                                              <CheckCircle2 className={`size-4 mx-auto mt-1 ${isAvailable ? 'text-green-600' : 'text-blue-600'}`} />
                                            )}
                                            {!isAvailable && selectedCourt !== courtNum && (
                                              <div className="text-red-600 mt-1">✕</div>
                                            )}
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                  <p className="text-slate-600 mt-2">
                                    {courtsToCheck.includes(selectedCourt)
                                      ? `Court ${selectedCourt} is available${bookingDuration === 60 ? ' for the full 60 minutes' : ''} - will book immediately`
                                      : `Court ${selectedCourt} is ${bookingDuration === 60 ? 'not available for the full 60 minutes' : 'booked'} - will watch for cancellations`
                                    }
                                  </p>
                                </div>
                              );
                            })()}

                            {slotStatus.type === 'not-open' && (
                              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                <div className="flex items-start gap-3">
                                  <CalendarClock className="size-5 text-purple-600 mt-0.5" />
                                  <div>
                                    <p className="text-purple-900">Booking Window Not Open - Scheduled Booking</p>
                                    <p className="text-purple-700 mt-1">
                                      {slotStatus.description}
                                    </p>
                                    <p className="text-purple-700 mt-2">
                                      Our bot will automatically book this for you when the window opens.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {slotStatus.type === 'booked' && (() => {
                              const dateKey = selectedDate.toISOString().split('T')[0];
                              const key = `${dateKey}-${selectedSlot}`;
                              const availableCourts = courtAvailability[key] || [];
                              
                              return (
                                <>
                                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-start gap-3">
                                      <Eye className="size-5 text-blue-600 mt-0.5" />
                                      <div>
                                        <p className="text-blue-900">Fully Booked - Auto-Book on Cancellation</p>
                                        <p className="text-blue-700 mt-1">
                                          This slot is currently fully booked.
                                        </p>
                                        <p className="text-blue-700 mt-2">
                                          We'll watch this slot and automatically book it if someone cancels.
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <Label className="mb-3 block">Watch For</Label>
                                    <div className="grid grid-cols-5 gap-2">
                                      <button
                                        onClick={() => setSelectedCourt(0)}
                                        className={`p-3 rounded-lg border-2 transition-all ${
                                          selectedCourt === 0
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                      >
                                        <div className="text-center">
                                          <div className={`${selectedCourt === 0 ? 'text-blue-900' : 'text-slate-900'}`}>
                                            Any
                                          </div>
                                          {selectedCourt === 0 && (
                                            <CheckCircle2 className="size-4 mx-auto mt-1 text-blue-600" />
                                          )}
                                        </div>
                                      </button>
                                      {[1, 2, 3, 4].map((courtNum) => (
                                        <button
                                          key={courtNum}
                                          onClick={() => setSelectedCourt(courtNum)}
                                          className={`p-3 rounded-lg border-2 transition-all ${
                                            selectedCourt === courtNum
                                              ? 'border-blue-500 bg-blue-50'
                                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                          }`}
                                        >
                                          <div className="text-center">
                                            <div className={`${selectedCourt === courtNum ? 'text-blue-900' : 'text-slate-900'}`}>
                                              {courtNum}
                                            </div>
                                            {selectedCourt === courtNum && (
                                              <CheckCircle2 className="size-4 mx-auto mt-1 text-blue-600" />
                                            )}
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                    <p className="text-slate-600 mt-2">
                                      {selectedCourt === 0 
                                        ? 'Will auto-book any court that becomes available'
                                        : `Will auto-book only Court ${selectedCourt} if it becomes available`
                                      }
                                    </p>
                                  </div>
                                </>
                              );
                            })()}

                            <div className="space-y-3">
                              <Label>Recurring Booking</Label>
                              <select
                                value={recurrenceType}
                                onChange={(e) => setRecurrenceType(e.target.value as any)}
                                className="w-full p-2 border border-slate-300 rounded-lg"
                              >
                                <option value="none">Does not repeat</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="biweekly">Bi-weekly</option>
                                <option value="monthly">Monthly</option>
                              </select>

                              {recurrenceType !== 'none' && (
                                <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                                  {(recurrenceType === 'weekly' || recurrenceType === 'biweekly') && (
                                    <div className="space-y-2">
                                      <Label>Repeat on</Label>
                                      <div className="grid grid-cols-7 gap-2">
                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => {
                                          const isSelected = selectedDaysOfWeek.includes(index);
                                          return (
                                            <button
                                              key={index}
                                              type="button"
                                              onClick={() => {
                                                if (isSelected) {
                                                  setSelectedDaysOfWeek(selectedDaysOfWeek.filter(d => d !== index));
                                                } else {
                                                  setSelectedDaysOfWeek([...selectedDaysOfWeek, index].sort());
                                                }
                                              }}
                                              className={`p-2 rounded-lg border-2 transition-all ${
                                                isSelected
                                                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                                                  : 'border-slate-300 hover:border-slate-400 text-slate-700'
                                              }`}
                                            >
                                              {day}
                                            </button>
                                          );
                                        })}
                                      </div>
                                      <p className="text-slate-600 text-xs">
                                        {selectedDaysOfWeek.length === 0 
                                          ? 'Leave empty to repeat on the same day of the week'
                                          : `Will repeat on ${selectedDaysOfWeek.map(d => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d]).join(', ')}`
                                        }
                                      </p>
                                    </div>
                                  )}

                                  <div className="space-y-2">
                                    <Label>Ends</Label>
                                    <div className="space-y-2">
                                      <label className="flex items-center gap-2">
                                        <input
                                          type="radio"
                                          name="endType"
                                          checked={neverEnds}
                                          onChange={() => {
                                            setNeverEnds(true);
                                            setRecurrenceEndType('weeks');
                                          }}
                                        />
                                        <span className="text-slate-700">Never (up to 52 weeks)</span>
                                      </label>

                                      <label className="flex items-center gap-2">
                                        <input
                                          type="radio"
                                          name="endType"
                                          checked={!neverEnds && recurrenceEndType === 'weeks'}
                                          onChange={() => {
                                            setNeverEnds(false);
                                            setRecurrenceEndType('weeks');
                                          }}
                                        />
                                        <span className="text-slate-700">After</span>
                                        <input
                                          type="number"
                                          min="1"
                                          max="52"
                                          value={recurrenceWeeks}
                                          onChange={(e) => setRecurrenceWeeks(Number(e.target.value))}
                                          className="w-20 p-1 border border-slate-300 rounded"
                                          disabled={neverEnds || recurrenceEndType !== 'weeks'}
                                        />
                                        <span className="text-slate-700">weeks</span>
                                      </label>
                                      
                                      <label className="flex items-center gap-2">
                                        <input
                                          type="radio"
                                          name="endType"
                                          checked={!neverEnds && recurrenceEndType === 'occurrences'}
                                          onChange={() => {
                                            setNeverEnds(false);
                                            setRecurrenceEndType('occurrences');
                                          }}
                                        />
                                        <span className="text-slate-700">After</span>
                                        <input
                                          type="number"
                                          min="1"
                                          max="52"
                                          value={recurrenceOccurrences}
                                          onChange={(e) => setRecurrenceOccurrences(Number(e.target.value))}
                                          className="w-20 p-1 border border-slate-300 rounded"
                                          disabled={neverEnds || recurrenceEndType !== 'occurrences'}
                                        />
                                        <span className="text-slate-700">occurrences</span>
                                      </label>
                                    </div>
                                  </div>

                                  {recurrenceType !== 'none' && (() => {
                                    const dates = generateRecurringDatesWithDays(
                                      selectedDate,
                                      recurrenceType,
                                      selectedDaysOfWeek,
                                      neverEnds ? 52 * 7 : (recurrenceEndType === 'weeks' ? recurrenceWeeks * 7 : undefined),
                                      neverEnds ? undefined : (recurrenceEndType === 'occurrences' ? recurrenceOccurrences : undefined)
                                    );
                                    const estimatedCost = dates.length * totalCost;
                                    
                                    return (
                                      <div className="p-3 bg-blue-50 rounded border border-blue-200">
                                        <p className="text-blue-900">
                                          Will create <span>{dates.length}</span> booking{dates.length > 1 ? 's' : ''}
                                        </p>
                                        <p className="text-blue-700 mt-1">
                                          Estimated total: £{estimatedCost}
                                        </p>
                                        <div className="mt-2 text-blue-700 max-h-32 overflow-y-auto">
                                          {dates.map((date, i) => (
                                            <div key={i} className="text-xs">
                                              {date.toLocaleDateString('en-US', { 
                                                weekday: 'short',
                                                month: 'short', 
                                                day: 'numeric',
                                                year: 'numeric'
                                              })} at {selectedSlot}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>

                            <Button onClick={handleBooking} className="w-full">
                              {slotStatus.type === 'available' && 'Book Now'}
                              {slotStatus.type === 'not-open' && 'Schedule Auto-Book'}
                              {slotStatus.type === 'booked' && 'Watch & Auto-Book'}
                            </Button>
                          </>
                        );
                      })()}
                    </div>
                  </DialogContent>
                </Dialog>
              );
            })}
          </div>
        </div>
      </div>

      <ManageBookingDialog
        open={manageBookingDialogOpen}
        onOpenChange={setManageBookingDialogOpen}
        booking={selectedBookingToManage}
        onCancel={onCancelBooking}
      />
    </Card>
  );
}