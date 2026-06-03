import React from 'react';
import { render, screen } from '@testing-library/react-native';

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    const { createElement } = require('react');
    const { View } = require('react-native');
    return createElement(View, { testID: `redirect:${href}` });
  },
}));

import { useAuth } from '@/context/AuthContext';
import Index from '@/app/index';

const mockUseAuth = useAuth as jest.Mock;

describe('Index routing', () => {
  it('shows a loading indicator while session is being restored', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });
    render(<Index />);
    expect(screen.getByTestId('activity-indicator')).toBeTruthy();
  });

  it('redirects to login when there is no authenticated user', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    render(<Index />);
    expect(screen.getByTestId('redirect:/(auth)/login')).toBeTruthy();
  });

  it('redirects control role to AdminDashboard', () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'control', username: 'admin', personalId: '1', firstName: 'A', lastName: 'B' },
      loading: false,
    });
    render(<Index />);
    expect(screen.getByTestId('redirect:/(admin)/dashboard')).toBeTruthy();
  });

  it('redirects non-control roles to UserDashboard', () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'medic', username: 'doc', personalId: '2', firstName: 'C', lastName: 'D' },
      loading: false,
    });
    render(<Index />);
    expect(screen.getByTestId('redirect:/(user)/dashboard')).toBeTruthy();
  });
});
