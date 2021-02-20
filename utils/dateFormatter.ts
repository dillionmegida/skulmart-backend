import { format } from "date-fns";

export const formatDate = (date?: Date) => {
  const _date = date ? new Date(date) : new Date();
  return format(_date, "do MMM, yyyy");
};
