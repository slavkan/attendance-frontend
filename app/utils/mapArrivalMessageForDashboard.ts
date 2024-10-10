// Besides the string also return one of three: "arrival", "departure" or "error".

interface ArrivalMessage {
  finalMessage: string;
  status: "arrival" | "departure" | "error";
}

export const mapArrivalMessageForDashboard = (passedMessage: string, firstName: string, lastName: string): ArrivalMessage => {
  console.log("Passed message: ", passedMessage);
  switch (passedMessage) {
    case "Student is not part of this subject":
      return { finalMessage: `${firstName} ${lastName} nije dio ovog kolegija`, status: "error" };
    case "Class session is not in progress":
      return { finalMessage: `Predavanje nije u toku`, status: "error" };
    case "Invalid code":
      return { finalMessage: `Korišten zastarijeli kod`, status: "error" };
    case "Student has arrived at class session":
      return { finalMessage: `${firstName} ${lastName} prijavljen na predavanju`, status: "arrival" };
    case "Student has departed from class session":
      return { finalMessage: `${firstName} ${lastName} odjavljen sa predavanja`, status: "departure" };
    case "Student already attended this class session":
      return { finalMessage: `${firstName} ${lastName} je već prisustvovao ovoj nastavi`, status: "error" };
    default:
      return { finalMessage: "Greška", status: "error" };
  }
};