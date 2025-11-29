import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { User, Mail, Phone, MapPin, Calendar, Bell, Shield, CreditCard, LogOut, Save, Edit2, Users, UserPlus, X, Check, Gift, Copy, Share2, ExternalLink, Trash2, AlertTriangle } from 'lucide-react';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { ConnectedAccountsSection, ConnectedAccount } from './ConnectedAccountsSection';
import { BillingSection } from './BillingSection';
import { toast } from 'sonner';
import { PhoneInput } from './PhoneInput';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface ProfilePageProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    phone?: string;
    location?: string;
    memberSince?: string;
    isAdmin?: boolean;
    balance?: number;
  };
  connectedAccounts: ConnectedAccount[];
  onLogout: () => void;
  onUpdateProfile: (updates: Partial<ProfilePageProps['user']>) => void;
  onAddAccount: (account: Omit<ConnectedAccount, 'id' | 'addedDate' | 'status'>) => void;
  onEditAccount: (id: string, updates: Partial<ConnectedAccount>) => void;
  onDeleteAccount: (id: string) => void;
}

export function ProfilePage({ 
  user, 
  connectedAccounts,
  onLogout, 
  onUpdateProfile,
  onAddAccount,
  onEditAccount,
  onDeleteAccount,
}: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [bookingReminders, setBookingReminders] = useState(true);
  const [weatherAlerts, setWeatherAlerts] = useState(true);
  const [shareBookingActivity, setShareBookingActivity] = useState(true);
  const [friendSearchQuery, setFriendSearchQuery] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  // Mock friends data (in real app, this would come from a database)
  const [friends, setFriends] = useState([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      avatar: undefined,
      status: 'connected' as const,
      connectedDate: '2024-10-15',
      sharedBookings: 3,
    },
    {
      id: '2',
      name: 'Mike Chen',
      email: 'mike.chen@example.com',
      avatar: undefined,
      status: 'connected' as const,
      connectedDate: '2024-11-01',
      sharedBookings: 7,
    },
  ]);
  
  const [pendingRequests, setPendingRequests] = useState([
    {
      id: '3',
      name: 'Emma Wilson',
      email: 'emma.w@example.com',
      avatar: undefined,
      status: 'pending' as const,
    },
  ]);

  const handleAddFriend = () => {
    if (!friendSearchQuery.trim()) return;
    
    // In a real app, this would search for users and send a friend request
    const newRequest = {
      id: Math.random().toString(36).substring(7),
      name: 'New Friend',
      email: friendSearchQuery,
      avatar: undefined,
      status: 'pending' as const,
    };
    
    setPendingRequests([...pendingRequests, newRequest]);
    setFriendSearchQuery('');
  };

  const handleAcceptRequest = (requestId: string) => {
    const request = pendingRequests.find(r => r.id === requestId);
    if (request) {
      setFriends([...friends, {
        ...request,
        status: 'connected',
        connectedDate: new Date().toISOString().split('T')[0],
        sharedBookings: 0,
      }]);
      setPendingRequests(pendingRequests.filter(r => r.id !== requestId));
    }
  };

  const handleDeclineRequest = (requestId: string) => {
    setPendingRequests(pendingRequests.filter(r => r.id !== requestId));
  };

  const handleRemoveFriend = (friendId: string) => {
    setFriends(friends.filter(f => f.id !== friendId));
  };

  // Referral code generation (in real app, this would be user-specific and from backend)
  const referralCode = 'TENNIS' + user.name.split(' ')[0].toUpperCase().substring(0, 4) + '2024';
  const referralLink = `https://tennisbooking.app/join?ref=${referralCode}`;
  
  // Mock referral data
  const [referrals, setReferrals] = useState([
    {
      id: '1',
      name: 'James Wilson',
      email: 'james.w@example.com',
      status: 'completed' as const,
      joinedDate: '2024-10-20',
      rewardEarned: '£10',
    },
    {
      id: '2',
      name: 'Lisa Anderson',
      email: 'lisa.a@example.com',
      status: 'completed' as const,
      joinedDate: '2024-11-05',
      rewardEarned: '£10',
    },
    {
      id: '3',
      name: 'Tom Brown',
      email: 'tom.b@example.com',
      status: 'pending' as const,
      joinedDate: '2024-11-18',
      rewardEarned: null,
    },
  ]);
  
  const totalReferrals = referrals.length;
  const completedReferrals = referrals.filter(r => r.status === 'completed').length;
  const totalRewards = completedReferrals * 10; // £10 per referral
  
  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success('Referral code copied to clipboard!');
  };
  
  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied to clipboard!');
  };
  
  const handleShareEmail = () => {
    const subject = encodeURIComponent('Join me on Tennis Court Booking!');
    const body = encodeURIComponent(
      `Hi!\n\nI've been using this amazing tennis court booking app and thought you'd love it too!\n\nUse my referral code ${referralCode} or click this link to sign up:\n${referralLink}\n\nYou'll get £10 off your first booking, and I'll get £10 credit too!\n\nSee you on the court!\n${user.name}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };
  
  const handleSave = () => {
    onUpdateProfile(editedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-slate-900 bg-blue-100">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-slate-900 mb-1">{user.name}</h2>
              <p className="text-slate-600">{user.email}</p>
              <Badge variant="secondary" className="mt-2">
                <Calendar className="size-3 mr-1" />
                Member since {user.memberSince || 'November 2024'}
              </Badge>
            </div>
          </div>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit2 className="size-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>

        {isEditing && (
          <>
            <Separator className="my-6" />

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">
                    <User className="size-4 inline mr-2" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={editedUser.name}
                    onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="email">
                    <Mail className="size-4 inline mr-2" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={editedUser.email}
                    onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">
                    <Phone className="size-4 inline mr-2" />
                    Phone Number
                  </Label>
                  <PhoneInput
                    value={editedUser.phone || ''}
                    onChange={(value, isValid) => {
                      setEditedUser({ ...editedUser, phone: value });
                    }}
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="location">
                    <MapPin className="size-4 inline mr-2" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="London, UK"
                    value={editedUser.location || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSave}>
                  <Save className="size-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* 2. Connected Accounts Section */}
      <ConnectedAccountsSection
        accounts={connectedAccounts}
        onAdd={onAddAccount}
        onEdit={onEditAccount}
        onDelete={onDeleteAccount}
      />

      {/* 3. Billing & Payment Methods */}
      <BillingSection 
        balance={user.balance ?? 45.50} 
        onBalanceChange={(newBalance) => onUpdateProfile({ balance: newBalance })}
      />

      {/* 4. Connect with Friends */}
      <Card className="p-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-slate-900 mb-1">
              <Users className="size-5 inline mr-2" />
              Connect with Friends
            </h3>
            <p className="text-slate-600">Share your bookings and connect with other players</p>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <p className="text-blue-900">Share Booking Activity</p>
              <p className="text-blue-700">Allow friends to see your booking activity and schedule</p>
            </div>
            <Switch
              checked={shareBookingActivity}
              onCheckedChange={setShareBookingActivity}
            />
          </div>

          {!shareBookingActivity && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-amber-900">
                Your booking activity is currently private. Friends won't be able to see your bookings or schedule.
              </p>
            </div>
          )}

          <Separator />

          <div className="space-y-3">
            <Label>Add Friend</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter friend's email address"
                value={friendSearchQuery}
                onChange={(e) => setFriendSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddFriend();
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={handleAddFriend}
                disabled={!friendSearchQuery.trim()}
              >
                <UserPlus className="size-4 mr-2" />
                Send Request
              </Button>
            </div>
          </div>

          {pendingRequests.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label>Pending Requests ({pendingRequests.length})</Label>
                {pendingRequests.map(request => (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10">
                        <AvatarImage src={request.avatar} alt={request.name} />
                        <AvatarFallback className="text-slate-900 bg-orange-100">
                          {getInitials(request.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-slate-900">{request.name}</p>
                        <p className="text-slate-600">{request.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRequest(request.id)}
                      >
                        <Check className="size-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeclineRequest(request.id)}
                      >
                        <X className="size-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {friends.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label>Connected Friends ({friends.length})</Label>
                {friends.map(friend => (
                  <div key={friend.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10">
                        <AvatarImage src={friend.avatar} alt={friend.name} />
                        <AvatarFallback className="text-slate-900 bg-blue-100">
                          {getInitials(friend.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-slate-900">{friend.name}</p>
                        <p className="text-slate-600">{friend.email}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            Connected {new Date(friend.connectedDate).toLocaleDateString()}
                          </Badge>
                          {shareBookingActivity && friend.sharedBookings > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {friend.sharedBookings} shared bookings
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRemoveFriend(friend.id)}
                    >
                      <X className="size-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}

          {friends.length === 0 && pendingRequests.length === 0 && (
            <div className="p-8 text-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
              <Users className="size-12 mx-auto mb-3 text-slate-400" />
              <p className="text-slate-900 mb-1">No friends yet</p>
              <p className="text-slate-600">Add friends to share your booking activity and coordinate games</p>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-slate-900 mb-1">
              <Gift className="size-5 inline mr-2" />
              Refer a Friend
            </h3>
            <p className="text-slate-600">Invite friends and earn £10 credit for each successful referral</p>
          </div>

          {/* Rewards Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <p className="text-green-900">Total Earned</p>
              <p className="text-green-600 mt-1">£{totalRewards}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <p className="text-blue-900">Completed</p>
              <p className="text-blue-600 mt-1">{completedReferrals} referrals</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <p className="text-purple-900">Pending</p>
              <p className="text-purple-600 mt-1">{totalReferrals - completedReferrals} referrals</p>
            </div>
          </div>

          {/* How it Works */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-900 mb-2">How it works:</p>
            <ul className="text-blue-800 space-y-1 ml-4">
              <li className="list-disc">Share your unique referral code or link with friends</li>
              <li className="list-disc">Your friend signs up and makes their first booking</li>
              <li className="list-disc">You both get £10 credit automatically applied to your accounts</li>
              <li className="list-disc">No limit on referrals - invite as many friends as you like!</li>
            </ul>
          </div>

          <Separator />

          {/* Referral Code */}
          <div className="space-y-3">
            <Label>Your Referral Code</Label>
            <div className="flex gap-2">
              <div className="flex-1 p-3 bg-slate-100 rounded-lg border-2 border-slate-300">
                <p className="text-slate-900 text-center tracking-wider">{referralCode}</p>
              </div>
              <Button
                onClick={handleCopyReferralCode}
              >
                <Copy className="size-4 mr-2" />
                Copy Code
              </Button>
            </div>
          </div>

          {/* Referral Link */}
          <div className="space-y-3">
            <Label>Your Referral Link</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={referralLink}
                readOnly
                className="bg-slate-50"
              />
              <Button
                onClick={handleCopyReferralLink}
              >
                <Copy className="size-4 mr-2" />
                Copy Link
              </Button>
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-3">
            <Label>Share with Friends</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleShareEmail}
              >
                <Mail className="size-4 mr-2" />
                Share via Email
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Join me on Tennis Court Booking!',
                      text: `Use my referral code ${referralCode} to get £10 off your first booking!`,
                      url: referralLink,
                    }).catch(() => {});
                  } else {
                    handleCopyReferralLink();
                  }
                }}
              >
                <Share2 className="size-4 mr-2" />
                Share Link
              </Button>
            </div>
          </div>

          {referrals.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label>Your Referrals ({referrals.length})</Label>
                {referrals.map(referral => (
                  <div key={referral.id} className={`flex items-center justify-between p-4 rounded-lg border ${
                    referral.status === 'completed' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-orange-50 border-orange-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10">
                        <AvatarFallback className={`text-slate-900 ${
                          referral.status === 'completed' ? 'bg-green-100' : 'bg-orange-100'
                        }`}>
                          {getInitials(referral.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-slate-900">{referral.name}</p>
                        <p className="text-slate-600">{referral.email}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            Joined {new Date(referral.joinedDate).toLocaleDateString()}
                          </Badge>
                          <Badge 
                            variant={referral.status === 'completed' ? 'default' : 'secondary'} 
                            className="text-xs"
                          >
                            {referral.status === 'completed' ? `✓ ${referral.rewardEarned} earned` : 'Pending first booking'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {referrals.length === 0 && (
            <div className="p-8 text-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
              <Gift className="size-12 mx-auto mb-3 text-slate-400" />
              <p className="text-slate-900 mb-1">No referrals yet</p>
              <p className="text-slate-600">Start inviting friends to earn rewards!</p>
            </div>
          )}
        </div>
      </Card>

      {/* 5. Notification Preferences */}
      <Card className="p-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-slate-900 mb-1">
              <Bell className="size-5 inline mr-2" />
              Notification Preferences
            </h3>
            <p className="text-slate-600">Manage how you receive updates</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-slate-900">Email Notifications</p>
                <p className="text-slate-600">Receive booking confirmations and updates</p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-slate-900">Booking Reminders</p>
                <p className="text-slate-600">Get reminded 1 hour before your booking</p>
              </div>
              <Switch
                checked={bookingReminders}
                onCheckedChange={setBookingReminders}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-slate-900">Weather Alerts</p>
                <p className="text-slate-600">Receive weather updates for your bookings</p>
              </div>
              <Switch
                checked={weatherAlerts}
                onCheckedChange={setWeatherAlerts}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* 6. Security & Privacy */}
      <Card className="p-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-slate-900 mb-1">
              <Shield className="size-5 inline mr-2" />
              Security & Privacy
            </h3>
            <p className="text-slate-600">Manage your account security</p>
          </div>

          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Shield className="size-4 mr-2" />
              Change Password
            </Button>
          </div>
        </div>
      </Card>

      {/* 7. Account Actions */}
      <Card className="p-8">
        <div className="space-y-4">
          <h3 className="text-slate-900">Account Actions</h3>
          
          {/* Demo: Toggle Admin Mode */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-900">Admin Mode (Demo)</p>
                <p className="text-blue-700 text-sm">Toggle admin access for testing</p>
              </div>
              <Switch
                checked={user.isAdmin || false}
                onCheckedChange={(checked) => onUpdateProfile({ isAdmin: checked })}
              />
            </div>
          </div>
          
          <Button
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            onClick={onLogout}
          >
            <LogOut className="size-4 mr-2" />
            Sign Out
          </Button>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <AlertTriangle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-900">Delete Account</p>
                <p className="text-red-700 text-sm mt-1">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
            </div>
            
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="size-4 mr-2" />
              Delete My Account
            </Button>
          </div>
        </div>
      </Card>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="size-6" />
              Delete Account Permanently?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-900 mb-2">This action will permanently delete:</p>
                <ul className="text-red-800 space-y-1 ml-4">
                  <li className="list-disc">Your profile and personal information</li>
                  <li className="list-disc">All your court bookings (upcoming and past)</li>
                  <li className="list-disc">Your payment methods and billing history</li>
                  <li className="list-disc">Connected accounts and automation settings</li>
                  <li className="list-disc">Friend connections and referral data</li>
                  <li className="list-disc">Account balance and earned rewards</li>
                </ul>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-amber-900 mb-2">Before you delete:</p>
                <ul className="text-amber-800 space-y-1 ml-4">
                  <li className="list-disc">Cancel any upcoming bookings to avoid no-show fees</li>
                  <li className="list-disc">Use or transfer your account balance</li>
                  <li className="list-disc">Save any important booking receipts or invoices</li>
                  <li className="list-disc">Consider signing out instead if you might return</li>
                </ul>
              </div>

              <div className="space-y-2">
                <Label htmlFor="delete-confirm" className="text-slate-900">
                  Type <span className="px-2 py-0.5 bg-slate-200 rounded font-mono">DELETE</span> to confirm:
                </Label>
                <Input
                  id="delete-confirm"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE here"
                  className="font-mono"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteConfirmText('');
              setShowDeleteDialog(false);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteConfirmText !== 'DELETE'}
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deleteConfirmText === 'DELETE') {
                  toast.success('Account deletion initiated. You will be logged out shortly.');
                  setDeleteConfirmText('');
                  setShowDeleteDialog(false);
                  // In a real app, this would call an API to delete the account
                  setTimeout(() => {
                    onLogout();
                  }, 2000);
                }
              }}
            >
              <Trash2 className="size-4 mr-2" />
              Delete Account Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}