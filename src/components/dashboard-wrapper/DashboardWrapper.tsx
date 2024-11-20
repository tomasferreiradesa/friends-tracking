import React, { ReactNode } from "react";
import { Box } from "@mui/material";

export function DashboardWrapper({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        width: "calc(100vw - 30px)",
        gap: "15px",
        margin: "15px",
      }}
    >
      {children}
    </Box>
  );
}
