import React, { useEffect, useState } from "react";
import { Modal, Button, TextInput, Checkbox, Tabs } from "@mantine/core";
import styles from "@/app/components/AddUserModal.module.css";
import "@mantine/notifications/styles.css";
import { notifications } from "@mantine/notifications";
import { Faculty, FacultyPerson, Person } from "@/app/utils/types";
import { PageLoading } from "@/app/components/PageLoading";

interface EditUserModalProps {
  opened: boolean;
  open: () => void;
  close: () => void;
  creatorRole: string;
  setRefreshUsers: (value: boolean) => void;
  personEdit: Person | null;
  setPersonEdit: (value: Person | null) => void;
  faculties: Faculty[] | null;
}

export default function EditUserModal({
  opened,
  open,
  close,
  creatorRole,
  setRefreshUsers,
  personEdit,
  setPersonEdit,
  faculties,
}: EditUserModalProps) {
  const [invalidFirstName, setInvalidFirstName] = useState(false);
  const [invalidLastName, setInvalidLastName] = useState(false);
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [invalidUsername, setInvalidUsername] = useState(false);
  const [invalidIndexNumber, setInvalidIndexNumber] = useState(false);
  const [invalidAcademicTitle, setInvalidAcademicTitle] = useState(false);

  const handleClose = () => {
    setPersonEdit(null);
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
  const [facultyPerson, setFacultyPerson] = useState<FacultyPerson | null>(
    null
  );
  const [facultyIds, setFacultyIds] = useState<number[]>([]);
  const [personFacultyBeingConnected, setPersonFacultyBeingConnected] = useState(false);

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


  // PersonFaculty connection
  const handlePersonFacultyConnection = (e: React.ChangeEvent<any>) => {
    const { id, name, value } = e.target;
    if (name === "1") {
      console.log(id, name, value);
    }
  };

  useEffect(() => {
    console.log("Fetching user's faculties");
    const fetchFaculties = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/faculty-person?personId=${personId}`
        );
        if (response.ok) {
          const data: FacultyPerson[] = await response.json();
          const extractedFacultyIds = data.map((item) => item.faculty.id);
          setFacultyIds(extractedFacultyIds);
        } else {
          console.error("Failed to fetch faculties");
        }
      } catch (error) {
        console.error("Error fetching faculties", error);
      }
    };

    if (opened) {
      fetchFaculties();
    }
  }, [personId, opened]);

  return (
    <>
      <Modal opened={opened} onClose={handleClose} title="Uredi korisnika">
        <Button onClick={() => console.log(facultyIds)}></Button>
        <Tabs defaultValue="editPerson">
          <Tabs.List mb={10}>
            <Tabs.Tab value="editPerson">Uređivanje korisnika</Tabs.Tab>
            <Tabs.Tab value="editPersonFaculty">
              Povezivanje sa fakultetima
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="editPerson">
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
                error={
                  invalidLastName ? "Prezime mora biti popunjeno" : undefined
                }
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
                error={
                  invalidUsername ? "Korisničko ime je zauzeto" : undefined
                }
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
          </Tabs.Panel>
          <Tabs.Panel value="editPersonFaculty">
            <h4>{`${newPersonForm.academicTitle} ${newPersonForm.firstName} ${newPersonForm.lastName} ${newPersonForm.indexNumber}`}</h4>
            <div className={styles.facultyCheckboxContainer}>
              {faculties && faculties.length > 0 ? (
                faculties.map((faculty) => (
                  <div key={faculty.id}>
                    <Checkbox
                      name={faculty.id.toString()}
                      label={`${faculty.name}`}
                      checked={facultyIds.includes(faculty.id)}
                      onChange={handlePersonFacultyConnection}
                    />
                  </div>
                ))
              ) : (
                <div>Nema fakulteta</div>
              )}
            </div>
          </Tabs.Panel>
        </Tabs>
        <PageLoading visible={personFacultyBeingConnected} />
      </Modal>
    </>
  );
}
