'use strict';
const bcrypt = require('bcryptjs')
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [
      {
        name: 'User1',
        email: 'user1@example.com',
        password: await bcrypt.hash('12345678', 10),
        image: '/images/default-profile.png',
        role: 'user',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'User2',
        email: 'user2@example.com',
        password: await bcrypt.hash('12345678', 10),
        image: '/images/default-profile.png',
        role: 'user',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {})
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', {})
  }
};
