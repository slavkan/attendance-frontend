"use client";
import { PageLoading } from "@/app/components/PageLoading";
import { Button, ScrollArea, Table, Tooltip, Text } from "@mantine/core";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import Image from "next/image";
import { ClassSession, SessionMessage, Study } from "@/app/utils/types";
import { useDisclosure, useTimeout } from "@mantine/hooks";
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

import { over } from "stompjs";
import SockJS from "sockjs-client";
import { useGenerateRandomString } from "@/app/utils/useGenerateRandomString";
import {QRCodeSVG} from 'qrcode.react';
import { notifications } from "@mantine/notifications";



// var stompClient:any = null;
function page() {
  const token = getPlainCookie();
  
  const stompClientRef = useRef<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  const searchParams = useSearchParams();
  const subjectId = searchParams?.get("subjectId") ?? "";
  const sessionId = searchParams?.get("sessionId") ?? "";
  const subjectIdNumber = parseInt(subjectId);
  const { authorized, subjectName } = useCheckRoleAndSubject(
    "ROLE_PROFESSOR",
    subjectId
  );

  const decodedToken = getDecodedToken();
  const userId = decodedToken ? decodedToken.userId : "";

  const [response, setResponse] = useState<ClassSession[] | null>(null);
  const [classSession, setClassSession] = useState<ClassSession>();
  const [studyEdit, setStudyEdit] = useState<Study | null>(null);
  const [studyDelete, setStudyDelete] = useState<Study | null>(null);

  const [QRcode, setQRcode] = useState<string>("");

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
    openedDeleteStudyModal,
    { open: openDeleteStudyModal, close: closeDeleteStudyModal },
  ] = useDisclosure(false);

  useEffect(() => {
    setRefreshStudies(false);
    if (authorized === "AUTHORIZED" || refreshStudies) {
      fetchData();
    }
  }, [authorized, refreshStudies]);

  //Fetch Session info
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/class-sessions/${sessionId}`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const responseData: ClassSession = await response.json();
        console.log("RESPOSNE OK", responseData);
        setClassSession(responseData);
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


  // Generate QR code
  const generateNewQrCode = useCallback(async () => {
    clear();
    console.log("TIMER CLEARED");
    const newCode = useGenerateRandomString(sessionId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/class-sessions/change-qr-code?classSessionId=${sessionId}&newCode=${newCode}`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const responseData: ClassSession = await response.json();
        start();
        console.log("NEW TIMER STARTED");
        setQRcode(responseData.codeForArrival);
        setClassSession(responseData);
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



  const { start, clear } = useTimeout(() => generateNewQrCode(), 2000);

  // Web Socket
  useEffect(() => {
    const socket = new SockJS(`${process.env.NEXT_PUBLIC_API_URL}/ws`);
    const stompClient = over(socket);
    stompClientRef.current = stompClient;

    const connectPrivateUrl = `/user/${sessionId}/private`;
  
    stompClient.connect(
      {},
      () => {
        stompClient.subscribe(
          connectPrivateUrl,
          onPrivateMessage
        );
      },
      (error) => {
        console.log("Error connecting to web socket: ", error);
      }
    );
  }, [sessionId]);
  
  const sendValue = () => {
    if (stompClientRef.current) {
      const sendMessage = {
        classSessionId: 1,
        subjectName: "",
        personId: 1,
        code: "1_5mr9ketfno",
        firstName: "",
        lastName: "",
        arrivalTime: "",
        departureTime: "",
        message: "",
      };
      stompClientRef.current.send(`/app/class-session`, {}, JSON.stringify(sendMessage));
    } else {
      console.log("stompClient is not initialized");
    }
  };


  const onPrivateMessage = (payload:any) => {
    console.log(payload);
    var payloadData = JSON.parse(payload.body);
    console.log("Message received: ", payloadData);
    notifications.show({
      withBorder: true,
      title: "Scan",
      message: `Skeniro si se`,
    });
  };




  const rows = elements.map((element) => (
    <Table.Tr key={element.id}>
      <Table.Td className={styles.column}>
        {usePrintDate(element.startTime)}{" "}
        <b>{usePrintTime(element.startTime)}</b>
      </Table.Td>
      <Table.Td className={styles.column}>
        {usePrintDate(element.endTIme)} <b>{usePrintTime(element.endTIme)}</b>
      </Table.Td>
      <Table.Td className={styles.column}>{element.status}</Table.Td>
      <Table.Td className={styles.column}>
        <div className={styles.crudButtonsContainer}>
          {element.status !== "Završeno" && (
            <Tooltip label="Nastavi predavanje">
              <Link
                href={{
                  pathname: "/professor/session",
                  query: { sessionId: element.id },
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

          {/* <Tooltip label="Obriši studij">
            <Button color="red" onClick={() => handleDeleteFaculty(element)}>
              <Image
                src="/assets/svgs/trash.svg"
                alt="Delete"
                width={24}
                height={24}
              ></Image>
            </Button>
          </Tooltip> */}
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

      <div className={styles.mainDiv}>
        <div className={styles.pageContent}>
          <div className={styles.headingRowContainer}>
            <Text size="xl" ta="center" fw={500} mb={20}>
              {classSession?.subject.name}
            </Text>
            <Text size="xl" ta="center" mb={20}>
              {classSession?.person.academicTitle}{" "}
              {classSession?.person.firstName} {classSession?.person.lastName}
            </Text>
            <Text size="xl" ta="center" mb={20}>
              {usePrintDate(classSession?.startTime)}
            </Text>
          </div>
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

          <div className={styles.tableAndCodesContainer}>
            <ScrollArea className={styles.borderColor}>
              <Table striped highlightOnHover withTableBorder withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th className={styles.column}>Ime</Table.Th>
                    <Table.Th className={styles.columnSmall}>Indeks</Table.Th>
                    <Table.Th className={styles.columnMedium}>
                      Vrijeme dolaska
                    </Table.Th>
                    <Table.Th className={styles.columnMedium}>
                      Vrijeme odlaska
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
              </Table>
            </ScrollArea>
            <div className={styles.codesContainer}>
              {QRcode &&
                <>
                  <QRCodeSVG value={QRcode} />
                  <Text>{QRcode}</Text>
                </>
              }
              <Button onClick={sendValue}>Send Message</Button>
              <Button onClick={start}>Start timer</Button>
              <Button onClick={clear}>Stop timer</Button>
            </div>
          </div>
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
    </div>
  );
}

export default page;
