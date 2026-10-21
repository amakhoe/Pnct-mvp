import next from "eslint-config-next";
import firebaseRulesPlugin from "@firebase/eslint-plugin-security-rules";

const config = [
  {
    ignores: [".next/**/*", "node_modules/**/*", "dist/**/*"],
  },
  ...next,
  firebaseRulesPlugin.configs["flat/recommended"],
];

export default config;
