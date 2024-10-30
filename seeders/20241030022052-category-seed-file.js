'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Categories',
      ['Beginner', 'Hat', 'Scarf', 'Bag', 'Clothes']
        .map(item => {
          return {
            name: item,
            created_at: new Date(),
            updated_at: new Date()
          }          
        }), {})
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Categories', {})
  }
};
