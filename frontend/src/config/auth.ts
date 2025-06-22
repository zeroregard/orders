// Get the Google Client ID from environment or use a default for development
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1019876543210-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com';

export const GOOGLE_BUTTON_OPTIONS = {
  theme: 'outline' as const,
  size: 'large' as const,
  text: 'signin_with' as const,
  shape: 'rectangular' as const,
  logo_alignment: 'left' as const,
  width: '250px'
} as const; 