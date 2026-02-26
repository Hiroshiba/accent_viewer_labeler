import { z } from "zod";

export const displayModeValues = ["wrap", "horizontal-scroll"] as const;
export type DisplayMode = (typeof displayModeValues)[number];

export const autoScrollModeValues = [
  "none",
  "follow-offscreen",
  "always-center",
] as const;
export type AutoScrollMode = (typeof autoScrollModeValues)[number];

export const playbackSpeedValues = [0.25, 0.5, 1, 2, 4] as const;
export type PlaybackSpeed = (typeof playbackSpeedValues)[number];

export const settingsSchema = z.object({
  displayMode: z.enum(displayModeValues),
  autoScrollMode: z.enum(autoScrollModeValues),
  playbackSpeed: z.union([
    z.literal(0.25),
    z.literal(0.5),
    z.literal(1),
    z.literal(2),
    z.literal(4),
  ]),
});

export type Settings = z.infer<typeof settingsSchema>;
