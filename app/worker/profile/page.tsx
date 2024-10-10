"use client";
import { getPlainCookie } from "@/app/auth/getPlainCookie";
import useCheckRoleAndPersonId from "@/app/auth/useCheckRoleAndPersonId";
import NavbarProfessor from "@/app/components/NavbarProfessor";
import { PageLoading } from "@/app/components/PageLoading";
import Link from "next/link";
import styles from "@/app/worker/profile/styles.module.css";
import "@mantine/notifications/styles.css";
import {
  Button,
  ScrollArea,
  Table,
  Tooltip,
  Text,
  Input,
  PasswordInput,
} from "@mantine/core";
import { useSearchParams } from "next/navigation";
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { notifications } from "@mantine/notifications";
import NavbarWorker from "@/app/components/NavbarWorker";

// var stompClient:any = null;
function page() {
  const token = getPlainCookie();

  const searchParams = useSearchParams();
  const personId = searchParams?.get("personId") ?? "";

  const { authorized, person } = useCheckRoleAndPersonId(
    "ROLE_WORKER",
    personId
  );

  const [numberOfRoles, setNumberOfRoles] = useState<number>(0);
  const [invalidPasswordErrorsList, setInvalidPasswordErrorsList] = useState<
    string[]
  >([]);

  useEffect(() => {
    if (person) {
      let numberOfRoles = 0;
      if (person.admin) numberOfRoles++;
      if (person.worker) numberOfRoles++;
      if (person.professor) numberOfRoles++;
      if (person.student) numberOfRoles++;
      setNumberOfRoles(numberOfRoles);
    }
  }, [person]);

  const [loginCred, setLoginCred] = useState("");

  if (authorized === "CHECKING") {
    return <PageLoading visible={true} />;
  }

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>): void {
    const password = event.target.value;
    const errors: string[] = [];

    // Check for at least one upper case letter
    if (!/[A-Z]/.test(password)) {
      errors.push("Loznika mora sadržavati barem jedno veliko slovo");
    }

    // Check for at least one lower case letter
    if (!/[a-z]/.test(password)) {
      errors.push("Loznika mora sadržavati barem malo veliko slovo");
    }

    // Check for at least one digit
    if (!/\d/.test(password)) {
      errors.push("Loznika mora sadržavati barem jednu znamenku");
    }

    // Check for at least 8 characters long
    if (password.length < 8) {
      errors.push("Loznika mora biti dugačka barem 8 znakova");
    }

    setInvalidPasswordErrorsList(errors);

    setLoginCred(password);
  }

  async function handlePasswordChangeFetch() {
    console.log(JSON.stringify({ password: loginCred }));
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/change-password/${personId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password: loginCred }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to change password");
      }

      const data = await response.json();
      notifications.show({
        withBorder: true,
        title: "Loznika izmijenjena",
        message: "",
      });
      console.log("Password changed successfully", data);
    } catch (error) {
      console.error("Error changing password:", error);
    }
  }

  return (
    <div>
      <NavbarWorker token={token} studiesChanged={false} />
      <div className={styles.pageMargin}>
        <div className={styles.row}>
          <Text size="lg" fw={500}>
            {person?.academicTitle}
          </Text>
          <Text size="lg" fw={500}>
            {person?.firstName}
          </Text>
          <Text size="lg" fw={500}>
            {person?.lastName}
          </Text>
          <Text size="lg" fw={500}>
            {person?.indexNumber}
          </Text>
        </div>
        <div className={styles.row}>
          <Text size="lg">Email: </Text>
          <Text size="lg" fw={500}>
            {person?.email}
          </Text>
        </div>
        <div className={styles.row}>
          <Text size="lg">Korisničko ime: </Text>
          <Text size="lg" fw={500}>
            {person?.username}
          </Text>
        </div>
        <div>
          <PasswordInput
            name="password"
            value={loginCred}
            label="Nova lozinka"
            onChange={handlePasswordChange}
            error={invalidPasswordErrorsList.length > 0 ? " " : undefined}
            mb={10}
          />
          {invalidPasswordErrorsList.map((error, index) => (
            <Text key={index} c="red">
              {error}
            </Text>
          ))}

          <Button
            disabled={
              invalidPasswordErrorsList.length > 0 || loginCred.length === 0
            }
            onClick={handlePasswordChangeFetch}
          >
            Zamijeni lozinku
          </Button>

          {numberOfRoles > 1 && (
            <>
              <Text mt={30}>Zamijeni rolu</Text>
              <div className={styles.changeRoleContainer}>
                {person?.admin && (
                  <Link href="/admin/dashboard">
                    <Button fullWidth>Admin</Button>
                  </Link>
                )}
                {person?.worker && (
                  <Link href="/worker/dashboard">
                    <Button fullWidth>Worker</Button>
                  </Link>
                )}
                {person?.professor && (
                  <Link href="/professor/dashboard">
                    <Button fullWidth>Professor</Button>
                  </Link>
                )}
                {person?.student && (
                  <Link href="/student/dashboard">
                    <Button fullWidth>Student</Button>
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default page;
