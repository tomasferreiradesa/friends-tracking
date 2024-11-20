import "./App.css";
import { Overview } from "./views/overview/Overview";
import { Vehicle } from "./views/vehicle/Vehicle";
import { Header } from "./components/header/Header";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificationProvider } from "./context/NotificationContext";
import { Notifications } from "./components/notifications/Notifications";
import { Navigate, Route, Routes } from "react-router-dom";

function App() {
  const queryClient = new QueryClient();

  return (
    <NotificationProvider>
      <QueryClientProvider client={queryClient}>
        <div style={{ position: "relative" }}>
          <Header />
          <Notifications />
          <Routes>
            <Route exact path="/overview" element={<Overview />} />
            <Route exact path="/vehicle/:vehiclePlate" element={<Vehicle />} />
            <Route path="/*" element={<Navigate replace to="/overview" />} />
          </Routes>
        </div>
      </QueryClientProvider>
    </NotificationProvider>
  );
}

export default App;
