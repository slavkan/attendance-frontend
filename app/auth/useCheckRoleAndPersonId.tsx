import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { roleRedirect } from "./roleRedirect";
import { getDecodedToken } from "./getDecodedToken";
import { Person } from "../utils/types";
import { getPlainCookie } from "./getPlainCookie";

const useCheckRoleAndPersonId = (requiredRole: string, personId: string) => {
  const [authorizedPerson, setAuthorizedPerson] = useState("CHECKING");
  const [authorized, setAuthorized] = useState("CHECKING");
  const router = useRouter();

  const decodedToken = getDecodedToken();
  const token = getPlainCookie();
  const userId = decodedToken ? decodedToken.userId : "";

  const [person, setPerson] = useState<Person>();

  //Fetch person data
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/persons/${userId}`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data: Person = await response.json();
        console.log(data);
        setPerson(data);
      } else {
        const errorData = await response.json();
        if (errorData) {
          console.log(errorData);
        }
      }
    } catch (error) {
      console.log("Error attempting to fetch data: ", error);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);


  useEffect(() => {
    if (person) {
      if (person.id === userId) {
        setAuthorizedPerson("AUTHORIZED");
      } else {
        if (requiredRole === "ROLE_ADMIN") {
          router.push("/admin/dashboard");
        } else if (requiredRole === "ROLE_PROFESSOR") {
          router.push("/professor/dashboard");
        } else if (requiredRole === "ROLE_STUDENT") {
          router.push("/student/dashboard");
        } else if (requiredRole === "ROLE_WORKER") {
          router.push("/worker/dashboard");
        } else {
          router.push("/");
        }
      }
    }
  }, [userId, person]);

  useEffect(() => {
    if (authorizedPerson !== "CHECKING") {
      if (decodedToken && decodedToken.roles.includes(requiredRole)) {
        setAuthorized("AUTHORIZED");
      } else if (decodedToken) {
        roleRedirect(decodedToken.roles, router);
      } else {
        router.push("/");
      }
    }
  }, [requiredRole, router, authorizedPerson]);

  return {authorized, person};
};

export default useCheckRoleAndPersonId;
