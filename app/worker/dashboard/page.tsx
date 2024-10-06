"use client";
import useCheckRole from "@/app/auth/useCheckRole";
import { PageLoading } from "@/app/components/PageLoading";
import NavbarWorker from "@/app/components/NavbarWorker";

export default function Page() {
  const authorized = useCheckRole("ROLE_WORKER");
  if (authorized === "CHECKING") {
    return <PageLoading visible={true} />;
  }

  return (
    <div>
      <NavbarWorker />
      <div>Radnik</div>
    </div>
  );
}
