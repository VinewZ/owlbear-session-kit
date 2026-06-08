import CssBaseline from "@mui/material/CssBaseline";
import {
	createTheme,
	ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";
import OBR, { type Theme } from "@owlbear-rodeo/sdk";
import { useEffect, useState } from "react";

function getTheme(obrTheme?: Theme) {
	return createTheme({
		palette: obrTheme
			? {
					mode: obrTheme.mode === "LIGHT" ? "light" : "dark",
					text: obrTheme.text,
					primary: obrTheme.primary,
					secondary: obrTheme.secondary,
					background: obrTheme.background,
				}
			: undefined,
		shape: {
			borderRadius: 12,
		},
		components: {
			MuiCssBaseline: {
				styleOverrides: {
					body: {
						backgroundColor: OBR.isAvailable ? "transparent" : undefined,
					},
				},
			},
			MuiButtonBase: {
				defaultProps: {
					disableRipple: true,
				},
			},
			MuiDialog: {
				styleOverrides: {
					paper: {
						backgroundImage:
							obrTheme?.mode === "LIGHT"
								? "linear-gradient(rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05))"
								: "linear-gradient(rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.07))",
					},
				},
			},
		},
	});
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setTheme] = useState(() => getTheme());

	useEffect(() => {
		const updateTheme = (obrTheme: Theme) => {
			setTheme(getTheme(obrTheme));
		};

		let unsubscribe: (() => void) | null = null;

		async function init() {
			const obrTheme = await OBR.theme.getTheme();
			updateTheme(obrTheme);
			unsubscribe = OBR.theme.onChange(updateTheme);
		}

		OBR.onReady(() => {
			init();
		});

		return () => {
			if (unsubscribe) {
				unsubscribe();
			}
		};
	}, []);

	return (
		<MuiThemeProvider theme={theme}>
			<CssBaseline enableColorScheme />
			{children}
		</MuiThemeProvider>
	);
}
