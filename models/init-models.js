var DataTypes = require("sequelize").DataTypes;
var _accounts = require("./accounts");
var _roles = require("./roles");
var _transactions = require("./transactions");
var _transfers = require("./transfers");
var _userroles = require("./userroles");
var _users = require("./users");

function initModels(sequelize) {
  var accounts = _accounts(sequelize, DataTypes);
  var roles = _roles(sequelize, DataTypes);
  var transactions = _transactions(sequelize, DataTypes);
  var transfers = _transfers(sequelize, DataTypes);
  var userroles = _userroles(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);

  roles.belongsToMany(users, { as: 'user_id_users', through: userroles, foreignKey: "role_id", otherKey: "user_id" });
  users.belongsToMany(roles, { as: 'role_id_roles', through: userroles, foreignKey: "user_id", otherKey: "role_id" });
  transactions.belongsTo(accounts, { as: "account", foreignKey: "account_id"});
  accounts.hasMany(transactions, { as: "transactions", foreignKey: "account_id"});
  transfers.belongsTo(accounts, { as: "from_account", foreignKey: "from_account_id"});
  accounts.hasMany(transfers, { as: "transfers", foreignKey: "from_account_id"});
  transfers.belongsTo(accounts, { as: "to_account", foreignKey: "to_account_id"});
  accounts.hasMany(transfers, { as: "to_account_transfers", foreignKey: "to_account_id"});
  userroles.belongsTo(roles, { as: "role", foreignKey: "role_id"});
  roles.hasMany(userroles, { as: "userroles", foreignKey: "role_id"});
  accounts.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(accounts, { as: "accounts", foreignKey: "user_id"});
  userroles.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(userroles, { as: "userroles", foreignKey: "user_id"});

  return {
    accounts,
    roles,
    transactions,
    transfers,
    userroles,
    users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
