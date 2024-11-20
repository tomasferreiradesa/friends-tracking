import React, { ReactNode } from "react";
import { Box, DialogActions, DialogContent, Modal } from "@mui/material";
import Button from "@mui/joy/Button";
import ModalDialog from "@mui/joy/ModalDialog";
import { DialogTitle, ModalClose } from "@mui/joy";
import { ClipLoader } from "react-spinners";

type FormModalProps = {
  children?: ReactNode;
  title: string;
  subtitle?: string;
  open: boolean;
  confirmationText: string;
  handleClose: () => void;
  submitHandler: () => void;
  isPending: boolean;
};

export function FormModal(props: FormModalProps) {
  return (
    <Modal open={props.open} onClose={props.handleClose}>
      <ModalDialog sx={{ overflow: "scroll" }}>
        <ModalClose onClick={props.handleClose} />
        <DialogTitle>{props.title}</DialogTitle>
        <DialogTitle>{props.subtitle}</DialogTitle>
        {props.children}
        <DialogActions>
          {props.isPending ? (
            <ClipLoader />
          ) : (
            <Button
              variant="solid"
              color="primary"
              onClick={props.submitHandler}
            >
              {props.confirmationText}
            </Button>
          )}
          <Button variant="plain" color="neutral" onClick={props.handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
