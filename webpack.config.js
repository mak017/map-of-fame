const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const autoPreprocess = require("svelte-preprocess");
import { scss } from "svelte-preprocess";
const path = require("path");
const Dotenv = require("dotenv-webpack");

const mode = process.env.NODE_ENV || "development";
const prod = mode === "production";

module.exports = {
  entry: {
    bundle: ["./src/js/main.js"],
  },
  resolve: {
    alias: {
      svelte: path.resolve("node_modules", "svelte"),
    },
    extensions: [".mjs", ".js", ".svelte"],
    mainFields: ["svelte", "browser", "module", "main"],
  },
  output: {
    path: path.join(__dirname, "/public"),
    filename: "[name].js",
    chunkFilename: "[name].[id].js",
  },
  module: {
    rules: [
      {
        test: /\.svelte$/,
        use: [
          "babel-loader",
          {
            loader: "svelte-loader",
            options: {
              dev: !prod,
              preprocess: [scss()],
              emitCss: true,
            },
          },
        ],
      },
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          /**
           * MiniCssExtractPlugin doesn't support HMR.
           * For developing, use 'style-loader' instead.
           * */
          prod ? MiniCssExtractPlugin.loader : "style-loader",
          "css-loader",
        ],
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        use: [
          {
            loader: "url-loader",
          },
        ],
      },
    ],
  },
  mode,
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
    new Dotenv(),
  ],
  devtool: prod ? false : "source-map",
  devServer: {
    contentBase: "public",
    watchOptions: {
      aggregateTimeout: 100,
    },
    overlay: true,
    host: "0.0.0.0",
  },
};
