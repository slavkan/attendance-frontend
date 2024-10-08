import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { roleRedirect } from "./roleRedirect";
import { getDecodedToken } from "./getDecodedToken";
import { Subject, SubjectPerson } from "../utils/types";
import { getPlainCookie } from "./getPlainCookie";

const useCheckRoleAndSubject = (requiredRole: string, subjectId: string) => {
  const [authorizedSubject, setAuthorizedSubject] = useState("CHECKING");
  const [authorized, setAuthorized] = useState("CHECKING");
  const [subjectName, setSubjectName] = useState("");
  const router = useRouter();

  const decodedToken = getDecodedToken();
  const token = getPlainCookie();
  const userId = decodedToken ? decodedToken.userId : "";

  const [subjectPerson, setSubjectPerson] = useState<SubjectPerson[]>([]);

  //Fetch worker's subjectPerson
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/subject-person?personId=${userId}`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data: SubjectPerson[] = await response.json();
        console.log(data);
        const extractedSubjectPerson = data.map((item) => ({
          id: item.id,
          subject: item.subject,
          person: item.person,
        }));
        setSubjectPerson(extractedSubjectPerson);
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
    if (subjectPerson.length > 0) {
      // if subjectId is inside subjects array set authorizedSubject to "AUTHORIZED"
      const foundSubjectPerson = subjectPerson.find(
        (subjectPersonItem) => subjectPersonItem.subject.id === Number(subjectId)
      );
      if (foundSubjectPerson) {
        setSubjectName(foundSubjectPerson.subject.name);
        setAuthorizedSubject("AUTHORIZED");
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
  }, [subjectId, subjectPerson]);

  useEffect(() => {
    if (authorizedSubject !== "CHECKING") {
      if (decodedToken && decodedToken.roles.includes(requiredRole)) {
        setAuthorized("AUTHORIZED");
      } else if (decodedToken) {
        roleRedirect(decodedToken.roles, router);
      } else {
        router.push("/");
      }
    }
  }, [requiredRole, router, authorizedSubject]);

  return { authorized, subjectName };
};

export default useCheckRoleAndSubject;
