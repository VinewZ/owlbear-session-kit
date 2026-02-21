import Slide from "@mui/material/Slide";
import type { TransitionProps } from "@mui/material/transitions";
import React from "react";

export const SlideTransition = React.forwardRef(function Transition(
	props: TransitionProps & {
		children: React.ReactElement;
	},
	ref: React.Ref<unknown>,
) {
	return <Slide direction="right" ref={ref} {...props} />;
});
