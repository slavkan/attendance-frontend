import React, { useEffect, useState } from "react";
import { Modal, Button, TextInput, Checkbox } from "@mantine/core";
import "@mantine/notifications/styles.css";
import { notifications } from "@mantine/notifications";
import { Subject } from "@/app/utils/types";
import styles from "@/app/components/adminComponents/DeleteUserModal.module.css";

interface DeleteSubjectModalProps {
  token: string | undefined,
  opened: boolean;
  open: () => void;
  close: () => void;
  setRefreshSubjects: (value: boolean) => void;
  subjectDelete: Subject | null;
  setSubjectDelete: (value: Subject | null) => void;
}

export default function DeleteSubjectModal({
  token,
  opened,
  open,
  close,
  setRefreshSubjects,
  subjectDelete,
  setSubjectDelete,
}: DeleteSubjectModalProps) {
  const handleClose = () => {
    setSubjectDelete(null);
    setDeleteSubjectForm({
      name: "",
    });
    close();
  };

  const [subjectId, setSubjectId] = useState<string | null>(null);

  const [deleteSubjectForm, setDeleteSubjectForm] = useState({
    name: "",
  });

  useEffect(() => {
    if (subjectDelete) {
      setSubjectId(subjectDelete.id.toString());
      setDeleteSubjectForm({
        name: subjectDelete.name || "",
      });
    }
  }, [opened, subjectDelete]);

  const onSubmit = async (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/subjects/${subjectId}`,
        {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setRefreshSubjects(true);
        handleClose();
        notifications.show({
          color: "red",
          withBorder: true,
          title: "Kolegij obrisan",
          message: `${deleteSubjectForm.name} je uspješno obrisan`,
        });
      } else {
        const errorData = await response.json();
        if (errorData.message === "Cannot delete faculty due to foreign key constraints") {
          notifications.show({
            color: "red",
            withBorder: true,
            title: "Greška",
            message: `${deleteSubjectForm.name} nije moguće obrisati jer postoje povezane reference`,
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
      <Modal opened={opened} onClose={handleClose} title="Brisanje kolegija">
        <form onSubmit={onSubmit}>
          <p>Da li ste sigurni da želite obrisati kolegij <b>{subjectDelete?.name}</b></p>
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
