import { ModuleFederationPlugin } from "@module-federation/enhanced/rspack";
import { RsdoctorRspackPlugin } from "@rsdoctor/rspack-plugin";
import { defineConfig } from "@rspack/cli";
import { HtmlRspackPlugin } from "@rspack/core";
import path from "path";

const isDev = process.env.NODE_ENV !== "production";
const root = process.cwd();

const PUBLIC_URL = process.env["PUBLIC_URL"] ?? "http://localhost:3001";

export default defineConfig({
  mode: isDev ? "development" : "production",
  entry: "./src/index.ts",
  output: {
    path: path.resolve(root, "dist"),
    publicPath: `${PUBLIC_URL}/`,
    clean: true,
  },
  optimization: {
    splitChunks: {
      chunks: "async",
      minSize: 20_000,
      cacheGroups: {
        "vendor-forms": {
          test: /[\\/]node_modules[\\/](react-hook-form|@hookform|zod)[\\/]/,
          name: "vendor.forms",
          chunks: "async",
          priority: 30,
          enforce: true,
        },
        "auth-shared": {
          test: /[\\/]src[\\/]modules[\\/]shared[\\/]/,
          name: "auth.shared",
          chunks: "async",
          minChunks: 2,
          priority: 20,
          reuseExistingChunk: true,
        },
      },
    },
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      "@modules": path.resolve(root, "src/modules"),
      "@hooks": path.resolve(root, "src/hooks"),
      "@utils": path.resolve(root, "src/utils"),
      "@app-types": path.resolve(root, "src/types"),
      "@store": path.resolve(root, "src/store"),
      "@theme": path.resolve(root, "src/theme"),
      "@routes": path.resolve(root, "src/routes"),
    },
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "builtin:swc-loader",
          options: {
            jsc: {
              parser: { syntax: "typescript", tsx: true },
              transform: { react: { runtime: "automatic" } },
              target: "es2022",
            },
          },
        },
        type: "javascript/auto",
      },
    ],
  },

  plugins: [
    new HtmlRspackPlugin({
      template: path.resolve(root, "public/index.html"),
    }),

    new ModuleFederationPlugin({
      name: "authApp",
      dts: false,
      filename: "remoteEntry.js",
      exposes: {
        "./AuthRoutes": "./src/routes/AuthRoutes.tsx",
        "./AuthGuard": "./src/components/AuthGuard.tsx",
      },

      shared: {
        react: {
          singleton: true,
          requiredVersion: "^19.0.0",
          eager: false,
        },
        "react-dom": {
          singleton: true,
          requiredVersion: "^19.0.0",
          eager: false,
        },
        "react-router-dom": {
          singleton: true,
          requiredVersion: "^7.0.0",
          eager: false,
        },
        "@chakra-ui/react": {
          singleton: true,
          requiredVersion: "^3.0.0",
          eager: false,
        },
        "@emotion/react": {
          singleton: true,
          eager: false,
        },
        "@emotion/styled": {
          singleton: true,
          eager: false,
        },
        zustand: {
          singleton: true,
          requiredVersion: "^5.0.0",
          eager: false,
        },
      },
    }),

    ...(process.env["RSDOCTOR"] === "true" ? [new RsdoctorRspackPlugin({ disableClientServer: false })] : []),
  ],

  devServer: {
    port: 3001,
    hot: true,
    historyApiFallback: true,
    static: { directory: path.resolve(root, "public") },
    headers: { "Access-Control-Allow-Origin": "*" },
  },
});
