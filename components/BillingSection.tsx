import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Star, 
  Download, 
  Receipt,
  Wallet,
  MapPin,
  Building2,
  Globe,
  Mail,
  User,
  CheckCircle2,
  ArrowUpCircle,
  Edit2
} from 'lucide-react';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';

interface PaymentMethod {
  id: string;
  type: 'card' | 'google-pay' | 'apple-pay';
  brand?: string;
  last4?: string;
  expiryMonth?: string;
  expiryYear?: string;
  isDefault: boolean;
  email?: string;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  description: string;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl?: string;
}

interface BillingDetails {
  fullName: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
  country: string;
}

interface BillingSectionProps {
  balance: number;
  onBalanceChange: (newBalance: number) => void;
}

export function BillingSection({ balance, onBalanceChange }: BillingSectionProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      brand: 'Visa',
      last4: '4242',
      expiryMonth: '12',
      expiryYear: '2025',
      isDefault: true,
    },
    {
      id: '2',
      type: 'card',
      brand: 'Mastercard',
      last4: '5555',
      expiryMonth: '08',
      expiryYear: '2026',
      isDefault: false,
    },
    {
      id: '3',
      type: 'google-pay',
      email: 'user@gmail.com',
      isDefault: false,
    },
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'INV-001',
      date: '2024-11-15',
      amount: 30,
      description: 'Court booking - 2 sessions',
      status: 'paid',
    },
    {
      id: 'INV-002',
      date: '2024-11-08',
      amount: 45,
      description: 'Court booking - 3 sessions',
      status: 'paid',
    },
    {
      id: 'INV-003',
      date: '2024-11-01',
      amount: 15,
      description: 'Court booking - 1 session',
      status: 'paid',
    },
  ]);

  const [billingDetails, setBillingDetails] = useState<BillingDetails>({
    fullName: 'John Smith',
    email: 'john.smith@example.com',
    addressLine1: '123 Tennis Court Road',
    addressLine2: 'Flat 4B',
    city: 'London',
    postcode: 'SW1A 1AA',
    country: 'United Kingdom',
  });

  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [isBillingDetailsOpen, setIsBillingDetailsOpen] = useState(false);
  const [isTopUpDialogOpen, setIsTopUpDialogOpen] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<'card' | 'google-pay' | 'apple-pay'>('card');
  
  // New payment method form
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    nameOnCard: '',
  });

  // Top-up form
  const [topUpAmount, setTopUpAmount] = useState('');
  
  // Auto top-up settings
  const [autoTopUpEnabled, setAutoTopUpEnabled] = useState(false);
  const [autoTopUpThreshold, setAutoTopUpThreshold] = useState('10');
  const [autoTopUpAmount, setAutoTopUpAmount] = useState('50');
  const [isEditingAutoTopUp, setIsEditingAutoTopUp] = useState(false);

  const handleSetDefault = (id: string) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id,
    })));
    toast.success('Default payment method updated');
  };

  const handleDeletePayment = (id: string) => {
    const method = paymentMethods.find(m => m.id === id);
    if (method?.isDefault && paymentMethods.length > 1) {
      toast.error('Cannot delete default payment method. Set another as default first.');
      return;
    }
    setPaymentMethods(paymentMethods.filter(method => method.id !== id));
    toast.success('Payment method removed');
  };

  const handleAddPaymentMethod = () => {
    if (selectedPaymentType === 'card') {
      if (!newCard.cardNumber || !newCard.expiryMonth || !newCard.expiryYear || !newCard.cvv || !newCard.nameOnCard) {
        toast.error('Please fill in all card details');
        return;
      }
      
      const newPaymentMethod: PaymentMethod = {
        id: Math.random().toString(36).substring(7),
        type: 'card',
        brand: newCard.cardNumber.startsWith('4') ? 'Visa' : 'Mastercard',
        last4: newCard.cardNumber.slice(-4),
        expiryMonth: newCard.expiryMonth,
        expiryYear: newCard.expiryYear,
        isDefault: paymentMethods.length === 0,
      };
      
      setPaymentMethods([...paymentMethods, newPaymentMethod]);
      setNewCard({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        nameOnCard: '',
      });
      setIsAddingPayment(false);
      toast.success('Payment method added successfully');
    } else {
      // Mock digital wallet connection
      const newPaymentMethod: PaymentMethod = {
        id: Math.random().toString(36).substring(7),
        type: selectedPaymentType,
        email: selectedPaymentType === 'google-pay' ? 'user@gmail.com' : 'user@icloud.com',
        isDefault: paymentMethods.length === 0,
      };
      
      setPaymentMethods([...paymentMethods, newPaymentMethod]);
      setIsAddingPayment(false);
      toast.success(`${selectedPaymentType === 'google-pay' ? 'Google Pay' : 'Apple Pay'} connected successfully`);
    }
  };

  const handleTopUp = () => {
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount < 5 || amount > 500) {
      toast.error('Please enter an amount between £5 and £500');
      return;
    }
    
    onBalanceChange(balance + amount);
    setTopUpAmount('');
    setIsTopUpDialogOpen(false);
    toast.success(`Account topped up with £${amount.toFixed(2)}`);
  };

  const handleSaveBillingDetails = () => {
    setIsEditingBilling(false);
    toast.success('Billing details updated');
  };

  const getCardIcon = (brand?: string) => {
    return <CreditCard className="size-6" />;
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Account Balance Card with Auto Top-Up */}
      <Card className="p-6 bg-gradient-to-br from-blue-600 to-green-600 text-white">
        <div className="space-y-4">
          {/* Balance Display and Top Up Button */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 mb-1">Account Balance</p>
              <p className="text-white">£{balance.toFixed(2)}</p>
              <p className="text-blue-100 text-xs mt-2">Available for bookings</p>
            </div>
            <Dialog open={isTopUpDialogOpen} onOpenChange={setIsTopUpDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="gap-2">
                  <ArrowUpCircle className="size-4" />
                  Top Up
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Top Up Account Balance</DialogTitle>
                  <DialogDescription>
                    Add credit to your account for faster bookings. Minimum £5, maximum £500.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="topup-amount">Amount (£)</Label>
                    <Input
                      id="topup-amount"
                      type="number"
                      placeholder="50.00"
                      min="5"
                      max="500"
                      step="5"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    {[10, 20, 50, 100].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setTopUpAmount(amount.toString())}
                      >
                        £{amount}
                      </Button>
                    ))}
                  </div>
                  
                  {paymentMethods.length > 0 && (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-slate-600 text-sm mb-2">Payment will be charged to:</p>
                      <div className="flex items-center gap-2">
                        {paymentMethods.find(m => m.isDefault)?.type === 'card' ? (
                          <>
                            <CreditCard className="size-4" />
                            <span className="text-slate-900">
                              {paymentMethods.find(m => m.isDefault)?.brand} •••• {paymentMethods.find(m => m.isDefault)?.last4}
                            </span>
                          </>
                        ) : (
                          <>
                            <Wallet className="size-4" />
                            <span className="text-slate-900">
                              {paymentMethods.find(m => m.isDefault)?.type === 'google-pay' ? 'Google Pay' : 'Apple Pay'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsTopUpDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleTopUp}>
                    Top Up £{topUpAmount || '0.00'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Auto Top-Up Toggle and Settings */}
          <Separator className="bg-white/20" />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-white mb-1">
                  <Wallet className="size-4" />
                  <span>Auto Top-Up</span>
                </div>
                <p className="text-blue-100 text-sm">Automatically add funds when balance is low</p>
              </div>
              <Switch
                checked={autoTopUpEnabled}
                onCheckedChange={(checked) => {
                  setAutoTopUpEnabled(checked);
                  if (checked && paymentMethods.length === 0) {
                    toast.error('Please add a payment method first');
                    setAutoTopUpEnabled(false);
                    return;
                  }
                  toast.success(checked ? 'Auto top-up enabled' : 'Auto top-up disabled');
                }}
              />
            </div>

            {autoTopUpEnabled && (
              <>
                {isEditingAutoTopUp ? (
                  <div className="space-y-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="auto-threshold" className="text-blue-100">
                          When balance falls below
                        </Label>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-100">£</span>
                          <Input
                            id="auto-threshold"
                            type="number"
                            min="5"
                            max="100"
                            step="5"
                            value={autoTopUpThreshold}
                            onChange={(e) => setAutoTopUpThreshold(e.target.value)}
                            className="flex-1 bg-white/10 text-white placeholder:text-blue-200 border-white/30 focus:border-white/50"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="auto-amount" className="text-blue-100">
                          Top up by
                        </Label>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-100">£</span>
                          <Input
                            id="auto-amount"
                            type="number"
                            min="10"
                            max="500"
                            step="10"
                            value={autoTopUpAmount}
                            onChange={(e) => setAutoTopUpAmount(e.target.value)}
                            className="flex-1 bg-white/10 text-white placeholder:text-blue-200 border-white/30 focus:border-white/50"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                      <p className="text-white text-sm">
                        <CheckCircle2 className="size-4 inline mr-2" />
                        When your balance drops below £{autoTopUpThreshold || '0'}, we'll automatically charge your default payment method £{autoTopUpAmount || '0'}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          const threshold = parseFloat(autoTopUpThreshold);
                          const amount = parseFloat(autoTopUpAmount);
                          
                          if (isNaN(threshold) || threshold < 5 || threshold > 100) {
                            toast.error('Threshold must be between £5 and £100');
                            return;
                          }
                          
                          if (isNaN(amount) || amount < 10 || amount > 500) {
                            toast.error('Top-up amount must be between £10 and £500');
                            return;
                          }
                          
                          if (amount <= threshold) {
                            toast.error('Top-up amount should be greater than threshold');
                            return;
                          }
                          
                          setIsEditingAutoTopUp(false);
                          toast.success('Auto top-up settings saved');
                        }}
                      >
                        <CheckCircle2 className="size-4 mr-2" />
                        Save Settings
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/10 hover:bg-white/20 text-white border-white/30"
                        onClick={() => setIsEditingAutoTopUp(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-blue-100 text-sm">When balance falls below</p>
                            <p className="text-white">£{autoTopUpThreshold}</p>
                          </div>
                          <div className="text-blue-200">→</div>
                          <div>
                            <p className="text-blue-100 text-sm">Automatically add</p>
                            <p className="text-white">£{autoTopUpAmount}</p>
                          </div>
                        </div>
                        
                        {paymentMethods.find(m => m.isDefault) && (
                          <div className="flex items-center gap-2 text-sm text-blue-100">
                            <CreditCard className="size-4" />
                            <span>
                              Using {paymentMethods.find(m => m.isDefault)?.type === 'card' 
                                ? `${paymentMethods.find(m => m.isDefault)?.brand} •••• ${paymentMethods.find(m => m.isDefault)?.last4}`
                                : paymentMethods.find(m => m.isDefault)?.type === 'google-pay' ? 'Google Pay' : 'Apple Pay'
                              }
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setIsEditingAutoTopUp(true)}
                      >
                        <Edit2 className="size-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {!autoTopUpEnabled && (
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg border-2 border-dashed border-white/30">
                <p className="text-blue-100 text-sm">
                  Enable auto top-up to never run out of credit. We'll automatically add funds to your account when your balance gets low.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Payment Methods */}
      <Card className="p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-slate-900 mb-1">
                <CreditCard className="size-5 inline mr-2" />
                Payment Methods
              </h3>
              <p className="text-slate-600">Manage your payment methods and billing details</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isBillingDetailsOpen} onOpenChange={setIsBillingDetailsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Receipt className="size-4 mr-2" />
                    Billing Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Billing Details</DialogTitle>
                    <DialogDescription>
                      Manage your billing information for invoices
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto py-4">
                    <div>
                      <Label htmlFor="billing-name">
                        <User className="size-4 inline mr-2" />
                        Full Name
                      </Label>
                      <Input
                        id="billing-name"
                        value={billingDetails.fullName}
                        onChange={(e) => setBillingDetails({ ...billingDetails, fullName: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="billing-email">
                        <Mail className="size-4 inline mr-2" />
                        Email
                      </Label>
                      <Input
                        id="billing-email"
                        type="email"
                        value={billingDetails.email}
                        onChange={(e) => setBillingDetails({ ...billingDetails, email: e.target.value })}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="address-1">
                        <MapPin className="size-4 inline mr-2" />
                        Address Line 1
                      </Label>
                      <Input
                        id="address-1"
                        value={billingDetails.addressLine1}
                        onChange={(e) => setBillingDetails({ ...billingDetails, addressLine1: e.target.value })}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="address-2">Address Line 2 (Optional)</Label>
                      <Input
                        id="address-2"
                        value={billingDetails.addressLine2 || ''}
                        onChange={(e) => setBillingDetails({ ...billingDetails, addressLine2: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="city">
                        <Building2 className="size-4 inline mr-2" />
                        City
                      </Label>
                      <Input
                        id="city"
                        value={billingDetails.city}
                        onChange={(e) => setBillingDetails({ ...billingDetails, city: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="postcode">Postcode</Label>
                      <Input
                        id="postcode"
                        value={billingDetails.postcode}
                        onChange={(e) => setBillingDetails({ ...billingDetails, postcode: e.target.value })}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="country">
                        <Globe className="size-4 inline mr-2" />
                        Country
                      </Label>
                      <Select
                        value={billingDetails.country}
                        onValueChange={(value) => setBillingDetails({ ...billingDetails, country: value })}
                      >
                        <SelectTrigger id="country">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                          <SelectItem value="United States">United States</SelectItem>
                          <SelectItem value="Ireland">Ireland</SelectItem>
                          <SelectItem value="France">France</SelectItem>
                          <SelectItem value="Germany">Germany</SelectItem>
                          <SelectItem value="Spain">Spain</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsBillingDetailsOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => {
                      handleSaveBillingDetails();
                      setIsBillingDetailsOpen(false);
                    }}>
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddingPayment} onOpenChange={setIsAddingPayment}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="size-4 mr-2" />
                    Add Payment Method
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Payment Method</DialogTitle>
                    <DialogDescription>
                      Add a new card or connect a digital wallet
                    </DialogDescription>
                  </DialogHeader>

                  <Tabs value={selectedPaymentType} onValueChange={(v) => setSelectedPaymentType(v as any)}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="card">Card</TabsTrigger>
                      <TabsTrigger value="google-pay">Google Pay</TabsTrigger>
                      <TabsTrigger value="apple-pay">Apple Pay</TabsTrigger>
                    </TabsList>

                    <TabsContent value="card" className="space-y-4">
                      <div>
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input
                          id="card-number"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          value={formatCardNumber(newCard.cardNumber)}
                          onChange={(e) => setNewCard({ ...newCard, cardNumber: e.target.value.replace(/\s/g, '') })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry-month">Expiry Month</Label>
                          <Select
                            value={newCard.expiryMonth}
                            onValueChange={(value) => setNewCard({ ...newCard, expiryMonth: value })}
                          >
                            <SelectTrigger id="expiry-month">
                              <SelectValue placeholder="MM" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                                  {month.toString().padStart(2, '0')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="expiry-year">Expiry Year</Label>
                          <Select
                            value={newCard.expiryYear}
                            onValueChange={(value) => setNewCard({ ...newCard, expiryYear: value })}
                          >
                            <SelectTrigger id="expiry-year">
                              <SelectValue placeholder="YYYY" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          type="password"
                          placeholder="123"
                          maxLength={3}
                          value={newCard.cvv}
                          onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value.replace(/\D/g, '') })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="name-on-card">Name on Card</Label>
                        <Input
                          id="name-on-card"
                          placeholder="John Smith"
                          value={newCard.nameOnCard}
                          onChange={(e) => setNewCard({ ...newCard, nameOnCard: e.target.value })}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="google-pay" className="space-y-4">
                      <div className="p-6 text-center space-y-4">
                        <div className="size-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                          <Wallet className="size-8 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-slate-900 mb-2">Connect Google Pay</p>
                          <p className="text-slate-600 text-sm">
                            You'll be redirected to securely connect your Google Pay account
                          </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-blue-900 text-sm">
                            <CheckCircle2 className="size-4 inline mr-1" />
                            Fast and secure payments
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="apple-pay" className="space-y-4">
                      <div className="p-6 text-center space-y-4">
                        <div className="size-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                          <Wallet className="size-8 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-slate-900 mb-2">Connect Apple Pay</p>
                          <p className="text-slate-600 text-sm">
                            You'll be redirected to securely connect your Apple Pay account
                          </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-blue-900 text-sm">
                            <CheckCircle2 className="size-4 inline mr-1" />
                            Fast and secure payments
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddingPayment(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddPaymentMethod}>
                      {selectedPaymentType === 'card' ? 'Add Card' : `Connect ${selectedPaymentType === 'google-pay' ? 'Google Pay' : 'Apple Pay'}`}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex items-center gap-3">
                    {method.type === 'card' ? (
                      <>
                        {getCardIcon(method.brand)}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-slate-900">
                              {method.brand} •••• {method.last4}
                            </p>
                            {method.isDefault && (
                              <Badge variant="default" className="text-xs">
                                <Star className="size-3 mr-1" />
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-slate-600">
                            Expires {method.expiryMonth}/{method.expiryYear}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="size-6 bg-slate-200 rounded flex items-center justify-center">
                          <Wallet className="size-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-slate-900">
                              {method.type === 'google-pay' ? 'Google Pay' : 'Apple Pay'}
                            </p>
                            {method.isDefault && (
                              <Badge variant="default" className="text-xs">
                                <Star className="size-3 mr-1" />
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-slate-600">{method.email}</p>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeletePayment(method.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
              <CreditCard className="size-12 mx-auto mb-3 text-slate-400" />
              <p className="text-slate-900 mb-1">No payment methods</p>
              <p className="text-slate-600">Add a payment method to start booking courts</p>
            </div>
          )}
        </div>
      </Card>

      {/* Invoices */}
      <Card className="p-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-slate-900 mb-1">
              <Receipt className="size-5 inline mr-2" />
              Invoices
            </h3>
            <p className="text-slate-600">Download your past invoices</p>
          </div>

          {invoices.length > 0 ? (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Receipt className="size-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-slate-900">{invoice.id}</p>
                      <p className="text-slate-600">{invoice.description}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {new Date(invoice.date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Badge>
                        <Badge
                          variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {invoice.status === 'paid' ? '✓ Paid' : invoice.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-slate-900">£{invoice.amount.toFixed(2)}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.success('Invoice downloaded')}
                    >
                      <Download className="size-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
              <Receipt className="size-12 mx-auto mb-3 text-slate-400" />
              <p className="text-slate-900 mb-1">No invoices yet</p>
              <p className="text-slate-600">Your invoices will appear here after bookings</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}