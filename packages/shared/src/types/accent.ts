import { z } from "zod";

export const moraIntervalSchema = z.object({
  start: z.number(),
  end: z.number(),
});

export type MoraInterval = z.infer<typeof moraIntervalSchema>;

export const pitchLevelValues = ["H", "L"] as const;
export type PitchLevel = (typeof pitchLevelValues)[number];
