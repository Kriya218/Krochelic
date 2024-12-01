'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Images', [
      {
        post_id: 1,
        path: "https://images.unsplash.com/photo-1470049384172-927891aad5e9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        post_id: 1,
        path: "https://images.unsplash.com/photo-1640097922544-de8faa1cc857?q=80&w=1885&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        post_id: 2,
        path: "https://images.unsplash.com/photo-1585660558321-b7a05fd13775?q=80&w=1854&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        post_id: 2,
        path: "https://images.unsplash.com/photo-1585660569726-a2c9a8917a35?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        post_id: 3,
        path: "https://i.pinimg.com/736x/df/09/ff/df09ffa2fdbd114a2c3f6474d9f32c88.jpg",
        created_at: new Date(),
        updated_at: new Date()
      },
    ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Images', {});
  }
};
