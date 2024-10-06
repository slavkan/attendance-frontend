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
import { Study } from "@/app/utils/types";

interface EditStudyModalProps {
  token: string | undefined;
  opened: boolean;
  open: () => void;
  close: () => void;
  creatorRole: string;
  setRefreshStudies: (value: boolean) => void;
  studyEdit: Study | null;
  setStudyEdit: (value: Study | null) => void;
  facultyId: number;
}

export default function EditStudyModal({
  token,
  opened,
  open,
  close,
  creatorRole,
  setRefreshStudies,
  studyEdit,
  setStudyEdit,
  facultyId,
}: EditStudyModalProps) {
  const [invalidName, setInvalidName] = useState(false);
  const [invalidAbbreviation, setInvalidAbbreviation] = useState(false);

  const handleClose = () => {
    setStudyEdit(null);
    setNewStudyForm({
      name: "",
      faculty: {
        id: facultyId
      }
    });
    close();
  };

  const [studyId, setStudyId] = useState<string | null>(null);

  const [newStudyForm, setNewStudyForm] = useState({
    name: "",
      faculty: {
        id: facultyId
      }
  });

  useEffect(() => {
    if (studyEdit) {
      setStudyId(studyEdit.id.toString());
      setNewStudyForm({
        name: studyEdit.name || "",
        faculty: {
          id: facultyId
        }
      });
    }
  }, [opened, studyEdit]);

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
        `${process.env.NEXT_PUBLIC_API_URL}/study/${studyId}`,
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
          color: "green",
          withBorder: true,
          title: "Studij uređen",
          message: `${newStudyForm.name} je uspješno uređen`,
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
      <Modal opened={opened} onClose={handleClose} title="Uredi studij">
        <form onSubmit={onSubmit}>
          <TextInput
            data-autofocus
            value={newStudyForm.name}
            name="name"
            label="Naziv studija"
            onChange={handleFormInput}
            error={invalidName ? "Naziv mora biti popunjen" : undefined}
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
