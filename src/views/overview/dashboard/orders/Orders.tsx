import React, { ChangeEvent, useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { API } from "../../../../api/mockAPI";
import { Filters, Order } from "../../../../interface/order";
import { formatDate } from "../../../../utils/date";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClipLoader } from "react-spinners";
import { Vehicle } from "@/src/interface/vehicle";
import { ArrowDownward, ArrowUpward, Clear, Star } from "@mui/icons-material";
import { ConfirmationModal } from "../../../../components/modals/confirmation-modal/ConfirmationModal";

type OrderVehicleParams = {
  order: Order;
  vehicle?: Vehicle;
  unassign?: boolean;
};

export function Orders() {
  const [confirmationModal, setOpenConfirmationModal] = useState(false);
  const [selectedOrderVehicle, setSelectedOrderVehicle] =
    useState<OrderVehicleParams | null>(null);
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>("");
  const [immediateSearchText, setImmediateSearchText] = useState<string>("");
  const [filters, setFilters] = useState<Filters>({
    unassignedOrdersOnly: false,
    searchText: "",
    sort: {
      column: "id",
      order: "ASC",
    },
  });
  const {
    data: orders,
    isLoading: loadingOrders,
    isFetching: fetchingOrders,
  } = useQuery<Order[]>({
    queryKey: ["orders", filters],
    queryFn: () => API.getOrders(filters),
  });
  const { data: vehicles } = useQuery<Vehicle[]>({
    queryKey: ["vehicles"],
    queryFn: API.getVehicles,
  });

  const queryClient = useQueryClient();
  const assignVehicleMutation = useMutation({
    mutationFn: ({ order, vehicle }: OrderVehicleParams) =>
      API.assignVehicle(order.id, vehicle?.plate),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["vehicles"],
      });
      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
    },
  });
  const unassignVehicleMutation = useMutation({
    mutationFn: ({ order, vehicle }: OrderVehicleParams) =>
      API.unassignVehicle(order.id, vehicle?.plate),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["vehicles"],
      });
      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
    },
  });

  const handleOpenModal = async (
    order: Order,
    vehicle: Vehicle,
    unassign: boolean = false
  ) => {
    const newState: OrderVehicleParams = { order, vehicle, unassign };
    setSelectedOrderVehicle(newState);
    setOpenConfirmationModal(true);
  };

  const handleCloseModal = () => {
    queryClient.invalidateQueries({
      queryKey: ["orders"],
    });
    setSelectedOrderVehicle(null);
    setOpenConfirmationModal(false);
  };

  const handleClearSelection = (order: Order, vehicle: Vehicle) => {
    handleOpenModal(order, vehicle, true);
  };

  const handleAssignVehicle = async ({
    order,
    vehicle,
  }: OrderVehicleParams) => {
    try {
      const result = await assignVehicleMutation.mutateAsync({
        order,
        vehicle,
      });
      alert(result);
    } catch (error) {
      console.error(error);
      alert(error || "Failed to assign vehicle.");
    }
    handleCloseModal();
  };

  function setSortFilter(colKey: string) {
    const colOrder =
      filters.sort.column === colKey
        ? filters.sort.order === "ASC"
          ? "DESC"
          : "ASC"
        : "ASC";
    setFilters({
      ...filters,
      sort: { column: colKey as keyof Order, order: colOrder },
    });
  }

  const handleUnassignVehicle = async ({
    order,
    vehicle,
  }: OrderVehicleParams) => {
    try {
      const result = await unassignVehicleMutation.mutateAsync({
        order,
        vehicle,
      });
      alert(result);
    } catch (error) {
      console.error(error);
      alert("Failed to unassign vehicle.");
    }
    handleCloseModal();
  };

  const setUnassignedOrdersFilter = (filter: boolean) => {
    setFilters({ ...filters, unassignedOrdersOnly: filter });
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prevFilters) => ({
        ...prevFilters,
        searchText: debouncedSearchText,
      }));
    }, 400);

    return () => clearTimeout(handler);
  }, [debouncedSearchText]);

  const setSearchText = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setImmediateSearchText(value);
    setDebouncedSearchText(value);
  };

  const TableColumnHeader = ({
    colKey,
    colName,
    nonFiltering = false,
  }: {
    colKey: string;
    colName: string;
    nonFiltering?: boolean;
  }) => {
    return (
      <TableCell sx={{ fontSize: "14px" }}>
        {nonFiltering ? (
          colName
        ) : (
          <Button
            onClick={() => setSortFilter(colKey)}
            sx={{ fontSize: "12px" }}
          >
            {colName}
            {filters.sort.column === colKey &&
              (filters.sort.order === "ASC" ? (
                <ArrowUpward />
              ) : (
                <ArrowDownward />
              ))}
          </Button>
        )}
      </TableCell>
    );
  };

  return (
    <Card sx={{ width: "55%" }} variant="outlined">
      <Box sx={{ display: "flex", gap: "20px", justifyContent: "flex-end" }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={filters.unassignedOrdersOnly}
              onChange={(event) =>
                setUnassignedOrdersFilter(event.target.checked)
              }
            />
          }
          label={<Typography>Unassigned orders only</Typography>}
        />
        <TextField
          label="Search location"
          autoComplete="current-password"
          variant="outlined"
          sx={{ backgroundColor: "white" }}
          onChange={setSearchText}
          value={immediateSearchText}
        />
      </Box>
      <>
        <TableContainer
          style={{
            minWidth: "400px",
            width: "100%",
            maxHeight: "85vh",
            overflow: "auto",
          }}
          component={Paper}
        >
          {loadingOrders || fetchingOrders ? (
            <Box>
              <ClipLoader />
            </Box>
          ) : (
            <Table
              stickyHeader
              sx={{ minWidth: 650 }}
              aria-label="simple table"
            >
              <TableHead>
                <TableRow>
                  <TableColumnHeader colName="Order #" colKey={"id"} />
                  <TableColumnHeader
                    colName="Status"
                    colKey={"completed"}
                    nonFiltering
                  />
                  <TableColumnHeader colName="Date" colKey={"date"} />
                  <TableColumnHeader colName="Weight (KG)" colKey={"weight"} />
                  <TableColumnHeader
                    colName="Destination"
                    colKey={"destination"}
                  />
                  <TableColumnHeader
                    colName="Vehicle"
                    colKey={"vehicle"}
                    nonFiltering
                  />
                </TableRow>
              </TableHead>

              <TableBody>
                {orders?.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.id}
                    </TableCell>
                    <TableCell align="left">
                      <Typography
                        fontSize={14}
                        style={{ color: row.completed ? "green" : "red" }}
                      >
                        {row.completed ? "Delivered" : "To deliver"}
                      </Typography>
                    </TableCell>
                    <TableCell align="left">{formatDate(row.date)}</TableCell>
                    <TableCell align="left">{row.weight}</TableCell>
                    <TableCell align="left">
                      {row.destination.city}, {row.destination.country}
                    </TableCell>
                    <TableCell align="left">
                      <FormControl>
                        {vehicles && (
                          <Autocomplete
                            value={row.vehicle || undefined}
                            onChange={(_, vehicle) => {
                              if (vehicle) {
                                handleOpenModal(row, vehicle, false);
                              }
                            }}
                            options={vehicles || []}
                            getOptionLabel={(option) => option.plate}
                            getOptionDisabled={(option) =>
                              option.availableWeight < row.weight
                            }
                            isOptionEqualToValue={(option, value) =>
                              option.plate === value?.plate
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Assign vehicle"
                                variant="outlined"
                                InputProps={{
                                  ...params.InputProps,
                                  endAdornment: (
                                    <>
                                      {params.InputProps.endAdornment}
                                      {row.vehicle && (
                                        <InputAdornment position="end">
                                          <IconButton
                                            onClick={() =>
                                              row.vehicle &&
                                              handleClearSelection(
                                                row,
                                                row.vehicle
                                              )
                                            }
                                            size="small"
                                          >
                                            <Clear fontSize="small" />
                                          </IconButton>
                                        </InputAdornment>
                                      )}
                                    </>
                                  ),
                                }}
                              />
                            )}
                            renderOption={(props, option) => (
                              <li {...props}>
                                {option.plate}{" "}
                                {option.favourite && <Star fontSize="small" />}
                              </li>
                            )}
                            disableClearable={true}
                            sx={{ minWidth: "160px" }}
                          />
                        )}
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
        <ConfirmationModal
          open={confirmationModal}
          handleClose={handleCloseModal}
          title={
            selectedOrderVehicle?.unassign
              ? `Unssign ${selectedOrderVehicle?.vehicle?.plate} to order ${selectedOrderVehicle?.order?.id}?`
              : `Assign ${selectedOrderVehicle?.vehicle?.plate} to order ${selectedOrderVehicle?.order?.id}?`
          }
          confirmationAction={() =>
            selectedOrderVehicle?.unassign
              ? handleUnassignVehicle(selectedOrderVehicle)
              : selectedOrderVehicle &&
                handleAssignVehicle(selectedOrderVehicle)
          }
          isPending={
            unassignVehicleMutation.isPending || assignVehicleMutation.isPending
          }
        />
      </>
    </Card>
  );
}
