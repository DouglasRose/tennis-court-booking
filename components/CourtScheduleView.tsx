import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
import { Switch } from './ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from './ui/dialog';
import { Zap, CalendarClock, Eye, CheckCircle2, ChevronLeft, ChevronRight, CalendarIcon, Sun, Cloud, CloudRain, CloudDrizzle, CloudLightning, Trash2, Edit, Wind, Clock, MapPin } from 'lucide-react';
import { ManageBookingDialog } from './ManageBookingDialog';
import type { Booking, WeatherData, Venue } from './CourtBookingSystem';
import type { ConnectedAccount } from './ConnectedAccountsSection';
import { VenueSelect } from './VenueSelect';

interface CourtScheduleViewProps {
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

const COURTS = [1, 2, 3, 4];

export function CourtScheduleView({
  courtAvailability,
  weatherForecast,
  onBooking,
  existingBookings,
  isBookingWindowOpen,
  getBookingWindowOpens,
  getSlotCost,
  selectedDate,
  setSelectedDate,
  onCancelBooking,
  connectedAccounts,
  selectedVenue,
  onVenueChange,
  venues,
  isSlotInPast
}: CourtScheduleViewProps) {
  const [selectedSlot, setSelectedSlot] = useState<{ time: string; court: number } | null>(null);
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

  const getCourtStatus = (date: Date, slot: string, courtNumber: number): 
    { status: 'available' | 'not-open' | 'booked' | 'your-booking' | 'your-scheduled' | 'your-watching'; info?: string } => {
    const dateKey = date.toISOString().split('T')[0];
    const key = `${dateKey}-${slot}`;
    const availableCourts = courtAvailability[key] || [];
    const windowOpen = isBookingWindowOpen(date, slot);
    
    // Check if user has this slot booked (confirmed)
    const confirmedBooking = existingBookings.find(
      b => b.date.toISOString().split('T')[0] === dateKey && 
           b.timeSlot === slot && 
           b.courtNumber === courtNumber &&
           b.status === 'booked'
    );
    
    if (confirmedBooking) {
      return { status: 'your-booking' };
    }
    
    // Check if user has scheduled auto-booking (pending - window not open)
    const scheduledBooking = existingBookings.find(
      b => b.date.toISOString().split('T')[0] === dateKey && 
           b.timeSlot === slot && 
           b.courtNumber === courtNumber &&
           b.status === 'scheduled'
    );
    
    if (scheduledBooking) {
      const windowOpens = getBookingWindowOpens(date, slot);
      return { 
        status: 'your-scheduled',
        info: `Will auto-book at ${windowOpens.toLocaleString()}`
      };
    }
    
    // Check if user is watching this slot (pending - waiting for cancellation)
    const watchingBooking = existingBookings.find(
      b => b.date.toISOString().split('T')[0] === dateKey && 
           b.timeSlot === slot && 
           b.courtNumber === courtNumber &&
           b.status === 'watching'
    );
    
    if (watchingBooking) {
      return { 
        status: 'your-watching',
        info: 'Watching for cancellations'
      };
    }
    
    if (!windowOpen) {
      const windowOpens = getBookingWindowOpens(date, slot);
      return { 
        status: 'not-open',
        info: `Opens ${windowOpens.toLocaleString()}`
      };
    }
    
    if (availableCourts.includes(courtNumber)) {
      return { status: 'available' };
    }
    
    return { status: 'booked' };
  };

  const handleCellClick = (court: number, time: string) => {
    const status = getCourtStatus(selectedDate, time, court);
    
    // Open manage dialog for confirmed bookings
    if (status.status === 'your-booking') {
      const dateKey = selectedDate.toISOString().split('T')[0];
      const booking = existingBookings.find(
        b => b.date.toISOString().split('T')[0] === dateKey && 
             b.timeSlot === time && 
             b.courtNumber === court &&
             b.status === 'booked'
      );
      if (booking) {
        setSelectedBookingToManage(booking);
        setManageBookingDialogOpen(true);
      }
      return;
    }
    
    // Open manage dialog for pending bookings (scheduled or watching)
    if (status.status === 'your-scheduled' || status.status === 'your-watching') {
      const dateKey = selectedDate.toISOString().split('T')[0];
      const booking = existingBookings.find(
        b => b.date.toISOString().split('T')[0] === dateKey && 
             b.timeSlot === time && 
             b.courtNumber === court &&
             (b.status === 'scheduled' || b.status === 'watching')
      );
      if (booking) {
        setSelectedBookingToManage(booking);
        setManageBookingDialogOpen(true);
      }
      return;
    }
    
    setSelectedSlot({ time, court });
    // Set selected court based on availability
    const dateKey = selectedDate.toISOString().split('T')[0];
    const key = `${dateKey}-${time}`;
    const availableCourts = courtAvailability[key] || [];
    // For watching (fully booked), default to the clicked court
    // For available slots, default to the clicked court (it should be available)
    setSelectedCourt(court);
    setIsDialogOpen(true);
  };

  const handleBooking = () => {
    if (!selectedSlot) return;

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
      const currentSlotIndex = TIME_SLOTS.indexOf(selectedSlot.time);
      const slotsToBook = bookingDuration === 60 && currentSlotIndex < TIME_SLOTS.length - 1 
        ? [selectedSlot.time, TIME_SLOTS[currentSlotIndex + 1]]
        : [selectedSlot.time];

      // Book each slot
      slotsToBook.forEach((slot) => {
        const key = `${dateKey}-${slot}`;
        const availableCourts = courtAvailability[key] || [];
        const status = getCourtStatus(bookingDate, slot, selectedSlot.court);
        const cost = getSlotCost(slot);

        let booking: Booking;

        if (status.status === 'available') {
          // Instant book - court is available now
          booking = {
            id: Math.random().toString(36).substring(7),
            courtNumber: selectedSlot.court,
            date: bookingDate,
            timeSlot: slot,
            status: 'booked',
            autoCancelEnabled,
            autoRebookEnabled,
            cost,
            recurringGroupId,
            recurringIndex: recurringGroupId ? dateIndex + 1 : undefined,
            recurringTotal: recurringGroupId ? totalBookings : undefined,
            accountId: randomAccountId,
          };
        } else if (status.status === 'not-open') {
          // Scheduled - booking window hasn't opened yet
          const windowOpens = getBookingWindowOpens(bookingDate, slot);
          booking = {
            id: Math.random().toString(36).substring(7),
            courtNumber: selectedSlot.court,
            date: bookingDate,
            timeSlot: slot,
            status: 'scheduled',
            scheduledFor: windowOpens,
            autoCancelEnabled,
            autoRebookEnabled,
            cost,
            recurringGroupId,
            recurringIndex: recurringGroupId ? dateIndex + 1 : undefined,
            recurringTotal: recurringGroupId ? totalBookings : undefined,
          };
        } else {
          // Watching - slot is fully booked, watch for cancellations
          booking = {
            id: Math.random().toString(36).substring(7),
            courtNumber: selectedSlot.court,
            date: bookingDate,
            timeSlot: slot,
            status: 'watching',
            autoCancelEnabled,
            autoRebookEnabled,
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
    setSelectedSlot(null);
    setBookingDuration(30); // Reset duration
    setRecurrenceType('none'); // Reset recurrence
  };

  const getSlotStatus = (date: Date, slot: string, court: number) => {
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
    } else if (availableCourts.includes(court)) {
      return { 
        type: 'available', 
        icon: Zap, 
        label: 'Available now', 
        description: `Court ${court} is available` 
      };
    } else {
      return { 
        type: 'booked', 
        icon: Eye, 
        label: 'Booked', 
        description: 'Watch for cancellations' 
      };
    }
  };

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    if (newDate >= new Date(new Date().setHours(0, 0, 0, 0))) {
      setSelectedDate(newDate);
    }
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const isPastDate = selectedDate < new Date(new Date().setHours(0, 0, 0, 0));

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

  return (
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
              disabled={isPastDate || isToday}
            >
              <ChevronLeft className="size-4" />
            </Button>
            
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen} modal={true}>
              <PopoverTrigger>
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
                      setIsCalendarOpen(false);
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

      <Card className="p-6 overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="grid grid-cols-5 gap-2 mb-2">
            <div className="p-3">
              <span className="text-slate-600">Time</span>
            </div>
            {COURTS.map(court => (
              <div key={court} className="p-3 text-center">
                <span className="text-slate-900">Court {court}</span>
              </div>
            ))}
          </div>

          <div className="space-y-1">
            {TIME_SLOTS.filter(slot => !isSlotInPast(selectedDate, slot, selectedVenue)).map(slot => {
              const dateKey = selectedDate.toISOString().split('T')[0];
              const weatherKey = `${dateKey}-${slot}`;
              const weather = weatherForecast[weatherKey];
              const WeatherIcon = weather ? getWeatherIcon(weather.condition) : Cloud;
              const weatherColor = weather ? getWeatherColor(weather.condition) : 'text-slate-500';
              
              return (
                <div key={slot} className="grid grid-cols-5 gap-2">
                  <div className="p-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">{slot}</span>
                      <Badge variant="outline" className="text-xs">£{getSlotCost(slot)}</Badge>
                    </div>
                    {weather && (
                      <div className="flex flex-wrap items-center gap-2 text-slate-600">
                        <div className="flex items-center gap-1">
                          <WeatherIcon className={`size-3.5 ${weatherColor}`} />
                          <span className="text-xs">{weather.temp}°C</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CloudDrizzle className="size-3.5 text-slate-400" />
                          <span className="text-xs">{weather.rainProbability}%</span>
                        </div>
                        {weather.windSpeed !== undefined && (
                          <div className="flex items-center gap-1">
                            <Wind className="size-3.5 text-slate-400" />
                            <span className="text-xs">{weather.windSpeed}mph</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {COURTS.map(court => {
                    const courtStatus = getCourtStatus(selectedDate, slot, court);
                    
                    let bgColor = 'bg-slate-100';
                    let borderColor = 'border-slate-300';
                    let textColor = 'text-slate-600';
                    let cursor = 'cursor-pointer';
                    let content = null;
                    let disabled = isPastDate;
                    
                    if (isPastDate) {
                      bgColor = 'bg-slate-50';
                      borderColor = 'border-slate-200';
                      textColor = 'text-slate-300';
                      cursor = 'cursor-not-allowed';
                      content = <span className={`text-xs ${textColor}`}>Past</span>;
                    } else if (courtStatus.status === 'available') {
                      bgColor = 'bg-green-100 hover:bg-green-200';
                      borderColor = 'border-green-500';
                      textColor = 'text-green-700';
                      content = <span className={`text-xs ${textColor}`}>Available</span>;
                    } else if (courtStatus.status === 'booked') {
                      bgColor = 'bg-red-100 hover:bg-red-200';
                      borderColor = 'border-red-500';
                      textColor = 'text-red-700';
                      content = <span className={`text-xs ${textColor}`}>Booked</span>;
                    } else if (courtStatus.status === 'not-open') {
                      bgColor = 'bg-purple-100 hover:bg-purple-200';
                      borderColor = 'border-purple-500';
                      textColor = 'text-purple-700';
                      content = <span className={`text-xs ${textColor}`}>Locked</span>;
                    } else if (courtStatus.status === 'your-booking') {
                      bgColor = 'bg-blue-100';
                      borderColor = 'border-blue-500';
                      textColor = 'text-blue-700';
                      cursor = 'cursor-default';
                      content = (
                        <div className="flex flex-col items-center gap-1">
                          <CheckCircle2 className={`size-4 ${textColor}`} />
                          <span className={`text-[10px] ${textColor}`}>Confirmed</span>
                        </div>
                      );
                    } else if (courtStatus.status === 'your-scheduled') {
                      bgColor = 'bg-orange-100';
                      borderColor = 'border-orange-500';
                      textColor = 'text-orange-700';
                      cursor = 'cursor-default';
                      content = (
                        <div className="flex flex-col items-center gap-1">
                          <CalendarClock className={`size-4 ${textColor}`} />
                          <span className={`text-[10px] ${textColor}`}>Pending</span>
                        </div>
                      );
                    } else if (courtStatus.status === 'your-watching') {
                      bgColor = 'bg-orange-100';
                      borderColor = 'border-orange-500';
                      textColor = 'text-orange-700';
                      cursor = 'cursor-default';
                      content = (
                        <div className="flex flex-col items-center gap-1">
                          <Eye className={`size-4 ${textColor}`} />
                          <span className={`text-[10px] ${textColor}`}>Pending</span>
                        </div>
                      );
                    }
                    
                    return (
                      <button
                        key={court}
                        onClick={() => handleCellClick(court, slot)}
                        className={`p-3 rounded-lg border-2 ${bgColor} ${borderColor} ${cursor} transition-colors flex items-center justify-center ${disabled ? 'opacity-50' : ''}`}
                        disabled={disabled}
                      >
                        {content}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {selectedSlot ? (() => {
                const currentSlotIndex = TIME_SLOTS.indexOf(selectedSlot.time);
                let endTime: string;
                
                if (bookingDuration === 30) {
                  // For 30 minutes, end time is the next slot
                  endTime = currentSlotIndex < TIME_SLOTS.length - 1 
                    ? TIME_SLOTS[currentSlotIndex + 1] 
                    : selectedSlot.time;
                } else {
                  // For 60 minutes, end time is two slots ahead
                  endTime = currentSlotIndex < TIME_SLOTS.length - 2 
                    ? TIME_SLOTS[currentSlotIndex + 2] 
                    : TIME_SLOTS[TIME_SLOTS.length - 1];
                }
                
                return `Book Court ${selectedSlot.court} - ${selectedSlot.time} - ${endTime}`;
              })() : 'Book Court'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">{selectedSlot && selectedDate && (() => {
            const slotStatus = getSlotStatus(selectedDate, selectedSlot.time, selectedSlot.court);
            const cost = getSlotCost(selectedSlot.time);
            
            // Get next slot for 60-minute booking
            const currentSlotIndex = TIME_SLOTS.indexOf(selectedSlot.time);
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

                <div>
                  <Label className="mb-3 block">{slotStatus.type === 'booked' ? 'Watch For Court' : 'Court Selection'}</Label>
                  {(() => {
                    // For available slots, check if we need to filter courts based on 60-minute duration
                    let courtsToShow = [1, 2, 3, 4];
                    const dateKey = selectedDate.toISOString().split('T')[0];
                    const key = `${dateKey}-${selectedSlot.time}`;
                    const availableCourts = courtAvailability[key] || [];
                    
                    let availableCourtsFiltered = availableCourts;
                    
                    // For 60-minute bookings when slot is available, check next slot too
                    if (slotStatus.type === 'available' && bookingDuration === 60 && nextSlot) {
                      const nextKey = `${dateKey}-${nextSlot}`;
                      const nextSlotAvailableCourts = courtAvailability[nextKey] || [];
                      // Only courts available in BOTH slots
                      availableCourtsFiltered = availableCourts.filter(court => 
                        nextSlotAvailableCourts.includes(court)
                      );
                    }
                    
                    return (
                      <>
                        <div className={`grid ${slotStatus.type === 'booked' ? 'grid-cols-5' : 'grid-cols-4'} gap-2`}>
                          {slotStatus.type === 'booked' && (
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
                          )}
                          {[1, 2, 3, 4].map((courtNum) => {
                            const isAvailable = slotStatus.type === 'available' 
                              ? availableCourtsFiltered.includes(courtNum)
                              : true; // For booked/not-open, all courts are selectable
                            
                            return (
                              <button
                                key={courtNum}
                                onClick={() => setSelectedCourt(courtNum)}
                                className={`p-3 rounded-lg border-2 transition-all ${
                                  selectedCourt === courtNum
                                    ? (slotStatus.type === 'available' && isAvailable ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-blue-50')
                                    : slotStatus.type === 'available' && !isAvailable
                                    ? 'border-slate-200 bg-slate-100 opacity-60'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                <div className="text-center">
                                  <div className={`${selectedCourt === courtNum ? (slotStatus.type === 'available' && isAvailable ? 'text-green-900' : 'text-blue-900') : 'text-slate-900'}`}>
                                    {courtNum}
                                  </div>
                                  {selectedCourt === courtNum && (
                                    <CheckCircle2 className={`size-4 mx-auto mt-1 ${slotStatus.type === 'available' && isAvailable ? 'text-green-600' : 'text-blue-600'}`} />
                                  )}
                                  {slotStatus.type === 'available' && !isAvailable && selectedCourt !== courtNum && (
                                    <div className="text-red-600 mt-1">✕</div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-slate-600 mt-2">
                          {slotStatus.type === 'booked' ? (
                            selectedCourt === 0 
                              ? 'Will auto-book any court that becomes available'
                              : `Will auto-book only Court ${selectedCourt} if it becomes available`
                          ) : slotStatus.type === 'available' ? (
                            availableCourtsFiltered.includes(selectedCourt)
                              ? `Court ${selectedCourt} is available${bookingDuration === 60 ? ' for the full 60 minutes' : ''} - will book immediately`
                              : `Court ${selectedCourt} is ${bookingDuration === 60 ? 'not available for the full 60 minutes' : 'booked'} - will watch for cancellations`
                          ) : (
                            `Court ${selectedCourt} will be booked`
                          )}
                        </p>
                      </>
                    );
                  })()}
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <Label>Enable Auto-Rebook</Label>
                    <p className="text-slate-600">Use automation settings to rebook if conditions are met</p>
                  </div>
                  <Switch
                    checked={autoRebookEnabled}
                    onCheckedChange={setAutoRebookEnabled}
                  />
                </div>

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
                                  })} at {selectedSlot.time}
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

      <ManageBookingDialog
        open={manageBookingDialogOpen}
        onOpenChange={setManageBookingDialogOpen}
        booking={selectedBookingToManage}
        onCancel={onCancelBooking}
      />
    </div>
  );
}