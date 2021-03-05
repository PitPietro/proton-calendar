module.exports = {
    setupFilesAfterEnv: ['./rtl.setup.js'],
    verbose: true,
    moduleDirectories: ['<rootDir>/node_modules'],
    transform: {
        '^.+\\.(js|tsx?)$': '<rootDir>/jest.transform.js',
    },
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
    transformIgnorePatterns: ['node_modules/(?!(proton-shared|react-components|mutex-browser|pmcrypto)/)'],
    moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)$': 'react-components/__mocks__/fileMock.js',
        '\\.(css|scss|less)$': 'react-components/__mocks__/styleMock.js',
        'sieve.js': 'react-components/__mocks__/sieve.js',
    },
    reporters: ['default', ['jest-junit', { outputName: 'test-report.xml' }]],
    coverageReporters: ['text', 'lcov', 'cobertura'],
};
