interface ArrivalMessage {
  finalMessage: string;
  status: "arrival" | "departure" | "error";
}

export const mapArrivalMessageForStudent = (passedMessage: string): ArrivalMessage => {
  console.log("Passed message: ", passedMessage);
  switch (passedMessage) {
    case "Student is not part of this subject":
      return { finalMessage: "Nisi dio ovog predavanja", status: "error" };
    case "Class session is not in progress":
      return { finalMessage: "Predavanje nije u toku", status: "error" };
    case "Invalid code":
      return { finalMessage: "Korišten zastarijeli kod", status: "error" };
    case "Student has arrived at class session":
      return { finalMessage: "Prijavljen si na predavanju", status: "arrival" };
    case "Student has departed from class session":
      return { finalMessage: "Odjavljen si sa predavanja", status: "departure" };
    case "Student already attended this class session":
      return { finalMessage: "Već si prisustvovao ovoj nastavi", status: "error" };
    default:
      return { finalMessage: "Greška", status: "error" };
  }
};