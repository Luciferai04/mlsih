module.exports = {
  apps: [{
    name: 'natpac-backend',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: 'logs/pm2-error.log',
    out_file: 'logs/pm2-out.log',
    log_file: 'logs/pm2-combined.log',
    time: true,
    kill_timeout: 5000,
    listen_timeout: 3000,
    cron_restart: '0 0 * * *' // Daily restart at midnight
  }],

  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-org/natpac-travel-app.git',
      path: '/var/www/natpac-backend',
      'post-deploy': 'cd backend && npm ci --production && pm2 reload ecosystem.config.js --env production',
      'pre-deploy-local': 'echo "Deploying to production server"'
    },
    staging: {
      user: 'deploy',
      host: 'staging-server.com',
      ref: 'origin/develop',
      repo: 'git@github.com:your-org/natpac-travel-app.git',
      path: '/var/www/natpac-backend-staging',
      'post-deploy': 'cd backend && npm ci && pm2 reload ecosystem.config.js --env development',
      'pre-deploy-local': 'echo "Deploying to staging server"'
    }
  }
};