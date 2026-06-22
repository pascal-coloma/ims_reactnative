import React from 'react';
import { Alert } from 'react-native';
import { renderHook, act } from '@testing-library/react-native';
import { NotificationProvider, useNotifications } from '@/context/NotificationContext';

let onMessageHandler: (message: any) => void;

jest.mock('@react-native-firebase/messaging', () => ({
  getMessaging: jest.fn(() => ({})),
  onMessage: jest.fn((_messaging, handler) => {
    onMessageHandler = handler;
    return jest.fn();
  }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NotificationProvider>{children}</NotificationProvider>
);

beforeEach(() => {
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('NotificationContext', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });
    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.lastMessageId).toBeNull();
  });

  it('adds an incoming FCM message to the front of the list and bumps the unread count', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });
    act(() => {
      onMessageHandler({
        messageId: 'msg-1',
        notification: { title: 'Nuevo despacho', body: 'Emergencia en Calle 1' },
      });
    });
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toMatchObject({
      id: 'msg-1',
      title: 'Nuevo despacho',
      body: 'Emergencia en Calle 1',
      read: false,
    });
    expect(result.current.unreadCount).toBe(1);
    expect(result.current.lastMessageId).toBe('msg-1');
    expect(Alert.alert).toHaveBeenCalledWith('Nuevo despacho', 'Emergencia en Calle 1');
  });

  it('falls back to a generated id when messageId is missing', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });
    act(() => {
      onMessageHandler({ notification: {} });
    });
    expect(result.current.notifications[0].id).toBeTruthy();
    expect(result.current.notifications[0].title).toBe('');
  });

  describe('dismissNotification', () => {
    it('removes only the targeted notification', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });
      act(() => {
        onMessageHandler({ messageId: 'a', notification: { title: 'A', body: '' } });
        onMessageHandler({ messageId: 'b', notification: { title: 'B', body: '' } });
      });
      act(() => {
        result.current.dismissNotification('a');
      });
      expect(result.current.notifications.map((n) => n.id)).toEqual(['b']);
    });
  });

  describe('markAllRead', () => {
    it('marks every notification read and resets the unread count', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });
      act(() => {
        onMessageHandler({ messageId: 'a', notification: { title: 'A', body: '' } });
        onMessageHandler({ messageId: 'b', notification: { title: 'B', body: '' } });
      });
      act(() => {
        result.current.markAllRead();
      });
      expect(result.current.notifications.every((n) => n.read)).toBe(true);
      expect(result.current.unreadCount).toBe(0);
    });
  });

  it('throws when used outside provider', () => {
    expect(() => renderHook(() => useNotifications())).toThrow();
  });
});
