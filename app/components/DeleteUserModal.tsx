import React, { useEffect, useState } from "react";
import { Modal, Button, TextInput, Checkbox } from "@mantine/core";
import "@mantine/notifications/styles.css";
import { notifications } from "@mantine/notifications";
import { Person } from "@/app/utils/types";
import styles from "@/app/components/DeleteUserModal.module.css";

interface DeleteUserModalProps {
  opened: boolean;
  open: () => void;
  close: () => void;
  setRefreshUsers: (value: boolean) => void;
  personDelete: Person | null;
}

export default function DeleteUserModal({
  opened,
  open,
  close,
  setRefreshUsers,
  personDelete,
}: DeleteUserModalProps) {
  const handleClose = () => {
    setDeletePersonForm({
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      indexNumber: "",
      academicTitle: "",
      admin: false,
      worker: false,
      professor: false,
      student: false,
    });
    close();
  };

  const [personId, setPersonId] = useState<string | null>(null);

  const [deletePersonForm, setDeletePersonForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    indexNumber: "",
    academicTitle: "",
    admin: false,
    worker: false,
    professor: false,
    student: false,
  });

  useEffect(() => {
    if (personDelete) {
      setPersonId(personDelete.id.toString());
      setDeletePersonForm({
        firstName: personDelete.firstName || "",
        lastName: personDelete.lastName || "",
        email: personDelete.email || "",
        username: personDelete.username || "",
        indexNumber: personDelete.indexNumber || "",
        academicTitle: personDelete.academicTitle || "",
        admin: personDelete.admin || false,
        worker: personDelete.worker || false,
        professor: personDelete.professor || false,
        student: personDelete.student || false,
      });
    }
  }, [opened, personDelete]);

  const onSubmit = async (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/persons/${personId}`,
        {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
          },
        }
      );

      if (response.ok) {
        setRefreshUsers(true);
        handleClose();
        notifications.show({
          color: "red",
          withBorder: true,
          title: "Korisnik obrisan",
          message: `Korisnik ${deletePersonForm.firstName} ${deletePersonForm.lastName} je uspješno obrisan`,
        });
      } else {
        const errorData = await response.json();
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
      <Modal opened={opened} onClose={handleClose} title="Brisanje korisnika">
        <form onSubmit={onSubmit}>
          <p>Da li ste sigurni da želite obrisati korisnika <b>{personDelete?.firstName} {personDelete?.lastName}</b></p>
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
