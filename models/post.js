'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Post.belongsTo(models.Category, { foreignKey: 'categoryId' } )
      Post.belongsTo(models.User, { foreignKey: 'userId' })
      Post.hasMany(models.Image, { foreignKey: 'postId' })
    }
  }
  Post.init({
    title: DataTypes.STRING,
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    content: DataTypes.TEXT,
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Post',
    tableName: 'Posts',
    underscored: true,
  });
  return Post;
};