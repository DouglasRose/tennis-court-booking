import { useState, useEffect, useMemo } from 'react';
import { Button, buttonVariants } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { MapPin, Navigation, Search, Loader2, AlertCircle, ChevronDown, Check, X } from 'lucide-react';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { Alert, AlertDescription } from './ui/alert';
import { cn } from './ui/utils';

interface VenueSelectProps {
  venues: Venue[];
  selectedVenue: string;
  onVenueChange: (venueId: string) => void;
}

interface VenueWithDistance extends Venue {
  distance?: number; // in miles
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

export function VenueSelect({ venues, selectedVenue, onVenueChange }: VenueSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');

  // Check permission status on mount
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        setPermissionState(result.state as 'prompt' | 'granted' | 'denied');
        
        // Listen for permission changes
        result.onchange = () => {
          setPermissionState(result.state as 'prompt' | 'granted' | 'denied');
        };
      }).catch(() => {
        // Some browsers don't support permissions query
        setPermissionState('unknown');
      });
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-venue-select]')) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Get user's location
  const getUserLocation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      toast.error('Geolocation not supported');
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLoadingLocation(false);
        setPermissionState('granted');
        toast.success('Location detected');
      },
      (error) => {
        let message = 'Unable to get your location';
        let detailedMessage = '';
        
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Location permission denied';
          detailedMessage = 'Please enable location access in your browser settings to see distances.';
          setPermissionState('denied');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = 'Location information unavailable';
          detailedMessage = 'Your device cannot determine your location at this time.';
        } else if (error.code === error.TIMEOUT) {
          message = 'Location request timed out';
          detailedMessage = 'Please try again.';
        }
        
        setLocationError(message);
        setIsLoadingLocation(false);
        toast.error(message, {
          description: detailedMessage,
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  // Calculate distances and sort venues
  const venuesWithDistance: VenueWithDistance[] = useMemo(() => {
    if (!userLocation) {
      return venues;
    }

    return venues
      .map((venue) => ({
        ...venue,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          venue.latitude,
          venue.longitude
        ),
      }))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [venues, userLocation]);

  // Filter venues based on search query
  const filteredVenues = useMemo(() => {
    if (!searchQuery.trim()) {
      return venuesWithDistance;
    }

    const query = searchQuery.toLowerCase();
    return venuesWithDistance.filter(
      (venue) =>
        venue.name.toLowerCase().includes(query) ||
        venue.address.toLowerCase().includes(query)
    );
  }, [venuesWithDistance, searchQuery]);

  const selectedVenueData = venuesWithDistance.find((v) => v.id === selectedVenue);

  const handleVenueSelect = (venueId: string) => {
    onVenueChange(venueId);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="space-y-2" data-venue-select>
      <div className="relative">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setOpen(!open)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setOpen(!open);
            }
          }}
          className={cn(buttonVariants({ variant: "outline" }), "w-full justify-between h-auto py-2.5 px-3 cursor-pointer")}
        >
          <div className="flex items-center gap-2 truncate">
            <MapPin className="size-4 text-slate-400 flex-shrink-0" />
            <div className="truncate text-left">
              {selectedVenueData ? (
                <div className="flex items-center gap-2">
                  <span className="truncate">{selectedVenueData.name}</span>
                  {selectedVenueData.distance !== undefined && (
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      {selectedVenueData.distance} mi
                    </Badge>
                  )}
                </div>
              ) : (
                'Select venue...'
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            {!userLocation && !isLoadingLocation && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={getUserLocation}
                className="h-auto py-1 px-2 text-xs"
              >
                <Navigation className="size-3 mr-1" />
                Detect
              </Button>
            )}
            {isLoadingLocation && (
              <div className="flex items-center gap-1 text-xs text-slate-600">
                <Loader2 className="size-3 animate-spin" />
              </div>
            )}
            {userLocation && (
              <Badge variant="secondary" className="text-xs">
                <Navigation className="size-3 mr-1" />
                Detected
              </Badge>
            )}
            <ChevronDown className={cn("size-4 transition-transform", open && "transform rotate-180")} />
          </div>
        </div>

        {open && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-[400px] md:max-h-[500px] flex flex-col">
            {/* Search Input */}
            <div className="p-2 sm:p-3 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search venues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8 h-10 sm:h-9"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded touch-manipulation"
                  >
                    <X className="size-4 sm:size-3 text-slate-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Venue List */}
            <div className="overflow-y-auto">
              {filteredVenues.length === 0 ? (
                <div className="p-6 sm:p-8 text-center text-slate-500 text-sm">
                  No venues found
                </div>
              ) : (
                <div className="p-1.5 sm:p-2">
                  {filteredVenues.map((venue) => (
                    <button
                      key={venue.id}
                      type="button"
                      onClick={() => handleVenueSelect(venue.id)}
                      className={cn(
                        "w-full text-left p-3 sm:p-3 md:p-3 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors flex items-start gap-2.5 sm:gap-3 touch-manipulation min-h-[60px] sm:min-h-0",
                        selectedVenue === venue.id && "bg-blue-50 hover:bg-blue-100"
                      )}
                    >
                      <MapPin className="size-4 sm:size-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-slate-900 truncate text-sm sm:text-base">{venue.name}</p>
                          {venue.distance !== undefined && (
                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                              {venue.distance} mi
                            </Badge>
                          )}
                        </div>
                        <p className="text-slate-600 text-xs sm:text-xs truncate">{venue.address}</p>
                        <p className="text-slate-500 text-xs mt-1">
                          {venue.numCourts} {venue.numCourts === 1 ? 'court' : 'courts'}
                        </p>
                      </div>
                      {selectedVenue === venue.id && (
                        <Check className="size-4 sm:size-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {userLocation && (
        <p className="text-xs text-slate-600">
          Venues sorted by distance from your location
        </p>
      )}
      
      {locationError && permissionState === 'denied' && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="size-4 text-amber-600" />
          <AlertDescription className="text-amber-900 text-sm">
            <strong>Location access blocked.</strong> To see distances, please enable location permissions in your browser:
            <ul className="list-disc ml-4 mt-1 text-xs">
              <li>Click the location icon in your address bar</li>
              <li>Select "Allow" or "Always allow"</li>
              <li>Refresh the page and try again</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}