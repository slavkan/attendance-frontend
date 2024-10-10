import React, { useCallback, useEffect, useState } from "react";
import { Modal, Text, Table, ScrollArea } from "@mantine/core";
// import styles from "@/app/components/adminComponents/AddUserModal.module.css";
import "@mantine/notifications/styles.css";
import { notifications } from "@mantine/notifications";
import { ClassAttendance, ClassSession } from "@/app/utils/types";
import { usePrintDate, usePrintTime } from "@/app/utils/usePrintDateTime";
import styles from "@/app/components/professorComponents/ViewClassSession.module.css";

interface ViewClassSessionModalProps {
  token: string | undefined;
  opened: boolean;
  open: () => void;
  close: () => void;
  creatorRole: string;
  classSessionId: string;
  setClassSessionId: (value: string) => void;
}

export default function ViewClassSessionModal({
  token,
  opened,
  open,
  close,
  creatorRole,
  classSessionId,
  setClassSessionId,
}: ViewClassSessionModalProps) {
  const [classSession, setClassSession] = useState<ClassSession>();
  const [classAttendance, setClassAttendance] = useState<ClassAttendance[]>();
  const [elements, setElements] = useState<any[]>([]);

  const handleClose = () => {
    setClassSessionId("0");
    close();
  };

  //Fetch Session info
  const fetchData = useCallback(async () => {
    if (classSessionId === "0") {
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/class-sessions/${classSessionId}`,
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
        console.log(responseData);
      } else {
        const errorData = await response.json();
        if (errorData) {
          console.log(errorData);
        }
      }
    } catch (error) {
      console.log("Error attempting to fetch data: ", error);
    }
  }, [classSessionId]);

  //Fetch attendance
  const fetchDataA = useCallback(async () => {
    if (classSessionId === "0") {
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/class-attendance/${classSessionId}`,
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
        console.log(responseData);
        setClassAttendance(responseData);
      } else {
        const errorData = await response.json();
        if (errorData) {
          console.log(errorData);
        }
      }
    } catch (error) {
      console.log("Error attempting to fetch data: ", error);
    }
  }, [classSessionId]);

  useEffect(() => {
    if (classSessionId !== "0") {
      fetchData();
      fetchDataA();
    }
  }, [classSessionId]);

  useEffect(() => {
    if (classAttendance) {
      const transformedElements = classAttendance
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
  }, [classAttendance]);

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
      <Table.Td className={styles.columnSmall}>
        {/* {usePrintDate(element.arrivalTime)}{" "} */}
        <b>{usePrintTime(element.arrivalTime)}</b>
      </Table.Td>
      <Table.Td className={styles.columnSmall}>
        {/* {usePrintDate(element.departureTime)}{" "} */}
        <b>{usePrintTime(element.departureTime)}</b>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Modal opened={opened} onClose={handleClose} title="Pregled predavanja" size="80%">
        <div className={styles.viewClassSessionHeader}>
          <div>
          <Text size="xl" fw={500}>{classSession?.subject.name}</Text>
          <Text size="xl" fw={500}>{classSession?.person.academicTitle} {classSession?.person.firstName} {classSession?.person.lastName}</Text>
          </div>
          <div>
          <Text size="xl" style={{ textAlign: "right" }}>Početak predavanja: {usePrintDate(classSession?.startTime)}{" "} <span style={{ fontWeight: 500 }}> {usePrintTime(classSession?.startTime)}</span></Text>
          <Text size="xl" style={{ textAlign: "right" }}>Završetak predavanja: {usePrintDate(classSession?.endTime)}{" "} <span style={{ fontWeight: 500 }}> {usePrintTime(classSession?.endTime)}</span></Text>
          </div>
        </div>
        <ScrollArea className={styles.borderColor}>
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th className={styles.column}>Ime</Table.Th>
                <Table.Th className={styles.columnSmall}>Indeks</Table.Th>
                <Table.Th className={styles.columnSmall}>
                  Vrijeme dolaska
                </Table.Th>
                <Table.Th className={styles.columnSmall}>
                  Vrijeme odlaska
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </ScrollArea>
      </Modal>
    </>
  );
}
