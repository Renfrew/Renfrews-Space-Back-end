module.exports = {
  apps: [
    {
      name: "Renfrew's Space back-end",
      script: 'yarn deploy',
      watch: '.',
    },
  ],
  deploy: {
    test: {
      user: 'ubuntu',
      host: 'api.renfrew.me',
      key: '/Users/renfrew/.ssh/Renfrew-Space1.pem',
      ref: 'origin/dev',
      repo: 'git@github.com:Renfrew/Renfrews-Space-Back-end.git',
      path: '/var/www/renfrews-space-back-end',
      'pre-deploy-local': '',
      'post-deploy': 'sudo pm2 reload ecosystem.config.js',
      'pre-setup': '',
    },
  },
};