// const MiniCssExtractPlugin = require("mini-css-extract-plugin");
import WatchExternalFilesPlugin from "webpack-watch-files-plugin";
const path = require("path");

const mode = process.env.NODE_ENV || "development";
const prod = mode === "production";
// const dev = !prod;

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
      // {
      //   test: /\.css$/,
      //   use: [
      //     /**
      //      * MiniCssExtractPlugin doesn't support HMR.
      //      * For developing, use 'style-loader' instead.
      //      * */
      //     prod ? MiniCssExtractPlugin.loader : "style-loader",
      //     "css-loader",
      //   ],
      // },
    ],
  },
  mode,
  plugins: [
    new WatchExternalFilesPlugin({
      files: [
        "./public/images/**/*",
        "./public/index.html",
        "./public/init.css",
      ],
    }),
    //   new MiniCssExtractPlugin({
    //     filename: "[name].css",
    //   }),
  ],
  devtool: prod ? false : "source-map",
  devServer: {
    contentBase: "public",
    overlay: true,
  },
};
