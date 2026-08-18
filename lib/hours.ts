import type { WeeklyHours } from "@/lib/types";

export const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export const defaultWeeklyHours: WeeklyHours = {
  sun: { isClosed: false, open: "08:00", close: "18:00" },
  mon: { isClosed: false, open: "07:00", close: "21:00" },
  tue: { isClosed: false, open: "07:00", close: "21:00" },
  wed: { isClosed: false, open: "07:00", close: "21:00" },
  thu: { isClosed: false, open: "07:00", close: "21:00" },
  fri: { isClosed: false, open: "07:00", close: "21:00" },
  sat: { isClosed: false, open: "08:00", close: "20:00" }
};

export function isShopOpenNow(hours: WeeklyHours, now = new Date()) {
  const today = hours[dayKeys[now.getDay()]];

  if (!today || today.isClosed || !today.open || !today.close) {
    return false;
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = timeToMinutes(today.open);
  const closeMinutes = timeToMinutes(today.close);

  if (openMinutes === closeMinutes) {
    return true;
  }

  if (openMinutes < closeMinutes) {
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  }

  return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
}

export function todaysHoursLabel(hours: WeeklyHours, now = new Date()) {
  const today = hours[dayKeys[now.getDay()]];

  if (!today || today.isClosed || !today.open || !today.close) {
    return "Closed today";
  }

  return `${formatTime(today.open)} - ${formatTime(today.close)}`;
}

export function formatOpenStatus(hours: WeeklyHours, now = new Date()) {
  return isShopOpenNow(hours, now) ? "Open now" : "Closed now";
}

export function parseWeeklyHours(value: unknown): WeeklyHours {
  if (!value || typeof value !== "object") {
    return defaultWeeklyHours;
  }

  const source = value as Partial<WeeklyHours>;
  return dayKeys.reduce((hours, key) => {
    hours[key] = {
      isClosed: Boolean(source[key]?.isClosed),
      open: source[key]?.open || defaultWeeklyHours[key].open,
      close: source[key]?.close || defaultWeeklyHours[key].close
    };
    return hours;
  }, {} as WeeklyHours);
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(2026, 0, 1, hours, minutes));
}
