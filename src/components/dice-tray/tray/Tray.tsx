import type { JSX } from "react";
import { TrayMaterial } from "../materials/tray/TrayMaterial";
import { TrayMesh } from "../meshes/TrayMesh";

export function Tray(props: JSX.IntrinsicElements["group"]) {
	return (
		<TrayMesh {...props}>
			<TrayMaterial />
		</TrayMesh>
	);
}
