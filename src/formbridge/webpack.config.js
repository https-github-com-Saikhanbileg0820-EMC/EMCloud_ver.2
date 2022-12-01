const path = require("path");
const webpack = require("webpack");
const MiniCSSExtractPlugin = require("mini-css-extract-plugin");

module.exports = (param) => {
  param.modeShort = param.mode === "development" ? "dev" : "prd";
  const fullhash = "[fullhash]";
  return {
    entry: path.resolve(__dirname, './src/js/index.js'),
    mode: param.mode,
    output: {
      path: path.resolve(__dirname, 'dist', param.modeShort),
      filename: `${param.name}-${param.modeShort}-[fullhash].js`,
      assetModuleFilename: "images/[name][ext]",
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"]
        },
        {
          test: /\.(png|jpg|gif)$/i,
          type: "asset/inline"
        },
      ]
    },
    plugins: [
      new webpack.SourceMapDevToolPlugin({
        append: `\n//# sourceMappingURL=http://localhost:8000/space/dist/prd/${param.name}-${param.modeShort}-${fullhash}.map`,
        filename: `./${param.name}-${param.modeShort}-${fullhash}.map`,
        test: /\.js$/i
      }),
      new MiniCSSExtractPlugin({
        filename: `${param.name}-${param.modeShort}.css`,
      }),
    ],
    target: ["web", "es5"]
  }
};
