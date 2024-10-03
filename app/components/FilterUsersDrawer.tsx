import React, { useState } from "react";
import { Drawer, TextInput, Checkbox, Button, Radio } from "@mantine/core";
import styles from "./FilterUsersDrawer.module.css";
import { exit } from "process";

interface FilterUsersDrawerProps {
  opened: boolean;
  open: () => void;
  close: () => void;
  creatorRole: string;
  setFilterQuery: (query: string) => void;
}

export default function FilterUsersDrawer({
  opened,
  open,
  close,
  creatorRole,
  setFilterQuery,
}: FilterUsersDrawerProps) {
  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    role: "",
  });

  const handleFormInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormState((prevState) => ({
      ...prevState,
      role: value,
    }));
  };

  const generateQueryString = () => {
    const { firstName, lastName, role } = formState;
    let queryString = "&";

    if (firstName) queryString += `firstName=${firstName}&`;
    if (lastName) queryString += `lastName=${lastName}&`;
    if (role) queryString += `role=${role}&`;

    // Remove the trailing '&' if it exists
    if (queryString.endsWith("&")) {
      queryString = queryString.slice(0, -1);
    }

    return queryString;
  };

  const handleSubmit = () => {
    const queryString = generateQueryString();
    close();
    setFilterQuery(queryString);
  };

  return (
    <Drawer opened={opened} onClose={close} title="Filtriranje korisnika">
      <TextInput
        data-autofocus
        name="firstName"
        label="Ime"
        value={formState.firstName}
        onChange={handleFormInput}
        mb={10}
      />
      <TextInput
        name="lastName"
        label="Prezime"
        value={formState.lastName}
        onChange={handleFormInput}
        mb={10}
      />
      <Radio.Group
        name="role"
        value={formState.role}
        onChange={handleRoleChange}
        mb={10}
      >
        <div className={styles.checkboxTwoRows}>
          <div>
            <Radio value="" label="Svi" mb={10} />
            <Radio value="admin" label="Admin" mb={10} />
            <Radio value="worker" label="Radnik" />
          </div>
          <div>
            <Radio value="professor" label="Professor" mb={10} />
            <Radio value="student" label="Student" />
          </div>
        </div>
      </Radio.Group>
      <Button onClick={handleSubmit} mt={20}>
        Filtriraj
      </Button>
    </Drawer>
  );
}
