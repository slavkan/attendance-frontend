import Cookies from "js-cookie";
import DecodeCookie from "./DecodeCookie";

export const getDecodedToken = () => {
  const token = Cookies.get("jwtTokenAttendanceApp");
  if (token) {
    const decodedToken = DecodeCookie(token);

    if (decodedToken) {
      return {
        roles: decodedToken.roles,
        userId: decodedToken.userId,
      };
    }

  }
  return null;
};