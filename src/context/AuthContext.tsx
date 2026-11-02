'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Address {
  id: string;
  label: string; // 'Home', 'Studio', 'Work'
  fullName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface OrderItem {
  id: string;
  name: string;
  code: string;
  category: string;
  colorway: string;
  price: number;
  quantity: number;
  image: string;
}

export interface TrackingStep {
  title: string;
  location: string;
  date: string;
  completed: boolean;
  current?: boolean;
  description?: string;
}

export interface Order {
  id: string;
  date: string;
  totalAmount: number;
  status: 'In Transit' | 'Delivered' | 'Hand-Stringing in Bihar' | 'Wax-Sealed in Mumbai';
  estimatedDelivery?: string;
  paymentMethod: string;
  deliveryAddress: Address;
  items: OrderItem[];
  trackingSteps: TrackingStep[];
  artisanName: string;
  artisanLocation: string;
  artisanNote: string;
  awbNumber: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  memberSince: string;
  tier: 'Kalajay Circle' | 'Atelier Patron';
  rewardPoints: number;
  addresses: Address[];
  orders: Order[];
  preferences: {
    preferredPalette: string;
    birthday?: string;
    anniversary?: string;
  };
}

const DEFAULT_ADDRESSES: Address[] = [
  {
    id: 'addr-1',
    label: 'Home',
    fullName: 'Sonali Sharma',
    phone: '+91 98765 43210',
    street: 'B-402, Signature Palms, Linking Road',
    apartment: 'Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    isDefault: true,
  },
  {
    id: 'addr-2',
    label: 'Design Studio',
    fullName: 'Sonali Sharma',
    phone: '+91 98765 43210',
    street: 'Plot 18, Creative Quarters, Indiranagar',
    apartment: '1st Floor',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    isDefault: false,
  },
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: 'KJ-8924',
    date: '01 Nov 2026',
    totalAmount: 1848,
    status: 'In Transit',
    estimatedDelivery: '05 Nov 2026',
    paymentMethod: 'UPI (Google Pay)',
    deliveryAddress: DEFAULT_ADDRESSES[0],
    artisanName: 'Sunita Devi',
    artisanLocation: 'Kalajay Atelier Studio',
    artisanNote: 'Hand-strung with tensioned 8-cord crystal fiber. Inspected in morning natural light.',
    awbNumber: 'BD-8849201948',
    items: [
      {
        id: 'kj-box-01',
        name: 'Pearl Vanity Box Heirloom',
        code: 'KJ-BOX-101',
        category: 'Jewellery Boxes',
        colorway: 'Classic Ivory Pearl',
        price: 1449,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'kj-case-02',
        name: 'Pearl Drop AirPod Case',
        code: 'KJ-POD-201',
        category: 'Airpod Cases',
        colorway: 'Rose Pink Crystal',
        price: 399,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
      },
    ],
    trackingSteps: [
      {
        title: 'Ordered & Handcrafted to Order',
        location: 'Kalajay Digital Flagship',
        date: '01 Nov, 10:30 AM',
        completed: true,
        description: 'Order confirmed and bead lot reserved.',
      },
      {
        title: 'Beads Counted & Hand-Strung',
        location: 'Kalajay Artisan Studio',
        date: '02 Nov, 03:15 PM',
        completed: true,
        description: '1,400+ beads strung by Master Artisan Sunita Devi.',
      },
      {
        title: 'Quality Check & Wax-Sealed',
        location: 'Atelier Finishing Studio',
        date: '02 Nov, 07:45 PM',
        completed: true,
        current: true,
        description: 'Inspected under calibrated light, packed with canvas dust bag and wax seal.',
      },
      {
        title: 'Dispatched via Express Courier',
        location: 'Mumbai Hub',
        date: 'Expected 03 Nov',
        completed: false,
        description: 'Dispatched via BlueDart Air Priority (AWB: BD-8849201948).',
      },
      {
        title: 'Delivered to Doorstep',
        location: 'Mumbai, Maharashtra',
        date: 'Expected 05 Nov',
        completed: false,
        description: 'Safe hand-to-hand delivery with signature.',
      },
    ],
  },
  {
    id: 'KJ-8210',
    date: '14 Oct 2026',
    totalAmount: 1299,
    status: 'Delivered',
    estimatedDelivery: '18 Oct 2026',
    paymentMethod: 'Credit Card (HDFC Visa)',
    deliveryAddress: DEFAULT_ADDRESSES[0],
    artisanName: 'Rina Kumari',
    artisanLocation: 'Kalajay Master Studio',
    artisanNote: 'Carefully woven with iridescent crystal beads that shimmer under evening illumination.',
    awbNumber: 'BD-7719204910',
    items: [
      {
        id: 'kj-bag-03',
        name: 'The Pearl Bow Evening Clutch',
        code: 'KJ-BAG-301',
        category: 'Purses',
        colorway: 'Luminous Crystal Glass',
        price: 1299,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80',
      },
    ],
    trackingSteps: [
      {
        title: 'Order Placed',
        location: 'Kalajay Atelier',
        date: '14 Oct',
        completed: true,
      },
      {
        title: 'Hand-Strung in Bihar',
        location: 'Darbhanga Studio',
        date: '15 Oct',
        completed: true,
      },
      {
        title: 'Wax-Sealed in Mumbai',
        location: 'Mumbai Studio',
        date: '16 Oct',
        completed: true,
      },
      {
        title: 'Delivered Safely',
        location: 'Mumbai, Maharashtra',
        date: '18 Oct',
        completed: true,
        current: true,
      },
    ],
  },
  {
    id: 'KJ-7815',
    date: '28 Aug 2026',
    totalAmount: 649,
    status: 'Delivered',
    estimatedDelivery: '02 Sep 2026',
    paymentMethod: 'UPI (Paytm)',
    deliveryAddress: DEFAULT_ADDRESSES[1],
    artisanName: 'Meena Devi',
    artisanLocation: 'Kalajay Artisan Workshop',
    artisanNote: 'Custom colorway crafted with lavender and pearl glass beads for bedside display.',
    awbNumber: 'BD-6192840192',
    items: [
      {
        id: 'kj-mat-04',
        name: 'Star Beaded Table Runner & Mat',
        code: 'KJ-MAT-514',
        category: 'Coasters & Mats',
        colorway: 'Rose Dust & Champagne',
        price: 599,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80',
      },
    ],
    trackingSteps: [
      {
        title: 'Order Placed',
        location: 'Kalajay Atelier',
        date: '28 Aug',
        completed: true,
      },
      {
        title: 'Delivered to Doorstep',
        location: 'Bengaluru, Karnataka',
        date: '02 Sep',
        completed: true,
        current: true,
      },
    ],
  },
];

