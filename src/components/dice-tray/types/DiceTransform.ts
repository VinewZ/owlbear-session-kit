import type { DiceQuaternion } from "./DiceQuaternion";
import type { DiceVector3 } from "./DiceVector3";

export interface DiceTransform {
  position: DiceVector3;
  rotation: DiceQuaternion;
}
