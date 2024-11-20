import React from "react";
import { DashboardWrapper } from "../../../components/dashboard-wrapper/DashboardWrapper";
import { Orders } from "./orders/Orders";
import { Vehicles } from "./vehicles/Vehicles";

export function Dashboard() {
  return (
    <DashboardWrapper>
      <Orders />
      <Vehicles />
    </DashboardWrapper>
  );
}