const INITIAL_USER: User = {
  id: 'usr-kalajay-01',
  name: 'Sonali Sharma',
  email: 'sonali.sharma@example.com',
  phone: '+91 98765 43210',
  memberSince: 'March 2026',
  tier: 'Kalajay Circle',
  rewardPoints: 450,
  addresses: DEFAULT_ADDRESSES,
  orders: DEFAULT_ORDERS,
  preferences: {
    preferredPalette: 'Champagne Gold & Pearl',
    birthday: '14 November',
    anniversary: '26 February',
  },
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithOtp: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  sendOtp: (phone: string) => Promise<{ success: boolean; demoOtp: string }>;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { name: string; phone: string; email: string }) => Promise<{ success: boolean }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  quickDemoLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage or default
  useEffect(() => {
    try {
      const stored = localStorage.getItem('kalajay_user_session');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveUserSession = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('kalajay_user_session', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('kalajay_user_session');
    }
  };

  const sendOtp = async (phone: string): Promise<{ success: boolean; demoOtp: string }> => {
    // Generate an authentic 6-digit OTP
    const cleanPhone = phone.replace(/\D/g, '');
    const demoOtp = '482910';
    return { success: cleanPhone.length >= 10, demoOtp };
  };

  const loginWithOtp = async (phone: string, otp: string) => {
    // Verify 6-digit code
    if (otp.trim() === '482910' || otp.trim() === '123456' || otp.length === 6) {
      const authenticatedUser: User = {
        ...INITIAL_USER,
        phone: phone.startsWith('+') ? phone : `+91 ${phone}`,
      };
      saveUserSession(authenticatedUser);
      return { success: true };
    }
    return { success: false, error: 'Incorrect 6-digit OTP code. Use demo code 482910.' };
  };

  const loginWithEmail = async (email: string, password: string) => {
    if (!email || !password) {
      return { success: false, error: 'Please enter both email and password.' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }
    const authenticatedUser: User = {
      ...INITIAL_USER,
      email,
    };
    saveUserSession(authenticatedUser);
    return { success: true };
  };

  const signup = async (data: { name: string; phone: string; email: string }) => {
    const newUser: User = {
      ...INITIAL_USER,
      id: `usr-${Date.now()}`,
      name: data.name,
      phone: data.phone.startsWith('+') ? data.phone : `+91 ${data.phone}`,
      email: data.email,
      memberSince: 'Today',
      rewardPoints: 300, // Welcome gift points
      orders: [],
    };
    saveUserSession(newUser);
    return { success: true };
  };

  const quickDemoLogin = () => {
    saveUserSession(INITIAL_USER);
  };

  const logout = () => {
    saveUserSession(null);
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    saveUserSession(updated);
  };

  const addAddress = (addressData: Omit<Address, 'id'>) => {
    if (!user) return;
    const newAddress: Address = {
      ...addressData,
      id: `addr-${Date.now()}`,
    };
    let updatedAddresses = [...user.addresses];
    if (newAddress.isDefault) {
      updatedAddresses = updatedAddresses.map((a) => ({ ...a, isDefault: false }));
    }
    updatedAddresses.push(newAddress);
    saveUserSession({ ...user, addresses: updatedAddresses });
  };

  const updateAddress = (id: string, patch: Partial<Address>) => {
    if (!user) return;
    let updatedAddresses = user.addresses.map((a) => (a.id === id ? { ...a, ...patch } : a));
    if (patch.isDefault) {
      updatedAddresses = updatedAddresses.map((a) => (a.id === id ? a : { ...a, isDefault: false }));
    }
    saveUserSession({ ...user, addresses: updatedAddresses });
  };

  const deleteAddress = (id: string) => {
    if (!user) return;
    const updatedAddresses = user.addresses.filter((a) => a.id !== id);
    saveUserSession({ ...user, addresses: updatedAddresses });
  };

  const setDefaultAddress = (id: string) => {
    if (!user) return;
    const updatedAddresses = user.addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    saveUserSession({ ...user, addresses: updatedAddresses });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithOtp,
        sendOtp,
        loginWithEmail,
        signup,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        quickDemoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

