import React, { useContext, useState, useEffect } from "react";
import {
  Card,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { API } from "../../../../api/mockAPI";
import { Vehicle } from "../../../../interface/vehicle";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipLoader } from "react-spinners";
import { Star, StarBorder } from "@mui/icons-material";
import { ConfirmationModal } from "../../../../components/modals/confirmation-modal/ConfirmationModal";

export function Vehicles() {
  const [confirmationModal, setOpenConfirmationModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const {
    data: vehicles,
    isLoading,
    isFetching,
  } = useQuery<Vehicle[]>({
    queryKey: ["vehicles"],
    queryFn: API.getVehicles,
  });

  const queryClient = useQueryClient();
  const setFavouriteVehicleMutation = useMutation({
    mutationFn: (vehicle: Vehicle) => API.setFavouriteVehicle(vehicle.plate),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["vehicles"],
      });
    },
  });

  const handleSetFavouriteVehicle = async (vehicle: Vehicle) => {
    try {
      const result = await setFavouriteVehicleMutation.mutateAsync(vehicle);
      alert(result);
      handleCloseModal();
    } catch (error) {
      console.error(error);
      alert("Failed to set favourite vehicle.");
    }
  };

  const handleOpenModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setOpenConfirmationModal(true);
  };

  const handleCloseModal = () => {
    setSelectedVehicle(null);
    setOpenConfirmationModal(false);
  };

  return (
    <Card
      sx={{
        flex: 1,
        minWidth: "400px",
        height: "fit-content",
      }}
      variant="outlined"
    >
      {isLoading || isFetching ? (
        <ClipLoader />
      ) : (
        <>
          <TableContainer
            style={{
              overflow: "auto",
              maxHeight: "85vh",
              height: "100%",
            }}
            component={Paper}
          >
            <Table
              stickyHeader
              sx={{ minWidth: 650 }}
              aria-label="simple table"
            >
              <TableHead>
                <TableRow>
                  <TableCell>Plate</TableCell>
                  <TableCell align="left">Weight Capacity (KG)</TableCell>
                  <TableCell align="left">Available (KG)</TableCell>
                  <TableCell align="left">Favourite</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vehicles?.map((row) => (
                  <TableRow
                    key={row.plate}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      <a href={`/vehicle/${row.plate}`}>{row.plate}</a>
                    </TableCell>
                    <TableCell align="left">{row.maxWeightCapacity}</TableCell>
                    <TableCell align="left">{row.availableWeight}</TableCell>
                    <TableCell align="left">
                      <IconButton
                        onClick={() => handleOpenModal(row)}
                        color={row.favourite ? "primary" : "default"}
                      >
                        {row.plate ? <Star /> : <StarBorder />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <ConfirmationModal
            open={confirmationModal}
            handleClose={handleCloseModal}
            title={
              selectedVehicle?.favourite
                ? `Unset ${selectedVehicle?.plate} as favourite?`
                : `Set ${selectedVehicle?.plate} as favourite?`
            }
            confirmationAction={() =>
              selectedVehicle && handleSetFavouriteVehicle(selectedVehicle)
            }
            isPending={setFavouriteVehicleMutation.isPending}
          />
        </>
      )}
    </Card>
  );
}
