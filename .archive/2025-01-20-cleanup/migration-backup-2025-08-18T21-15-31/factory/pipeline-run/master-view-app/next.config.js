/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable if deploying to a subdirectory
  // basePath: '/master-view',
  
  // Optimize for production
  swcMinify: true,
  
  // Add any environment variables
  env: {
    APP_VERSION: '1.0.0',
  },
}

module.exports = nextConfig
