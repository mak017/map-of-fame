const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const autoPreprocess = require("svelte-preprocess");
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
      svelte: path.resolve("node_modules", "svelte/src/runtime"),
    },
    extensions: [".mjs", ".js", ".svelte"],
    mainFields: ["svelte", "browser", "module", "main"],
    conditionNames: ["svelte", "browser", "import"],
  },
  output: {
    path: path.join(__dirname, "/public"),
    filename: "[name].js",
    chunkFilename: "[name].[id].js",
    publicPath: "/",
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
              preprocess: [autoPreprocess.scss()],
              compilerOptions: {
                // NOTE Svelte's dev mode MUST be enabled for HMR to work
                dev: !prod, // Default: false
              },

              onwarn: (warning, handler) => {
                if (warning.code.startsWith("a11y-")) return;
                handler(warning);
              },

              // NOTE emitCss: true is currently not supported with HMR
              // Enable it for production to output separate css file
              emitCss: prod, // Default: false
              // Enable HMR only for dev mode
              hotReload: !prod, // Default: false
              // Extra HMR options, the defaults are completely fine
              // You can safely omit hotOptions altogether
              hotOptions: {
                // Prevent preserving local component state
                preserveLocalState: false,

                // If this string appears anywhere in your component's code, then local
                // state won't be preserved, even when noPreserveState is false
                noPreserveStateKey: "@!hmr",

                // Prevent doing a full reload on next HMR update after fatal error
                noReload: false,

                // Try to recover after runtime errors in component init
                optimistic: false,

                // --- Advanced ---

                // Prevent adding an HMR accept handler to components with
                // accessors option to true, or to components with named exports
                // (from <script context="module">). This have the effect of
                // recreating the consumer of those components, instead of the
                // component themselves, on HMR updates. This might be needed to
                // reflect changes to accessors / named exports in the parents,
                // depending on how you use them.
                acceptAccessors: true,
                acceptNamedExports: true,
              },
            },
          },
        ],
      },
      {
        // required to prevent errors from Svelte on Webpack 5+, omit on Webpack 4
        test: /node_modules\/svelte\/.*\.mjs$/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.m?js$/,
        include: /node_modules/,
        resolve: {
          fullySpecified: false,
        },
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
        type: "asset/inline",
      },
    ],
  },
  mode,
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
      ignoreOrder: true,
    }),
    new Dotenv(),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],
  devtool: prod ? false : "source-map",
  devServer: {
    static: "public",
    historyApiFallback: true,
    hot: true,
    host: "0.0.0.0",
  },
};
