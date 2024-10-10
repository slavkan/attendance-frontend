"use client";
import { PageLoading } from "@/app/components/PageLoading";
import { Button, ScrollArea, Table, Tooltip, Text } from "@mantine/core";
import React, { useCallback, useEffect, useState } from "react";
import styles from "./page.module.css";
import Image from "next/image";
import { ClassSession, Study } from "@/app/utils/types";
import { useDisclosure } from "@mantine/hooks";
import { getPlainCookie } from "@/app/auth/getPlainCookie";
import { useSearchParams } from "next/navigation";
import NavbarWorker from "@/app/components/NavbarWorker";
import AddStudyModal from "@/app/components/workerComponents/AddStudyModal";
import EditStudyModal from "@/app/components/workerComponents/EditStudyModal";
import DeleteStudyModal from "@/app/components/workerComponents/DeleteStudyModal";
import useCheckRoleAndSubject from "@/app/auth/useCheckRoleAndSubject";
import NavbarProfessor from "@/app/components/NavbarProfessor";
import {
  usePrintDate,
  usePrintTime,
  usePrintDateTime,
} from "@/app/utils/usePrintDateTime";
import StartClassSessionModal from "@/app/components/professorComponents/StartClassSessionModal";
import { getDecodedToken } from "@/app/auth/getDecodedToken";
import Link from "next/link";
import ViewClassSessionModal from "@/app/components/professorComponents/ViewClassSessionModal";

function page() {
  const token = getPlainCookie();

  const searchParams = useSearchParams();
  const subjectId = searchParams?.get("subjectId") ?? "";
  const subjectIdNumber = parseInt(subjectId);
  const { authorized, subjectName } = useCheckRoleAndSubject(
    "ROLE_PROFESSOR",
    subjectId
  );

  const decodedToken = getDecodedToken();
  const userId = decodedToken ? decodedToken.userId : "";

  const [response, setResponse] = useState<ClassSession[] | null>(null);
  // const [classSessions, setClassSessions] = useState<Study[]>([]);
  const [studyEdit, setStudyEdit] = useState<Study | null>(null);
  const [viewClassSessionId, setViewClassSessionId] = useState("0");

  const [elements, setElements] = useState<any[]>([]);

  const [refreshStudies, setRefreshStudies] = useState<boolean>(false);
  const [studiesChanged, setStudiesChanged] = useState<boolean>(false);

  const [
    openedStartNewClassSessionModal,
    {
      open: openStartNewClassSessionModal,
      close: closeStartNewClassSessionModal,
    },
  ] = useDisclosure(false);
  const [
    openedEditStudyModal,
    { open: openEditStudyModal, close: closeEditStudyModal },
  ] = useDisclosure(false);
  const [
    openedViewClassSessionModal,
    { open: openViewClassSessionModal, close: closeViewClassSessionModal },
  ] = useDisclosure(false);

  useEffect(() => {
    setRefreshStudies(false);
    if (authorized === "AUTHORIZED" || refreshStudies) {
      fetchData();
    }
  }, [authorized, refreshStudies]);

  //Fetch faculties
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/class-sessions?subjectId=${subjectId}`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        console.log(responseData);
        setResponse(responseData);
      } else {
        const errorData = await response.json();
        if (errorData) {
          console.log(errorData);
        }
      }
    } catch (error) {
      console.log("Error attempting to fetch data: ", error);
    }
  }, [setRefreshStudies, subjectId]);

  useEffect(() => {
    if (response) {
      const transformedElements = response
        .map((classSession) => ({
          id: classSession.id,
          startTime: classSession.startTime,
          endTime: classSession.endTime,
          status:
            classSession.state === "IN_PROGRESS"
              ? "U tijeku"
              : classSession.state === "PAUSED"
              ? "Pauzirano"
              : "Završeno",
        }))
        .sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
      setElements(transformedElements);
    }
  }, [response]);

  // function to trigger openEditStudyModal and set personEdit
  // const handleContinueClassSession = (study: Study) => {
  //   setStudyEdit(study);
  // };

  useEffect(() => {
    if (studyEdit) {
      openEditStudyModal();
    }
  }, [studyEdit]);

  // function to trigger openDeleteFacultyModal and set personEdit
  const handleViewClassSession = (classSessionId: string) => {
    setViewClassSessionId(classSessionId);
  };

  useEffect(() => {
    if (viewClassSessionId !== "0") {
      console.log("viewClassSessionId", viewClassSessionId);
      openViewClassSessionModal();
    }
  }, [viewClassSessionId]);

  const rows = elements.map((element) => (
    <Table.Tr key={element.id}>
      <Table.Td className={styles.column}>
        {usePrintDate(element.startTime)}{" "}
        <b>{usePrintTime(element.startTime)}</b>
      </Table.Td>
      <Table.Td className={styles.column}>
        {usePrintDate(element.endTime)} <b>{usePrintTime(element.endTime)}</b>
      </Table.Td>
      <Table.Td className={styles.column}>{element.status}</Table.Td>
      <Table.Td className={styles.column}>
        <div className={styles.crudButtonsContainer}>
          {element.status !== "Završeno" && (
            <Tooltip label="Nastavi predavanje">
              <Link
                href={{
                  pathname: "/professor/session",
                  query: { sessionId: element.id, subjectId: subjectId },
                }}
              >
                <Button color="blue">
                  <Image
                    src="/assets/svgs/play.svg"
                    alt="Edit"
                    width={24}
                    height={24}
                  ></Image>
                </Button>
              </Link>
            </Tooltip>
          )}

          <Tooltip label="Pregled predavanja">
            <Button color="green" onClick={() => handleViewClassSession(element.id)}>
              <Image
                src="/assets/svgs/eye.svg"
                alt="Delete"
                width={24}
                height={24}
              ></Image>
            </Button>
          </Tooltip>
        </div>
      </Table.Td>
    </Table.Tr>
  ));

  if (authorized === "CHECKING") {
    return <PageLoading visible={true} />;
  }

  return (
    <div>
      <NavbarProfessor token={token} studiesChanged={studiesChanged} />
      <Text size="xl" ta="center" mb={20}>
        {subjectName} - Sva predavanja
      </Text>
      <div className={styles.mainDiv}>
        <div className={styles.pageContent}>
          <div className={styles.addAndFilterBtnContainer}>
            <Tooltip label="Pokreni novo predavanje">
              <Button onClick={openStartNewClassSessionModal}>
                <Image
                  src="/assets/svgs/plus.svg"
                  alt="Plus Icon"
                  width={24}
                  height={24}
                />
              </Button>
            </Tooltip>
          </div>

          <ScrollArea className={styles.borderColor}>
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th className={styles.column}>Start</Table.Th>
                  <Table.Th className={styles.column}>End</Table.Th>
                  <Table.Th className={styles.column}>Status</Table.Th>
                  <Table.Th className={styles.column}></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </ScrollArea>
        </div>
        <div className={styles.bottomSpace}></div>
      </div>

      <StartClassSessionModal
        token={token}
        opened={openedStartNewClassSessionModal}
        open={openStartNewClassSessionModal}
        close={closeStartNewClassSessionModal}
        creatorRole="ROLE_PROFESSOR"
        subjectId={subjectId}
        professorId={userId}
      />
      <ViewClassSessionModal
        token={token}
        opened={openedViewClassSessionModal}
        open={openViewClassSessionModal}
        close={closeViewClassSessionModal}
        creatorRole="ROLE_PROFESSOR"
        classSessionId={viewClassSessionId}
        setClassSessionId={setViewClassSessionId}
      />
    </div>
  );
}

export default page;
