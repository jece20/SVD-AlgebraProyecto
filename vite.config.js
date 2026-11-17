import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: ["laboratorio-svd-algebra-lineal.onrender.com"]
  }
});
