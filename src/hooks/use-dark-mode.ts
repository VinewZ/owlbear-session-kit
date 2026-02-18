import { useEffect, useState } from "react";

const STORAGE_KEY = "theme";

function getInitialDark(): boolean {
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === "dark") return true;
	if (stored === "light") return false;
	return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function useDarkMode() {
	const [isDark, setIsDark] = useState(getInitialDark);

	useEffect(() => {
		const root = document.documentElement;
		if (isDark) {
			root.classList.add("dark");
		} else {
			root.classList.remove("dark");
		}
		localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
	}, [isDark]);

	function toggle() {
		setIsDark((prev) => !prev);
	}

	return { isDark, toggle };
}
