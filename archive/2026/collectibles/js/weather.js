import { timePeriods, weatherStates } from "./content.js";

export function getCurrentEnvironment(now = Date.now()) {
  const date = new Date(now);
  const hour = date.getHours();
  const period = timePeriods.find((item) => isHourInPeriod(hour, item)) ?? timePeriods[1];
  const weather = getWeatherForDate(date);

  return {
    now,
    period,
    weather,
    label: `${period.name} · ${weather.name}`,
  };
}

function isHourInPeriod(hour, period) {
  const [start, end] = period.hours;

  if (start < end) {
    return hour >= start && hour < end;
  }

  return hour >= start || hour < end;
}

function getWeatherForDate(date) {
  const dayKey =
    date.getFullYear() * 10000 +
    (date.getMonth() + 1) * 100 +
    date.getDate() +
    Math.floor(date.getHours() / 6);
  const index = Math.abs(Math.sin(dayKey) * 10000) % weatherStates.length;

  return weatherStates[Math.floor(index)];
}
