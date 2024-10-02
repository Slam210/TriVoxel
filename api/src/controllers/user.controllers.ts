export const test = (
  req: any,
  res: { json: (arg0: { message: string }) => void }
) => {
  res.json({ message: "API is working" });
};
