module.exports = {
  output: "export",
  basePath: process.env.NODE_ENV === "production" ? "/webgpu-kit" : "",
  transpilePackages: ["ui", "@webgpu-kit/core"],

  reactStrictMode: false,
  experimental: {
    // serverActions: true,
    // serverComponentsExternalPackages: ["typedoc"],
  },

  webpack: (config) => {
    config.module.rules = [
      {
        resourceQuery: /raw/,
        type: "asset/source",
      },
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        exclude: /node_modules/,
        use: ["raw-loader", "glslify-loader"],
      },
      ...config.module.rules,
    ];

    return config;
  },
};
