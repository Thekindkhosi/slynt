import { z } from "zod";
import { slyntProjectSchema, type SlyntProject } from "@/lib/slynt/project-schema";

export const slyntCompositionSchema = z.object({
  project: slyntProjectSchema,
});

export type SlyntCompositionProps = {
  project: SlyntProject;
};

