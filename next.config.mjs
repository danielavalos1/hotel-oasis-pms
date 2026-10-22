// Plain JS on purpose: Heroku prunes devDependencies after the build, and
// Next.js needs TypeScript at runtime to load a next.config.ts.
/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "standalone",
};

export default nextConfig;
