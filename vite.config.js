import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/sf6_notebook/",
  plugins: [react()],
});

