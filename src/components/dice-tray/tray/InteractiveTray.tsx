import Box from "@mui/material/Box";
import {
	ContactShadows,
	Environment,
	OrbitControls,
	PerspectiveCamera,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { AudioListenerProvider } from "../audio/AudioListenerProvider";
import { DiceRollControls } from "../controls/DiceRollControls";
import { useDebugStore } from "../debug/store";
import { InteractiveDiceRoll } from "../dice/InteractiveDiceRoll";
import { PreviewDiceRoll } from "../dice/PreviewDiceRoll";
import environment from "../environment.hdr";
import { Tray } from "./Tray";
import { TraySuspense } from "./TraySuspense";
/** Dice tray that controls the dice roll store */
export function InteractiveTray() {
	const allowOrbit = useDebugStore((state) => state.allowOrbit);

	return (
		<Box
			component="div"
			borderRadius={1}
			height="100vh"
			width="calc(100vh / 2)"
			overflow="hidden"
			position="relative"
			sx={{
				"& canvas": {
					touchAction: "manipulation",
					userSelect: "none",
				},
			}}
		>
			<TraySuspense>
				<Canvas frameloop="demand" gl={{ powerPreference: "high-performance" }}>
					<AudioListenerProvider>
						<Environment files={environment} />
						<ContactShadows
							resolution={256}
							scale={[1, 2]}
							position={[0, 0, 0]}
							blur={0.5}
							opacity={0.5}
							far={1}
							color="#222222"
						/>
						<Tray />
						<PreviewDiceRoll />
						<InteractiveDiceRoll />
						<PerspectiveCamera
							makeDefault
							fov={28}
							position={[0, 4.3, 0]}
							rotation={[-Math.PI / 2, 0, 0]}
						/>
						{allowOrbit && <OrbitControls />}
					</AudioListenerProvider>
				</Canvas>
			</TraySuspense>
			<DiceRollControls />
		</Box>
	);
}
