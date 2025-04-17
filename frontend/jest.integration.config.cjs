// Copy of jest.config.cjs, but without moduleNameMapper for integration tests
module.exports = {
    preset: "ts-jest/presets/default-esm",
    testEnvironment: "node",
    extensionsToTreatAsEsm: [".ts"],
    globals: {
        "ts-jest": {
            tsconfig: "tsconfig.jest.json",
            useESM: true,
        },
    },
    roots: ["<rootDir>/src"],
    testRegex: "\\.(test|spec)\\.tsx?$",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    setupFiles: ["<rootDir>/jest.setup.js"],
};
