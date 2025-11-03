'use client';

import ErrorBoundary from './ErrorBoundary';

export function DashboardErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      title="Dashboard Error"
      message="We encountered an issue loading the dashboard. Your data is safe."
    >
      {children}
    </ErrorBoundary>
  );
}

export function PollsErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      title="Polls Error"
      message="Unable to load poll data. Please refresh and try again."
    >
      {children}
    </ErrorBoundary>
  );
}

export function BillingErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      title="Billing Error"
      message="There was a problem loading billing information. Please try again."
    >
      {children}
    </ErrorBoundary>
  );
}

export function InventoryErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      title="Inventory Error"
      message="Failed to load inventory data. Please refresh the page."
    >
      {children}
    </ErrorBoundary>
  );
}

export function ProfileErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      title="Profile Error"
      message="Could not load your profile. Please try again."
    >
      {children}
    </ErrorBoundary>
  );
}

export function AdminMenuErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      title="Menu Management Error"
      message="Failed to load menu management. Please refresh and try again."
    >
      {children}
    </ErrorBoundary>
  );
}

export function AuthErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      title="Authentication Error"
      message="There was a problem with authentication. Please try logging in again."
    >
      {children}
    </ErrorBoundary>
  );
}

export function QRErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      title="QR Code Error"
      message="Failed to generate or scan QR code. Please try again."
    >
      {children}
    </ErrorBoundary>
  );
}

export function AttendanceErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      title="Attendance Error"
      message="Could not load attendance data. Please refresh the page."
    >
      {children}
    </ErrorBoundary>
  );
}

export function MenuErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      title="Menu Error"
      message="Unable to display today's menu. Please try again later."
    >
      {children}
    </ErrorBoundary>
  );
}

export function MealHistoryErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      title="Meal History Error"
      message="Failed to load meal history. Please refresh and try again."
    >
      {children}
    </ErrorBoundary>
  );
}
