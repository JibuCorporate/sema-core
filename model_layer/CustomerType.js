// Returns information on a SalesChannel.

class CustomerType {
	constructor(cutsomerType) {
		this.id = cutsomerType.id;
		this.name = cutsomerType.name;
		this.description = cutsomerType.description;
		this.salesChannelId=cutsomerType.sales_channel_id,
		this.salesChannelName=cutsomerType.sales_channel_name
	}
	classToPlain(){
		return {
			id:this.id,
			name:this.name,
			description:this.description,
			salesChannelId:this.salesChannelId,
			salesChannelName:this.salesChannelName
		};
	}
}

module.exports = CustomerType;
