"use client";
import useCheckRole from "@/app/auth/useCheckRole";
import { PageLoading } from "@/app/components/PageLoading";
import NavbarWorker from "@/app/components/NavbarWorker";
import { getDecodedToken } from "@/app/auth/getDecodedToken";
import { getPlainCookie } from "@/app/auth/getPlainCookie";

export default function Page() {
  const authorized = useCheckRole("ROLE_WORKER");
  if (authorized === "CHECKING") {
    return <PageLoading visible={true} />;
  }

  const token = getPlainCookie();

  return (
    <div>
      <NavbarWorker 
        token={token}
        studiesChanged={false}
      />
      <div>Radnik</div>
    </div>
  );
}
