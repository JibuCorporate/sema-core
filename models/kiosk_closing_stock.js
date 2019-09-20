/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	const kiosk_closing_stock = sequelize.define('kiosk_closing_stock', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		kiosk_id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			references: {
				model: 'kiosk',
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
		quantity: {
			type: DataTypes.BIGINT,
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
		tableName: 'kiosk_closing_stock',
		timestamps: false,
		underscored: true
	});

	return kiosk_closing_stock;
};
