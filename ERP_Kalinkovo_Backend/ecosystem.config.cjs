module.exports = {
  apps: [
    {
      name: "kalinkovo-backend",
      script: "index.js", // главный файл бекенда
      cwd: "C:\\ERP_Kalinkovo\\ERP_Kalinkovo_Backend", // рабочая папка
      watch: false, // можно поставить true если хочешь авто-перезапуск при изменениях
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
