import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { roleRedirect } from "./roleRedirect";
import { getDecodedToken } from "./getDecodedToken";
import { Faculty, FacultyPerson } from "../utils/types";
import { getPlainCookie } from "./getPlainCookie";

const useCheckRoleAndFaculty = (requiredRole: string, facultyId: string) => {
  const [authorizedFaculty, setAuthorizedFaculty] = useState("CHECKING");
  const [authorized, setAuthorized] = useState("CHECKING");
  const router = useRouter();

  const decodedToken = getDecodedToken();
  const token = getPlainCookie();
  const userId = decodedToken ? decodedToken.userId : "";

  const [faculties, setFaculties] = useState<Faculty[]>([]);

  //Fetch worker's faculties
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/faculty-person?personId=${userId}`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data: FacultyPerson[] = await response.json();
        const extractedFaculties = data.map((item) => ({
          id: item.faculty.id,
          name: item.faculty.name,
          abbreviation: item.faculty.abbreviation,
        }));
        setFaculties(extractedFaculties);
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
    if (faculties.length > 0) {
      // if facultyId is inside faculties array set authorizedFaculty to "AUTHORIZED"
      if (faculties.some((faculty) => faculty.id === Number(facultyId))) {
        setAuthorizedFaculty("AUTHORIZED");
      } else {
        router.push("/worker/dashboard");
      }
    }
  }, [facultyId, faculties]);

  useEffect(() => {
    if (authorizedFaculty !== "CHECKING") {
      if (decodedToken && decodedToken.roles.includes(requiredRole)) {
        setAuthorized("AUTHORIZED");
      } else if (decodedToken) {
        roleRedirect(decodedToken.roles, router);
      } else {
        router.push("/");
      }
    }
  }, [requiredRole, router, authorizedFaculty]);

  return authorized;
};

export default useCheckRoleAndFaculty;
