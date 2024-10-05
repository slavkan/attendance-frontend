"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { PasswordInput, TextInput, Fieldset, Button } from "@mantine/core";
import { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { getDecodedToken } from "./auth/getDecodedToken";
import { roleRedirect } from "./auth/roleRedirect";


export default function Home() {
  const router = useRouter();
  const [invalidUsername, setInvalidUsername] = useState(false);
  const [invalidPassword, setInvalidPassword] = useState(false);
  const [loginCred, setLoginCred] = useState({
    username: "",
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
        const responseData = await response.json();
        console.log("Response data", responseData.message);
        Cookies.set("jwtTokenAttendanceApp", responseData.message, {
          expires: 7,
          sameSite: "None",
          secure: true,
        });
        const decodedToken = getDecodedToken();
        if (decodedToken) {
          roleRedirect(decodedToken.roles, router);
        } else {
          console.error("Decoded token is null");
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
    <div className={styles.page}>
      <div className={styles.loginWidth}>
        <form onSubmit={onSubmit} className={styles.formTag}>
          <Fieldset legend="Prijava">
            <TextInput
              name="username"
              label="Korisničko ime"
              onChange={handleFormInput}
              error={invalidUsername ? "Netočno korisničko ime" : undefined}
              mb={10}
            />
            <PasswordInput
              name="password"
              label="Lozinka"
              onChange={handleFormInput}
              error={invalidPassword ? "Netočna lozinka" : undefined}
              mb={20}
            />
            <Button type="submit">Prijavi se</Button>
          </Fieldset>
        </form>
      </div>
    </div>
  );
}
