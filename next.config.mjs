/** @type {import('next').NextConfig} */

const allowedOrigins = ["localhost:3000"];
const allowedForwardedHosts = ["localhost:3000"];

if (process.env.CODESPACE_NAME) {
  // GitHub Codespaces sets x-forwarded-host to the codespace URL even when
  // the browser reaches the dev server via localhost:3000. Whitelist both.
  const codespaceHost = `${process.env.CODESPACE_NAME}-3000.app.github.dev`;
  allowedOrigins.push(codespaceHost);
  allowedForwardedHosts.push(codespaceHost);
}

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins,
      allowedForwardedHosts,
    },
  },
};

export default nextConfig;
