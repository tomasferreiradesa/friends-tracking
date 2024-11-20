import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API } from "../../api/mockAPI";
import {
  Box,
  Button,
  Card,
  FormControl,
  FormLabel,
  TextField,
  Typography,
} from "@mui/material";
import { formatDate } from "../../utils/date";
import { Order } from "../../interface/order";
import { FormModal } from "../../components/modals/form-modal/FormModal";

interface ChangeObservationParams {
  orderId: string;
  text: string;
}

export function Vehicle() {
  const { vehiclePlate } = useParams();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [modalOrder, setModalOrder] = React.useState<Order | null>(null);
  const [dateFilter, setDateFilter] = React.useState(new Date());

  const { data: vehicle } = useQuery({
    queryKey: ["vehicle-data"],
    queryFn: () => API.getVehicleDetails(vehiclePlate!),
    enabled: !!vehiclePlate,
  });
  const { data: orders } = useQuery({
    queryKey: ["vehicle-orders", dateFilter],
    queryFn: () => API.getVehicleOrdersSorted(vehiclePlate!, dateFilter),
    enabled: !!vehiclePlate,
  });
  const queryClient = useQueryClient();
  const changeObservationMutation = useMutation({
    mutationFn: ({ orderId, text }: ChangeObservationParams) =>
      API.changeObservation(orderId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["vehicle-orders"],
      });
      handleClose();
    },
  });

  if (!vehicle) return;

  const handleOpen = (order: Order) => {
    setModalOrder(order);
    setOpen(true);
  };
  const handleClose = () => {
    setModalOrder(null);
    setOpen(false);
  };

  const handleObservationChange = (value: string) => {
    if (modalOrder) {
      setModalOrder({ ...modalOrder, observations: value });
    }
  };

  const handleChangeDateFilter = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDateFilter(new Date(event.target.value));
  };

  const handleSaveObservation = async () => {
    try {
      if (modalOrder) {
        const orderId = modalOrder.id;
        const text = modalOrder.observations;
        if (text) {
          const result = await changeObservationMutation.mutateAsync({
            orderId,
            text,
          });
          alert(result);
        }
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save observation.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "start",
        flexFlow: "column",
        width: "calc(100vw - 30px)",
        gap: "15px",
        margin: "15px",
      }}
    >
      <Button onClick={() => navigate(-1)}>{"<"} Back</Button>
      <Box
        sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}
      >
        <Box sx={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
          <FormControl>
            <FormLabel>Plate</FormLabel>
            <p>{vehicle.plate}</p>
          </FormControl>
          <FormControl>
            <FormLabel>Max Weight Capacity</FormLabel>
            <p>{vehicle.maxWeightCapacity} kg</p>
          </FormControl>
          <FormControl>
            <FormLabel>Available Weight</FormLabel>
            <p>{vehicle.availableWeight} kg</p>
          </FormControl>
          <FormControl>
            <FormLabel>Is favourite?</FormLabel>
            <p>{vehicle.favourite ? "Yes" : "No"}</p>
          </FormControl>
        </Box>
        <TextField
          type="date"
          name="date"
          value={dateFilter.toISOString().split("T")[0]}
          onChange={handleChangeDateFilter}
        />
      </Box>
      <hr style={{ width: "50%", marginLeft: 0 }} />
      {orders && orders?.length > 0 ? (
        <>
          <FormControl>
            <FormLabel sx={{ color: "red", marginBottom: "15px" }}>
              Orders to deliver:
            </FormLabel>
            <Box sx={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
              {orders.map(
                (order, index) =>
                  !order.completed && (
                    <Card sx={{ padding: "10px" }}>
                      {index === 0 && (
                        <p style={{ color: "orange" }}>Next delivery!</p>
                      )}
                      <p>{order.destination.address}</p>
                      <p>{order.destination.city}</p>
                      <p>{order.destination.country}</p>
                      <p>{order.destination.postalCode}</p>
                      <p>{formatDate(order.date)}</p>
                      <p>{order.weight} kg</p>

                      <Box
                        onClick={() => {
                          handleOpen(order);
                        }}
                        sx={{
                          padding: "5px",
                          border: "1px solid black",
                          borderRadius: "4px",
                        }}
                      >
                        <Typography>{order.observations || ""}</Typography>
                      </Box>
                    </Card>
                  )
              )}
            </Box>
          </FormControl>
          <hr style={{ width: "50%", marginLeft: 0 }} />
          <FormControl>
            <FormLabel sx={{ color: "green", marginBottom: "15px" }}>
              Orders delivered:
            </FormLabel>
            <Box sx={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
              {orders?.map(
                (order) =>
                  order.completed && (
                    <Card sx={{ padding: "10px" }}>
                      <p>{order.destination.address}</p>
                      <p>{order.destination.city}</p>
                      <p>{order.destination.country}</p>
                      <p>{order.destination.postalCode}</p>
                      <p>{formatDate(order.date)}</p>
                      <p>{order.weight} kg</p>

                      <Box
                        onClick={() => {
                          handleOpen(order);
                        }}
                        sx={{
                          padding: "5px",
                          border: "1px solid black",
                          borderRadius: "4px",
                        }}
                      >
                        <Typography>{order.observations || ""}</Typography>
                      </Box>
                    </Card>
                  )
              )}
            </Box>
          </FormControl>
        </>
      ) : (
        <Typography>No orders for the selected day.</Typography>
      )}
      <FormModal
        title="Update observations"
        open={open}
        handleClose={handleClose}
        confirmationText="Update"
        submitHandler={handleSaveObservation}
        isPending={changeObservationMutation.isPending}
      >
        <TextField
          onChange={(e) => handleObservationChange(e.target.value)}
          placeholder="Notes"
          value={modalOrder?.observations || ""}
          rows={4}
          name="notes"
          multiline
        />
      </FormModal>
    </Box>
  );
}
