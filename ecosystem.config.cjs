module.exports = {
  apps: [
    {
      name: 'file-server-nuxt',
      script: '.output/server/index.mjs',
      cwd: '/home/ced/file-server-nuxt',
      env: {
        NODE_ENV: 'production',
        PORT: 37407,
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    }
  ]
}
