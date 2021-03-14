module.exports = (sequelize, DataTypes) => {
  const Subscription = sequelize.define('Subscription', {
    subscriberId : DataTypes.INTEGER,
    subscribingId: DataTypes.INTEGER,
  }, {});
  Subscription.associate = function (models) {
    // associations can be defined here
  };
  return Subscription;
};
