// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    LOGOUT: '/auth/logout'
  },
  PROPERTIES: {
    BASE: '/properties',
    STATS: '/properties/:id/stats'
  },
  ROOMS: {
    BASE: '/properties/:propertyId/rooms',
    BULK: '/properties/:propertyId/rooms/bulk'
  },
  REQUESTS: {
    BASE: '/properties/:propertyId/requests',
    STATS: '/properties/:propertyId/requests/stats',
    RECENT: '/properties/:propertyId/requests/recent'
  },
  FEEDBACK: {
    BASE: '/properties/:propertyId/feedback',
    STATS: '/properties/:propertyId/feedback/stats'
  },
  GUEST: {
    VERIFY: '/guest/verify',
    DASHBOARD: '/guest/dashboard',
    REQUESTS: '/guest/requests',
    FEEDBACK: '/guest/feedback'
  }
};

// Request Types
export const REQUEST_TYPES = [
  { id: 'cleaning', label: 'Cleaning', icon: '🧹', color: 'blue' },
  { id: 'towels', label: 'Extra Towels', icon: '🛏️', color: 'green' },
  { id: 'toiletries', label: 'Toiletries', icon: '🧴', color: 'purple' },
  { id: 'water', label: 'Water', icon: '💧', color: 'cyan' },
  { id: 'maintenance', label: 'Maintenance', icon: '🔧', color: 'orange' },
  { id: 'other', label: 'Other', icon: '🛎️', color: 'gray' }
];

// Request Status
export const REQUEST_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const REQUEST_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

export const REQUEST_STATUS_LABELS = {
  pending: 'Pending',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

// Room Status
export const ROOM_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  CLEANING: 'cleaning',
  MAINTENANCE: 'maintenance',
  RESERVED: 'reserved'
};

export const ROOM_STATUS_COLORS = {
  available: 'bg-green-100 text-green-800',
  occupied: 'bg-blue-100 text-blue-800',
  cleaning: 'bg-yellow-100 text-yellow-800',
  maintenance: 'bg-red-100 text-red-800',
  reserved: 'bg-purple-100 text-purple-800'
};

// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  PROPERTY_ADMIN: 'property_admin',
  STAFF: 'staff'
};

// Time Slots
export const TIME_SLOTS = [
  { value: 'morning', label: 'Morning (8AM - 12PM)', icon: '🌅' },
  { value: 'afternoon', label: 'Afternoon (12PM - 5PM)', icon: '☀️' },
  { value: 'evening', label: 'Evening (5PM - 9PM)', icon: '🌆' },
  { value: 'custom', label: 'Custom Time', icon: '🕐' }
];

// Rating Options
export const RATING_OPTIONS = [
  { value: 5, label: 'Excellent', emoji: '🌟' },
  { value: 4, label: 'Good', emoji: '👍' },
  { value: 3, label: 'Average', emoji: '🤔' },
  { value: 2, label: 'Poor', emoji: '😕' },
  { value: 1, label: 'Terrible', emoji: '😡' }
];

// Subscription Plans
export const SUBSCRIPTION_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 999,
    currency: 'INR',
    rooms: 10,
    features: ['Up to 10 rooms', 'Basic features', 'Email support']
  },
  {
    id: 'business',
    name: 'Business',
    price: 2999,
    currency: 'INR',
    rooms: 50,
    features: ['Up to 50 rooms', 'All features', 'Priority support', 'Analytics']
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 6999,
    currency: 'INR',
    rooms: 150,
    features: ['Up to 150 rooms', 'All features', '24/7 support', 'Advanced analytics', 'Custom branding']
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    currency: 'INR',
    rooms: '150+',
    features: ['Unlimited rooms', 'All features', 'Dedicated support', 'Custom integrations']
  }
];

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  PIN_MIN_LENGTH: 4,
  PIN_MAX_LENGTH: 8,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_COMMENT_LENGTH: 1000
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  GUEST_TOKEN: 'guestToken',
  GUEST_ROOM: 'guestRoom',
  USER_PREFERENCES: 'userPreferences',
  RECENT_PROPERTIES: 'recentProperties'
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_TIME: 'MMM DD, YYYY HH:mm',
  DATE_INPUT: 'YYYY-MM-DD',
  TIME_INPUT: 'HH:mm',
  API: 'YYYY-MM-DD'
};

// QR Code Options
export const QR_CODE_OPTIONS = {
  width: 200,
  margin: 2,
  level: 'H',
  color: {
    dark: '#000000',
    light: '#ffffff'
  }
};