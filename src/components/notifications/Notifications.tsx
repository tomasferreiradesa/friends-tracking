import {
  eventEmitter,
  Notification,
  useNotifications,
} from "../../context/NotificationContext";
import { Box, Typography } from "@mui/material";
import React, { useContext, useState, useEffect } from "react";
import { NotificationItem } from "./notification-item/NotificationItem";
import { useQueryClient } from "@tanstack/react-query";

export function Notifications() {
  const { notifications, clearNotification, addNotification } =
    useNotifications();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleDeliveryCompleted = (message: string) => {
      addNotification(message);
      queryClient.invalidateQueries({
        queryKey: ["vehicles"],
      });
      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
      const timeout = setTimeout(() => {
        clearNotification();
      }, 10000);
      return () => clearTimeout(timeout);
    };
    eventEmitter.on("deliveryCompleted", handleDeliveryCompleted);

    return () => {
      eventEmitter.removeListener("deliveryCompleted", handleDeliveryCompleted);
    };
  }, [addNotification]);

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        right: 0,
        zIndex: 999,
        pointerEvents: "none",
        width: "300px",
        padding: "40px 20px",
        display: "flex",
        flexFlow: "column",
        gap: "15px",
        maxHeight: "100vh",
        overflowY: "auto",
      }}
    >
      {notifications.map((notification: Notification) => (
        <NotificationItem key={notification.id} {...notification} />
      ))}
    </Box>
  );
}
