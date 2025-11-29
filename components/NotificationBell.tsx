import { useState } from 'react';
import { Bell, UserPlus, CheckCircle2, Zap, X, Calendar, Users, CloudRain } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

export interface Notification {
  id: string;
  type: 'friend-request' | 'friend-accepted' | 'auto-booked' | 'auto-cancelled' | 'friend-booking';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  metadata?: {
    friendName?: string;
    friendEmail?: string;
    bookingDate?: string;
    bookingTime?: string;
    courtNumber?: number;
    reason?: string;
  };
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'friend-request',
      title: 'New Friend Request',
      message: 'Emma Wilson sent you a friend request',
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      read: false,
      metadata: {
        friendName: 'Emma Wilson',
        friendEmail: 'emma.w@example.com',
      },
    },
    {
      id: '2',
      type: 'auto-booked',
      title: 'Booking Confirmed',
      message: 'Your booking was automatically confirmed for Court 2',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
      metadata: {
        bookingDate: 'Tomorrow',
        bookingTime: '10:00 AM',
        courtNumber: 2,
      },
    },
    {
      id: '3',
      type: 'friend-accepted',
      title: 'Friend Request Accepted',
      message: 'Mike Chen accepted your friend request',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      read: false,
      metadata: {
        friendName: 'Mike Chen',
      },
    },
    {
      id: '4',
      type: 'auto-cancelled',
      title: 'Booking Auto-Cancelled',
      message: 'Your booking was cancelled due to high chance of rain',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
      metadata: {
        bookingDate: 'Nov 22',
        bookingTime: '2:00 PM',
        courtNumber: 1,
        reason: 'High chance of rain (85%)',
      },
    },
    {
      id: '5',
      type: 'friend-booking',
      title: 'Friend Booked a Court',
      message: 'Sarah Johnson booked Court 3 for tomorrow at 4:00 PM',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      read: true,
      metadata: {
        friendName: 'Sarah Johnson',
        bookingDate: 'Nov 23',
        bookingTime: '4:00 PM',
        courtNumber: 3,
      },
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'friend-request':
        return <UserPlus className="size-4 text-orange-600" />;
      case 'friend-accepted':
        return <CheckCircle2 className="size-4 text-green-600" />;
      case 'auto-booked':
        return <Zap className="size-4 text-blue-600" />;
      case 'auto-cancelled':
        return <CloudRain className="size-4 text-red-600" />;
      case 'friend-booking':
        return <Users className="size-4 text-purple-600" />;
      default:
        return <Bell className="size-4" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'friend-request':
        return 'bg-orange-50 border-orange-200';
      case 'friend-accepted':
        return 'bg-green-50 border-green-200';
      case 'auto-booked':
        return 'bg-blue-50 border-blue-200';
      case 'auto-cancelled':
        return 'bg-red-50 border-red-200';
      case 'friend-booking':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button 
          type="button"
          className="relative inline-flex items-center justify-center rounded-md p-2 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Bell className="size-5 text-slate-700" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 size-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs pointer-events-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 z-[100]" align="end" sideOffset={8}>
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-slate-600">{unreadCount} unread</p>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center bg-white">
              <Bell className="size-12 mx-auto mb-3 text-slate-400" />
              <p className="text-slate-900 mb-1">No notifications</p>
              <p className="text-slate-600">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 bg-white">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-slate-50 transition-colors ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`size-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-slate-900">
                          {notification.title}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6 flex-shrink-0 hover:bg-slate-200"
                          onClick={() => handleDeleteNotification(notification.id)}
                        >
                          <X className="size-3" />
                        </Button>
                      </div>
                      <p className="text-slate-600 mb-2">
                        {notification.message}
                      </p>
                      
                      {notification.metadata && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {notification.metadata.bookingDate && (
                            <Badge variant="secondary" className="text-xs">
                              <Calendar className="size-3 mr-1" />
                              {notification.metadata.bookingDate} at {notification.metadata.bookingTime}
                            </Badge>
                          )}
                          {notification.metadata.courtNumber && (
                            <Badge variant="secondary" className="text-xs">
                              Court {notification.metadata.courtNumber}
                            </Badge>
                          )}
                          {notification.metadata.reason && (
                            <Badge variant="outline" className="text-xs">
                              {notification.metadata.reason}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-xs">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="h-6 text-xs"
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}