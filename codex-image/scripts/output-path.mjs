import { homedir } from "node:os";
import { resolve } from "node:path";

function pad(value, width = 2) {
  return String(value).padStart(width, "0");
}

export function formatDateFolder(now = new Date()) {
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
  ].join("-");
}

export function formatTimestamp(now = new Date()) {
  return [
    `${formatDateFolder(now)}T${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}-${pad(now.getMilliseconds(), 3)}`,
  ].join("");
}

export function buildOutputPath({
  outputPath = "",
  format,
  now = new Date(),
  homeDir = homedir(),
} = {}) {
  if (outputPath) {
    return resolve(outputPath);
  }

  return resolve(
    homeDir,
    "Pictures",
    formatDateFolder(now),
    `generated-${formatTimestamp(now)}.${format}`,
  );
}
