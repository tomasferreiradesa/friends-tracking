import { Notification } from "../../../context/NotificationContext";
import { Box, Typography } from "@mui/material";
import React, { useContext, useState, useEffect } from "react";

export function NotificationItem({ message }: Notification) {
  return (
    <Box
      sx={{
        backgroundColor: "lightgray",
        padding: "15px",
        borderRadius: "5px",
        border: "1px solid darkgray",
      }}
    >
      {message}
    </Box>
  );
}
