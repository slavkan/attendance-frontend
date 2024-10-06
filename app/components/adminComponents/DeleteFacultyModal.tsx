import React, { useEffect, useState } from "react";
import { Modal, Button, TextInput, Checkbox } from "@mantine/core";
import "@mantine/notifications/styles.css";
import { notifications } from "@mantine/notifications";
import { Faculty } from "@/app/utils/types";
import styles from "@/app/components/adminComponents/DeleteUserModal.module.css";

interface DeleteFacultyModalProps {
  token: string | undefined,
  opened: boolean;
  open: () => void;
  close: () => void;
  setRefreshFaculties: (value: boolean) => void;
  facultyDelete: Faculty | null;
  setFacultyDelete: (value: Faculty | null) => void;
}

export default function DeleteFacultyModal({
  token,
  opened,
  open,
  close,
  setRefreshFaculties,
  facultyDelete,
  setFacultyDelete,
}: DeleteFacultyModalProps) {
  const handleClose = () => {
    setFacultyDelete(null);
    setDeleteFacultyForm({
      name: "",
      abbreviation: "",
    });
    close();
  };

  const [facultyId, setFacultyId] = useState<string | null>(null);

  const [deleteFacultyForm, setDeleteFacultyForm] = useState({
    name: "",
    abbreviation: "",
  });

  useEffect(() => {
    if (facultyDelete) {
      setFacultyId(facultyDelete.id.toString());
      setDeleteFacultyForm({
        name: facultyDelete.name || "",
        abbreviation: facultyDelete.abbreviation || "",
      });
    }
  }, [opened, facultyDelete]);

  const onSubmit = async (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/faculties/${facultyId}`,
        {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setRefreshFaculties(true);
        handleClose();
        notifications.show({
          color: "red",
          withBorder: true,
          title: "Fakultet obrisan",
          message: `Fakultet ${deleteFacultyForm.name} je uspješno obrisan`,
        });
      } else {
        const errorData = await response.json();
        if (errorData.message === "Cannot delete faculty due to foreign key constraints") {
          notifications.show({
            color: "red",
            withBorder: true,
            title: "Greška",
            message: `${deleteFacultyForm.name} nije moguće obrisati jer postoje povezane reference`,
          });
        }
        if (errorData) {
          console.log(errorData.message);
        }
      }
    } catch (error) {
      console.log("Error attempting to login", error);
    }
  };

  return (
    <>
      <Modal opened={opened} onClose={handleClose} title="Brisanje fakulteta">
        <form onSubmit={onSubmit}>
          <p>Da li ste sigurni da želite obrisati fakultet <b>{facultyDelete?.name}</b></p>
          <div className={styles.buttonsContainer}>
            <Button
              fullWidth
              mt={20}
              color="gray"
              onClick={handleClose}
            >
              Zatvori
            </Button>
            <Button type="submit" fullWidth mt={20} color="red">
              Obriši
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
