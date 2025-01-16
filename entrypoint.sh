#!/bin/bash

echo "Starting entrypoint.sh..."
# 使用 wait-for-it.sh 腳本檢查 MySQL 服務是否已啟動並可用
/app/wait-for-it.sh db:3306 --timeout=30 --strict -- echo "MySQL is ready - starting app"


echo "Running database migrations..."
npx sequelize db:migrate

# 判斷種子檔案是否已執行過
# if [ $(npx sequelize-cli db:seed:status | grep -c "No seeds were executed.") -gt 0 ]; then
#     echo "Running database seeding..."
#     npx sequelize db:seed:all
# else
#     echo "Database already seeded - skipping seeding."
# fi

echo "Running database seeding..."
npx sequelize db:seed:all

echo "Starting Express app"
npm start