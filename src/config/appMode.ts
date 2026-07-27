export type AppMode = "demo" | "production";

export const APP_MODE: AppMode =
  (import.meta.env.VITE_APP_MODE as AppMode) || "demo";

export const isDemoMode = () => APP_MODE === "demo";
export const isProductionMode = () => APP_MODE === "production";
