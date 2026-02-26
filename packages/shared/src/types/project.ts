import { z } from "zod";
import { moraIntervalSchema } from "./accent";

export const sourceFilesSchema = z.object({
  lab: z.string(),
  startAccent: z.string(),
  endAccent: z.string(),
  startAccentPhrase: z.string(),
  endAccentPhrase: z.string(),
});

export type SourceFiles = z.infer<typeof sourceFilesSchema>;

export const sampleDataSchema = z.object({
  moras: z.array(z.string()),
  moraIntervals: z.array(moraIntervalSchema),
  phraseBoundaries: z.array(z.number()),
  accentPosInPhrase: z.array(z.number()),
  sourceFiles: sourceFilesSchema,
});

export type SampleData = z.infer<typeof sampleDataSchema>;

export const projectMetaSchema = z.object({
  rootDirectory: z.string(),
  globLab: z.string(),
  globStartAccent: z.string(),
  globEndAccent: z.string(),
  globStartAccentPhrase: z.string(),
  globEndAccentPhrase: z.string(),
  globAudio: z.string(),
});

export type ProjectMeta = z.infer<typeof projectMetaSchema>;

export const overrideDataSchema = z.object({
  phraseBoundaries: z.array(z.number()),
  accentPosInPhrase: z.array(z.number()),
});

export type OverrideData = z.infer<typeof overrideDataSchema>;

export const projectDataSchema = z.object({
  version: z.number(),
  meta: projectMetaSchema,
  stems: z.array(z.string()),
  samples: z.record(z.string(), sampleDataSchema),
  overrides: z.record(z.string(), overrideDataSchema),
  checked: z.record(z.string(), z.literal(true)),
  audioFiles: z.record(z.string(), z.string()),
  lastOpenStem: z.string(),
});

export type ProjectData = z.infer<typeof projectDataSchema>;
