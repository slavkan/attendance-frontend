"use client";
import Navbar2 from "@/app/components/Navbar2";
import useCheckRole from "@/app/auth/useCheckRole";
import { PageLoading } from "@/app/components/PageLoading";

export default function Page() {
  const authorized = useCheckRole("ROLE_ADMIN");
  if (authorized === "CHECKING") {
    return <PageLoading visible={true} />;
  }

  return (
    <div>
      <Navbar2 />
      <div></div>
    </div>
  );
}
