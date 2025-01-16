'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Notice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Notice.belongsTo(models.User, { foreignKey: 'userId' })
    }
  }
  Notice.init({
    notifyId: DataTypes.INTEGER,
    description: DataTypes.TEXT,
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    isRead: DataTypes.BOOLEAN,
    postId: DataTypes.INTEGER,
    likeId: DataTypes.INTEGER,
    commentId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Notice',
    tableName: 'Notices',
    underscored: true,
  });
  return Notice;
};