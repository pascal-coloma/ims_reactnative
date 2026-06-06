// Copyright 2025 Pascal Coloma
// SPDX-License-Identifier: Apache-2.0

import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';

export type FcmNotification = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  receivedAt: Date;
};

type NotificationContextType = {
  notifications: FcmNotification[];
  unreadCount: number;
  dismissNotification: (id: string) => void;
  markAllRead: () => void;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<FcmNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const dismissNotification = useCallback(
    (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id)),
    [],
  );

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(
      (message: FirebaseMessagingTypes.RemoteMessage) => {
        setNotifications((prev) => [
          {
            id: message.messageId ?? Date.now().toString(),
            title: message.notification?.title ?? '',
            body: message.notification?.body ?? '',
            read: false,
            receivedAt: new Date(),
          },
          ...prev,
        ]);
        setUnreadCount((prev) => prev + 1);
      },
    );
    return unsubscribe;
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, dismissNotification, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications debe usarse dentro de NotificationProvider');
  return ctx;
}
