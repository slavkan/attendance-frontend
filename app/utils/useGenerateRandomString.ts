export const useGenerateRandomString = (sessionId: String) => {
  const randomString = Math.random().toString(36).substring(2, 12);
  return `${sessionId}_${randomString}`;
};
