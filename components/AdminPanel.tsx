import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  Users, 
  Building2, 
  Search, 
  Eye, 
  Edit2, 
  Trash2, 
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  ShieldCheck,
  X,
  Save,
  Clock,
  Zap,
  Layers,
  BookOpen,
} from 'lucide-react';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { DocumentationContent } from './DocumentationContent';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  avatar?: string;
  memberSince: string;
  status: 'active' | 'suspended' | 'deleted';
  upcomingBookings: Booking[];
  connectedAccounts: string[];
  totalSpent: number;
  lastLogin: string;
}

interface Booking {
  id: string;
  venue: string;
  court: string;
  date: string;
  time: string;
  duration: number;
  cost: number;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface Court {
  id: string;
  name: string;
  surface: 'hard' | 'clay' | 'grass' | 'carpet';
  hasFloodlights: boolean;
}

interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  postcode: string;
  courts: Court[];
  cancellationCutoff: number; // hours before booking
  peakHourPrice: number;
  offPeakHourPrice: number;
  openingTime: string;
  closingTime: string;
  contactEmail: string;
  contactPhone: string;
}

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'users' | 'venues' | 'documentation'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [isEditingVenue, setIsEditingVenue] = useState(false);
  const [isAddingVenue, setIsAddingVenue] = useState(false);

  // Mock users data
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+447700900123',
      location: 'London, UK',
      avatar: undefined,
      memberSince: '2024-01-15',
      status: 'active',
      upcomingBookings: [
        {
          id: 'b1',
          venue: 'Riverside Tennis Club',
          court: 'Court 1',
          date: '2024-11-25',
          time: '14:00',
          duration: 60,
          cost: 30,
          status: 'confirmed',
        },
        {
          id: 'b2',
          venue: 'Central Courts',
          court: 'Court 3',
          date: '2024-11-27',
          time: '10:00',
          duration: 90,
          cost: 45,
          status: 'confirmed',
        },
      ],
      connectedAccounts: ['Gmail', 'Outlook', 'Apple Calendar'],
      totalSpent: 450.00,
      lastLogin: '2024-11-23T10:30:00',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@gmail.com',
      phone: '+447700900456',
      location: 'Manchester, UK',
      avatar: undefined,
      memberSince: '2024-03-20',
      status: 'active',
      upcomingBookings: [
        {
          id: 'b3',
          venue: 'Parkside Sports Centre',
          court: 'Court 2',
          date: '2024-11-24',
          time: '18:00',
          duration: 60,
          cost: 30,
          status: 'confirmed',
        },
      ],
      connectedAccounts: ['Gmail', 'Google Calendar'],
      totalSpent: 280.00,
      lastLogin: '2024-11-22T15:45:00',
    },
    {
      id: '3',
      name: 'Mike Chen',
      email: 'mike.chen@example.com',
      phone: '+447700900789',
      location: 'Birmingham, UK',
      avatar: undefined,
      memberSince: '2024-06-10',
      status: 'active',
      upcomingBookings: [],
      connectedAccounts: ['Outlook'],
      totalSpent: 150.00,
      lastLogin: '2024-11-20T09:15:00',
    },
  ]);

  // Mock venues data
  const [venues, setVenues] = useState<Venue[]>([
    {
      id: '1',
      name: 'Riverside Tennis Club',
      address: '123 River Road',
      city: 'London',
      postcode: 'SW1A 1AA',
      courts: [
        { id: 'c1', name: 'Court 1', surface: 'hard', hasFloodlights: true },
        { id: 'c2', name: 'Court 2', surface: 'hard', hasFloodlights: true },
        { id: 'c3', name: 'Court 3', surface: 'clay', hasFloodlights: false },
        { id: 'c4', name: 'Court 4', surface: 'grass', hasFloodlights: false },
      ],
      cancellationCutoff: 24,
      peakHourPrice: 15,
      offPeakHourPrice: 10,
      openingTime: '08:00',
      closingTime: '19:30',
      contactEmail: 'info@riverside.com',
      contactPhone: '+442012345678',
    },
    {
      id: '2',
      name: 'Parkside Sports Centre',
      address: '45 Park Lane',
      city: 'Manchester',
      postcode: 'M1 2AB',
      courts: [
        { id: 'c5', name: 'Court 1', surface: 'hard', hasFloodlights: true },
        { id: 'c6', name: 'Court 2', surface: 'hard', hasFloodlights: true },
        { id: 'c7', name: 'Court 3', surface: 'hard', hasFloodlights: true },
      ],
      cancellationCutoff: 12,
      peakHourPrice: 18,
      offPeakHourPrice: 12,
      openingTime: '07:00',
      closingTime: '22:00',
      contactEmail: 'bookings@parkside.com',
      contactPhone: '+441612345678',
    },
    {
      id: '3',
      name: 'Central Courts',
      address: '78 High Street',
      city: 'Birmingham',
      postcode: 'B1 3CD',
      courts: [
        { id: 'c8', name: 'Court 1', surface: 'grass', hasFloodlights: false },
        { id: 'c9', name: 'Court 2', surface: 'grass', hasFloodlights: false },
      ],
      cancellationCutoff: 48,
      peakHourPrice: 20,
      offPeakHourPrice: 15,
      openingTime: '08:00',
      closingTime: '18:00',
      contactEmail: 'info@centralcourts.com',
      contactPhone: '+441212345678',
    },
  ]);

  const [editedVenue, setEditedVenue] = useState<Venue | null>(null);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVenues = venues.filter(venue =>
    venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
  };

  const handleEditVenue = (venue: Venue) => {
    setEditedVenue({ ...venue });
    setSelectedVenue(venue);
    setIsEditingVenue(true);
  };

  const handleAddVenue = () => {
    const newVenue: Venue = {
      id: `venue-${Date.now()}`,
      name: '',
      address: '',
      city: '',
      postcode: '',
      courts: [
        { id: 'c1', name: 'Court 1', surface: 'hard', hasFloodlights: false },
      ],
      cancellationCutoff: 24,
      peakHourPrice: 15,
      offPeakHourPrice: 10,
      openingTime: '08:00',
      closingTime: '19:30',
      contactEmail: '',
      contactPhone: '',
    };
    setEditedVenue(newVenue);
    setIsAddingVenue(true);
  };

  const handleSaveVenue = () => {
    if (!editedVenue) return;

    if (!editedVenue.name || !editedVenue.address || !editedVenue.city) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isAddingVenue) {
      setVenues([...venues, editedVenue]);
      toast.success('Venue added successfully');
      setIsAddingVenue(false);
    } else {
      setVenues(venues.map(v => v.id === editedVenue.id ? editedVenue : v));
      toast.success('Venue updated successfully');
      setIsEditingVenue(false);
    }
    setEditedVenue(null);
    setSelectedVenue(null);
  };

  const handleDeleteVenue = (venueId: string) => {
    if (confirm('Are you sure you want to delete this venue? This action cannot be undone.')) {
      setVenues(venues.filter(v => v.id !== venueId));
      toast.success('Venue deleted successfully');
    }
  };

  const handleAddCourt = () => {
    if (!editedVenue) return;
    const courtNumber = editedVenue.courts.length + 1;
    const newCourt: Court = {
      id: `court-${Date.now()}`,
      name: `Court ${courtNumber}`,
      surface: 'hard',
      hasFloodlights: false,
    };
    setEditedVenue({
      ...editedVenue,
      courts: [...editedVenue.courts, newCourt],
    });
  };

  const handleUpdateCourt = (courtId: string, updates: Partial<Court>) => {
    if (!editedVenue) return;
    setEditedVenue({
      ...editedVenue,
      courts: editedVenue.courts.map(c => c.id === courtId ? { ...c, ...updates } : c),
    });
  };

  const handleDeleteCourt = (courtId: string) => {
    if (!editedVenue) return;
    if (editedVenue.courts.length <= 1) {
      toast.error('Venue must have at least one court');
      return;
    }
    setEditedVenue({
      ...editedVenue,
      courts: editedVenue.courts.filter(c => c.id !== courtId),
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 mb-2">Admin Panel</h1>
          <p className="text-slate-600">Manage users, venues, and system settings</p>
        </div>
      </div>

      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'users' | 'venues' | 'documentation')}>
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="size-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="venues" className="flex items-center gap-2">
              <Building2 className="size-4" />
              Venues
            </TabsTrigger>
            <TabsTrigger value="documentation" className="flex items-center gap-2">
              <BookOpen className="size-4" />
              Documentation
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Badge variant="secondary" className="text-sm">
                {users.length} total users
              </Badge>
            </div>

            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="size-12">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-slate-900 bg-blue-100">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-slate-900">{user.name}</p>
                      <p className="text-slate-600 text-sm">{user.email}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {user.upcomingBookings.length} upcoming bookings
                        </Badge>
                        <Badge 
                          variant={user.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {user.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewUser(user)}
                  >
                    <Eye className="size-4 mr-2" />
                    View Details
                  </Button>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="p-8 text-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                  <Users className="size-12 mx-auto mb-3 text-slate-400" />
                  <p className="text-slate-900 mb-1">No users found</p>
                  <p className="text-slate-600">Try adjusting your search query</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Venues Tab */}
          <TabsContent value="venues" className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search venues by name or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleAddVenue}>
                <Plus className="size-4 mr-2" />
                Add Venue
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVenues.map((venue) => (
                <Card key={venue.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-slate-900 mb-1">{venue.name}</h3>
                        <p className="text-slate-600 text-sm">
                          {venue.address}, {venue.city}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {venue.courts.length} courts
                      </Badge>
                    </div>

                    <Separator />

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Opening Hours:</span>
                        <span className="text-slate-900">
                          {venue.openingTime} - {venue.closingTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Peak Price:</span>
                        <span className="text-slate-900">£{venue.peakHourPrice}/30min</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Off-Peak Price:</span>
                        <span className="text-slate-900">£{venue.offPeakHourPrice}/30min</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Cancellation:</span>
                        <span className="text-slate-900">{venue.cancellationCutoff}h before</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditVenue(venue)}
                      >
                        <Edit2 className="size-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteVenue(venue.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {filteredVenues.length === 0 && (
                <div className="col-span-2 p-8 text-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                  <Building2 className="size-12 mx-auto mb-3 text-slate-400" />
                  <p className="text-slate-900 mb-1">No venues found</p>
                  <p className="text-slate-600">Try adjusting your search query or add a new venue</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="documentation" className="space-y-6">
            <DocumentationContent />
          </TabsContent>
        </Tabs>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle>User Details</DialogTitle>
                <DialogDescription>
                  Complete information about {selectedUser.name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* User Info */}
                <Card className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="size-16">
                      <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                      <AvatarFallback className="text-slate-900 bg-blue-100 text-lg">
                        {getInitials(selectedUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-slate-900 mb-1">{selectedUser.name}</h3>
                      <Badge variant={selectedUser.status === 'active' ? 'default' : 'secondary'}>
                        {selectedUser.status}
                      </Badge>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Mail className="size-4 text-slate-500 mt-0.5" />
                        <div>
                          <p className="text-slate-600">Email</p>
                          <p className="text-slate-900">{selectedUser.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Phone className="size-4 text-slate-500 mt-0.5" />
                        <div>
                          <p className="text-slate-600">Phone</p>
                          <p className="text-slate-900">{selectedUser.phone || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="size-4 text-slate-500 mt-0.5" />
                        <div>
                          <p className="text-slate-600">Location</p>
                          <p className="text-slate-900">{selectedUser.location || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="size-4 text-slate-500 mt-0.5" />
                        <div>
                          <p className="text-slate-600">Member Since</p>
                          <p className="text-slate-900">
                            {new Date(selectedUser.memberSince).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-green-900 text-sm">Total Spent</p>
                      <p className="text-green-600 mt-1">£{selectedUser.totalSpent.toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-blue-900 text-sm">Last Login</p>
                      <p className="text-blue-600 mt-1 text-sm">
                        {new Date(selectedUser.lastLogin).toLocaleString('en-GB')}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Upcoming Bookings */}
                <div>
                  <h4 className="text-slate-900 mb-3">
                    Upcoming Bookings ({selectedUser.upcomingBookings.length})
                  </h4>
                  {selectedUser.upcomingBookings.length > 0 ? (
                    <div className="space-y-2">
                      {selectedUser.upcomingBookings.map((booking) => (
                        <Card key={booking.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-slate-900">{booking.venue}</p>
                              <p className="text-slate-600 text-sm">
                                {booking.court} • {new Date(booking.date).toLocaleDateString('en-GB')} at {booking.time}
                              </p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  {booking.duration} minutes
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  £{booking.cost.toFixed(2)}
                                </Badge>
                                <Badge 
                                  variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {booking.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="p-6 text-center bg-slate-50">
                      <Calendar className="size-8 mx-auto mb-2 text-slate-400" />
                      <p className="text-slate-600">No upcoming bookings</p>
                    </Card>
                  )}
                </div>

                {/* Connected Accounts */}
                <div>
                  <h4 className="text-slate-900 mb-3">
                    Connected Accounts ({selectedUser.connectedAccounts.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.connectedAccounts.map((account, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        <ShieldCheck className="size-3 mr-1" />
                        {account}
                      </Badge>
                    ))}
                    {selectedUser.connectedAccounts.length === 0 && (
                      <Card className="p-4 text-center bg-slate-50 w-full">
                        <p className="text-slate-600">No connected accounts</p>
                      </Card>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Venue Edit/Add Dialog */}
      <Dialog 
        open={isEditingVenue || isAddingVenue} 
        onOpenChange={() => {
          setIsEditingVenue(false);
          setIsAddingVenue(false);
          setEditedVenue(null);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {editedVenue && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {isAddingVenue ? 'Add New Venue' : 'Edit Venue'}
                </DialogTitle>
                <DialogDescription>
                  {isAddingVenue 
                    ? 'Create a new venue with court details and pricing'
                    : `Manage ${editedVenue.name}`
                  }
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Basic Info */}
                <Card className="p-6">
                  <h4 className="text-slate-900 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="venue-name">Venue Name *</Label>
                      <Input
                        id="venue-name"
                        value={editedVenue.name}
                        onChange={(e) => setEditedVenue({ ...editedVenue, name: e.target.value })}
                        placeholder="Enter venue name"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="venue-address">Address *</Label>
                      <Input
                        id="venue-address"
                        value={editedVenue.address}
                        onChange={(e) => setEditedVenue({ ...editedVenue, address: e.target.value })}
                        placeholder="Street address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="venue-city">City *</Label>
                      <Input
                        id="venue-city"
                        value={editedVenue.city}
                        onChange={(e) => setEditedVenue({ ...editedVenue, city: e.target.value })}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <Label htmlFor="venue-postcode">Postcode</Label>
                      <Input
                        id="venue-postcode"
                        value={editedVenue.postcode}
                        onChange={(e) => setEditedVenue({ ...editedVenue, postcode: e.target.value })}
                        placeholder="Postcode"
                      />
                    </div>
                    <div>
                      <Label htmlFor="venue-email">Contact Email</Label>
                      <Input
                        id="venue-email"
                        type="email"
                        value={editedVenue.contactEmail}
                        onChange={(e) => setEditedVenue({ ...editedVenue, contactEmail: e.target.value })}
                        placeholder="contact@venue.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="venue-phone">Contact Phone</Label>
                      <Input
                        id="venue-phone"
                        type="tel"
                        value={editedVenue.contactPhone}
                        onChange={(e) => setEditedVenue({ ...editedVenue, contactPhone: e.target.value })}
                        placeholder="+44 20 1234 5678"
                      />
                    </div>
                  </div>
                </Card>

                {/* Operating Hours & Pricing */}
                <Card className="p-6">
                  <h4 className="text-slate-900 mb-4">Operating Hours & Pricing</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="opening-time">Opening Time</Label>
                      <Input
                        id="opening-time"
                        type="time"
                        value={editedVenue.openingTime}
                        onChange={(e) => setEditedVenue({ ...editedVenue, openingTime: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="closing-time">Closing Time</Label>
                      <Input
                        id="closing-time"
                        type="time"
                        value={editedVenue.closingTime}
                        onChange={(e) => setEditedVenue({ ...editedVenue, closingTime: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="peak-price">Peak Hour Price (£/30min)</Label>
                      <Input
                        id="peak-price"
                        type="number"
                        min="0"
                        step="0.5"
                        value={editedVenue.peakHourPrice}
                        onChange={(e) => setEditedVenue({ ...editedVenue, peakHourPrice: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="offpeak-price">Off-Peak Price (£/30min)</Label>
                      <Input
                        id="offpeak-price"
                        type="number"
                        min="0"
                        step="0.5"
                        value={editedVenue.offPeakHourPrice}
                        onChange={(e) => setEditedVenue({ ...editedVenue, offPeakHourPrice: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="cancellation-cutoff">
                        <Clock className="size-4 inline mr-2" />
                        Cancellation Cut-off (hours before booking)
                      </Label>
                      <Input
                        id="cancellation-cutoff"
                        type="number"
                        min="0"
                        value={editedVenue.cancellationCutoff}
                        onChange={(e) => setEditedVenue({ ...editedVenue, cancellationCutoff: parseInt(e.target.value) || 0 })}
                      />
                      <p className="text-slate-500 text-xs mt-1">
                        Users must cancel at least this many hours before to get a refund
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Courts */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-slate-900">Courts ({editedVenue.courts.length})</h4>
                    <Button size="sm" onClick={handleAddCourt}>
                      <Plus className="size-4 mr-2" />
                      Add Court
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {editedVenue.courts.map((court, index) => (
                      <Card key={court.id} className="p-4 bg-slate-50">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-slate-900">Court {index + 1}</Label>
                            {editedVenue.courts.length > 1 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteCourt(court.id)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor={`court-name-${court.id}`} className="text-xs">Name</Label>
                              <Input
                                id={`court-name-${court.id}`}
                                value={court.name}
                                onChange={(e) => handleUpdateCourt(court.id, { name: e.target.value })}
                                placeholder="Court 1"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`court-surface-${court.id}`} className="text-xs">
                                <Layers className="size-3 inline mr-1" />
                                Surface
                              </Label>
                              <Select
                                value={court.surface}
                                onValueChange={(value) => handleUpdateCourt(court.id, { surface: value as Court['surface'] })}
                              >
                                <SelectTrigger id={`court-surface-${court.id}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="hard">Hard Court</SelectItem>
                                  <SelectItem value="clay">Clay Court</SelectItem>
                                  <SelectItem value="grass">Grass Court</SelectItem>
                                  <SelectItem value="carpet">Carpet Court</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                            <div className="flex items-center gap-2">
                              <Zap className="size-4 text-yellow-600" />
                              <Label htmlFor={`court-floodlights-${court.id}`} className="text-sm cursor-pointer">
                                Has Floodlights
                              </Label>
                            </div>
                            <Switch
                              id={`court-floodlights-${court.id}`}
                              checked={court.hasFloodlights}
                              onCheckedChange={(checked) => handleUpdateCourt(court.id, { hasFloodlights: checked })}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              </div>

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditingVenue(false);
                    setIsAddingVenue(false);
                    setEditedVenue(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveVenue}>
                  <Save className="size-4 mr-2" />
                  {isAddingVenue ? 'Add Venue' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}