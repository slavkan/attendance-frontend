import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";

import { roleRedirect } from './roleRedirect';
import { getDecodedToken } from './getDecodedToken';

const useCheckRole = (requiredRole: string) => {
  const [authorized, setAuthorized] = useState("CHECKING");
  const router = useRouter();

  useEffect(() => {
    const decodedToken = getDecodedToken();
    if (decodedToken && decodedToken.roles.includes(requiredRole)) {
      setAuthorized("AUTHORIZED");
    } else if (decodedToken) {
      roleRedirect(decodedToken.roles, router);
    } else {
      router.push("/");
    }
  }, [requiredRole, router]);

  return authorized;
};

export default useCheckRole;