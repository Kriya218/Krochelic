'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Post, { foreignKey: 'userId', as: 'Posts' })
      User.hasMany(models.Comment, { foreignKey: 'userId' })
      User.belongsToMany(models.Post, { 
        through: models.Like,
        foreignKey: 'userId',
        as: 'LikedPosts'
      })
      User.belongsToMany(User, {
        through: models.Followship,
        foreignKey: 'followingId',
        as: 'Followers'
      })
      User.belongsToMany(User, {
        through: models.Followship,
        foreignKey: 'followerId',
        as: 'Followings'
      })
      User.belongsToMany(User, {
        through: models.Subscribeship,
        foreignKey: 'subscriberId',
        as: 'Subscribes'
      })
      User.belongsToMany(User, {
        through: models.Subscribeship,
        foreignKey: 'subscribeId',
        as: 'Subscribers'
      }),
      User.hasMany(models.Notice, { foreignKey: 'notifyId' })
    }
  }
  User.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password:  {
      type: DataTypes.STRING,
      allowNull: false
    },
    image: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM('admin', 'user'),
      defaultValue: 'user',
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    underscored: true,
  });
  return User;
};