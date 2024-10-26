const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('roles', {
    role_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    role_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "role_name"
    }
  }, {
    sequelize,
    tableName: 'roles',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "role_id" },
        ]
      },
      {
        name: "role_name",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "role_name" },
        ]
      },
    ]
  });
};
