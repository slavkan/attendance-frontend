"use client";
import { PageLoading } from "@/app/components/PageLoading";
import { Button, ScrollArea, Table, Tooltip, Text } from "@mantine/core";
import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import Image from "next/image";
import {
  ClassAttendance,
  ClassSession,
  SessionMessage,
  Study,
} from "@/app/utils/types";
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
import { QRCodeSVG } from "qrcode.react";
import { notifications } from "@mantine/notifications";
import { mapArrivalMessageForDashboard } from "@/app/utils/mapArrivalMessageForStudent";

// var stompClient:any = null;
function page() {
  const token = getPlainCookie();

  const stompClientRef = useRef<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  const searchParams = useSearchParams();
  const subjectId = searchParams?.get("subjectId") ?? "";
  const sessionId = searchParams?.get("sessionId") ?? "";
  const subjectIdNumber = parseInt(subjectId);
  const [debugOptions, setDebugOptions] = useState(false);
  const [optionDebugQrCodeText, setOptionDebugQrCodeText] = useState(false);
  const { authorized, subjectName } = useCheckRoleAndSubject(
    "ROLE_PROFESSOR",
    subjectId
  );

  const decodedToken = getDecodedToken();
  const userId = decodedToken ? decodedToken.userId : "";

  const [response, setResponse] = useState<ClassSession[] | null>(null);
  const [responseAttendance, setResponseAttendance] = useState<
    ClassAttendance[] | null
  >(null);
  const [classSession, setClassSession] = useState<ClassSession>();
  const [studyEdit, setStudyEdit] = useState<Study | null>(null);
  const [studyDelete, setStudyDelete] = useState<Study | null>(null);

  const [offset, setOffset] = useState(0);

  const [QRcode, setQRcode] = useState<string>("");

  const [elements, setElements] = useState<any[]>([]);

  const [refreshStudies, setRefreshStudies] = useState<boolean>(false);
  const [refreshTable, setRefreshTable] = useState<boolean>(false);
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
        setClassSession(responseData);
        setOffset(responseData.offsetInMinutes);
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

  //Fetch class attendance
  useEffect(() => {
    const fetchClassAttendance = async () => {
      setRefreshTable(false);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/class-attendance/${sessionId}`,
          {
            method: "GET",
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const responseData: ClassAttendance[] = await response.json();
          console.log("RESPONSE OK", responseData);
          setResponseAttendance(responseData);
        } else {
          const errorData = await response.json();
          if (errorData) {
            console.log(errorData);
          }
        }
      } catch (error) {
        console.log("Error attempting to fetch data: ", error);
      }
    };

    fetchClassAttendance();
  }, [sessionId, refreshTable]);

  useEffect(() => {
    if (responseAttendance) {
      const transformedElements = responseAttendance
        .map((classAttendance) => ({
          id: classAttendance.id,
          arrivalTime: classAttendance.arrivalTime,
          departureTime: classAttendance.departureTime,
          person: {
            id: classAttendance.person.id,
            firstName: classAttendance.person.firstName,
            lastName: classAttendance.person.lastName,
            indexNumber: classAttendance.person.indexNumber,
          },
        }))
        .sort((a, b) => {
          const dateA = new Date(a.departureTime || a.arrivalTime).getTime();
          const dateB = new Date(b.departureTime || b.arrivalTime).getTime();
          return dateB - dateA;
        });
      setElements(transformedElements);
    }
  }, [responseAttendance]);

  //Trigger generateNewQrCode first render

  useEffect(() => {
    if (sessionId) {
      generateNewQrCode();
    }
  }, [sessionId]);

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
            Authorization: `Bearer ${token}`,
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

  const { start, clear } = useTimeout(() => generateNewQrCode(), 15000);

  // Web Socket
  useEffect(() => {
    const socket = new SockJS(`${process.env.NEXT_PUBLIC_API_URL}/ws`);
    const stompClient = over(socket);
    stompClientRef.current = stompClient;

    const connectPrivateUrl = `/user/${sessionId}/private`;

    stompClient.connect(
      {},
      () => {
        const subscription = stompClient.subscribe(
          connectPrivateUrl,
          onPrivateMessage
        );
        setIsConnected(true);

        // Cleanup function to unsubscribe
        return () => {
          subscription.unsubscribe();
          setIsConnected(false);
        };
      },
      (error) => {
        console.log("Error connecting to web socket: ", error);
      }
    );

    // Cleanup function to disconnect the client
    return () => {
      if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.disconnect();
      }
    };
  }, [sessionId]);

  const sendValue = () => {
    if (isConnected && stompClientRef.current) {
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
      stompClientRef.current.send(
        `/app/class-session`,
        {},
        JSON.stringify(sendMessage)
      );
    } else {
      console.log("stompClient is not initialized or not connected");
    }
  };

  const onPrivateMessage = (payload: any) => {
    console.log(payload);
    var payloadData = JSON.parse(payload.body);
    console.log("Message received: ", payloadData);
    const { finalMessage, status } = mapArrivalMessageForDashboard(
      payloadData.message,
      payloadData.firstName,
      payloadData.lastName
    );
    if (status === "arrival" || status === "departure") {
      setRefreshTable(true);
    }

    setRefreshStudies(true);

    notifications.show({
      color:
        status === "departure"
          ? "green"
          : status === "error"
          ? "red"
          : undefined,
      withBorder: true,
      title: payloadData.firstName + " " + payloadData.lastName,
      message: finalMessage,
    });
  };

  const handleOffsetChange = (event: ChangeEvent<HTMLInputElement>) => {
    setOffset(Number(event.target.value));
  };

  // set offset PUT request
  const sendOffset = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/class-sessions/set-offset?classSessionId=${sessionId}&offset=${offset}`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const responseData: ClassSession = await response.json();
        setOffset(responseData.offsetInMinutes);
        notifications.show({
          withBorder: true,
          title: "Offset",
          message: "Offset changed",
        });
      } else {
        const errorData = await response.json();
        if (errorData) {
          console.log(errorData);
        }
      }
    } catch (error) {
      console.log("Error attempting to fetch data: ", error);
    }
  };



  const rows = elements.map((element) => (
    <Table.Tr key={element.id}>
      {/* <Table.Td className={styles.column}>
        {usePrintDate(element.endTIme)} <b>{usePrintTime(element.endTIme)}</b>
      </Table.Td> */}
      <Table.Td className={styles.column}>
        {element.person.firstName} {element.person.lastName}
      </Table.Td>
      <Table.Td className={styles.columnSmall}>
        {element.person.indexNumber}
      </Table.Td>
      <Table.Td className={styles.columnMedium}>
        {usePrintDate(element.arrivalTime)}{" "}
        <b>{usePrintTime(element.arrivalTime)}</b>
      </Table.Td>
      <Table.Td className={styles.columnMedium}>
        {usePrintDate(element.departureTime)}{" "}
        <b>{usePrintTime(element.departureTime)}</b>
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
              {QRcode && (
                <>
                  <QRCodeSVG value={QRcode} />
                  <Text
                    style={{
                      display: optionDebugQrCodeText ? "block" : "none",
                    }}
                  >
                    {QRcode}
                  </Text>
                </>
              )}
            </div>
          </div>
        </div>
        <div className={styles.bottomSpace}></div>
      </div>

      <button
        onClick={() => setDebugOptions((prev) => !prev)}
        className={styles.debugToggleButton}
      />

      <div
        className={styles.debugMenu}
        style={{ display: debugOptions ? "flex" : "none" }}
      >
        <input type="number" value={offset} onChange={handleOffsetChange} style={{ width: '80px' }} />
        <Button onClick={sendOffset}>Set Offset</Button>
        <Button onClick={() => setOptionDebugQrCodeText((prev) => !prev)}>
          Show QR Text
        </Button>
        <Button onClick={sendValue}>Send Message</Button>
        <Button onClick={start}>Start timer</Button>
        <Button onClick={clear}>Stop timer</Button>
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
