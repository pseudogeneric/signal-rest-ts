module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\.tsx?$': ['ts-jest', {
      // ts-jest configuration options go here
      // For example, to specify tsconfig:
      // tsconfig: 'tsconfig.json'
      // Using default tsconfig.json for now
    }]
  },
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node'
  ],
  // Automatically clear mock calls, instances and results before every test
  clearMocks: true,
};
