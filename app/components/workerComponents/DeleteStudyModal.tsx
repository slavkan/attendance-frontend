import React, { useEffect, useState } from "react";
import { Modal, Button, TextInput, Checkbox } from "@mantine/core";
import "@mantine/notifications/styles.css";
import { notifications } from "@mantine/notifications";
import { Study } from "@/app/utils/types";
import styles from "@/app/components/adminComponents/DeleteUserModal.module.css";

interface DeleteStudyModalProps {
  token: string | undefined,
  opened: boolean;
  open: () => void;
  close: () => void;
  setRefreshStudies: (value: boolean) => void;
  studyDelete: Study | null;
  setStudyDelete: (value: Study | null) => void;
}

export default function DeleteStudyModal({
  token,
  opened,
  open,
  close,
  setRefreshStudies,
  studyDelete,
  setStudyDelete,
}: DeleteStudyModalProps) {
  const handleClose = () => {
    setStudyDelete(null);
    setDeleteStudyForm({
      name: "",
    });
    close();
  };

  const [studyId, setStudyId] = useState<string | null>(null);

  const [deleteStudyForm, setDeleteStudyForm] = useState({
    name: "",
  });

  useEffect(() => {
    if (studyDelete) {
      setStudyId(studyDelete.id.toString());
      setDeleteStudyForm({
        name: studyDelete.name || "",
      });
    }
  }, [opened, studyDelete]);

  const onSubmit = async (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/study/${studyId}`,
        {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setRefreshStudies(true);
        handleClose();
        notifications.show({
          color: "red",
          withBorder: true,
          title: "Studij obrisan",
          message: `${deleteStudyForm.name} je uspješno obrisan`,
        });
      } else {
        const errorData = await response.json();
        if (errorData.message === "Cannot delete faculty due to foreign key constraints") {
          notifications.show({
            color: "red",
            withBorder: true,
            title: "Greška",
            message: `${deleteStudyForm.name} nije moguće obrisati jer postoje povezane reference`,
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
      <Modal opened={opened} onClose={handleClose} title="Brisanje Studija">
        <form onSubmit={onSubmit}>
          <p>Da li ste sigurni da želite obrisati studij <b>{studyDelete?.name}</b></p>
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
