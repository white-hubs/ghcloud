import type { ModelEntry } from "../types";

export const createConfigId = (): string => `cfg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const isUe5Entry = (entry: ModelEntry): boolean => entry === "views";

export const isThreeEntry = (entry: ModelEntry): boolean => entry === "views-3d" || entry === "views-three";

export const isScadaEntry = (entry: ModelEntry): boolean => entry === "views-2d";

export const isGisEntry = (entry: ModelEntry): boolean => entry === "views-gis";
