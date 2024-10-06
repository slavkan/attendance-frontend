import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  TextInput,
  Checkbox,
  Tabs,
  Tooltip,
} from "@mantine/core";
import styles from "@/app/components/adminComponents/AddUserModal.module.css";
import "@mantine/notifications/styles.css";
import { notifications } from "@mantine/notifications";
import { Faculty } from "@/app/utils/types";
import { PageLoading } from "@/app/components/PageLoading";

interface EditFacultyModalProps {
  token: string | undefined;
  opened: boolean;
  open: () => void;
  close: () => void;
  creatorRole: string;
  setRefreshFaculties: (value: boolean) => void;
  facultyEdit: Faculty | null;
  setFacultyEdit: (value: Faculty | null) => void;
}

export default function EditFacultyModal({
  token,
  opened,
  open,
  close,
  creatorRole,
  setRefreshFaculties,
  facultyEdit,
  setFacultyEdit,
}: EditFacultyModalProps) {
  const [invalidName, setInvalidName] = useState(false);
  const [invalidAbbreviation, setInvalidAbbreviation] = useState(false);

  const handleClose = () => {
    setFacultyEdit(null);
    setNewFacultyForm({
      name: "",
      abbreviation: "",
    });
    close();
  };

  const [facultyId, setFacultyId] = useState<string | null>(null);
  const [facultyIds, setFacultyIds] = useState<number[]>([]);

  const [newFacultyForm, setNewFacultyForm] = useState({
    name: "",
    abbreviation: "",
  });

  useEffect(() => {
    if (facultyEdit) {
      setFacultyId(facultyEdit.id.toString());
      setNewFacultyForm({
        name: facultyEdit.name || "",
        abbreviation: facultyEdit.abbreviation || "",
      });
    }
  }, [opened, facultyEdit]);

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
        `${process.env.NEXT_PUBLIC_API_URL}/faculties/${facultyId}`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newFacultyForm),
        }
      );

      if (response.ok) {
        setRefreshFaculties(true);
        handleClose();
        notifications.show({
          color: "green",
          withBorder: true,
          title: "Fakultet uređen",
          message: `Fakultet ${newFacultyForm.name} je uspješno uređen`,
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
      <Modal opened={opened} onClose={handleClose} title="Uredi fakultet">
        <form onSubmit={onSubmit}>
          <TextInput
            data-autofocus
            value={newFacultyForm.name}
            name="name"
            label="Ime"
            onChange={handleFormInput}
            error={invalidName ? "Ime mora biti popunjeno" : undefined}
            mb={10}
            required
          />
          <TextInput
            value={newFacultyForm.abbreviation}
            name="abbreviation"
            label="Kratica"
            onChange={handleFormInput}
            error={invalidAbbreviation ? "kratica mora biti popunjena" : undefined}
            mb={10}
            required
          />
          <Button type="submit" fullWidth mt={20}>
            Uredi
          </Button>
        </form>
      </Modal>
    </>
  );
}
