'use strict';
const { Model } = require('sequelize');
const { hash } = require('./../helpers/hash');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Photo);
    }
  }
  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Username cannot be omitted'
          },
          notEmpty: {
            msg: 'Username cannot be an empty string'
          }
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Email cannot be omitted'
          },
          notEmpty: {
            msg: 'Email cannot be an empty string'
          },
          isEmail: {
            msg: 'Wrong email format'
          }
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Password cannot be omitted'
          },
          notEmpty: {
            msg: 'Password cannot be an empty string'
          }
        }
      }
    },
    {
      hooks: {
        beforeCreate(instance) {
          instance.password = hash(instance.password);
        }
      },
      sequelize,
      modelName: 'User'
    }
  );
  return User;
};
