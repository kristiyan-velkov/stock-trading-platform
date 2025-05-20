const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  testMatch: ["**/__tests__/**/*.test.(js|jsx|ts|tsx)"],
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "./coverage/test-results",
        outputName: "junit.xml",
      },
    ],
    [
      "jest-html-reporters",
      {
        publicPath: "./coverage/test-reports",
        filename: "report.html",
        expand: true,
      },
    ],
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
