/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	const region_pricing = sequelize.define('region_pricing', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		pricing_scheme_id:{
			type: DataTypes.BIGINT,
			allowNull: false,
			references: {
				model: 'pricing_scheme',
				key: 'id'
			}
		},
		region_id:{
			type: DataTypes.BIGINT,
			allowNull: false,
			references: {
				model: 'region',
				key: 'id'
			}
		},
		kiosk_id:{
			type: DataTypes.BIGINT,
			allowNull: false,
			references: {
				model: 'kiosk',
				key: 'id'
			}
		},
		pricing_id:{
			type: DataTypes.BIGINT,
			allowNull: false,
			references: {
				model: 'pricing',
				key: 'id'
			}
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
		tableName: 'region_pricing',
		timestamps: false,
		underscored: true
	});

	return region_pricing;
};
