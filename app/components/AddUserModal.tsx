import React, { useState } from "react";
import { Modal, Button, TextInput, Checkbox } from "@mantine/core";
import styles from "@/app/components/AddUserModal.module.css";
import "@mantine/notifications/styles.css";
import { notifications } from "@mantine/notifications";

interface AddUserModalProps {
  opened: boolean;
  open: () => void;
  close: () => void;
  creatorRole: string;
  setRefreshUsers: (value: boolean) => void;
}

export default function AddUserModal({
  opened,
  open,
  close,
  creatorRole,
  setRefreshUsers,
}: AddUserModalProps) {
  const [invalidFirstName, setInvalidFirstName] = useState(false);
  const [invalidLastName, setInvalidLastName] = useState(false);
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [invalidUsername, setInvalidUsername] = useState(false);
  const [invalidIndexNumber, setInvalidIndexNumber] = useState(false);
  const [invalidAcademicTitle, setInvalidAcademicTitle] = useState(false);

  const handleClose = () => {
    setNewUserForm({
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

  const [newUserForm, setNewUserForm] = useState({
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

  const handleFormInput = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    if (name === "firstName") {
      setNewUserForm({ ...newUserForm, firstName: value });
      setInvalidFirstName(false);
    } else if (name === "lastName") {
      setNewUserForm({ ...newUserForm, lastName: value });
      setInvalidLastName(false);
    } else if (name === "email") {
      setNewUserForm({ ...newUserForm, email: value });
      setInvalidEmail(false);
    } else if (name === "username") {
      setNewUserForm({ ...newUserForm, username: value });
      setInvalidUsername(false);
    } else if (name === "indexNumber") {
      setNewUserForm({ ...newUserForm, indexNumber: value });
      setInvalidIndexNumber(false);
    } else if (name === "academicTitle") {
      setNewUserForm({ ...newUserForm, academicTitle: value });
      setInvalidAcademicTitle(false);
    } else if (name === "admin") {
      setNewUserForm({ ...newUserForm, admin: e.target.checked });
    } else if (name === "worker") {
      setNewUserForm({ ...newUserForm, worker: e.target.checked });
    } else if (name === "professor") {
      setNewUserForm({ ...newUserForm, professor: e.target.checked });
    } else if (name === "student") {
      setNewUserForm({ ...newUserForm, student: e.target.checked });
    }
  };

  

  const onSubmit = async (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/persons`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(newUserForm),
        }
      );

      if (response.ok) {
        setRefreshUsers(true);
        handleClose();
        notifications.show({
          withBorder: true,
          title: "Korisnik dodan",
          message: `Korisnik ${newUserForm.firstName} ${newUserForm.lastName} je uspješno dodan`,
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
      <Modal opened={opened} onClose={handleClose} title="Dodaj korisnika">
        <form onSubmit={onSubmit}>
          <TextInput
            data-autofocus
            name="firstName"
            label="Ime"
            onChange={handleFormInput}
            error={invalidFirstName ? "Ime mora biti popunjeno" : undefined}
            mb={10}
            required
          />
          <TextInput
            name="lastName"
            label="Prezime"
            onChange={handleFormInput}
            error={invalidLastName ? "Prezime mora biti popunjeno" : undefined}
            mb={10}
            required
          />
          <TextInput
            name="email"
            label="Email"
            onChange={handleFormInput}
            error={invalidEmail ? "Email je zauzet" : undefined}
            mb={10}
            required
          />
          <TextInput
            name="username"
            label="Korisničko ime"
            onChange={handleFormInput}
            error={invalidUsername ? "Korisničko ime je zauzeto" : undefined}
            mb={10}
            required
          />
          <TextInput
            name="indexNumber"
            label="Broj indeksa"
            onChange={handleFormInput}
            mb={10}
          />
          <TextInput
            name="academicTitle"
            label="Akademski naziv"
            onChange={handleFormInput}
            mb={10}
          />
          <div className={styles.checkboxTwoRows}>
            <div>
              <Checkbox
                mb={10}
                name="admin"
                label="Admin"
                onChange={handleFormInput}
              />
              <Checkbox
                mb={10}
                name="worker"
                label="Radnik"
                onChange={handleFormInput}
              />
            </div>
            <div>
              <Checkbox
                mb={10}
                name="professor"
                label="Profesor"
                onChange={handleFormInput}
              />
              <Checkbox
                mb={10}
                name="student"
                label="Student"
                onChange={handleFormInput}
              />
            </div>
          </div>
          <Button type="submit" fullWidth mt={20}>
            Dodaj
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
