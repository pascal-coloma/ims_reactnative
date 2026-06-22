import React from 'react';
import { render, screen } from '@testing-library/react-native';

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/components/admin/AdminProviders', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@expo/vector-icons', () => ({ MaterialIcons: () => null }));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('expo-router', () => {
  const { createElement } = require('react');
  const { View } = require('react-native');
  const Tabs = ({ children }: { children: React.ReactNode }) =>
    createElement(View, { testID: 'tabs' }, children);
  Tabs.Screen = () => null;
  return {
    Redirect: ({ href }: { href: string }) => createElement(View, { testID: `redirect:${href}` }),
    Tabs,
  };
});

import { useAuth } from '@/context/AuthContext';
import AdminLayout from '@/app/(admin)/_layout';

const mockUseAuth = useAuth as jest.Mock;

describe('AdminLayout guard', () => {
  it('redirects to login when there is no user', () => {
    mockUseAuth.mockReturnValue({ user: null });
    render(<AdminLayout />);
    expect(screen.getByTestId('redirect:/(auth)/login')).toBeTruthy();
  });

  it('redirects to login when the user is not control', () => {
    mockUseAuth.mockReturnValue({ user: { role: 'medic' } });
    render(<AdminLayout />);
    expect(screen.getByTestId('redirect:/(auth)/login')).toBeTruthy();
  });

  it('renders the admin tabs when the user is control', () => {
    mockUseAuth.mockReturnValue({ user: { role: 'control' } });
    render(<AdminLayout />);
    expect(screen.getByTestId('tabs')).toBeTruthy();
    expect(screen.queryByTestId('redirect:/(auth)/login')).toBeNull();
  });
});
