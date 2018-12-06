const path = require("path");

const CleanWebpackPlugin = require("clean-webpack-plugin");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
  entry: {
    app: "./src/app.ts"
  },

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[chunkhash].js"
  },

  resolve: {
    extensions: [".js", ".ts", ".json"],
    alias: {
      phaser: "phaser/dist/phaser.min.js",
      assets: path.resolve(__dirname, "assets/"),
      styles: path.resolve(__dirname, "styles/")
    }
  },
  module: {
    rules: [
      {
        test: /^(?!.*\.d\.ts$).*\.ts$/,
        exclude: /node_modules$/,
        use: ["ts-loader"]
      },
      {
        test: /\.d.ts$/,
        use: ["ignore-loader"]
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            options: { minimize: true }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"]
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: {
          loader: "file-loader",
          options: {
            emitFile: true,
            outputPath: "assets/"
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      inject: true,
      hash: true,
      template: "./index.html"
    }),
    new CleanWebpackPlugin(["./dist"]),
    new MiniCssExtractPlugin({
      filename: "[name].[hash].css",
      chunkFilename: "[id].[hash].css"
    })
  ],
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true
      }),
      new OptimizeCssAssetsPlugin({})
    ],
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          chunks: "all"
        }
      }
    }
  }
};
