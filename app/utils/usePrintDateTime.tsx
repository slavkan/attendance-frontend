export const usePrintDateTime = (datetime?: Date) => {
  if (!datetime) {
    return "/";
  }
  
  const date = new Date(datetime);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  return `${day < 10 ? "0" + day : day}.${month < 10 ? "0" + month : month}.${year} ${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes}`;
};

export const usePrintTime = (datetime?: Date) => {
  if (!datetime) {
    return "";
  }

  const date = new Date(datetime);
  const hours = date.getHours();
  const minutes = date.getMinutes();

  return `${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes}`;
};

export const usePrintDate = (datetime?: Date) => {
  if (!datetime) {
    return "/";
  }

  const date = new Date(datetime);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${day < 10 ? "0" + day : day}.${month < 10 ? "0" + month : month}.${year}`;
};