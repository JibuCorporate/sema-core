/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	const pricing_scheme= sequelize.define('pricing_scheme', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},	
		description: {
			type: DataTypes.STRING,
			allowNull: false,
		},		
		active: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: '1'
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
		tableName: 'pricing_scheme',
		timestamps: false,
		underscored: true
	});

	return pricing_scheme;
};
