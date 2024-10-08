import React, { useState } from "react";
import { Modal, Button, TextInput, Checkbox, PasswordInput } from "@mantine/core";
import styles from "@/app/components/adminComponents/AddUserModal.module.css";
import "@mantine/notifications/styles.css";
import { notifications } from "@mantine/notifications";
import { Faculty } from "@/app/utils/types";
import { getDecodedToken } from "@/app/auth/getDecodedToken";
import { useRouter } from "next/navigation";

interface StartClassSessionModalProps {
  token: string | undefined;
  opened: boolean;
  open: () => void;
  close: () => void;
  creatorRole: string;
  professorId: string;
  subjectId: string;
}

export default function StartClassSessionModal({
  token,
  opened,
  open,
  close,
  creatorRole,
  professorId,
  subjectId,
}: StartClassSessionModalProps) {
  const router = useRouter();

  const [invalidUsername, setInvalidUsername] = useState(false);
  const [invalidPassword, setInvalidPassword] = useState(false);
  const decodedToken = getDecodedToken();

  

  const handleClose = () => {
    setLoginCred({
      username: decodedToken ? decodedToken.username : "",
      password: "",
    });
    close();
  };

  const [loginCred, setLoginCred] = useState({
    username: decodedToken ? decodedToken.username : "",
    password: "",
  });

  const handleFormInput = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    if (name === "username") {
      setLoginCred({ ...loginCred, username: value });
      setInvalidUsername(false);
    } else if (name === "password") {
      setLoginCred({ ...loginCred, password: value });
      setInvalidPassword(false);
    }
  };

  const onSubmit = async (e: React.ChangeEvent<any>) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(loginCred),
        }
      );
  
      if (response.ok) {
        // Hardcoded request to start the class session
        const startSessionResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/class-sessions/start?subjectId=${subjectId}&professor_id=${professorId}`,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "authorization": `Bearer ${token}`,
            },
          }
        );
  
        if (startSessionResponse.ok) {
          const responseData = await startSessionResponse.json();
          router.push(`/professor/session?sessionId=${responseData.id}&subjectId=${subjectId}`);
        } else {
          console.log("Failed to start class session");
        }
      } else {
        const errorData = await response.json();
        if (errorData) {
          if (errorData.message === "User not found") {
            setInvalidUsername(true);
            setInvalidPassword(false);
          } else if (errorData.message === "Incorrect password") {
            setInvalidUsername(false);
            setInvalidPassword(true);
          }
        }
      }
    } catch (error) {
      console.log("Error attempting to login", error);
    }
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleClose}
        title="Pokreni novo predavanje"
      >
        <form onSubmit={onSubmit}>
          <TextInput
            disabled
            name="username"
            value={loginCred.username}
            label="Korisničko ime"
            onChange={handleFormInput}
            error={invalidUsername ? "Netočno korisničko ime" : undefined}
            mb={10}
          />
          <PasswordInput
            data-autofocus
            name="password"
            value={loginCred.password}
            label="Lozinka"
            onChange={handleFormInput}
            error={invalidPassword ? "Netočna lozinka" : undefined}
            mb={20}
          />
          <Button type="submit" fullWidth mt={20}>
            Dodaj
          </Button>
        </form>
      </Modal>
    </>
  );
}
