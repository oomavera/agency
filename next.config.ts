import type { NextConfig } from "next";
import createMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug],
  },
});

const nextConfig: NextConfig = withBundleAnalyzer({
  ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),
  trailingSlash: false,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  images: {
    // Fine-tune image optimization for smaller thumbnails and better formats
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 420, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 160, 200, 256, 384],
  },
  experimental: {
    optimizePackageImports: [
      'react-icons',
      'framer-motion'
    ]
  }
});

export default nextConfig;
