import { useRouter } from "next/navigation";

const roleToRouteMap = {
  ROLE_ADMIN: "/admin/dashboard",
  ROLE_WORKER: "/worker/dashboard",
  ROLE_PROFESSOR: "/professor/dashboard",
  ROLE_STUDENT: "/student/dashboard",
} as const;

type Role = keyof typeof roleToRouteMap;

export const roleRedirect = (roles: Role[], router: ReturnType<typeof useRouter>) => {
  roles.some((role) => {
    const route = roleToRouteMap[role];
    if (route) {
      router.push(route);
      return true; // Stop iterating once a route is found
    }
    return false;
  });
};