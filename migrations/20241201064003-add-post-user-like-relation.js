'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Likes', 'post_id', {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Posts',
        key: 'id'
      },
      onDelete:'CASCADE',
      onUpdate:'CASCADE'
    })
    await queryInterface.changeColumn('Likes', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      reference: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Likes', 'post_id', {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false
    })
    await queryInterface.changeColumn('Likes', 'user_id', {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false
    })
  }
};
