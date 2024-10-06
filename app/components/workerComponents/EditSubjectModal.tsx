import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  TextInput,
  Checkbox,
  Tabs,
  Tooltip,
  NumberInput,
} from "@mantine/core";
import styles from "@/app/components/adminComponents/AddUserModal.module.css";
import "@mantine/notifications/styles.css";
import { notifications } from "@mantine/notifications";
import { Subject } from "@/app/utils/types";

interface EditSubjectModalProps {
  token: string | undefined;
  opened: boolean;
  open: () => void;
  close: () => void;
  creatorRole: string;
  setRefreshSubjects: (value: boolean) => void;
  subjectEdit: Subject | null;
  setSubjectEdit: (value: Subject | null) => void;
  stutyId: number;
}

export default function EditSubjectModal({
  token,
  opened,
  open,
  close,
  creatorRole,
  setRefreshSubjects,
  subjectEdit,
  setSubjectEdit,
  stutyId,
}: EditSubjectModalProps) {
  const [invalidName, setInvalidName] = useState(false);
  const [invalidSemester, setInvalidSemester] = useState(false);

  const handleClose = () => {
    setNewSubjectForm({
      name: "",
      semester: 1,
      study: {
        id: stutyId
      }
    });
    close();
  };

  const [subjectId, setSubjectId] = useState<string | null>(null);

  const [newSubjectForm, setNewSubjectForm] = useState({
    name: "",
    semester: 1,
      study: {
        id: stutyId
      }
  });

  useEffect(() => {
    if (subjectEdit) {
      setSubjectId(subjectEdit.id.toString());
      setNewSubjectForm({
        name: subjectEdit.name || "",
        semester: subjectEdit.semester,
        study: {
          id: stutyId
        }
      });
    }
  }, [opened, subjectEdit]);

  const handleFormInput = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    if (name === "name") {
      setNewSubjectForm({ ...newSubjectForm, name: value });
      setInvalidName(false);
    }
  };

  const handleNumberInput = (value: string | number) => {
    setNewSubjectForm({ ...newSubjectForm, semester: value as number });
    const valueToInt = Number(value);
    if (valueToInt > 6) {
      setNewSubjectForm({ ...newSubjectForm, semester: 6 });
    } else if (valueToInt < 1) {
      setNewSubjectForm({ ...newSubjectForm, semester: 1 });
    }

    setInvalidSemester(false);
  };

  const onSubmit = async (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/subjects/${subjectId}`,
        {
          method: "PUT",
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
          color: "green",
          withBorder: true,
          title: "Kolegij uređen",
          message: `Kolegij ${newSubjectForm.name} je uspješno uređen`,
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
      <Modal opened={opened} onClose={handleClose} title="Uredi kolegij">
        <form onSubmit={onSubmit}>
          <TextInput
            data-autofocus
            value={newSubjectForm.name}
            name="name"
            label="Naziv kolegija"
            onChange={handleFormInput}
            error={invalidName ? "Naziv mora biti popunjen" : undefined}
            mb={10}
            required
          />
          <NumberInput
            value={newSubjectForm.semester}
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
            Uredi
          </Button>
        </form>
      </Modal>
    </>
  );
}
