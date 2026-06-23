import React from 'react';
import { render, screen } from '@testing-library/react-native';

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/context/AmbulanciaContext', () => ({
  AmbulanciaProvider: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/context/AtencionContext', () => ({
  AtencionProvider: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/context/DespachosContext', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/context/InventoryContext', () => ({
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
  Tabs.Screen = ({ name, options }: { name: string; options?: { href?: unknown } }) =>
    createElement(View, {
      testID: `screen:${name}:${options?.href === null ? 'hidden' : 'visible'}`,
    });
  return {
    Redirect: ({ href }: { href: string }) => createElement(View, { testID: `redirect:${href}` }),
    Tabs,
  };
});

import { useAuth } from '@/context/AuthContext';
import UserLayout from '@/app/(user)/_layout';

const mockUseAuth = useAuth as jest.Mock;

describe('UserLayout guard', () => {
  it('redirects to login when there is no user', () => {
    mockUseAuth.mockReturnValue({ user: null });
    render(<UserLayout />);
    expect(screen.getByTestId('redirect:/(auth)/login')).toBeTruthy();
  });

  it('redirects to login when the user is control', () => {
    mockUseAuth.mockReturnValue({ user: { role: 'control' } });
    render(<UserLayout />);
    expect(screen.getByTestId('redirect:/(auth)/login')).toBeTruthy();
  });

  it.each(['medic', 'nurse'])('shows the registrar-atencion tab for %s', (role) => {
    mockUseAuth.mockReturnValue({ user: { role } });
    render(<UserLayout />);
    expect(screen.getByTestId('tabs')).toBeTruthy();
    expect(screen.getByTestId('screen:registrar-atencion:visible')).toBeTruthy();
  });

  it('hides the registrar-atencion tab for driver', () => {
    mockUseAuth.mockReturnValue({ user: { role: 'driver' } });
    render(<UserLayout />);
    expect(screen.getByTestId('screen:registrar-atencion:hidden')).toBeTruthy();
  });
});
