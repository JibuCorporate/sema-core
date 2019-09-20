/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	const pricing = sequelize.define('pricing', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		sales_channel_id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			references: {
				model: 'sales_channel',
				key: 'id'
			}
		},
		product_id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			references: {
				model: 'product',
				key: 'id'
			}
		},
		applies_to: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		start_date: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		end_date: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		amount: {
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
		tableName: 'pricing',
		timestamps: false,
		underscored: true
	});

	return pricing;
};
