'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM Users;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    )
    const categories = await queryInterface.sequelize.query(
      'SELECT id FROM Categories;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    )
    await queryInterface.bulkInsert('Posts', [
      {
        id: 1,
        title: '圍巾圖解',
        category_id: categories[Math.floor(Math.random() * categories.length)].id,
        content: '新手友好',
        user_id: users[Math.floor(Math.random() * users.length)].id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        title: '鉤織小包',
        category_id: categories[Math.floor(Math.random() * categories.length)].id,
        content: '可裝手機、錢包',
        user_id: users[Math.floor(Math.random() * users.length)].id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        title: '貝雷帽',
        category_id: categories[Math.floor(Math.random() * categories.length)].id,
        content: '10cm 娃娃適用',
        user_id: users[Math.floor(Math.random() * users.length)].id,
        created_at: new Date(),
        updated_at: new Date()
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Posts', {})
  }
};
