import { type RouterOutputs } from "../../../../lib/utils/api";

export type Message = RouterOutputs["conversations"]["infinite"]["messages"][number];
