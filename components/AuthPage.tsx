import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Chrome, Github, Mail, Phone, CheckCircle2, ArrowLeft, Shield } from 'lucide-react';
import { Badge } from './ui/badge';
import { PhoneInput } from './PhoneInput';

interface AuthPageProps {
  onAuth: (user: { name: string; email: string; avatar?: string }) => void;
}

type SignupStep = 'details' | 'verify-email' | 'verify-mobile' | 'complete';

export function AuthPage({ onAuth }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [signupStep, setSignupStep] = useState<SignupStep>('details');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [isMobileValid, setIsMobileValid] = useState(false);
  const [password, setPassword] = useState('');
  const [emailOTP, setEmailOTP] = useState(['', '', '', '', '', '']);
  const [mobileOTP, setMobileOTP] = useState(['', '', '', '', '', '']);
  const [emailOTPSent, setEmailOTPSent] = useState(false);
  const [mobileOTPSent, setMobileOTPSent] = useState(false);
  const [emailResendTimer, setEmailResendTimer] = useState(0);
  const [mobileResendTimer, setMobileResendTimer] = useState(0);

  // Timer for email OTP resend
  useEffect(() => {
    if (emailResendTimer > 0) {
      const timer = setTimeout(() => setEmailResendTimer(emailResendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [emailResendTimer]);

  // Timer for mobile OTP resend
  useEffect(() => {
    if (mobileResendTimer > 0) {
      const timer = setTimeout(() => setMobileResendTimer(mobileResendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [mobileResendTimer]);

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock authentication - just pass through the data
    onAuth({
      name: mode === 'signup' ? name : 'John Doe',
      email: email || 'user@example.com',
    });
  };

  const handleOAuthLogin = (provider: 'google' | 'github') => {
    // Mock OAuth login
    const mockUsers = {
      google: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@gmail.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      },
      github: {
        name: 'Alex Chen',
        email: 'alex.chen@github.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      },
    };

    onAuth(mockUsers[provider]);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Move to email verification
    setSignupStep('verify-email');
    sendEmailOTP();
  };

  const sendEmailOTP = () => {
    // Mock sending email OTP
    setEmailOTPSent(true);
    setEmailResendTimer(60);
    console.log('Email OTP sent to:', email);
  };

  const sendMobileOTP = () => {
    // Mock sending mobile OTP
    setMobileOTPSent(true);
    setMobileResendTimer(60);
    console.log('Mobile OTP sent to:', mobile);
  };

  const handleEmailOTPChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOTP = [...emailOTP];
      newOTP[index] = value;
      setEmailOTP(newOTP);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`email-otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleMobileOTPChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOTP = [...mobileOTP];
      newOTP[index] = value;
      setMobileOTP(newOTP);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`mobile-otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleEmailOTPKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !emailOTP[index] && index > 0) {
      const prevInput = document.getElementById(`email-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleMobileOTPKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !mobileOTP[index] && index > 0) {
      const prevInput = document.getElementById(`mobile-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const verifyEmailOTP = (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = emailOTP.join('');
    
    // Mock verification - accept any 6 digits
    if (otpValue.length === 6) {
      setSignupStep('verify-mobile');
      sendMobileOTP();
    } else {
      alert('Please enter a valid 6-digit OTP');
    }
  };

  const verifyMobileOTP = (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = mobileOTP.join('');
    
    // Mock verification - accept any 6 digits
    if (otpValue.length === 6) {
      setSignupStep('complete');
    } else {
      alert('Please enter a valid 6-digit OTP');
    }
  };

  const handleBackToDetails = () => {
    setSignupStep('details');
    setEmailOTP(['', '', '', '', '', '']);
    setEmailOTPSent(false);
  };

  const handleBackToEmailVerify = () => {
    setSignupStep('verify-email');
    setMobileOTP(['', '', '', '', '', '']);
    setMobileOTPSent(false);
  };

  const resetSignup = () => {
    setMode('login');
    setSignupStep('details');
    setEmailOTP(['', '', '', '', '', '']);
    setMobileOTP(['', '', '', '', '', '']);
    setEmailOTPSent(false);
    setMobileOTPSent(false);
    setName('');
    setEmail('');
    setMobile('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-slate-900 mb-2">Tennis Court Booking</h1>
          <p className="text-slate-600">
            {mode === 'login' 
              ? 'Welcome back! Sign in to continue' 
              : signupStep === 'details'
                ? 'Create your account to get started'
                : signupStep === 'verify-email'
                  ? 'Verify your email address'
                  : signupStep === 'verify-mobile'
                    ? 'Verify your mobile number'
                    : 'Account created successfully!'
            }
          </p>
        </div>

        {/* Progress indicator for signup */}
        {mode === 'signup' && signupStep !== 'complete' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className={`flex items-center gap-2 ${signupStep === 'details' ? 'text-blue-600' : 'text-green-600'}`}>
                {signupStep === 'details' ? (
                  <div className="size-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</div>
                ) : (
                  <CheckCircle2 className="size-6 text-green-600" />
                )}
                <span className="text-xs">Details</span>
              </div>
              <div className={`flex-1 h-0.5 mx-2 ${signupStep !== 'details' ? 'bg-green-600' : 'bg-slate-300'}`}></div>
              <div className={`flex items-center gap-2 ${signupStep === 'verify-email' ? 'text-blue-600' : signupStep === 'verify-mobile' || signupStep === 'complete' ? 'text-green-600' : 'text-slate-400'}`}>
                {signupStep === 'verify-mobile' || signupStep === 'complete' ? (
                  <CheckCircle2 className="size-6 text-green-600" />
                ) : (
                  <div className={`size-6 rounded-full flex items-center justify-center text-xs ${signupStep === 'verify-email' ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-600'}`}>2</div>
                )}
                <span className="text-xs">Email</span>
              </div>
              <div className={`flex-1 h-0.5 mx-2 ${signupStep === 'verify-mobile' || signupStep === 'complete' ? 'bg-green-600' : 'bg-slate-300'}`}></div>
              <div className={`flex items-center gap-2 ${signupStep === 'verify-mobile' ? 'text-blue-600' : signupStep === 'complete' ? 'text-green-600' : 'text-slate-400'}`}>
                {signupStep === 'complete' ? (
                  <CheckCircle2 className="size-6 text-green-600" />
                ) : (
                  <div className={`size-6 rounded-full flex items-center justify-center text-xs ${signupStep === 'verify-mobile' ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-600'}`}>3</div>
                )}
                <span className="text-xs">Mobile</span>
              </div>
            </div>
          </div>
        )}

        {mode === 'login' && (
          <>
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setMode('login')}
                className="flex-1 py-2 px-4 rounded-lg transition-colors bg-blue-600 text-white"
              >
                Sign In
              </button>
              <button
                onClick={() => setMode('signup')}
                className="flex-1 py-2 px-4 rounded-lg transition-colors bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                Sign Up
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => handleOAuthLogin('google')}
              >
                <Chrome className="size-5" />
                Continue with Google
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => handleOAuthLogin('github')}
              >
                <Github className="size-5" />
                Continue with GitHub
              </Button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <Separator className="flex-1" />
              <span className="text-slate-500">or</span>
              <Separator className="flex-1" />
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-slate-600">
                  <input type="checkbox" className="rounded" />
                  <span>Remember me</span>
                </label>
                <button type="button" className="text-blue-600 hover:text-blue-700">
                  Forgot password?
                </button>
              </div>

              <Button type="submit" className="w-full">
                <Mail className="size-4 mr-2" />
                Sign In
              </Button>
            </form>
          </>
        )}

        {mode === 'signup' && signupStep === 'details' && (
          <>
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setMode('login')}
                className="flex-1 py-2 px-4 rounded-lg transition-colors bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                Sign In
              </button>
              <button
                onClick={() => setMode('signup')}
                className="flex-1 py-2 px-4 rounded-lg transition-colors bg-blue-600 text-white"
              >
                Sign Up
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => handleOAuthLogin('google')}
              >
                <Chrome className="size-5" />
                Continue with Google
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => handleOAuthLogin('github')}
              >
                <Github className="size-5" />
                Continue with GitHub
              </Button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <Separator className="flex-1" />
              <span className="text-slate-500">or</span>
              <Separator className="flex-1" />
            </div>

            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="mobile">Mobile Number</Label>
                <PhoneInput
                  value={mobile}
                  onChange={(value, isValid) => {
                    setMobile(value);
                    setIsMobileValid(isValid);
                  }}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <p className="text-slate-500 text-xs mt-1">Must be at least 8 characters</p>
              </div>

              <Button type="submit" className="w-full" disabled={!isMobileValid}>
                Continue
              </Button>
            </form>

            <p className="text-slate-600 text-center mt-6 text-xs">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </>
        )}

        {mode === 'signup' && signupStep === 'verify-email' && (
          <div className="space-y-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDetails}
              className="mb-4"
            >
              <ArrowLeft className="size-4 mr-2" />
              Back
            </Button>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Shield className="size-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-900">Verify your email</p>
                  <p className="text-blue-700 text-xs mt-1">
                    We've sent a 6-digit code to <strong>{email}</strong>
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={verifyEmailOTP} className="space-y-6">
              <div>
                <Label className="mb-3 block text-center">Enter verification code</Label>
                <div className="flex gap-2 justify-center">
                  {emailOTP.map((digit, index) => (
                    <Input
                      key={index}
                      id={`email-otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleEmailOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleEmailOTPKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg"
                      required
                    />
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={emailOTP.join('').length !== 6}>
                Verify Email
              </Button>

              <div className="text-center">
                {emailResendTimer > 0 ? (
                  <p className="text-slate-600 text-sm">
                    Resend code in {emailResendTimer}s
                  </p>
                ) : (
                  <Button
                    type="button"
                    variant="link"
                    onClick={sendEmailOTP}
                    className="text-blue-600"
                  >
                    Resend verification code
                  </Button>
                )}
              </div>
            </form>
          </div>
        )}

        {mode === 'signup' && signupStep === 'verify-mobile' && (
          <div className="space-y-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToEmailVerify}
              className="mb-4"
            >
              <ArrowLeft className="size-4 mr-2" />
              Back
            </Button>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-3">
                <Phone className="size-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-900">Verify your mobile number</p>
                  <p className="text-green-700 text-xs mt-1">
                    We've sent a 6-digit code to <strong>{mobile}</strong>
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={verifyMobileOTP} className="space-y-6">
              <div>
                <Label className="mb-3 block text-center">Enter verification code</Label>
                <div className="flex gap-2 justify-center">
                  {mobileOTP.map((digit, index) => (
                    <Input
                      key={index}
                      id={`mobile-otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleMobileOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleMobileOTPKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg"
                      required
                    />
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={mobileOTP.join('').length !== 6}>
                Verify Mobile
              </Button>

              <div className="text-center">
                {mobileResendTimer > 0 ? (
                  <p className="text-slate-600 text-sm">
                    Resend code in {mobileResendTimer}s
                  </p>
                ) : (
                  <Button
                    type="button"
                    variant="link"
                    onClick={sendMobileOTP}
                    className="text-blue-600"
                  >
                    Resend verification code
                  </Button>
                )}
              </div>
            </form>
          </div>
        )}

        {mode === 'signup' && signupStep === 'complete' && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="size-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="size-10 text-green-600" />
              </div>
            </div>
            
            <div>
              <h2 className="text-slate-900 mb-2">Account Created Successfully!</h2>
              <p className="text-slate-600">
                Your email and mobile number have been verified. You can now sign in to your account.
              </p>
            </div>

            <div className="space-y-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 className="size-3 mr-1" />
                Email verified
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 ml-2">
                <CheckCircle2 className="size-3 mr-1" />
                Mobile verified
              </Badge>
            </div>

            <Button
              className="w-full"
              onClick={resetSignup}
            >
              Continue to Sign In
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}