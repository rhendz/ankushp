const nextVitals = require("eslint-config-next/core-web-vitals");
const nextTypeScript = require("eslint-config-next/typescript");

module.exports = [
  ...nextVitals,
  ...nextTypeScript,
  {
    ignores: ["node_modules/**", ".next/**", ".contentlayer/**"],
    rules: {
      "react/react-in-jsx-scope": "off",
      "jsx-a11y/anchor-is-valid": [
        "error",
        {
          components: ["Link"],
          specialLink: ["hrefLeft", "hrefRight"],
          aspects: ["invalidHref", "preferButton"],
        },
      ],
      "react/prop-types": 0,
      "@typescript-eslint/no-unused-vars": 0,
      "react/no-unescaped-entities": 0,
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
];
