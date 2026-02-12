import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

const LOG_PREFIXES = {
	WARNING: "WARN",
	ERROR: "ERROR",
	SUCCESS: "SUCCESS",
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
	warn: (message: string, ...args: unknown[]) =>
		logMessage("WARNING", message, ...args),
	error: (message: string, ...args: unknown[]) =>
		logMessage("ERROR", message, ...args),
	success: (message: string, ...args: unknown[]) =>
		logMessage("SUCCESS", message, ...args),
};

// Debug utilities
export const DEBUG_WEBRTC = import.meta.env.VITE_DEBUG_WEBRTC === "true";
export const DEBUG_YJS = import.meta.env.VITE_DEBUG_YJS === "true";

export function debugLog(context: string, ...args: unknown[]) {
	const debugMap: Record<string, boolean> = {
		webrtc: DEBUG_WEBRTC,
		yjs: DEBUG_YJS,
	};

	const shouldLog = debugMap[context.toLowerCase()] ?? false;

	if (shouldLog) {
		console.log(`[${context}]`, new Date().toISOString(), ...args);
	}
}

export function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`;
}

export function formatDuration(ms: number): string {
	if (ms < 1000) return `${ms}ms`;
	return `${(ms / 1000).toFixed(2)}s`;
}
