/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	const customer_debt= sequelize.define('customer_debt', {
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
        due_amount: {
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
		tableName: 'customer_debt',
		timestamps: false,
		underscored: true
	});

	return customer_debt;
};
