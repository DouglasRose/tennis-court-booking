import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

export function DocumentationContent() {
  return (
    <div className="space-y-6">
      {/* System Overview */}
      <Card className="p-6">
        <h2 className="text-slate-900 mb-4">Tennis Court Booking System - Complete Documentation</h2>
        <p className="text-slate-600 mb-4">
          This is a comprehensive tennis court booking web application built with React, TypeScript, and Tailwind CSS. 
          The system provides unified booking capabilities, intelligent automation, and advanced features for managing 
          court reservations at tennis venues.
        </p>
        <Badge variant="secondary">Last Updated: November 25, 2024</Badge>
      </Card>

      {/* Core Features */}
      <Card className="p-6">
        <h3 className="text-slate-900 mb-4">1. Booking System</h3>
        <Separator className="mb-4" />
        
        <div className="space-y-6">
          <div>
            <h4 className="text-slate-900 mb-2">1.1 Unified Booking Logic</h4>
            <p className="text-slate-600 mb-3">
              The system automatically determines the appropriate booking type based on slot availability:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li><strong>Instant Booking:</strong> For slots that are currently available - books immediately</li>
              <li><strong>Scheduled Auto-Booking:</strong> For slots that aren't available yet but will open 7 days before at 8pm - automatically books when the window opens</li>
              <li><strong>Monitoring for Cancellations:</strong> For fully booked slots - continuously monitors and books if someone cancels</li>
            </ul>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-900 text-sm">
                <strong>Frontend Logic:</strong> The booking type is determined in BookingCalendar.tsx by comparing the selected date 
                with the current date and checking court availability. The calculateBookingType() function handles this logic.
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-slate-900 mb-2">1.2 Court Selection & Duration</h4>
            <p className="text-slate-600 mb-3">
              Interactive court selector with visual availability indicators:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li>30-minute increment bookings from 8:00 AM to 7:30 PM</li>
              <li>Multi-duration support (30min, 60min, 90min, 120min)</li>
              <li>Visual court grid showing all 4 courts with availability status</li>
              <li>Real-time cost calculation based on duration and peak/off-peak pricing</li>
            </ul>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-900 text-sm">
                <strong>Frontend Logic:</strong> InteractiveCourtSelector.tsx manages court selection state. 
                The component validates that consecutive time slots are available for multi-slot bookings and 
                calculates total cost by summing individual slot prices.
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-slate-900 mb-2">1.3 Pricing System</h4>
            <p className="text-slate-600 mb-3">
              Dynamic pricing based on time of day:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li><strong>Off-Peak Hours:</strong> £10 per 30-minute slot (8:00 AM - 5:00 PM weekdays)</li>
              <li><strong>Peak Hours:</strong> £15 per 30-minute slot (5:00 PM onwards and weekends)</li>
              <li>Price displayed on individual time slot badges and booking dialogs</li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 mb-2">1.4 Recurring Bookings</h4>
            <p className="text-slate-600 mb-3">
              Set up repeating bookings with flexible scheduling:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li>Weekly, bi-weekly, or monthly patterns</li>
              <li>Select specific days of the week</li>
              <li>Set end date or number of occurrences</li>
              <li>Automatic scheduling for all recurring slots</li>
            </ul>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-900 text-sm">
                <strong>Frontend Logic:</strong> RecurringBookingDialog.tsx generates dates based on the selected pattern 
                and creates individual bookings for each occurrence. The generateRecurringDates() function handles date calculation.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Automation Features */}
      <Card className="p-6">
        <h3 className="text-slate-900 mb-4">2. Automation Features</h3>
        <Separator className="mb-4" />
        
        <div className="space-y-6">
          <div>
            <h4 className="text-slate-900 mb-2">2.1 Auto-Booking Settings</h4>
            <p className="text-slate-600 mb-3">
              Automatically books slots when booking windows open (7 days before at 8pm):
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li>Preferred courts selection (primary and backup options)</li>
              <li>Preferred time slots (morning, afternoon, evening)</li>
              <li>Preferred days of the week</li>
              <li>System automatically attempts booking at the scheduled time</li>
            </ul>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-900 text-sm">
                <strong>Frontend Logic:</strong> AutomationSettings.tsx stores user preferences in component state. 
                In a production environment, these would trigger backend jobs using scheduling libraries like node-cron 
                or cloud functions that execute at the specified booking window times.
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-slate-900 mb-2">2.2 Auto-Cancel Settings</h4>
            <p className="text-slate-600 mb-3">
              Automatically cancels bookings based on specific conditions:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li><strong>Weather Conditions:</strong> Cancel if temperature too cold (below 5°C), too hot (above 30°C), high chance of rain (above 70%), or windy (above 40 km/h)</li>
              <li><strong>Court Availability:</strong> Cancel if many courts become available (e.g., 3+ courts), suggesting free play opportunities</li>
              <li>Configurable thresholds for all conditions</li>
              <li>Weather data fetched from Open-Meteo API</li>
            </ul>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-900 text-sm">
                <strong>Frontend Logic:</strong> AutoCancelSettings.tsx manages cancellation preferences. Weather forecasts 
                are fetched in BookingsPage.tsx using the checkWeatherForBookings() function. The system evaluates each 
                booking against user-defined thresholds and triggers cancellation if conditions are met.
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-slate-900 mb-2">2.3 Auto-Rebook Feature</h4>
            <p className="text-slate-600 mb-3">
              Automatically re-books slots that were auto-cancelled:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li>Monitors court availability after cancellation</li>
              <li>Re-books when available court count drops below threshold</li>
              <li>Configurable availability threshold (default: 2 courts)</li>
              <li>Prevents unnecessary cancellations when courts fill up again</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Weather Integration */}
      <Card className="p-6">
        <h3 className="text-slate-900 mb-4">3. Weather Integration</h3>
        <Separator className="mb-4" />
        
        <div className="space-y-4">
          <p className="text-slate-600">
            Real-time weather forecasting using Open-Meteo API:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
            <li>7-day hourly weather forecasts</li>
            <li>Temperature, precipitation probability, and wind speed data</li>
            <li>Weather icons and condition descriptions</li>
            <li>Displayed on booking cards for informed decision-making</li>
          </ul>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-900 text-sm">
              <strong>Frontend Logic:</strong> WeatherForecast.tsx fetches weather data using the Open-Meteo API 
              (https://api.open-meteo.com/v1/forecast). The component parses hourly forecast data and matches it 
              with booking times to show relevant weather conditions. Weather icons are dynamically selected based 
              on precipitation probability and cloud cover.
            </p>
          </div>
        </div>
      </Card>

      {/* User Management */}
      <Card className="p-6">
        <h3 className="text-slate-900 mb-4">4. User Management & Authentication</h3>
        <Separator className="mb-4" />
        
        <div className="space-y-6">
          <div>
            <h4 className="text-slate-900 mb-2">4.1 Authentication System</h4>
            <p className="text-slate-600 mb-3">
              Mock authentication with multiple sign-in options:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li>Email/password authentication</li>
              <li>OAuth providers: Google, Apple, Facebook, Microsoft</li>
              <li>Multi-step OTP verification for email and mobile</li>
              <li>Phone number validation with country selection (50+ countries)</li>
            </ul>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-900 text-sm">
                <strong>Frontend Logic:</strong> AuthPage.tsx manages authentication flows. The component uses React state 
                to track verification steps and mock the OTP process. In production, this would integrate with authentication 
                services like Firebase Auth, Auth0, or custom backend APIs.
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-slate-900 mb-2">4.2 Profile Management</h4>
            <p className="text-slate-600 mb-3">
              Comprehensive user profile with multiple sections:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li>Personal information (name, email, phone, location)</li>
              <li>Profile picture upload and editing</li>
              <li>Connected calendar accounts (Gmail, Outlook, Apple Calendar)</li>
              <li>Secure password generation for calendar integrations</li>
              <li>Friend connections and social features</li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 mb-2">4.3 Connected Accounts</h4>
            <p className="text-slate-600 mb-3">
              Calendar integration for automatic booking sync:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li>OAuth connection to Gmail, Outlook, Apple Calendar</li>
              <li>Automatic calendar event creation for bookings</li>
              <li>Secure app-specific password generation</li>
              <li>Real-time sync status indicators</li>
            </ul>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-900 text-sm">
                <strong>Frontend Logic:</strong> ConnectedAccountsSection.tsx manages OAuth flows and calendar connections. 
                The generateSecurePassword() function creates app-specific passwords. In production, calendar API integrations 
                would use Google Calendar API, Microsoft Graph API, and CalDAV for Apple Calendar.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Social Features */}
      <Card className="p-6">
        <h3 className="text-slate-900 mb-4">5. Social & Community Features</h3>
        <Separator className="mb-4" />
        
        <div className="space-y-6">
          <div>
            <h4 className="text-slate-900 mb-2">5.1 Connect with Friends</h4>
            <p className="text-slate-600 mb-3">
              Find and connect with other players:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li>Search for users by name or email</li>
              <li>View friend profiles and booking history</li>
              <li>Send and manage friend requests</li>
              <li>See friends' upcoming bookings (with privacy controls)</li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 mb-2">5.2 Notifications</h4>
            <p className="text-slate-600 mb-3">
              Real-time notification system:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li>Booking confirmations and cancellations</li>
              <li>Auto-booking success/failure notifications</li>
              <li>Weather alerts for upcoming bookings</li>
              <li>Friend request notifications</li>
              <li>System updates and announcements</li>
            </ul>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-900 text-sm">
                <strong>Frontend Logic:</strong> Notifications are managed in App.tsx using React state. The NotificationBell 
                component displays unread count and notification list. In production, this would integrate with push notification 
                services like Firebase Cloud Messaging or web push APIs.
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-slate-900 mb-2">5.3 Referral System</h4>
            <p className="text-slate-600 mb-3">
              Invite friends and earn rewards:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li>Unique referral code for each user</li>
              <li>£10 credit for referrer and referee</li>
              <li>Share via email, social media, or direct link</li>
              <li>Track referral stats and rewards earned</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Payment & Billing */}
      <Card className="p-6">
        <h3 className="text-slate-900 mb-4">6. Payment & Billing System</h3>
        <Separator className="mb-4" />
        
        <div className="space-y-6">
          <div>
            <h4 className="text-slate-900 mb-2">6.1 Account Balance</h4>
            <p className="text-slate-600 mb-3">
              Prepaid account system for faster bookings:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li>Top-up account with £5-£500</li>
              <li>Quick top-up buttons (£10, £20, £50, £100)</li>
              <li>Balance synchronized across entire application</li>
              <li>Automatic deduction on booking</li>
            </ul>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-900 text-sm">
                <strong>Frontend Logic:</strong> Balance is managed in App.tsx and passed to components via props. 
                The onBalanceChange callback updates the global balance state, which triggers re-renders across all 
                components displaying balance information (ProfilePage, BookingCalendar, BillingSection).
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-slate-900 mb-2">6.2 Auto Top-Up</h4>
            <p className="text-slate-600 mb-3">
              Never run out of credit:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li>Set threshold amount (£5-£100)</li>
              <li>Configure top-up amount (£10-£500)</li>
              <li>Automatic charging to default payment method</li>
              <li>Email notifications for auto top-ups</li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 mb-2">6.3 Payment Methods</h4>
            <p className="text-slate-600 mb-3">
              Multiple payment options:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li>Credit/debit cards (Visa, Mastercard, Amex)</li>
              <li>Digital wallets (Google Pay, Apple Pay)</li>
              <li>Set default payment method</li>
              <li>Secure card management with CVV verification</li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 mb-2">6.4 Invoices & Billing History</h4>
            <p className="text-slate-600 mb-3">
              Complete transaction history:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li>Downloadable PDF invoices</li>
              <li>Detailed billing breakdown</li>
              <li>Payment status tracking</li>
              <li>Billing details management</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Venue Management */}
      <Card className="p-6">
        <h3 className="text-slate-900 mb-4">7. Venue Management</h3>
        <Separator className="mb-4" />
        
        <div className="space-y-6">
          <div>
            <h4 className="text-slate-900 mb-2">7.1 Venue Selection</h4>
            <p className="text-slate-600 mb-3">
              Smart venue selection with location awareness:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li>Searchable venue dropdown</li>
              <li>Automatic location detection via browser geolocation API</li>
              <li>Venues sorted by proximity to user location</li>
              <li>Venue details: address, courts, pricing, hours</li>
            </ul>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-900 text-sm">
                <strong>Frontend Logic:</strong> VenueSelector.tsx uses the Geolocation API to get user coordinates. 
                The calculateDistance() function computes distances using the Haversine formula and sorts venues accordingly. 
                The component maintains selected venue state and passes it up to parent components.
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-slate-900 mb-2">7.2 Timezone Support</h4>
            <p className="text-slate-600 mb-3">
              Prevents booking past time slots:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li>Each venue has configured timezone</li>
              <li>Helper functions convert times to venue timezone</li>
              <li>Past slots automatically hidden from UI</li>
              <li>Calendar auto-advances if all slots on current date are past</li>
            </ul>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-900 text-sm">
                <strong>Frontend Logic:</strong> timezoneHelpers.ts contains utility functions (isSlotInPast, getVenueDateTime) 
                that use the date-fns-tz library for timezone conversions. BookingCalendar and CourtScheduleView components 
                filter out past slots before rendering.
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-slate-900 mb-2">7.3 Court Configuration</h4>
            <p className="text-slate-600 mb-3">
              Flexible court setup:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li>Multiple court types (hard, clay, grass, carpet)</li>
              <li>Floodlight availability</li>
              <li>Individual court naming</li>
              <li>Operating hours configuration</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Admin Panel */}
      <Card className="p-6">
        <h3 className="text-slate-900 mb-4">8. Admin Panel</h3>
        <Separator className="mb-4" />
        
        <div className="space-y-6">
          <div>
            <h4 className="text-slate-900 mb-2">8.1 User Management</h4>
            <p className="text-slate-600 mb-3">
              Comprehensive user administration:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li>View all users with search functionality</li>
              <li>User details: bookings, connected accounts, spending</li>
              <li>User status management (active, suspended, deleted)</li>
              <li>Last login tracking</li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 mb-2">8.2 Venue Management</h4>
            <p className="text-slate-600 mb-3">
              Complete venue administration:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li>Add, edit, delete venues</li>
              <li>Configure courts (add, remove, modify)</li>
              <li>Set pricing (peak and off-peak rates)</li>
              <li>Operating hours management</li>
              <li>Cancellation policy settings</li>
            </ul>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-900 text-sm">
                <strong>Frontend Logic:</strong> AdminPanel.tsx manages venue CRUD operations using React state. 
                Form validation ensures required fields are filled. The handleSaveVenue() function updates the venues 
                array and shows success toasts. In production, these operations would make API calls to a backend service.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Technical Architecture */}
      <Card className="p-6">
        <h3 className="text-slate-900 mb-4">9. Technical Architecture</h3>
        <Separator className="mb-4" />
        
        <div className="space-y-6">
          <div>
            <h4 className="text-slate-900 mb-2">9.1 Frontend Stack</h4>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li><strong>React 18:</strong> Component-based UI with hooks</li>
              <li><strong>TypeScript:</strong> Type-safe development</li>
              <li><strong>Tailwind CSS:</strong> Utility-first styling</li>
              <li><strong>Lucide React:</strong> Icon library</li>
              <li><strong>date-fns & date-fns-tz:</strong> Date manipulation and timezone handling</li>
              <li><strong>Sonner:</strong> Toast notifications</li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 mb-2">9.2 Component Structure</h4>
            <p className="text-slate-600 mb-3">
              Modular component architecture:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li><strong>App.tsx:</strong> Main application component managing global state (user, balance, bookings)</li>
              <li><strong>BookingCalendar.tsx:</strong> Primary booking interface with date/time selection</li>
              <li><strong>CourtScheduleView.tsx:</strong> Alternative schedule-style booking view</li>
              <li><strong>BookingsPage.tsx:</strong> Manage existing bookings with weather and auto-cancel</li>
              <li><strong>ProfilePage.tsx:</strong> User profile and settings</li>
              <li><strong>AdminPanel.tsx:</strong> Administrative interface</li>
              <li><strong>UI Components:</strong> Reusable components in /components/ui (buttons, dialogs, cards, etc.)</li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 mb-2">9.3 State Management</h4>
            <p className="text-slate-600 mb-3">
              React state and props pattern:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li>Global state managed in App.tsx (user, balance, bookings, notifications)</li>
              <li>Props drilling for shared state between components</li>
              <li>Local component state for UI-specific logic</li>
              <li>Callback functions for state updates passed down to children</li>
            </ul>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-900 text-sm">
                <strong>State Flow Example:</strong> When a user books a court, BookingCalendar calls onAddBooking() 
                which updates the bookings array in App.tsx. This triggers re-renders in BookingsPage and balance updates 
                in ProfilePage and BillingSection.
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-slate-900 mb-2">9.4 Mobile Responsiveness</h4>
            <p className="text-slate-600 mb-3">
              Fully responsive design:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li>Tailwind responsive classes (sm:, md:, lg:, xl:)</li>
              <li>Mobile-first approach</li>
              <li>Touch-friendly interactive elements</li>
              <li>Optimized layouts for phones, tablets, and desktops</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* API Integrations */}
      <Card className="p-6">
        <h3 className="text-slate-900 mb-4">10. External Integrations</h3>
        <Separator className="mb-4" />
        
        <div className="space-y-6">
          <div>
            <h4 className="text-slate-900 mb-2">10.1 Weather API</h4>
            <p className="text-slate-600 mb-3">
              Open-Meteo weather forecasting:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li>Free, no API key required</li>
              <li>Endpoint: https://api.open-meteo.com/v1/forecast</li>
              <li>Hourly forecasts for temperature, precipitation, wind</li>
              <li>Fetched in WeatherForecast component</li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 mb-2">10.2 Geolocation API</h4>
            <p className="text-slate-600 mb-3">
              Browser-based location detection:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li>navigator.geolocation.getCurrentPosition()</li>
              <li>User permission required</li>
              <li>Returns latitude and longitude</li>
              <li>Used for venue proximity sorting</li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 mb-2">10.3 Calendar APIs (Production)</h4>
            <p className="text-slate-600 mb-3">
              For production implementation:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li><strong>Google Calendar API:</strong> OAuth 2.0, event creation/sync</li>
              <li><strong>Microsoft Graph API:</strong> Outlook calendar integration</li>
              <li><strong>CalDAV:</strong> Apple Calendar integration</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Future Enhancements */}
      <Card className="p-6">
        <h3 className="text-slate-900 mb-4">11. Production Considerations</h3>
        <Separator className="mb-4" />
        
        <div className="space-y-4">
          <p className="text-slate-600">
            For production deployment, consider implementing:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
            <li><strong>Backend API:</strong> Node.js/Express, Python/Django, or Ruby/Rails for booking logic</li>
            <li><strong>Database:</strong> PostgreSQL or MongoDB for storing users, bookings, venues</li>
            <li><strong>Authentication:</strong> Firebase Auth, Auth0, or custom JWT-based system</li>
            <li><strong>Payment Processing:</strong> Stripe or PayPal integration</li>
            <li><strong>Real-time Updates:</strong> WebSockets or Server-Sent Events for live availability</li>
            <li><strong>Email Service:</strong> SendGrid, AWS SES, or Mailgun for transactional emails</li>
            <li><strong>SMS Service:</strong> Twilio for OTP verification and notifications</li>
            <li><strong>Job Scheduling:</strong> node-cron, Bull, or AWS Lambda for automated tasks</li>
            <li><strong>File Storage:</strong> AWS S3 or Cloudinary for user uploads</li>
            <li><strong>Analytics:</strong> Google Analytics, Mixpanel for user behavior tracking</li>
            <li><strong>Error Tracking:</strong> Sentry for production error monitoring</li>
            <li><strong>CDN:</strong> Cloudflare or AWS CloudFront for asset delivery</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}