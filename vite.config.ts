import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { readFileSync } from "fs";
import { componentTagger } from "lovable-tagger";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load `.env` files (and any real shell/CI env vars) so the Sentry secrets
  // can live in a gitignored `.env` locally OR be injected by CI. The third
  // arg '' means "load all vars", not just the VITE_-prefixed ones.
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };

  // Derive a stable release name from package.json version, e.g. "ownershub@1.0.9".
  // The SAME value is injected into the app (as the Sentry `release`) and given
  // to the upload plugin, so uploaded source maps and incoming events line up.
  const pkg = JSON.parse(readFileSync(path.resolve(__dirname, "package.json"), "utf-8"));
  const appRelease = `ownershub@${pkg.version}`;

  // Only upload source maps when we have an auth token (CI / release builds).
  // The token is secret — keep it in the environment, never in the repo.
  const sentryAuthToken = env.SENTRY_AUTH_TOKEN;
  const enableSentryUpload = mode === 'production' && Boolean(sentryAuthToken);

  return {
  // Make the release name available to app code as import.meta.env.VITE_APP_RELEASE.
  define: {
    'import.meta.env.VITE_APP_RELEASE': JSON.stringify(appRelease),
  },
  server: {
    host: "::",
    port: 8081,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    // Uploads source maps to Sentry and injects `release`/`dist` so production
    // stack traces map back to original source. Must come last so it runs after
    // the bundle is generated. Gated on SENTRY_AUTH_TOKEN being present.
    enableSentryUpload &&
    sentryVitePlugin({
      org: env.SENTRY_ORG,
      project: env.SENTRY_PROJECT,
      authToken: sentryAuthToken,
      release: { name: appRelease },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Emit source maps so the Sentry plugin can upload them and de-minify
    // production stack traces. They are uploaded to Sentry, not served to users.
    sourcemap: true,
    // Optimize build output
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast', '@radix-ui/react-tabs'],
        },
      },
    },
    // Use esbuild for minification (default, faster than terser)
    minify: 'esbuild',
    // Remove console logs and debugger in production
    ...(mode === 'production' && {
      esbuild: {
        drop: ['console', 'debugger'],
      },
    }),
  },
  // Enable CSS code splitting
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
  };
});
