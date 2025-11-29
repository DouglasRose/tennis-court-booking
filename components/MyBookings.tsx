import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Calendar, Clock, X, Zap, CalendarClock, Eye, Shield, Repeat, Users, User, Settings } from 'lucide-react';
import type { Booking, AutoCancelSettings } from './CourtBookingSystem';
import type { ConnectedAccount } from './ConnectedAccountsSection';
import { AutomationSettings } from './AutomationSettings';

interface MyBookingsProps {
  bookings: Booking[];
  onCancel: (id: string) => void;
  autoCancelSettings: AutoCancelSettings;
  connectedAccounts: ConnectedAccount[];
  onUpdateAutoCancelSettings: (settings: AutoCancelSettings) => void;
}

export function MyBookings({ bookings, onCancel, autoCancelSettings, connectedAccounts, onUpdateAutoCancelSettings }: MyBookingsProps) {
  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'booked':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Booked</Badge>;
      case 'scheduled':
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Scheduled</Badge>;
      case 'watching':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Watching</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
    }
  };

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'booked':
        return <Zap className="size-4" />;
      case 'scheduled':
        return <CalendarClock className="size-4" />;
      case 'watching':
        return <Eye className="size-4" />;
      default:
        return <X className="size-4" />;
    }
  };

  const activeBookings = bookings.filter(b => b.status !== 'cancelled');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');
  
  const totalCost = activeBookings
    .filter(b => b.status === 'booked')
    .reduce((sum, b) => sum + b.cost, 0);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900">Active & Pending Bookings</h3>
          {activeBookings.filter(b => b.status === 'booked').length > 0 && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-green-900">Total Cost: <span className="text-green-900">${totalCost}</span></span>
            </div>
          )}
        </div>
        {activeBookings.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-slate-600">No active bookings</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeBookings.map(booking => (
              <Card key={booking.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(booking.status)}
                      {getStatusBadge(booking.status)}
                      {booking.recurringGroupId && (
                        <Badge variant="outline" className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border-indigo-300">
                          <Repeat className="size-3" />
                          Recurring ({booking.recurringIndex}/{booking.recurringTotal})
                        </Badge>
                      )}
                      {booking.onlyBookWhenBusy && (
                        <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-300">
                          <Users className="size-3" />
                          Only Book When Busy ({booking.busyThreshold || 2})
                        </Badge>
                      )}
                      {booking.autoCancelEnabled && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Shield className="size-3" />
                          Auto-cancel ON
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Calendar className="size-4 text-slate-400" />
                        <span>{booking.date.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Clock className="size-4 text-slate-400" />
                        <span>{booking.timeSlot}</span>
                      </div>
                      <div className="text-slate-700">
                        {booking.status === 'booked' && `Court ${booking.courtNumber}`}
                        {booking.status === 'scheduled' && 'Court: TBD'}
                        {booking.status === 'watching' && 'Monitoring...'}
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="secondary">${booking.cost}</Badge>
                      {booking.status === 'booked' && booking.accountId && (() => {
                        const account = connectedAccounts.find(a => a.id === booking.accountId);
                        if (account) {
                          return (
                            <Badge variant="outline" className="flex items-center gap-1 bg-slate-50 text-slate-700 border-slate-300">
                              <User className="size-3" />
                              {account.name}
                            </Badge>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    {booking.status === 'scheduled' && booking.scheduledFor && (
                      <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                        <p className="text-purple-900">
                          Booking window opens: {booking.scheduledFor.toLocaleString()}
                        </p>
                        <p className="text-purple-700 mt-1">
                          Our bot will automatically book this when the window opens
                        </p>
                      </div>
                    )}

                    {booking.status === 'watching' && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-blue-900">
                          Watching for cancellations
                        </p>
                        <p className="text-blue-700 mt-1">
                          We'll automatically book when someone cancels their booking
                        </p>
                      </div>
                    )}

                    {booking.autoCancelEnabled && booking.status === 'booked' && (
                      <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                        <p className="text-amber-900">Auto-cancel conditions:</p>
                        <ul className="text-amber-800 mt-1 space-y-1">
                          {autoCancelSettings.weatherEnabled && (
                            <>
                              {autoCancelSettings.minTempEnabled && (
                                <li>• Temperature below {autoCancelSettings.minTemp}°C</li>
                              )}
                              {autoCancelSettings.maxTempEnabled && (
                                <li>• Temperature above {autoCancelSettings.maxTemp}°C</li>
                              )}
                              {autoCancelSettings.rainProbabilityEnabled && (
                                <li>• Rain probability &gt; {autoCancelSettings.rainProbability}%</li>
                              )}
                              {autoCancelSettings.recentRainEnabled && (
                                <li>• Rained in last {autoCancelSettings.recentRainHours} {autoCancelSettings.recentRainHours === 1 ? 'hour' : 'hours'} (wet courts)</li>
                              )}
                            </>
                          )}
                          {autoCancelSettings.availabilityEnabled && (
                            <li>• Availability: {autoCancelSettings.minAvailableCourts}+ courts available</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCancel(booking.id)}
                    className="ml-4"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {cancelledBookings.length > 0 && (
        <div>
          <h3 className="text-slate-900 mb-4">Cancelled Bookings</h3>
          <div className="space-y-3">
            {cancelledBookings.map(booking => (
              <Card key={booking.id} className="p-4 opacity-60">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(booking.status)}
                      {getStatusBadge(booking.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Calendar className="size-4 text-slate-400" />
                        <span>{booking.date.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Clock className="size-4 text-slate-400" />
                        <span>{booking.timeSlot}</span>
                      </div>
                      <div className="text-slate-700">
                        Court {booking.courtNumber}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="fixed bottom-6 right-6 shadow-lg z-50">
            <Settings className="size-4 mr-2" />
            Auto-Cancel Settings
          </Button>
        </SheetTrigger>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Auto-Cancel Settings</SheetTitle>
            <SheetDescription>
              Configure automated booking cancellation based on weather and availability
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <AutomationSettings
              settings={autoCancelSettings}
              onUpdate={onUpdateAutoCancelSettings}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}