#!/bin/bash

echo "Starting entrypoint.sh..."
# 使用 wait-for-it.sh 腳本檢查 MySQL 服務是否已啟動並可用
/usr/wait-for-it.sh db:3306 --timeout=30 --strict -- echo "MySQL is ready - starting app"

# 執行 Sequelize 資料庫遷移
echo "Running database migrations..."
npx sequelize db:migrate
npx sequelize db:seed:all
echo "Starting Express app"
# export NODE_ENV=development
npm start