"use client";
import useCheckRole from "@/app/auth/useCheckRole";
import { PageLoading } from "@/app/components/PageLoading";
import { getDecodedToken } from "@/app/auth/getDecodedToken";
import { getPlainCookie } from "@/app/auth/getPlainCookie";
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import NavbarStudent from "@/app/components/NavbarStudent";
import styles from "@/app/student/scan/styles.module.css";
import { useEffect, useRef, useState } from "react";

import { over } from "stompjs";
import SockJS from "sockjs-client";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import '@mantine/notifications/styles.css';


export default function Page() {
  const token = getPlainCookie();
  const decodedToken = getDecodedToken();
  const userId = decodedToken ? decodedToken.userId : "";

  const stompClientRef = useRef<any>(null);
  const [scanResults, setScanResults] = useState<IDetectedBarcode[]>([]);
  const [qrExtractedData, setQrExtractedData] = useState("");
  const [isScannerActive, setIsScannerActive] = useState(true);
  const [sessionId, setSessionId] = useState("");
  const [alreadyConnectedToSocket, setAlreadyConnectedToSocket] =
    useState(false);

  const [debug, setDebug] = useState("A");

  const handleScan = (detectedCodes: IDetectedBarcode[]) => {
    if (detectedCodes.length > 0) {
      
      setIsScannerActive(false);
      setQrExtractedData(detectedCodes[0].rawValue);
      const extractSessionId = detectedCodes[0].rawValue.split('_')[0];
      setDebug(detectedCodes[0].rawValue);
      setSessionId(extractSessionId);
    }else {
      setDebug("ELSE OTISLO");
    }
    if (alreadyConnectedToSocket === true) {
      sendValue(detectedCodes[0].rawValue);
    }
  };

  // Web Socket
  useEffect(() => {
    if (alreadyConnectedToSocket === false) {
      if (sessionId !== "" && qrExtractedData !== "") {
        setAlreadyConnectedToSocket(true);
        const socket = new SockJS(`${process.env.NEXT_PUBLIC_API_URL}/ws`);
        const stompClient = over(socket);
        stompClientRef.current = stompClient;

        const connectPrivateUrl = `/user/${sessionId}/private-student`;

        stompClient.connect(
          {},
          () => {
            stompClient.subscribe(connectPrivateUrl, onPrivateMessage);
            sendValue(qrExtractedData);
          },
          (error) => {
            console.log("Error connecting to web socket: ", error);
          }
        );
      }
    }
  }, [sessionId, alreadyConnectedToSocket, qrExtractedData]);

  const onPrivateMessage = (payload: any) => {
    console.log(payload);
    var payloadData = JSON.parse(payload.body);
    notifications.show({
      withBorder: true,
      title: "Scan",
      message: `Skeniro si se`,
    });
  };

  const sendValue = (code: string) => {
    if (stompClientRef.current) {
      const sendMessage = {
        classSessionId: sessionId,
        subjectName: "",
        personId: userId,
        code: code,
        firstName: "",
        lastName: "",
        arrivalTime: "",
        departureTime: "",
        message: "",
      };
      stompClientRef.current.send(
        `/app/class-session`,
        {},
        JSON.stringify(sendMessage)
      );
    } else {
      console.log("stompClient is not initialized");
    }
  };

  const authorized = useCheckRole("ROLE_STUDENT");
  if (authorized === "CHECKING") {
    return <PageLoading visible={true} />;
  }

  return (
    <div>
      <NavbarStudent token={token} studiesChanged={false} />
      <div className={styles.pageWrapper}>
        <div className={styles.cameraWrapper}>
          {isScannerActive ? (
            <Scanner
              onScan={handleScan}
              scanDelay={2000}
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
          ) : (
            <Button onClick={() => setIsScannerActive(true)}>
              Skenira ponovno
            </Button>
          )}
        </div>
        <div>
          <div>{sessionId}</div>
          <div>{debug}</div>
        </div>
      </div>
    </div>
  );
}
