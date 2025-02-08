/** @type {import('next').NextConfig} */

const path = require("node:path")
const LicensePlugin = require("webpack-license-plugin")

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    unoptimized: true,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.node$/,
      loader: "node-loader",
    })

    config.plugins.push(
      new LicensePlugin({
        outputFilename: "../src/licenses.json",
        unacceptableLicenseTest: (licenseType) =>
          licenseType.includes("GPL") || licenseType.includes("AGPL"),
      }),
    )

    return config
  },
}

module.exports = nextConfig
