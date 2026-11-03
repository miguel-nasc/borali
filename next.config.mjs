/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pacotes que rodam apenas no servidor e não devem ser empacotados
  serverExternalPackages: ['pg', '@electric-sql/pglite', 'bcryptjs'],
};

export default nextConfig;
