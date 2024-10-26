const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('accounts', {
    account_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    account_type: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    balance: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: false,
      defaultValue: 0.00
    },
    card_number: {
      type: DataTypes.STRING(16),
      allowNull: false,
      unique: "numero_tarjeta_UNIQUE"
    }
  }, {
    sequelize,
    tableName: 'accounts',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "account_id" },
        ]
      },
      {
        name: "numero_tarjeta_UNIQUE",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "card_number" },
        ]
      },
      {
        name: "user_id",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
};
