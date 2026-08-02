/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    // Middleware buffers request bodies when middleware is configured.
    // Default is 10MB — set above MAX_UPLOAD_BYTES (20MB) so our route
    // handler's own size check returns 413 instead of failing to parse.
    middlewareClientMaxBodySize: "25mb",
  },
};

export default nextConfig;
