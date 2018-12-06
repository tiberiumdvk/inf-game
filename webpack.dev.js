const path = require("path");

module.exports = {
  entry: {
    app: "./src/app.ts"
  },

  output: {
    path: path.resolve(__dirname, "build"),
    filename: "bundle.js"
  },

  resolve: {
    extensions: [".js", ".ts", ".json"],
    alias: {
      phaser: "phaser/dist/phaser.min.js",
      assets: path.resolve(__dirname, "assets/"),
      styles: path.resolve(__dirname, "styles/")
    }
  },

  devtool: "#eval-source-map",

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
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },

      {
        test: /\.(png|jpg|gif|json)$/,
        use: ["file-loader"]
      }
    ]
  }
};
