const withPWA = require("next-pwa");

module.exports = withPWA({
  webpack5: true,
  images: {
    domains: ["firebasestorage.googleapis.com"],
  },
  pwa: {
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    skipWaiting: true,
  },
});
