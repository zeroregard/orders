export const GOOGLE_BUTTON_OPTIONS = {
  theme: 'outline',
  size: 'large',
  text: 'signin_with',
  shape: 'rectangular',
  logo_alignment: 'left',
  width: '250px'
} as const;

// Storage keys for persistence
export const STORAGE_KEYS = {
  TOKEN: 'auto_order_auth_token',
  USER: 'auto_order_user_data',
  EXPIRES_AT: 'auto_order_token_expires_at',
} as const; 