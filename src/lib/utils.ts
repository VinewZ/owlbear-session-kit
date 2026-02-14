import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

const LOG_PREFIXES = {
	WARNING: "WARN",
	ERROR: "ERROR",
	SUCCESS: "SUCCESS",
	LOG: "LOG",
};

type LogLevel = keyof typeof LOG_PREFIXES;

function logMessage(level: LogLevel, message: string, ...args: unknown[]) {
	const prefix = LOG_PREFIXES[level];
	const timestamp = new Date().toLocaleTimeString();

	console.log(
		`
    [${timestamp}]
    ${prefix}:
     ${message}
    `,
		...args,
	);
}

export const logger = {
	log: (message: string, ...args: unknown[]) =>
		logMessage("LOG", message, ...args),
	warn: (message: string, ...args: unknown[]) =>
		logMessage("WARNING", message, ...args),
	error: (message: string, ...args: unknown[]) =>
		logMessage("ERROR", message, ...args),
	success: (message: string, ...args: unknown[]) =>
		logMessage("SUCCESS", message, ...args),
};
