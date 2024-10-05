"use client";
import useCheckRole from "@/app/auth/useCheckRole";
import Navbar2 from "@/app/components/Navbar2";
import { PageLoading } from "@/app/components/PageLoading";
import { Button, Pagination, ScrollArea, Table, Tooltip } from "@mantine/core";
import React, { useCallback, useEffect, useState } from "react";
import styles from "./page.module.css";
import Image from "next/image";
import { ApiResponsePerson, Person, Faculty } from "@/app/utils/types";
import AddUserModal from "@/app/components/AddUserModal";
import { useDisclosure } from "@mantine/hooks";
import { getDecodedToken } from "@/app/auth/getDecodedToken";
import DecodeCookie from "@/app/auth/DecodeCookie";
import { getPlainCookie } from "@/app/auth/getPlainCookie";
import { notifications } from "@mantine/notifications";
import FilterUsersDrawer from "@/app/components/FilterUsersDrawer";
import EditUserModal from "@/app/components/EditUserModal";
import DeleteUserModal from "@/app/components/DeleteUserModal";

function page() {
  const authorized = useCheckRole("ROLE_ADMIN");
  const token = getPlainCookie();

  const [response, setResponse] = useState<ApiResponsePerson | null>(null);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [personEdit, setPersonEdit] = useState<Person | null>(null);
  const [personDelete, setPersonDelete] = useState<Person | null>(null);

  const [elements, setElements] = useState<any[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>("");

  const [refreshUsers, setRefreshUsers] = useState<boolean>(false);
  const [facultiesToBeFetched, setFacultiesToBeFetched] = useState<boolean>(true);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);

  const [
    openedAddUserModal,
    { open: openAddUserModal, close: closeAddUserModal },
  ] = useDisclosure(false);
  const [
    openedEditUserModal,
    { open: openEditUserModal, close: closeEditUserModal },
  ] = useDisclosure(false);
  const [
    openedDeleteUserModal,
    { open: openDeleteUserModal, close: closeDeleteUserModal },
  ] = useDisclosure(false);
  const [
    openedFilterDrawer,
    { open: openFilterDrawer, close: closeFilterDrawer },
  ] = useDisclosure(false);

  useEffect(() => {
    setRefreshUsers(false);
    if (authorized === "AUTHORIZED" || refreshUsers) {
      fetchData();
    }
  }, [authorized, filterQuery, refreshUsers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterQuery]);

  //Fetch users
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/persons/filter?page=${
          currentPage - 1
        }&size=${pageSize}${filterQuery}`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        setTotalPages(responseData.totalPages);
        if (currentPage > responseData.totalPages) {
          setCurrentPage(responseData.totalPages);
        }
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
  }, [filterQuery, currentPage]);

  //Fetch faculties
  const fetchFaculties = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/faculties`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        setFaculties(responseData);
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
    if (facultiesToBeFetched) {
      setFacultiesToBeFetched(false);
      fetchFaculties();
    }
  }, [facultiesToBeFetched]);


  useEffect(() => {
    if (response) {
      const transformedElements = response.content.map((person) => ({
        id: person.id,
        firstName: person.firstName,
        lastName: person.lastName,
        username: person.username,
        email: person.email,
        indexNumber: person.indexNumber,
        academicTitle: person.academicTitle,
        admin: person.admin,
        worker: person.worker,
        professor: person.professor,
        student: person.student,
        rolesDisplay: `${person.admin ? "(Admin) " : ""}${
          person.worker ? "(Radnik) " : ""
        }${person.professor ? "(Profesor) " : ""}${
          person.student ? "(Student) " : ""
        }`,
      }));
      setElements(transformedElements);
    }
  }, [response]);

  // function to trigger openEditUserModal and set personEdit
  const handleEditUser = (person: Person) => {
    setPersonEdit(person);
  };

  useEffect(() => {
    if (personEdit) {
      openEditUserModal();
    }
  }, [personEdit]);

  // function to trigger openDeleteUserModal and set personEdit
  const handleDeleteUser = (person: Person) => {
    setPersonDelete(person);
  };

  useEffect(() => {
    if (personDelete) {
      openDeleteUserModal();
    }
  }, [personDelete]);

  const rows = elements.map((element) => (
    <Table.Tr key={element.id}>
      <Table.Td className={styles.column}>{element.firstName}</Table.Td>
      <Table.Td className={styles.column}>{element.lastName}</Table.Td>
      <Table.Td className={styles.column}>{element.email}</Table.Td>
      <Table.Td className={styles.column}>{element.indexNumber}</Table.Td>
      <Table.Td className={styles.column}>{element.rolesDisplay}</Table.Td>
      <Table.Td className={styles.column}>
        <div className={styles.crudButtonsContainer}>
          <Tooltip label="Uredi korisnika">
            <Button color="green" onClick={() => handleEditUser(element)}>
              <Image
                src="/assets/svgs/edit.svg"
                alt="Edit"
                width={24}
                height={24}
              ></Image>
            </Button>
          </Tooltip>
          <Tooltip label="Obriši korisnika">
            <Button color="red" onClick={() => handleDeleteUser(element)}>
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
    return <PageLoading visible={true}/>;
  }

  return (
    <div>
      <Navbar2 />
      <div className={styles.mainDiv}>
        <div className={styles.pageContent}>
          <div className={styles.addAndFilterBtnContainer}>
            <Tooltip label="Dodaj korisnika">
              <Button onClick={openAddUserModal}>
                <Image
                  src="/assets/svgs/plus.svg"
                  alt="Plus Icon"
                  width={24}
                  height={24}
                />
              </Button>
            </Tooltip>
            <Tooltip label="Filtriraj">
              <Button variant="filled" color="gray" onClick={openFilterDrawer}>
                <Image
                  src="/assets/svgs/filtering.svg"
                  alt="Filter"
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
                  <Table.Th className={styles.column}>Prezime</Table.Th>
                  <Table.Th className={styles.column}>Email</Table.Th>
                  <Table.Th className={styles.column}>Indeks</Table.Th>
                  <Table.Th className={styles.column}>Prava</Table.Th>
                  <Table.Th className={styles.column}></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </ScrollArea>
        </div>
        <Pagination
          value={currentPage}
          onChange={setCurrentPage}
          total={totalPages}
          mt={50}
        />
        <div className={styles.bottomSpace}></div>
      </div>

      <AddUserModal
        token={token}
        opened={openedAddUserModal}
        open={openAddUserModal}
        close={closeAddUserModal}
        creatorRole="ROLE_ADMIN"
        setRefreshUsers={setRefreshUsers}
      />
      <EditUserModal
        token={token}
        opened={openedEditUserModal}
        open={openEditUserModal}
        close={closeEditUserModal}
        creatorRole="ROLE_ADMIN"
        setRefreshUsers={setRefreshUsers}
        personEdit={personEdit}
        setPersonEdit={setPersonEdit}
        faculties={faculties}
      />
      <DeleteUserModal
        token={token}
        opened={openedDeleteUserModal}
        open={openDeleteUserModal}
        close={closeDeleteUserModal}
        setRefreshUsers={setRefreshUsers}
        personDelete={personDelete}
        setPersonDelete={setPersonDelete}
      />
      <FilterUsersDrawer
        opened={openedFilterDrawer}
        open={openFilterDrawer}
        close={closeFilterDrawer}
        creatorRole="ROLE_ADMIN"
        setFilterQuery={setFilterQuery}
      />
    </div>
  );
}

export default page;
