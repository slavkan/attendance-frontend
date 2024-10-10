"use client";
import styles from "@/app/professor/dashboard/styles.module.css";
import useCheckRole from "@/app/auth/useCheckRole";
import { PageLoading } from "@/app/components/PageLoading";
import { getDecodedToken } from "@/app/auth/getDecodedToken";
import { getPlainCookie } from "@/app/auth/getPlainCookie";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Faculty,
  FacultyPerson,
  Study,
  SubjectPerson,
} from "@/app/utils/types";
import { Accordion, Button, Text } from "@mantine/core";
import Link from "next/link";
import NavbarProfessor from "@/app/components/NavbarProfessor";

export default function Page() {
  const token = getPlainCookie();

  const decodedToken = getDecodedToken();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (decodedToken) {
      setUserId(decodedToken.userId);
    }
  }, [decodedToken]);

  const [subjects, setSubjects] = useState<SubjectPerson[] | null>(null);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);

  //Fetch user's subjects
  const fetchSubjects = useCallback(async () => {
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
        const responseData: SubjectPerson[] = await response.json();
        setSubjects(responseData);

        // Extract unique faculties and studies
        const uniqueFaculties: { [key: number]: Faculty } = {};
        const uniqueStudies: { [key: number]: Study } = {};

        responseData.forEach((subjectPerson) => {
          const faculty = subjectPerson.subject.study.faculty;
          const study = subjectPerson.subject.study;

          if (!uniqueFaculties[faculty.id]) {
            uniqueFaculties[faculty.id] = faculty;
          }

          if (!uniqueStudies[study.id]) {
            uniqueStudies[study.id] = study;
          }
        });

        setFaculties(Object.values(uniqueFaculties));
        setStudies(Object.values(uniqueStudies));
      } else {
        const errorData = await response.json();
        if (errorData) {
          console.log(errorData);
        }
      }
    } catch (error) {
      console.log("Error attempting to fetch data: ", error);
    }
  }, [userId, token]);

  useEffect(() => {
    if (userId) {
      fetchSubjects();
    }
  }, [userId]);

  const studyItems = (facultyId: number) => {
    return studies
      .filter((study) => study.faculty.id === facultyId)
      .map((study) => (
        <Accordion.Item key={study.id} value={study.name}>
          <Accordion.Control>{study.name}</Accordion.Control>
          <Accordion.Panel>
            {subjects
              ?.filter(
                (subjectPerson) => subjectPerson.subject.study.id === study.id
              )
              .sort((a, b) => a.subject.semester - b.subject.semester)
              .map((subjectPerson, index, array) => {
                const currentSemester = subjectPerson.subject.semester;
                const previousSemester =
                  index > 0 ? array[index - 1].subject.semester : null;
                return (
                  <div key={subjectPerson.subject.id}>
                    {currentSemester !== previousSemester && (
                      <Text fw={700}>{currentSemester}. semestar</Text>
                    )}
                    <Link
                      href={{
                        pathname: "/professor/subject",
                        query: { subjectId: subjectPerson.subject.id },
                      }}
                    >
                      <Button variant="default" mb={5}>
                        {subjectPerson.subject.name}
                      </Button>
                    </Link>
                  </div>
                );
              })}
          </Accordion.Panel>
        </Accordion.Item>
      ));
  };

  // Create faculty accordion
  const items =
    faculties.length > 0 ? (
      faculties.map((faculty) => (
        <Accordion.Item key={faculty.id} value={faculty.name}>
          <Accordion.Control>{faculty.name}</Accordion.Control>
          <Accordion.Panel>
            <Accordion variant="contained">{studyItems(faculty.id)}</Accordion>
          </Accordion.Panel>
        </Accordion.Item>
      ))
    ) : (
      <div>Nemate fakulteta</div>
    );

  const authorized = useCheckRole("ROLE_PROFESSOR");
  if (authorized === "CHECKING") {
    return <PageLoading visible={true} />;
  }

  return (
    <div>
      <NavbarProfessor token={token} studiesChanged={false} />
      <div className={styles.accordionWrapper}>
        <div className={styles.accordionWidth}>
        <div className={styles.pageHeading}>
            <Text size="lg" fw={500}>
              Moji Kolegiji
            </Text>
          </div>
          <Accordion variant="separated">{items}</Accordion>
        </div>
      </div>
    </div>
  );
}
