module.exports = {
  apps: [
    {
      name: 'BlindTusAPI',
      script: 'index.js',
      watch: false,
      interpreter: './node_modules/.bin/babel-node',
      env_production: {
        PORT: 4000,
        NODE_ENV: 'production',
      },
    },
  ],
};
