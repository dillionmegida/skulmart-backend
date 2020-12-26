const { defaults: tsjPreset } = require("ts-jest/presets");

module.exports = {
  testPathIgnorePatterns: ["<rootDir>/node_modules/"],
  transform: {
    ...tsjPreset.transform,
  },
};
