const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('transfers', {
    transfer_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    from_account_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'accounts',
        key: 'account_id'
      }
    },
    to_account_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'accounts',
        key: 'account_id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: false
    },
    transfer_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'transfers',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "transfer_id" },
        ]
      },
      {
        name: "from_account_id",
        using: "BTREE",
        fields: [
          { name: "from_account_id" },
        ]
      },
      {
        name: "to_account_id",
        using: "BTREE",
        fields: [
          { name: "to_account_id" },
        ]
      },
    ]
  });
};
