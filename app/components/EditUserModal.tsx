import React, { useEffect, useState } from "react";
import { Modal, Button, TextInput, Checkbox } from "@mantine/core";
import styles from "@/app/components/AddUserModal.module.css";
import "@mantine/notifications/styles.css";
import { notifications } from "@mantine/notifications";
import { Person } from "@/app/utils/types";

interface EditUserModalProps {
  opened: boolean;
  open: () => void;
  close: () => void;
  creatorRole: string;
  setRefreshUsers: (value: boolean) => void;
  personEdit: Person | null;
}

export default function EditUserModal({
  opened,
  open,
  close,
  creatorRole,
  setRefreshUsers,
  personEdit,
}: EditUserModalProps) {
  const [invalidFirstName, setInvalidFirstName] = useState(false);
  const [invalidLastName, setInvalidLastName] = useState(false);
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [invalidUsername, setInvalidUsername] = useState(false);
  const [invalidIndexNumber, setInvalidIndexNumber] = useState(false);
  const [invalidAcademicTitle, setInvalidAcademicTitle] = useState(false);

  const handleClose = () => {
    setNewPersonForm({
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

  const [newPersonForm, setNewPersonForm] = useState({
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
    if (personEdit) {
      setPersonId(personEdit.id.toString());
      setNewPersonForm({
        firstName: personEdit.firstName || "",
        lastName: personEdit.lastName || "",
        email: personEdit.email || "",
        username: personEdit.username || "",
        indexNumber: personEdit.indexNumber || "",
        academicTitle: personEdit.academicTitle || "",
        admin: personEdit.admin || false,
        worker: personEdit.worker || false,
        professor: personEdit.professor || false,
        student: personEdit.student || false,
      });
    }
  }, [opened, personEdit]);

  const handleFormInput = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    if (name === "firstName") {
      setNewPersonForm({ ...newPersonForm, firstName: value });
      setInvalidFirstName(false);
    } else if (name === "lastName") {
      setNewPersonForm({ ...newPersonForm, lastName: value });
      setInvalidLastName(false);
    } else if (name === "email") {
      setNewPersonForm({ ...newPersonForm, email: value });
      setInvalidEmail(false);
    } else if (name === "username") {
      setNewPersonForm({ ...newPersonForm, username: value });
      setInvalidUsername(false);
    } else if (name === "indexNumber") {
      setNewPersonForm({ ...newPersonForm, indexNumber: value });
      setInvalidIndexNumber(false);
    } else if (name === "academicTitle") {
      setNewPersonForm({ ...newPersonForm, academicTitle: value });
      setInvalidAcademicTitle(false);
    } else if (name === "admin") {
      setNewPersonForm({ ...newPersonForm, admin: e.target.checked });
    } else if (name === "worker") {
      setNewPersonForm({ ...newPersonForm, worker: e.target.checked });
    } else if (name === "professor") {
      setNewPersonForm({ ...newPersonForm, professor: e.target.checked });
    } else if (name === "student") {
      setNewPersonForm({ ...newPersonForm, student: e.target.checked });
    }
  };

  

  const onSubmit = async (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/persons/${personId}`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(newPersonForm),
        }
      );

      if (response.ok) {
        setRefreshUsers(true);
        handleClose();
        notifications.show({
          color: "green",
          withBorder: true,
          title: "Korisnik uređen",
          message: `Korisnik ${newPersonForm.firstName} ${newPersonForm.lastName} je uspješno uređen`,
        });
      } else {
        const errorData = await response.json();
        if (errorData) {
          console.log(errorData.message);
          if (errorData.message === "Email already exists") {
            setInvalidEmail(true);
          } else if (errorData.message === "Username already exists") {
            setInvalidUsername(true);
          }
        }
      }
    } catch (error) {
      console.log("Error attempting to login", error);
    }
  };


  return (
    <>
      <Modal opened={opened} onClose={handleClose} title="Uredi korisnika">
        <form onSubmit={onSubmit}>
          <TextInput
            data-autofocus
            value={newPersonForm.firstName}
            name="firstName"
            label="Ime"
            onChange={handleFormInput}
            error={invalidFirstName ? "Ime mora biti popunjeno" : undefined}
            mb={10}
            required
          />
          <TextInput
            value={newPersonForm.lastName}
            name="lastName"
            label="Prezime"
            onChange={handleFormInput}
            error={invalidLastName ? "Prezime mora biti popunjeno" : undefined}
            mb={10}
            required
          />
          <TextInput
            value={newPersonForm.email}
            name="email"
            label="Email"
            onChange={handleFormInput}
            error={invalidEmail ? "Email je zauzet" : undefined}
            mb={10}
            required
          />
          <TextInput
            value={newPersonForm.username}
            name="username"
            label="Korisničko ime"
            onChange={handleFormInput}
            error={invalidUsername ? "Korisničko ime je zauzeto" : undefined}
            mb={10}
            required
          />
          <TextInput
            value={newPersonForm.indexNumber}
            name="indexNumber"
            label="Broj indeksa"
            onChange={handleFormInput}
            mb={10}
          />
          <TextInput
            value={newPersonForm.academicTitle}
            name="academicTitle"
            label="Akademski naziv"
            onChange={handleFormInput}
            mb={10}
          />
          <div className={styles.checkboxTwoRows}>
            <div>
              <Checkbox
                checked={newPersonForm.admin}
                mb={10}
                name="admin"
                label="Admin"
                onChange={handleFormInput}
              />
              <Checkbox
                checked={newPersonForm.worker}
                mb={10}
                name="worker"
                label="Radnik"
                onChange={handleFormInput}
              />
            </div>
            <div>
              <Checkbox
                checked={newPersonForm.professor}
                mb={10}
                name="professor"
                label="Profesor"
                onChange={handleFormInput}
              />
              <Checkbox
                checked={newPersonForm.student}
                mb={10}
                name="student"
                label="Student"
                onChange={handleFormInput}
              />
            </div>
          </div>
          <Button type="submit" fullWidth mt={20}>
            Uredi
          </Button>
          {invalidUsername && (
            <div className={styles.error}>Korisničko ime već postoji</div>
          )}
          {invalidEmail && (
            <div className={styles.error}>Email već postoji</div>
          )}
        </form>
      </Modal>
    </>
  );
}
