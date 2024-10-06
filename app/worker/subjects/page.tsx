"use client";
import useCheckRole from "@/app/auth/useCheckRole";
import Navbar2 from "@/app/components/Navbar2";
import { PageLoading } from "@/app/components/PageLoading";
import { Button, Pagination, ScrollArea, Table, Tooltip } from "@mantine/core";
import React, { useCallback, useEffect, useState } from "react";
import styles from "./page.module.css";
import Image from "next/image";
import { Faculty, Study, Subject } from "@/app/utils/types";
import { useDisclosure } from "@mantine/hooks";
import { getDecodedToken } from "@/app/auth/getDecodedToken";
import DecodeCookie from "@/app/auth/DecodeCookie";
import { getPlainCookie } from "@/app/auth/getPlainCookie";
import { notifications } from "@mantine/notifications";
import FilterUsersDrawer from "@/app/components/adminComponents/FilterUsersDrawer";
import EditUserModal from "@/app/components/adminComponents/EditUserModal";
import DeleteUserModal from "@/app/components/adminComponents/DeleteUserModal";
import AddFacultyModal from "@/app/components/adminComponents/AddFacultyModal";
import EditFacultyModal from "@/app/components/adminComponents/EditFacultyModal";
import DeleteFacultyModal from "@/app/components/adminComponents/DeleteFacultyModal";
import { useSearchParams } from "next/navigation";
import useCheckRoleAndFaculty from "@/app/auth/useCheckRoleAndFaculty";
import NavbarWorker from "@/app/components/NavbarWorker";
import AddStudyModal from "@/app/components/workerComponents/AddStudyModal";
import EditStudyModal from "@/app/components/workerComponents/EditStudyModal";
import DeleteStudyModal from "@/app/components/workerComponents/DeleteStudyModal";
import AddSubjectModal from "@/app/components/workerComponents/AddSubjectModal";
import EditSubjectModal from "@/app/components/workerComponents/EditSubjectModal";
import DeleteSubjectModal from "@/app/components/workerComponents/DeleteSubjectModal";

function page() {
  const token = getPlainCookie();

  const searchParams = useSearchParams();
  const studyId = searchParams?.get("studyId") ?? "";
  const studyIdNumber = parseInt(studyId);
  const authorized = useCheckRole("ROLE_WORKER");

  const [response, setResponse] = useState<Subject[] | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectEdit, setSubjectEdit] = useState<Subject | null>(null);
  const [subjectDelete, setSubjectDelete] = useState<Subject | null>(null);

  const [elements, setElements] = useState<any[]>([]);

  const [refreshSubjects, setRefreshSubjects] = useState<boolean>(false);

  const [
    openedAddSubjectModal,
    { open: openAddSubjectModal, close: closeAddSubjectModal },
  ] = useDisclosure(false);
  const [
    openedEditSubjectModal,
    { open: openEditSubjectModal, close: closeEditSubjectModal },
  ] = useDisclosure(false);
  const [
    openedDeleteSubjectModal,
    { open: openDeleteSubjectModal, close: closeDeleteSubjectModal },
  ] = useDisclosure(false);

  useEffect(() => {
    setRefreshSubjects(false);
    if (authorized === "AUTHORIZED" || refreshSubjects) {
      fetchData();
    }
  }, [authorized, refreshSubjects]);

  //Fetch faculties
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/subjects?studyId=${studyId}`,
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
  }, [setRefreshSubjects]);

  useEffect(() => {
    if (response) {
      const transformedElements = response.map((subject) => ({
        id: subject.id,
        name: subject.name,
        semester: subject.semester,
      }));
      setElements(transformedElements);
    }
  }, [response]);

  // function to trigger openEditStudyModal and set personEdit
  const handleEditStudy = (subject: Subject) => {
    setSubjectEdit(subject);
  };

  useEffect(() => {
    if (subjectEdit) {
      openEditSubjectModal();
    }
  }, [subjectEdit]);

  // function to trigger openDeleteFacultyModal and set personEdit
  const handleDeleteSubject = (subject: Subject) => {
    setSubjectDelete(subject);
  };

  useEffect(() => {
    if (subjectDelete) {
      openDeleteSubjectModal();
    }
  }, [subjectDelete]);

  const rows = elements.map((element) => (
    <Table.Tr key={element.id}>
      <Table.Td className={styles.column}>{element.name}</Table.Td>
      <Table.Td className={styles.column}>{element.semester}</Table.Td>
      <Table.Td className={styles.column}>
        <div className={styles.crudButtonsContainer}>
          <Tooltip label="Uredi kolegij">
            <Button color="green" onClick={() => handleEditStudy(element)}>
              <Image
                src="/assets/svgs/edit.svg"
                alt="Edit"
                width={24}
                height={24}
              ></Image>
            </Button>
          </Tooltip>
          <Tooltip label="Obriši kolegij">
            <Button color="red" onClick={() => handleDeleteSubject(element)}>
              <Image
                src="/assets/svgs/trash.svg"
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
      <NavbarWorker token={token} />
      <div className={styles.mainDiv}>
        <div className={styles.pageContent}>
          <div className={styles.addAndFilterBtnContainer}>
            <Tooltip label="Dodaj kolegij">
              <Button onClick={openAddSubjectModal}>
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
                  <Table.Th className={styles.column}>Naziv kolegija</Table.Th>
                  <Table.Th className={styles.column}>Semestar</Table.Th>
                  <Table.Th className={styles.column}></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </ScrollArea>
        </div>
        <div className={styles.bottomSpace}></div>
      </div>

      <AddSubjectModal
        token={token}
        opened={openedAddSubjectModal}
        open={openAddSubjectModal}
        close={closeAddSubjectModal}
        creatorRole="ROLE_WORKER"
        setRefreshSubjects={setRefreshSubjects}
        studyId={studyIdNumber}
      />
      <EditSubjectModal
        token={token}
        opened={openedEditSubjectModal}
        open={openEditSubjectModal}
        close={closeEditSubjectModal}
        creatorRole="ROLE_ADMIN"
        setRefreshSubjects={setRefreshSubjects}
        subjectEdit={subjectEdit}
        setSubjectEdit={setSubjectEdit}
        stutyId={studyIdNumber}
      />
      <DeleteSubjectModal
        token={token}
        opened={openedDeleteSubjectModal}
        open={openDeleteSubjectModal}
        close={closeDeleteSubjectModal}
        setRefreshSubjects={setRefreshSubjects}
        subjectDelete={subjectDelete}
        setSubjectDelete={setSubjectDelete}
      />
    </div>
  );
}

export default page;
