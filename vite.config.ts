import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Aliases para assets do Figma (mantidos por necessidade)
      "figma:asset/fdb4ef494a99e771ad2534fa1ee70561858f6471.png": path.resolve(
        __dirname,
        "./src/assets/fdb4ef494a99e771ad2534fa1ee70561858f6471.png"
      ),
      "figma:asset/8d6a7ac840cd502128aee5ff530de943ed079f42.png": path.resolve(
        __dirname,
        "./src/assets/8d6a7ac840cd502128aee5ff530de943ed079f42.png"
      ),
    },
  },
  server: { port: 3000, open: true },
  build: { outDir: "dist", target: "esnext" },
});
