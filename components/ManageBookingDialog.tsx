import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CalendarClock, Eye, CheckCircle2, Trash2, CloudRain, AlertCircle } from 'lucide-react';
import type { Booking } from './CourtBookingSystem';

interface ManageBookingDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: (bookingId: string) => void;
}

export function ManageBookingDialog({
  booking,
  open,
  onOpenChange,
  onCancel
}: ManageBookingDialogProps) {
  if (!booking) return null;

  const getStatusBadge = () => {
    if (booking.status === 'booked') {
      return (
        <Badge className="bg-blue-600">
          <CheckCircle2 className="size-3 mr-1" />
          Confirmed
        </Badge>
      );
    } else if (booking.status === 'scheduled') {
      return (
        <Badge className="bg-orange-600">
          <CalendarClock className="size-3 mr-1" />
          Scheduled
        </Badge>
      );
    } else if (booking.status === 'watching') {
      return (
        <Badge className="bg-orange-600">
          <Eye className="size-3 mr-1" />
          Watching
        </Badge>
      );
    }
    return null;
  };

  const handleCancel = () => {
    onCancel(booking.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Manage Booking</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-slate-900 mb-1">Court {booking.courtNumber}</h4>
              <p className="text-slate-600">
                {booking.date.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
              <p className="text-slate-600">{booking.timeSlot}</p>
            </div>
            {getStatusBadge()}
          </div>

          <div className="p-4 bg-slate-50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Status:</span>
              <span className="text-slate-900 capitalize">{booking.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Cost:</span>
              <span className="text-slate-900">${booking.cost}</span>
            </div>
            {booking.autoCancelEnabled && (
              <div className="flex justify-between">
                <span className="text-slate-600">Auto-Cancel:</span>
                <span className="text-green-700">Enabled</span>
              </div>
            )}
            {booking.autoRebookEnabled && (
              <div className="flex justify-between">
                <span className="text-slate-600">Auto-Rebook:</span>
                <span className="text-green-700">Enabled</span>
              </div>
            )}
            {booking.onlyBookWhenBusy && booking.busyThreshold && (
              <div className="flex justify-between">
                <span className="text-slate-600">Book When Busy:</span>
                <span className="text-amber-700">≤{booking.busyThreshold} courts</span>
              </div>
            )}
            {booking.recurringGroupId && booking.recurringIndex && booking.recurringTotal && (
              <div className="flex justify-between">
                <span className="text-slate-600">Recurring:</span>
                <span className="text-blue-700">
                  {booking.recurringIndex} of {booking.recurringTotal}
                </span>
              </div>
            )}
          </div>

          {booking.status === 'scheduled' && booking.scheduledFor && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <CalendarClock className="size-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-blue-900">Scheduled Auto-Booking</p>
                  <p className="text-blue-700 mt-1">
                    Will auto-book at {booking.scheduledFor.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {booking.status === 'watching' && (
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-start gap-2">
                <Eye className="size-4 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-amber-900">Watching for Availability</p>
                  <p className="text-amber-700 mt-1">
                    We'll automatically book when someone cancels their booking
                  </p>
                </div>
              </div>
            </div>
          )}

          {booking.autoCancelEnabled && booking.status === 'booked' && (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-start gap-2">
                <CloudRain className="size-4 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-purple-900">Auto-Cancel Active</p>
                  <p className="text-purple-700 mt-1">
                    This booking may be automatically cancelled based on your automation settings
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleCancel}
            >
              <Trash2 className="size-4 mr-2" />
              Cancel Booking
            </Button>
          </div>

          <div className="p-3 bg-slate-100 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="size-4 text-slate-600 mt-0.5" />
              <p className="text-slate-600 text-xs">
                Cancelling this booking will free up the court for others. If auto-rebook is enabled, 
                the system may automatically rebook this slot if conditions are met.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}