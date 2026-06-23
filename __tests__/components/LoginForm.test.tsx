import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import LoginForm from '@/components/LoginForm';

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('expo-router', () => ({ useRouter: jest.fn() }));

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

const mockUseAuth = useAuth as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;
const mockLogin = jest.fn();
const mockSetPendingCredentials = jest.fn();
const mockPush = jest.fn();
const mockNavigate = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({
    login: mockLogin,
    setPendingCredentials: mockSetPendingCredentials,
  });
  mockUseRouter.mockReturnValue({ push: mockPush, navigate: mockNavigate });
});

const fillAndSubmit = async (username: string, password: string) => {
  fireEvent.changeText(screen.getByPlaceholderText('RUT (12.345.678-9)'), username);
  fireEvent.changeText(screen.getByPlaceholderText('Contraseña'), password);
  await act(async () => {
    fireEvent.press(screen.getByText('Iniciar sesión'));
  });
};

describe('LoginForm', () => {
  it('shows a validation error and does not call login when fields are empty', async () => {
    render(<LoginForm />);
    await act(async () => {
      fireEvent.press(screen.getByText('Iniciar sesión'));
    });
    expect(screen.getAllByText('Ingresa tus credenciales')).toHaveLength(2); // subtítulo + banner de error
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('strips dots from the rut, logs in, stores pending credentials and navigates to totp', async () => {
    mockLogin.mockResolvedValue(true);
    render(<LoginForm />);
    await fillAndSubmit('12.345.678-9', 'secret');

    expect(mockLogin).toHaveBeenCalledWith('12345678-9', 'secret');
    expect(mockSetPendingCredentials).toHaveBeenCalledWith({
      username: '12345678-9',
      password: 'secret',
    });
    expect(mockPush).toHaveBeenCalledWith('/(auth)/totp');
  });

  it('shows an error and does not navigate when credentials are rejected', async () => {
    mockLogin.mockResolvedValue(false);
    render(<LoginForm />);
    await fillAndSubmit('12345678-9', 'wrong');

    expect(screen.getByText('Credenciales incorrectas')).toBeTruthy();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('navigates to recuperacion when "Olvidé mi contraseña" is pressed', () => {
    render(<LoginForm />);
    fireEvent.press(screen.getByText('Olvidé mi contraseña'));
    expect(mockNavigate).toHaveBeenCalledWith('/(auth)/recuperacion');
  });
});
