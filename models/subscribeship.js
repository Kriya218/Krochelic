'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subscribeship extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Subscribeship.init({
    subscribeId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'id'
      },
      allowNull: false
    },
    subscriberId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'id'
      },
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Subscribeship',
    tableName: 'Subscribeships',
    underscored: true,
  });
  return Subscribeship;
};