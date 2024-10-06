import React, { useState } from "react";
import { Modal, Button, TextInput, Checkbox } from "@mantine/core";
import styles from "@/app/components/adminComponents/AddUserModal.module.css";
import "@mantine/notifications/styles.css";
import { notifications } from "@mantine/notifications";
import { Faculty } from "@/app/utils/types";

interface AddFacultyModalProps {
  token: string | undefined,
  opened: boolean;
  open: () => void;
  close: () => void;
  creatorRole: string;
  setRefreshFaculties: (value: boolean) => void;
}

export default function AddFacultyModal({
  token,
  opened,
  open,
  close,
  creatorRole,
  setRefreshFaculties,
}: AddFacultyModalProps) {
  const [invalidName, setInvalidName] = useState(false);
  const [invalidAbbreviation, setInvalidAbbreviation] = useState(false);

  const handleClose = () => {
    setNewFacultyForm({
      name: "",
      abbreviation: "",
    });
    close();
  };

  const [newFacultyForm, setNewFacultyForm] = useState({
    name: "",
    abbreviation: "",
  });

  const handleFormInput = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    if (name === "name") {
      setNewFacultyForm({ ...newFacultyForm, name: value });
      setInvalidName(false);
    } else if (name === "abbreviation") {
      setNewFacultyForm({ ...newFacultyForm, abbreviation: value });
      setInvalidAbbreviation(false);
    }
  };

  

  const onSubmit = async (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/faculties`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(newFacultyForm),
        }
      );

      if (response.ok) {
        setRefreshFaculties(true);
        handleClose();
        notifications.show({
          withBorder: true,
          title: "Fakultet dodan",
          message: `Fakultet ${newFacultyForm.name} je uspješno dodan`,
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
      <Modal opened={opened} onClose={handleClose} title="Dodaj fakultet">
        <form onSubmit={onSubmit}>
          <TextInput
            data-autofocus
            name="name"
            label="Ime"
            onChange={handleFormInput}
            error={invalidName ? "Ime mora biti popunjeno" : undefined}
            mb={10}
            required
          />
          <TextInput
            name="abbreviation"
            label="Kratica"
            onChange={handleFormInput}
            error={invalidAbbreviation ? "Kratica mora biti popunjena" : undefined}
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
