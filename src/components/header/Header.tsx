import React, { useContext, useState, useEffect } from "react";
import { HeaderWrapper, NavItemLink, NavList } from "./styles";
import { Box, Button, Modal, TextField, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { FormControl, FormLabel, Input, Stack } from "@mui/joy";
import { Order, Destination, Coordinates } from "../../interface/order";
import { API } from "../../api/mockAPI";
import { generateOrderId } from "../../utils/generate-order-id";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormModal } from "../modals/form-modal/FormModal";

export function Header() {
  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = useState({
    weight: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
    latitude: "",
    longitude: "",
    date: "",
    observations: "",
  });

  const queryClient = useQueryClient();

  const createOrderMutation = useMutation({
    mutationFn: (newOrder: Order) => API.createOrder(newOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
    },
  });

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const clearFormData = () => {
    setFormData({
      weight: "",
      address: "",
      city: "",
      country: "",
      postalCode: "",
      latitude: "",
      longitude: "",
      date: "",
      observations: "",
    });
  };

  const handleOrderCreation = async (
    event?: React.FormEvent<HTMLFormElement>
  ) => {
    if (event) {
      event.preventDefault();
    }
    if (
      !formData.weight ||
      !formData.city ||
      !formData.country ||
      !formData.postalCode ||
      !formData.latitude ||
      !formData.longitude ||
      !formData.date
    ) {
      alert("All fields are required except observations.");
      return;
    }

    const newOrder: Order = {
      id: generateOrderId(),
      date: new Date(formData.date),
      weight: parseFloat(formData.weight),
      destination: {
        city: formData.city,
        country: formData.country,
        coordinates: {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        } as Coordinates,
        postalCode: formData.postalCode,
        address: formData.address,
      } as Destination,
      observations: formData.observations,
      vehicle: null,
      completed: false,
    };

    try {
      const result = await createOrderMutation.mutateAsync(newOrder);
      clearFormData();
      alert(result);
      handleClose();
    } catch (error) {
      console.error(error);
      alert("Failed to create order.");
    }
  };

  return (
    <HeaderWrapper>
      <h1>FRIEND</h1>
      <Box sx={{ display: "flex", gap: "10px" }}>
        <Button onClick={handleOpen} variant="contained">
          <AddIcon /> Create order
        </Button>
        <h6>Manager 1</h6>
      </Box>
      <FormModal
        title="Create an order"
        open={open}
        handleClose={handleClose}
        confirmationText="Create order"
        submitHandler={handleOrderCreation}
        isPending={createOrderMutation.isPending}
      >
        <form onSubmit={handleOrderCreation}>
          <Stack spacing={2}>
            <Box display="flex" gap={2} alignItems="flex-start">
              <FormControl>
                <FormLabel>Weight (kg)</FormLabel>
                <TextField
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleFormChange}
                  required
                  placeholder="e.g., 200"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Date</FormLabel>
                <TextField
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleFormChange}
                  required
                />
              </FormControl>
            </Box>
            <FormControl>
              <FormLabel>Address</FormLabel>
              <TextField
                name="address"
                value={formData.address}
                onChange={handleFormChange}
                required
                placeholder="e.g., Avenida da República, 123"
              />
            </FormControl>
            <Box display="flex" gap={2} alignItems="flex-start">
              <FormControl>
                <FormLabel>City</FormLabel>
                <TextField
                  name="city"
                  value={formData.city}
                  onChange={handleFormChange}
                  required
                  placeholder="e.g., Lisbon"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Country</FormLabel>
                <TextField
                  name="country"
                  value={formData.country}
                  onChange={handleFormChange}
                  required
                  placeholder="e.g., Portugal"
                />
              </FormControl>
            </Box>
            <FormControl>
              <FormLabel>Postal Code</FormLabel>
              <TextField
                name="postalCode"
                value={formData.postalCode}
                onChange={handleFormChange}
                placeholder="e.g., 1000-001"
              />
            </FormControl>
            <Box display="flex" gap={2} alignItems="flex-start">
              <FormControl>
                <FormLabel>Latitude</FormLabel>
                <TextField
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleFormChange}
                  placeholder="e.g., 38.7169"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Longitude</FormLabel>
                <TextField
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleFormChange}
                  placeholder="e.g., -9.1392"
                />
              </FormControl>
            </Box>
            <FormControl>
              <FormLabel>Observations</FormLabel>
              <TextField
                name="observations"
                multiline
                rows={2}
                value={formData.observations}
                onChange={handleFormChange}
                placeholder="e.g., Fragile, handle with care"
              />
            </FormControl>
          </Stack>
        </form>
      </FormModal>
    </HeaderWrapper>
  );
}
