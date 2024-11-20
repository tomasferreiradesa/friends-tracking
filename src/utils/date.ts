import { Dayjs } from "dayjs";

export function formatDate(inputDate: Date) {
  const date = new Date(inputDate); // Create a Date object

  // Format the date to dd/mm/yyyy hh:mm
  const formattedDate = [
    date.getDate().toString().padStart(2, "0"), // Day (2 digits)
    (date.getMonth() + 1).toString().padStart(2, "0"), // Month (2 digits, months are zero-based)
    date.getFullYear(), // Year (4 digits)
  ].join("/");

  return formattedDate;
}

export const isDate = (value: any): boolean => {
  return (
    value instanceof Date ||
    (typeof value === "string" && !isNaN(Date.parse(value)))
  );
};

export const convertDayjsToFormattedDate = (dayjsDate: Dayjs): Date => {
  const formattedDate = dayjsDate.format("DD/MM/YYYY"); // Get the date in the desired format as a string
  const [day, month, year] = formattedDate.split("/"); // Split the string into parts
  return new Date(Number(year), Number(month) - 1, Number(day)); // Create a new Date object
};
