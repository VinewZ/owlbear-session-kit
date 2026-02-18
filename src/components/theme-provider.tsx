import CssBaseline from "@mui/material/CssBaseline";
import {
	createTheme,
	ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";
import { createContext, useContext, useMemo } from "react";
import { useDarkMode } from "@/hooks/use-dark-mode";

type DarkModeContextT = {
	isDark: boolean;
	toggle: () => void;
};

const DarkModeContext = createContext<DarkModeContextT>({
	isDark: false,
	toggle: () => {},
});

export function useDarkModeContext() {
	return useContext(DarkModeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const { isDark, toggle } = useDarkMode();

	const muiTheme = useMemo(
		() =>
			createTheme({
				palette: {
					mode: isDark ? "dark" : "light",
				},
			}),
		[isDark],
	);

	return (
		<DarkModeContext.Provider value={{ isDark, toggle }}>
			<MuiThemeProvider theme={muiTheme}>
				<CssBaseline enableColorScheme />
				{children}
			</MuiThemeProvider>
		</DarkModeContext.Provider>
	);
}
