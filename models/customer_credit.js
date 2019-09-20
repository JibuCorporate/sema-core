/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	const customer_credit= sequelize.define('customer_credit', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		customer_account_id: {
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: 'customer_account',
				key: 'id'
			}
		},		
		topup: {
			type: DataTypes.DECIMAL,
			allowNull: false,
        },
        balance: {
			type: DataTypes.DECIMAL,
			allowNull: false,
        },
		created_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		updated_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
	}, {
		tableName: 'customer_credit',
		timestamps: false,
		underscored: true
	});

	return customer_credit;
};
