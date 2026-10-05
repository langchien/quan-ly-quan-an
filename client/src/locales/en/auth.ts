import type { Translation } from '@/lib/i18n/types'
import type { auth as vi } from '../vi/auth'

export const auth = {
  common: {
    email: 'Email',
    password: 'Password',
    orContinueWith: 'Or continue with',
    bannerAlt: 'Restaurant management',
    termsPrefix: 'By continuing, you agree to our',
    terms: 'Terms of Service',
    and: 'and',
    privacy: 'Privacy Policy',
    termsSuffix: '.',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
  },
  login: {
    title: 'Welcome back',
    subtitle: 'Log in to your account',
    forgotPassword: 'Forgot password?',
    submit: 'Log in',
    submitting: 'Logging in...',
    google: 'Log in with Google',
    noAccount: "Don't have an account?",
    signup: 'Sign up',
    success: 'Logged in successfully!',
  },
  logout: {
    success: 'Logged out successfully!',
  },
  signup: {
    title: 'Create an account',
    subtitle: 'Enter your email below to create your account',
    emailHint:
      "We'll use this email to contact you. We will not share your email with anyone else.",
    confirmPassword: 'Confirm password',
    passwordHint: 'Password must be at least 8 characters.',
    submit: 'Create account',
    google: 'Sign up with Google',
    hasAccount: 'Already have an account?',
    login: 'Log in',
  },
  guestLogin: {
    welcome: 'Welcome!',
    description: 'Table <b>{{number}}</b> — Enter your name to start ordering',
    nameLabel: 'Your name',
    namePlaceholder: 'E.g. John Smith',
    nameRequired: 'Please enter your name',
    entering: 'Entering...',
    submit: 'View the menu',
    greeting: 'Hello {{name}}! 👋',
    greetingDesc: 'Table {{number}} — Enjoy your meal!',
  },
} satisfies Translation<typeof vi>
