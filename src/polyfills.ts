// Polyfills for simple-peer (Node.js compatibility in browser)
// @ts-expect-error - process/browser doesn't have types
import process from "process/browser";

const win = window as {
	global: unknown;
	process: unknown;
};

win.global = window;
win.process = process;
