/** @type {import('next').NextConfig} */
const nextConfig = {
  logging: {
    _fetches: {
      fullUrl: true,
    },
    get fetches() {
      return this._fetches;
    },
    set fetches(value) {
      this._fetches = value;
    },
  },
  experimental: {
    // Esto autoriza a Next.js a recibir peticiones de tu IP local
    allowedDevOrigins: ["http://192.168.137.1:3000", "http://localhost:3000"],
  },
};

export default nextConfig;