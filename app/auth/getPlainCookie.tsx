import Cookies from "js-cookie";

export const getPlainCookie = (): string | undefined => {
  const token = Cookies.get("jwtTokenAttendanceApp");
  return token;
};