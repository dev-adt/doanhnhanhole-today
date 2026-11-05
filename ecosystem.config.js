// PM2 Ecosystem Config cho phutho.today
// Chạy: pm2 start ecosystem.config.js
// Auto-start khi reboot: pm2 startup && pm2 save

module.exports = {
  apps: [
    {
      name        : 'phutho-today',
      script      : 'server.js',
      instances   : 1,           // tăng lên 'max' nếu muốn cluster
      exec_mode   : 'fork',
      watch       : false,
      max_memory_restart: '500M',

      env: {
        NODE_ENV : 'production',
        PORT     : 3028,
      },

      // Log
      out_file    : './logs/out.log',
      error_file  : './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',

      // Auto restart nếu crash
      autorestart : true,
      restart_delay: 3000,
    },
  ],
};
