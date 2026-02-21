import { useTexture } from "@react-three/drei";
import type { JSX } from "react";
import { gltfTexture } from "../../helpers/gltfTexture";
import albedo from "./albedo.jpg";
import normal from "./normal.jpg";
import orm from "./orm.jpg";

export function NebulaMaterial(
	props: JSX.IntrinsicElements["meshStandardMaterial"],
) {
	const [albedoMap, ormMap, normalMap] = useTexture(
		[albedo, orm, normal],
		(textures) => gltfTexture(textures, ["SRGB", "LINEAR", "LINEAR"]),
	);

	return (
		<meshStandardMaterial
			map={albedoMap}
			aoMap={ormMap}
			roughnessMap={ormMap}
			metalnessMap={ormMap}
			normalMap={normalMap}
			{...props}
		/>
	);
}
