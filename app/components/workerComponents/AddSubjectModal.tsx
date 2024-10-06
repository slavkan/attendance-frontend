import React, { useState } from "react";
import { Modal, Button, TextInput, Checkbox, NumberInput } from "@mantine/core";
import styles from "@/app/components/adminComponents/AddUserModal.module.css";
import "@mantine/notifications/styles.css";
import { notifications } from "@mantine/notifications";

interface AddSubjectModalProps {
  token: string | undefined,
  opened: boolean;
  open: () => void;
  close: () => void;
  creatorRole: string;
  setRefreshSubjects: (value: boolean) => void;
  studyId: number;
}

export default function AddSubjectModal({
  token,
  opened,
  open,
  close,
  creatorRole,
  setRefreshSubjects,
  studyId,
}: AddSubjectModalProps) {
  const [invalidName, setInvalidName] = useState(false);
  const [invalidSemester, setInvalidSemester] = useState(false);

  const handleClose = () => {
    setNewSubjectForm({
      name: "",
      semester: "",
      study: {
        id: studyId
      }
    });
    close();
  };

  const [newSubjectForm, setNewSubjectForm] = useState({
    name: "",
    semester: "",
      study: {
        id: studyId
      }
  });

  const handleFormInput = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    if (name === "name") {
      setNewSubjectForm({ ...newSubjectForm, name: value });
      setInvalidName(false);
    }
  };

  const handleNumberInput = (value: string | number) => {
    setNewSubjectForm({ ...newSubjectForm, semester: value?.toString() || "" });
    const valueToInt = parseInt(value.toString());
    if (valueToInt > 6) {
      setNewSubjectForm({ ...newSubjectForm, semester: "6" });
    } else if (valueToInt < 1) {
      setNewSubjectForm({ ...newSubjectForm, semester: "1" });
    }

    setInvalidSemester(false);
  };

  

  const onSubmit = async (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/subjects`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(newSubjectForm),
        }
      );

      if (response.ok) {
        setRefreshSubjects(true);
        handleClose();
        notifications.show({
          withBorder: true,
          title: "Kolegij dodan",
          message: `Kolegij ${newSubjectForm.name} je uspješno dodan`,
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
      <Modal opened={opened} onClose={handleClose} title="Dodaj kolegij">
        <form onSubmit={onSubmit}>
          <TextInput
            data-autofocus
            name="name"
            label="Naziv kolegija"
            onChange={handleFormInput}
            error={invalidName ? "Ime mora biti popunjeno" : undefined}
            mb={10}
            required
          />
          <NumberInput
            name="semester"
            label="Semestar"
            onChange={handleNumberInput}
            error={invalidSemester ? "Semestar mora biti popunjen" : undefined}
            mb={10}
            required
            min={1}
            max={6}
          />
          <Button type="submit" fullWidth mt={20}>
            Dodaj
          </Button>
        </form>
      </Modal>
    </>
  );
}
