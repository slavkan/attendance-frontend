"use client";
import useCheckRole from "@/app/auth/useCheckRole";
import { PageLoading } from "@/app/components/PageLoading";
import { getDecodedToken } from "@/app/auth/getDecodedToken";
import { getPlainCookie } from "@/app/auth/getPlainCookie";
import { Scanner } from "@yudiel/react-qr-scanner";
import NavbarStudent from "@/app/components/NavbarStudent";
import styles from "@/app/student/scan/styles.module.css";

export default function Page() {
  const authorized = useCheckRole("ROLE_STUDENT");
  if (authorized === "CHECKING") {
    return <PageLoading visible={true} />;
  }

  const token = getPlainCookie();

  return (
    <div>
      <NavbarStudent token={token} studiesChanged={false} />
      <div className={styles.pageWrapper}>
        <div className={styles.cameraWrapper}>
          <Scanner
            onScan={(result) => console.log(result)}
            styles={{
              container: {
                backgroundColor: "red",
                maxHeight: "400px",
                width: "auto",
                aspectRatio: "1",
              },
              video: {
                maxHeight: "400px",
                width: "auto",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
