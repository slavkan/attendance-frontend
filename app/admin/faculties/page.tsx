"use client";
import useCheckRole from "@/app/auth/useCheckRole";
import Navbar2 from "@/app/components/Navbar2";
import { PageLoading } from "@/app/components/PageLoading";
import {
  Button,
  Pagination,
  ScrollArea,
  Table,
  Tooltip,
  Text,
} from "@mantine/core";
import React, { useCallback, useEffect, useState } from "react";
import styles from "./page.module.css";
import Image from "next/image";
import { Faculty } from "@/app/utils/types";
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

function page() {
  const authorized = useCheckRole("ROLE_ADMIN");
  const token = getPlainCookie();

  const [response, setResponse] = useState<Faculty[] | null>(null);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [facultyEdit, setFacultyEdit] = useState<Faculty | null>(null);
  const [facultyDelete, setFacultyDelete] = useState<Faculty | null>(null);

  const [elements, setElements] = useState<any[]>([]);

  const [refreshFaculties, setRefreshFaculties] = useState<boolean>(false);

  const [
    openedAddFacultyModal,
    { open: openAddFacultyModal, close: closeAddFacultyModal },
  ] = useDisclosure(false);
  const [
    openedEditFacultyModal,
    { open: openEditFacultyModal, close: closeEditFacultyModal },
  ] = useDisclosure(false);
  const [
    openedDeleteFacultyModal,
    { open: openDeleteFacultyModal, close: closeDeleteFacultyModal },
  ] = useDisclosure(false);

  useEffect(() => {
    setRefreshFaculties(false);
    if (authorized === "AUTHORIZED" || refreshFaculties) {
      fetchData();
    }
  }, [authorized, refreshFaculties]);

  //Fetch faculties
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/faculties`,
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
  }, []);

  useEffect(() => {
    if (response) {
      const transformedElements = response.map((faculty) => ({
        id: faculty.id,
        name: faculty.name,
        abbreviation: faculty.abbreviation,
      }));
      setElements(transformedElements);
    }
  }, [response]);

  // function to trigger openEditFacultyModal and set personEdit
  const handleEditFaculty = (faculty: Faculty) => {
    setFacultyEdit(faculty);
  };

  useEffect(() => {
    if (facultyEdit) {
      openEditFacultyModal();
    }
  }, [facultyEdit]);

  // function to trigger openDeleteFacultyModal and set personEdit
  const handleDeleteFaculty = (faculty: Faculty) => {
    setFacultyDelete(faculty);
  };

  useEffect(() => {
    if (facultyDelete) {
      openDeleteFacultyModal();
    }
  }, [facultyDelete]);

  const rows = elements.map((element) => (
    <Table.Tr key={element.id}>
      <Table.Td className={styles.column}>{element.name}</Table.Td>
      <Table.Td className={styles.column}>{element.abbreviation}</Table.Td>
      <Table.Td className={styles.column}>
        <div className={styles.crudButtonsContainer}>
          <Tooltip label="Uredi fakultet">
            <Button color="green" onClick={() => handleEditFaculty(element)}>
              <Image
                src="/assets/svgs/edit.svg"
                alt="Edit"
                width={24}
                height={24}
              ></Image>
            </Button>
          </Tooltip>
          <Tooltip label="Obriši fakultet">
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
      <Navbar2 />
      <div className={styles.mainDiv}>
        <div className={styles.pageContent}>
          <div className={styles.pageHeading}>
            <Text size="lg" fw={500}>
              Fakulteti
            </Text>
          </div>
          <div className={styles.addAndFilterBtnContainer}>
            <Tooltip label="Dodaj fakultet">
              <Button onClick={openAddFacultyModal}>
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
                  <Table.Th className={styles.column}>Ime</Table.Th>
                  <Table.Th className={styles.column}>Kratica</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </ScrollArea>
        </div>
        <div className={styles.bottomSpace}></div>
      </div>

      <AddFacultyModal
        token={token}
        opened={openedAddFacultyModal}
        open={openAddFacultyModal}
        close={closeAddFacultyModal}
        creatorRole="ROLE_ADMIN"
        setRefreshFaculties={setRefreshFaculties}
      />
      <EditFacultyModal
        token={token}
        opened={openedEditFacultyModal}
        open={openEditFacultyModal}
        close={closeEditFacultyModal}
        creatorRole="ROLE_ADMIN"
        setRefreshFaculties={setRefreshFaculties}
        facultyEdit={facultyEdit}
        setFacultyEdit={setFacultyEdit}
      />
      <DeleteFacultyModal
        token={token}
        opened={openedDeleteFacultyModal}
        open={openDeleteFacultyModal}
        close={closeDeleteFacultyModal}
        setRefreshFaculties={setRefreshFaculties}
        facultyDelete={facultyDelete}
        setFacultyDelete={setFacultyDelete}
      />
      {/* <FilterUsersDrawer
        opened={openedFilterDrawer}
        open={openFilterDrawer}
        close={closeFilterDrawer}
        creatorRole="ROLE_ADMIN"
        setFilterQuery={setFilterQuery}
      /> */}
    </div>
  );
}

export default page;
