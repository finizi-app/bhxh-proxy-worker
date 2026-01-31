export default {
  ignore: ["**/node_modules/**", "**/dist/**", "**/.wrangler/**"],
  loader: {
    ".ts": "ts",
  },
  tsconfig: {
    compilerOptions: {
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
    },
  },
};
