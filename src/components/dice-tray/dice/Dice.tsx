import type { JSX } from "react";
import React from "react";
import type * as THREE from "three";
import { DiceMaterial } from "../materials/DiceMaterial";

import { DiceMesh } from "../meshes/DiceMesh";
import type { Die } from "../types/Die";

type DiceProps = JSX.IntrinsicElements["group"] & { die: Die };

export const Dice = React.forwardRef<THREE.Group, DiceProps>(
	({ die, children, ...props }, ref) => {
		return (
			<DiceMesh
				diceType={die.type}
				{...props}
				sharp={die.style === "WALNUT"}
				ref={ref}
			>
				<DiceMaterial diceStyle={die.style} />
				{children}
			</DiceMesh>
		);
	},
);
