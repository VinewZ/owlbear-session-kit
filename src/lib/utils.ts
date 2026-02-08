import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as Y from "yjs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const LOG_COLORS = {
  WARNING: "\x1b[33m", // Yellow
  ERROR: "\x1b[31m", // Red
  SUCCESS: "\x1b[32m", // Green
  RESET: "\x1b[0m", // Reset color
};

const LOG_PREFIXES = {
  WARNING: "WARN",
  ERROR: "ERROR",
  SUCCESS: "SUCCESS",
};

type LogLevel = keyof typeof LOG_PREFIXES;

function logMessage(level: LogLevel, message: string, ...args: unknown[]) {
  const color = LOG_COLORS[level];
  const prefix = LOG_PREFIXES[level];
  const timestamp = new Date().toLocaleTimeString();

  console.log(
    `${color}[${timestamp}] ${prefix}: ${message}${LOG_COLORS.RESET}`,
    ...args,
  );
}

export const logger = {
  warn: (message: string, ...args: unknown[]) =>
    logMessage("WARNING", message, ...args),
  error: (message: string, ...args: unknown[]) =>
    logMessage("ERROR", message, ...args),
  success: (message: string, ...args: unknown[]) =>
    logMessage("SUCCESS", message, ...args),
};

