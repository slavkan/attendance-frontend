"use client";
import useCheckRole from "@/app/auth/useCheckRole";
import Navbar2 from "@/app/components/Navbar2";
import { PageLoading } from "@/app/components/PageLoading";
import { Button, Pagination, ScrollArea, Table, Tooltip } from "@mantine/core";
import React, { useCallback, useEffect, useState } from "react";
import styles from "./page.module.css";
import Image from "next/image";
import { Faculty, Study } from "@/app/utils/types";
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

function page() {
  const token = getPlainCookie();

  const searchParams = useSearchParams();
  const facultyId = searchParams?.get("facultyId") ?? "";
  const facultyIdNumber = parseInt(facultyId);
  const authorized = useCheckRoleAndFaculty("ROLE_WORKER", facultyId);

  const [response, setResponse] = useState<Study[] | null>(null);
  const [studies, setStudies] = useState<Study[]>([]);
  const [studyEdit, setStudyEdit] = useState<Study | null>(null);
  const [studyDelete, setStudyDelete] = useState<Study | null>(null);

  const [elements, setElements] = useState<any[]>([]);

  const [refreshStudies, setRefreshStudies] = useState<boolean>(false);
  const [studiesChanged, setStudiesChanged] = useState<boolean>(false);

  const [
    openedAddStudyModal,
    { open: openAddStudyModal, close: closeAddStudyModal },
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
      console.log("USE EFFECT REFRESH STUDIES");
      fetchData();
    }
  }, [authorized, refreshStudies]);

  //Fetch faculties
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/study?facultyId=${facultyId}`,
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
  }, [setRefreshStudies]);

  useEffect(() => {
    if (response) {
      const transformedElements = response.map((faculty) => ({
        id: faculty.id,
        name: faculty.name,
        //abbreviation: faculty.abbreviation,
      }));
      setElements(transformedElements);
    }
  }, [response]);

  // function to trigger openEditStudyModal and set personEdit
  const handleEditStudy = (study: Study) => {
    setStudyEdit(study);
  };

  useEffect(() => {
    if (studyEdit) {
      openEditStudyModal();
    }
  }, [studyEdit]);

  // function to trigger openDeleteFacultyModal and set personEdit
  const handleDeleteFaculty = (study: Study) => {
    setStudyDelete(study);
  };

  useEffect(() => {
    if (studyDelete) {
      openDeleteStudyModal();
    }
  }, [studyDelete]);

  const rows = elements.map((element) => (
    <Table.Tr key={element.id}>
      <Table.Td className={styles.column}>{element.name}</Table.Td>
      <Table.Td className={styles.column}>
        <div className={styles.crudButtonsContainer}>
          <Tooltip label="Uredi studij">
            <Button color="green" onClick={() => handleEditStudy(element)}>
              <Image
                src="/assets/svgs/edit.svg"
                alt="Edit"
                width={24}
                height={24}
              ></Image>
            </Button>
          </Tooltip>
          <Tooltip label="Obriši studij">
            <Button color="red" onClick={() => handleDeleteFaculty(element)}>
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
      <NavbarWorker token={token} studiesChanged={studiesChanged}/>
      <div className={styles.mainDiv}>
        <div className={styles.pageContent}>
          <div className={styles.addAndFilterBtnContainer}>
            <Tooltip label="Dodaj studij">
              <Button onClick={openAddStudyModal}>
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
                  <Table.Th className={styles.column}>Naziv studija</Table.Th>
                  <Table.Th className={styles.column}></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </ScrollArea>
        </div>
        <div className={styles.bottomSpace}></div>
      </div>

      <AddStudyModal
        token={token}
        opened={openedAddStudyModal}
        open={openAddStudyModal}
        close={closeAddStudyModal}
        creatorRole="ROLE_WORKER"
        setRefreshStudies={setRefreshStudies}
        setStudiesChanged={setStudiesChanged}
        facultyId={facultyIdNumber}
      />
      <EditStudyModal
        token={token}
        opened={openedEditStudyModal}
        open={openEditStudyModal}
        close={closeEditStudyModal}
        creatorRole="ROLE_ADMIN"
        setRefreshStudies={setRefreshStudies}
        setStudiesChanged={setStudiesChanged}
        studyEdit={studyEdit}
        setStudyEdit={setStudyEdit}
        facultyId={facultyIdNumber}
      />
      <DeleteStudyModal
        token={token}
        opened={openedDeleteStudyModal}
        open={openDeleteStudyModal}
        close={closeDeleteStudyModal}
        setRefreshStudies={setRefreshStudies}
        setStudiesChanged={setStudiesChanged}
        studyDelete={studyDelete}
        setStudyDelete={setStudyDelete}
      />
    </div>
  );
}

export default page;
