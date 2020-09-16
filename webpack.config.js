// const path = require('path');

// module.exports = {
//   devtool: 'source-map',
//   entry: './src/js/main.js',
//   output: {
//     filename: 'main.js',
//     path: path.resolve(__dirname, 'dist/js'),
//   },
// };

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
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
        // use: {
        //   loader: 'svelte-loader-hot',
        //   options: {
        //     dev,
        //     hotReload: true,
        //     hotOptions: {
        //       // whether to preserve local state (i.e. any `let` variable) or
        //       // only public props (i.e. `export let ...`)
        //       noPreserveState: false,
        //       // optimistic will try to recover from runtime errors happening
        //       // during component init. This goes funky when your components are
        //       // not pure enough.
        //       optimistic: true,

        //       // See docs of svelte-loader-hot for all available options:
        //       //
        //       // https://github.com/rixo/svelte-loader-hot#usage
        //     },
        //   },
        // },
        use: "svelte-loader",
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
    ],
  },
  mode,
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
  ],
  devtool: prod ? false : "source-map",
  devServer: {
    contentBase: "public",
    // hot: true,
    // overlay: true,
  },
};
