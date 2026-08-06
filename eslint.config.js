import js from "@eslint/js";

export default [
  { ignores: ["node_modules/**", "dist/**", "test-results/**", "references/**", "*.log", "*.md", ".eslintcache"] },
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: { 
      ecmaVersion: 2022, 
      sourceType: "module",
      globals: { 
        console: "readonly", 
        process: "readonly", 
        URL: "readonly", 
        document: "readonly", 
        window: "readonly", 
        getComputedStyle: "readonly", 
        location: "readonly", 
        require: "readonly", 
        module: "readonly", 
        __dirname: "readonly",
        fetch: "readonly",
        Headers: "readonly",
        Request: "readonly",
        Response: "readonly"
      } 
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off",
      "no-case-declarations": "off",
      "no-useless-assignment": "off",
      "no-empty": "off"
    }
  },
  {
    files: ["**/*.cjs"],
    languageOptions: { 
      ecmaVersion: 2022, 
      sourceType: "commonjs",
      globals: { console: "readonly", process: "readonly", require: "readonly", module: "readonly", __dirname: "readonly" } 
    },
    rules: { "no-console": "off" }
  }
];