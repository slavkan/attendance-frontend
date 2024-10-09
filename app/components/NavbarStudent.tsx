import Image from "next/image";
import {
  HoverCard,
  Group,
  Button,
  UnstyledButton,
  Text,
  SimpleGrid,
  ThemeIcon,
  Anchor,
  Divider,
  Center,
  Box,
  Burger,
  Drawer,
  Collapse,
  ScrollArea,
  rem,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "./Navbar2.module.css";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getDecodedToken } from "../auth/getDecodedToken";
import { Faculty, FacultyPerson, Study } from "../utils/types";

interface NavbarStudentProps {
  token: string | undefined;
  studiesChanged: boolean;
}

const NavbarStudent: React.FC<NavbarStudentProps> = ({
  token,
  studiesChanged,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);

  const [linksOpenedUsers, { toggle: toggleLinksUsers }] = useDisclosure(false);
  const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
  const [linksOpenedStudies, { toggle: toggleLinksStudies }] =
    useDisclosure(false);

  const theme = useMantineTheme();

  const decodedToken = getDecodedToken();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (decodedToken) {
      setUserId(decodedToken.userId);
    }
  }, [decodedToken]);

  const handleLogout = () => {
    localStorage.removeItem("jwtTokenAttendanceApp");
    router.push("/");
  };

  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);
  const hasFetchedStudies = useRef(false);

  //Fetch worker's faculties
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/faculty-person?personId=${userId}`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data: FacultyPerson[] = await response.json();
        const extractedFaculties = data.map((item) => ({
          id: item.faculty.id,
          name: item.faculty.name,
          abbreviation: item.faculty.abbreviation,
        }));
        setFaculties(extractedFaculties);
        // setResponse(responseData);
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

  //Fetch worker's studies
  const fetchDataStudy = useCallback(
    async (facultyId: number) => {
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
          const data: Study[] = await response.json();
          // console.log(`Studies for faculty ${facultyId}:`, data);
          setStudies((prevStudies) => [...prevStudies, ...data]);
        } else {
          const errorData = await response.json();
          if (errorData) {
            console.log(errorData);
          }
        }
      } catch (error) {
        console.log("Error attempting to fetch data: ", error);
      }
    },
    [userId]
  );

  useEffect(() => {
    const fetchAllStudies = async () => {
      for (const faculty of faculties) {
        await fetchDataStudy(faculty.id);
      }
    };

    if (faculties.length > 0 && !hasFetchedStudies.current) {
      fetchAllStudies();
      hasFetchedStudies.current = true;
    }
  }, [faculties, fetchDataStudy]);

  const linksFacultiesForUsers = faculties.map((item) => (
    <UnstyledButton key={item.id} className={classes.subLink}>
      <a href={`/worker/users?facultyId=${item.id}`}>
        <Group wrap="nowrap" align="flex-start">
          <div>
            <Text size="sm" fw={500}>
              {item.abbreviation}
            </Text>
            <Text size="xs" c="dimmed">
              {item.name}
            </Text>
          </div>
        </Group>
      </a>
    </UnstyledButton>
  ));

  const linksFaculties = faculties.map((item) => (
    <UnstyledButton key={item.id} className={classes.subLink}>
      <a href={`/worker/studies?facultyId=${item.id}`}>
        <Group wrap="nowrap" align="flex-start">
          <div>
            <Text size="sm" fw={500}>
              {item.abbreviation}
            </Text>
            <Text size="xs" c="dimmed">
              {item.name}
            </Text>
          </div>
        </Group>
      </a>
    </UnstyledButton>
  ));

  const linksStudies = studies.map((item) => (
    <UnstyledButton key={item.id} className={classes.subLink}>
      <a href={`/worker/subjects?studyId=${item.id}`}>
        <Group wrap="nowrap" align="flex-start">
          <div>
            <Text size="sm" fw={500}>
              {item.name}
            </Text>
            <Text size="xs" c="dimmed">
              {item.faculty.name}
            </Text>
          </div>
        </Group>
      </a>
    </UnstyledButton>
  ));

  return (
    <Box pb={30}>
      <header className={classes.header}>
        <Group justify="space-between" h="100%">
          <Link href={"/student/dashboard"}>
            <Image
              src="/assets/images/SUM_logo.png"
              alt="SUM"
              width={254}
              height={120}
              style={{ width: "auto", height: "35px" }}
            />
          </Link>

          <Group h="100%" gap={0} visibleFrom="sm">
            <Link href="/student/scan" className={classes.link}>
              Skeniraj
            </Link>

            <HoverCard
              width={600}
              position="bottom"
              radius="md"
              shadow="md"
              withinPortal
            >
              <HoverCard.Target>
                <a href="#" className={classes.link}>
                  <Center inline>
                    <Box component="span" mr={5}>
                      Korisnici
                    </Box>
                    <Image
                      src="/assets/svgs/chevron-down.svg"
                      alt="Settings"
                      width={30}
                      height={30}
                      style={{ width: "0.9rem", height: "0.9rem" }}
                    />
                  </Center>
                </a>
              </HoverCard.Target>

              <HoverCard.Dropdown style={{ overflow: "hidden" }}>
                <Group justify="space-between" px="md">
                  <Text fw={500}>Korisnici</Text>
                </Group>

                <Divider my="sm" />

                <SimpleGrid cols={2} spacing={0}>
                  {linksFacultiesForUsers}
                </SimpleGrid>
              </HoverCard.Dropdown>
            </HoverCard>

            <HoverCard
              width={600}
              position="bottom"
              radius="md"
              shadow="md"
              withinPortal
            >
              <HoverCard.Target>
                <a href="#" className={classes.link}>
                  <Center inline>
                    <Box component="span" mr={5}>
                      Studiji
                    </Box>
                    <Image
                      src="/assets/svgs/chevron-down.svg"
                      alt="Settings"
                      width={30}
                      height={30}
                      style={{ width: "0.9rem", height: "0.9rem" }}
                    />
                  </Center>
                </a>
              </HoverCard.Target>

              <HoverCard.Dropdown style={{ overflow: "hidden" }}>
                <Group justify="space-between" px="md">
                  <Text fw={500}>Studiji</Text>
                </Group>

                <Divider my="sm" />

                <SimpleGrid cols={2} spacing={0}>
                  {linksFaculties}
                </SimpleGrid>
              </HoverCard.Dropdown>
            </HoverCard>

            <HoverCard
              width={600}
              position="bottom"
              radius="md"
              shadow="md"
              withinPortal
            >
              <HoverCard.Target>
                <a href="#" className={classes.link}>
                  <Center inline>
                    <Box component="span" mr={5}>
                      Kolegiji
                    </Box>
                    <Image
                      src="/assets/svgs/chevron-down.svg"
                      alt="Settings"
                      width={30}
                      height={30}
                      style={{ width: "0.9rem", height: "0.9rem" }}
                    />
                  </Center>
                </a>
              </HoverCard.Target>

              <HoverCard.Dropdown style={{ overflow: "hidden" }}>
                <Group justify="space-between" px="md">
                  <Text fw={500}>Kolegiji</Text>
                  {studiesChanged && (
                    <Text size="sm">Ovježi stranicu da vidiš promjene</Text>
                  )}
                </Group>

                <Divider my="sm" />

                <SimpleGrid cols={2} spacing={0}>
                  {linksStudies}
                </SimpleGrid>
              </HoverCard.Dropdown>
            </HoverCard>
          </Group>

          <Group visibleFrom="sm">
            <Button>kRakic</Button>
            <Button variant="default" onClick={handleLogout}>
              Odjava
            </Button>
          </Group>

          <Burger
            opened={drawerOpened}
            onClick={toggleDrawer}
            hiddenFrom="sm"
          />
        </Group>
      </header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Izbornik"
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <ScrollArea h={`calc(100vh - ${rem(80)})`} mx="-md">
          <Divider my="sm" />

          <Link href="/student/scan" className={classes.link}>
            Skeniraj
          </Link>

          <UnstyledButton className={classes.link} onClick={toggleLinksUsers}>
            <Center inline>
              <Box component="span" mr={5}>
                Korisnici
              </Box>
              <Image
                src="/assets/svgs/chevron-down.svg"
                alt="Settings"
                width={30}
                height={30}
                style={{ width: "0.9rem", height: "0.9rem" }}
              />
            </Center>
          </UnstyledButton>
          <Collapse in={linksOpenedUsers}>{linksFacultiesForUsers}</Collapse>

          <UnstyledButton className={classes.link} onClick={toggleLinks}>
            <Center inline>
              <Box component="span" mr={5}>
                Studiji
              </Box>
              <Image
                src="/assets/svgs/chevron-down.svg"
                alt="Settings"
                width={30}
                height={30}
                style={{ width: "0.9rem", height: "0.9rem" }}
              />
            </Center>
          </UnstyledButton>
          <Collapse in={linksOpened}>{linksFaculties}</Collapse>

          <UnstyledButton className={classes.link} onClick={toggleLinksStudies}>
            <Center inline>
              <Box component="span" mr={5}>
                Kolegiji
              </Box>
              <Image
                src="/assets/svgs/chevron-down.svg"
                alt="Settings"
                width={30}
                height={30}
                style={{ width: "0.9rem", height: "0.9rem" }}
              />
            </Center>
          </UnstyledButton>
          <Collapse in={linksOpenedStudies}>{linksStudies}</Collapse>
          {/* <a href="#" className={classes.link}>
            Learn
          </a>
          <a href="#" className={classes.link}>
            Academy
          </a> */}

          <Divider my="sm" />

          <Group justify="center" grow pb="xl" px="md">
            <Button>kRakic</Button>
            <Button variant="default" onClick={handleLogout}>
              Odjava
            </Button>
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  );
};

export default NavbarStudent;
