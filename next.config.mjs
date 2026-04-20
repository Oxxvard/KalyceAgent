/** @type {import('next').NextConfig} */

const allowedOrigins = [];
if (process.env.CODESPACE_NAME) {
  // GitHub Codespaces: proxy rewrites host → localhost but origin stays *.app.github.dev
  allowedOrigins.push(
    `${process.env.CODESPACE_NAME}-3000.app.github.dev`,
    `${process.env.CODESPACE_NAME}-3000.preview.app.github.dev`,
  );
}

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins,
    },
  },
};

export default nextConfig;
