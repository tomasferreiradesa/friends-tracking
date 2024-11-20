import React, { createContext, useState, useContext, ReactNode } from "react";
import { EventEmitter } from "events";

export interface Notification {
  id: number;
  message: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string) => void;
  clearNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({
  children,
}: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (message: string): void => {
    setNotifications((prevNotifications) => [
      ...prevNotifications,
      { message, id: Date.now() },
    ]);
  };

  const clearNotification = (): void => {
    setNotifications((prevNotifications) => {
      const newNotifications = [...prevNotifications];
      newNotifications.shift();
      return newNotifications;
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        clearNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const eventEmitter = new EventEmitter();
