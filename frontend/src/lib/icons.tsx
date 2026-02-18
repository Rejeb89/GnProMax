// Central icon barrel — import icons from here throughout the app.
// This allows changing the icon library in one place in the future.
export * from 'lucide-react';

// Optionally, add a default Icon wrapper for consistent sizing/styling.
import React from 'react';
import { Icon as LucideIcon, IconProps } from 'lucide-react';

export function Icon(props: IconProps) {
  return <LucideIcon {...props} />;
}
