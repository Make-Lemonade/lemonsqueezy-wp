module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true
    },
    settings: {
        "react": {
            "version": "detect"
        }
    },
    parser: "@babel/eslint-parser",
    extends: ["eslint:recommended", "prettier", "plugin:react/recommended"],
    globals: {
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
        wp: "readonly",
        Lemonsqueezy: "readonly"
    },

    parserOptions: {
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: 2018,
        requireConfigFile: false,
        sourceType: "module",
        babelOptions: {
            "presets": ["@babel/preset-react"]
        },
    },
    plugins: ["react"],
    rules: {
        "no-console": "error",
        "react/react-in-jsx-scope": "off",
        "react/display-name": "off",
        "react/prop-types": "off"
    }
};
