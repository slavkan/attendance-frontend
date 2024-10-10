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

interface NavbarProfessorProps {
  token: string | undefined;
  studiesChanged: boolean;
}

const NavbarProfessor: React.FC<NavbarProfessorProps> = ({
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
  const personId = decodedToken ? decodedToken.userId : "";
  const personUsername = decodedToken ? decodedToken.username : "";
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


  return (
    <Box pb={30}>
      <header className={classes.header}>
        <Group justify="space-between" h="100%">
          <Link href={"/professor/dashboard"}>
            <Image
              src="/assets/images/SUM_logo.png"
              alt="SUM"
              width={254}
              height={120}
              style={{ width: "auto", height: "35px" }}
            />
          </Link>

          <Group h="100%" gap={0} visibleFrom="sm">

            <Link href="/professor/dashboard" className={classes.link}>
              Moji kolegiji
            </Link>
          </Group>

          <Group visibleFrom="sm">
            <Text
              style={{
                color: "var(--mantine-color-dark-3)",
                userSelect: "none",
              }}
            >
              Profesor
            </Text>
            <Link
              href={{
                pathname: "/professor/profile",
                query: { personId: personId },
              }}
            >
              <Button>{personUsername}</Button>
            </Link>
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
        title="Izbornik - Profesor"
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <ScrollArea h={`calc(100vh - ${rem(80)})`} mx="-md">
          <Divider my="sm" />

          <Link href="/professor/dashboard" className={classes.link}>
            Moji kolegiji
          </Link>

          <Divider my="sm" />

          <Group justify="center" grow pb="xl" px="md">
            <Link
              href={{
                pathname: "/professor/profile",
                query: { personId: personId },
              }}
            >
              <Button fullWidth>{personUsername}</Button>
            </Link>
            <Button variant="default" onClick={handleLogout}>
              Odjava
            </Button>
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  );
};

export default NavbarProfessor;
