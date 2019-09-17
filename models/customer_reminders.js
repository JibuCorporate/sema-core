/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	const customer_reminders= sequelize.define('customer_reminders', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		customer_account_id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			references: {
				model: 'customer_account',
				key: 'id'
			}
		},
        frequency: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
		},
		show_reminders: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
		},
		reminder_date: {
			type: DataTypes.DATE,
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
		tableName: 'customer_reminders',
		timestamps: false,
		underscored: true
	});

	return customer_reminders;
};
