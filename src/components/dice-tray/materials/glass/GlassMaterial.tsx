import { useTexture } from "@react-three/drei";
import type { JSX } from "react";
import * as THREE from "three";
import { gltfTexture } from "../../helpers/gltfTexture";
import albedo from "./albedo.jpg";
import mask from "./mask.png";
import normal from "./normal.jpg";

const sheenColor = new THREE.Color("#4abff4");
const attenuationColor = new THREE.Color(43 / 255, 1, 115 / 255);

export function GlassMaterial(
	props: JSX.IntrinsicElements["meshPhysicalMaterial"],
) {
	const [albedoMap, maskMap, normalMap] = useTexture(
		[albedo, mask, normal],
		(textures) => gltfTexture(textures, ["SRGB", "LINEAR", "LINEAR"]),
	);

	return (
		<meshPhysicalMaterial
			map={albedoMap}
			sheenColor={sheenColor}
			sheen={1}
			roughness={0.3}
			metalness={0}
			normalMap={normalMap}
			transmission={1}
			transmissionMap={maskMap}
			thickness={2}
			envMapIntensity={1}
			attenuationColor={attenuationColor}
			attenuationDistance={0.1}
			{...props}
		/>
	);
}
