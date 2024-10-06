import React, { useState } from "react";
import { Modal, Button, TextInput, Checkbox } from "@mantine/core";
import styles from "@/app/components/adminComponents/AddUserModal.module.css";
import "@mantine/notifications/styles.css";
import { notifications } from "@mantine/notifications";

interface AddStudyModalProps {
  token: string | undefined,
  opened: boolean;
  open: () => void;
  close: () => void;
  creatorRole: string;
  setRefreshStudies: (value: boolean) => void;
  facultyId: number;
}

export default function AddStudyModal({
  token,
  opened,
  open,
  close,
  creatorRole,
  setRefreshStudies,
  facultyId,
}: AddStudyModalProps) {
  const [invalidName, setInvalidName] = useState(false);
  const [invalidAbbreviation, setInvalidAbbreviation] = useState(false);

  const handleClose = () => {
    setNewStudyForm({
      name: "",
      faculty: {
        id: facultyId
      }
    });
    close();
  };

  const [newStudyForm, setNewStudyForm] = useState({
    name: "",
      faculty: {
        id: facultyId
      }
  });

  const handleFormInput = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    if (name === "name") {
      setNewStudyForm({ ...newStudyForm, name: value });
      setInvalidName(false);
    }
  };

  

  const onSubmit = async (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/study`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(newStudyForm),
        }
      );

      if (response.ok) {
        setRefreshStudies(true);
        handleClose();
        notifications.show({
          withBorder: true,
          title: "Studij dodan",
          message: `Studij ${newStudyForm.name} je uspješno dodan`,
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
      <Modal opened={opened} onClose={handleClose} title="Dodaj studij">
        <form onSubmit={onSubmit}>
          <TextInput
            data-autofocus
            name="name"
            label="Naziv studija"
            onChange={handleFormInput}
            error={invalidName ? "Ime mora biti popunjeno" : undefined}
            mb={10}
            required
          />
          <Button type="submit" fullWidth mt={20}>
            Dodaj
          </Button>
        </form>
      </Modal>
    </>
  );
}
