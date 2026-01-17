// eslint-disable-next-line @typescript-eslint/no-require-imports
const SourceTaggingPlugin = require('@antonmagnus/next-source-tagging');

// Get the loader path
const loaderPath = require.resolve('@antonmagnus/next-source-tagging/dist/loader.js');

// Loader options (shared between webpack and turbopack)
const loaderOptions = {
  debug: false,
  enabled: true,
  enableInProduction: false,
  tagReactComponents: true
};

const nextConfig = {
  // Turbopack configuration (for Next.js 16+)
  turbopack: {
    rules: {
      // Apply loader to TypeScript/JavaScript files
      // condition: { not: 'foreign' } excludes node_modules
      // No 'as' property - loader output type matches input type
      '*.tsx': {
        condition: { not: 'foreign' },
        loaders: [{ loader: loaderPath, options: loaderOptions }],
      },
      '*.ts': {
        condition: { not: 'foreign' },
        loaders: [{ loader: loaderPath, options: loaderOptions }],
      },
      '*.jsx': {
        condition: { not: 'foreign' },
        loaders: [{ loader: loaderPath, options: loaderOptions }],
      },
      '*.js': {
        condition: { not: 'foreign' },
        loaders: [{ loader: loaderPath, options: loaderOptions }],
      },
    },
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['*.fly.dev', '*.vy.app', 'vy.app'],
    },
  },
  allowedDevOrigins: ['*.fly.dev', 'vy.app', '*.vy.app'],
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          // Temporarily relax COEP for video component development - adjust for production needs
          { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' }
        ],
      },
    ];
  },
  // Webpack configuration (fallback for --no-turbopack)
  webpack: (config, { dev, isServer }) => {
    // Only apply source tagging in development mode
    if (dev) {
      config.module.rules.unshift({
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: [{
          loader: loaderPath,
          options: loaderOptions
        }]
      });
    }

    return config;
  },
}

module.exports = nextConfig
