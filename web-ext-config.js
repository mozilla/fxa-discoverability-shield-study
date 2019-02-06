/* eslint-env node */

const defaultConfig = {
  // Global options:
  sourceDir: "./src/",
  artifactsDir: "./dist/",
  ignoreFiles: [".DS_Store"],
  // Command options:
  build: {
    overwriteDest: true,
  },
  run: {
    firefox: process.env.FIREFOX_BINARY || "nightly",
    browserConsole: true,
    startUrl: ["about:debugging"],
    pref: ["shieldStudy.logLevel=All", "extensions.fxa-browser-discoverability_mozilla_org.test.variationName=treatment2"],
  },
};

module.exports = defaultConfig;
