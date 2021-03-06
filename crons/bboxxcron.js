const request = require('request');
const querystring = require('querystring');
let kiosk_panel = require('../models').kiosk_panel;
let kiosk_panel_readings = require('../models').kiosk_panel_readings;
let dProd = require('../models').kiosk_daily_production;
let moment = require('moment');
const CronJob = require('cron').CronJob;
const semaLog = require('../seama_services/sema_logger');
let updateHelper = require('../models').helper;
const db = require('../models');

const downloadCronJob = new CronJob('0 0 * * *', function() {
	loginToBBOXX();
});

const updateCronJob = new CronJob('0 1 * * *', function() {
	updateDailyProduction();
});

const identifyDaysWithoutRecords = new CronJob('0 1 * * *', function() {
	getDateWithoutRecords();
});

const downloadMissingData = new CronJob('0 2 * * *', function() {
	getMissingData();
});

loginToBBOXX = async () => {
	// form data
	let postData = querystring.stringify({
		username: process.env.BBOXX_USER,
		password: process.env.BBOXX_PWD
	});
	request.post(
		{
			uri: process.env.BBOXX_LOGIN,
			headers: {
				'content-type': 'application/x-www-form-urlencoded'
			},
			body: postData
		},
		(err, res, body) => {
			let creds = JSON.parse(body);
			if (creds) {
				let token = creds.message.login_successful.API_token;
				//We have credentials, ready imei from database and populate readings for each of them
				readIMEIFromDB(token);
			}
		}
	);
};

readIMEIFromDB = async token => {
	let begin = '2017-01-01';
	let panels = await kiosk_panel.findAll();

	if (panels) {
		try {
			for (let i = 0; i < panels.length; i++) {
				let e = panels[i];
				let time = 20000;
				let imei = e.imei;
				await wait(time);

				let lastReading = await getLastEntry(imei);
				let start = begin;
				let end = moment(new Date()).format('YYYY-MM-DD');

				if (lastReading) {
					let date = new Date();
					date.setDate(date.getDate() - 1);
					start = moment(date).format('YYYY-MM-DD');
				}

				await downloadPulsesFromBBOXX(imei, token, start, end);
			}
			updateDailyProduction();
		} catch (error) {}
	}
};

getLastEntry = async imei => {
	let filter = {
		where: {
			panel_imei: imei
		}
	};
	const reading = await kiosk_panel_readings.findOne(filter);
	return reading;
};

downloadPulsesFromBBOXX = (imei, token, start, end) => {
	console.log('called with ' + imei);
	let url = `${
		process.env.BBOXX_BASE_URL
	}/${imei}/data?start=${start}&end=${end}&measurement=telemetry&fields=pulse_count`;
	request.get(
		{
			uri: url,
			headers: {
				'content-type': 'application/json',
				Authorization: `Token token=${token}`
			}
		},
		async (err, res, body) => {
			if (body) {
				//If we have data insert into the db
				insertPulsesToDB(imei, body);
			}
			if (err) {
				console.log(err);
			}
		}
	);
};

insertPulsesToDB = async (imei, pulses) => {
	pulses = JSON.parse(pulses);
	pulses = pulses.data.pulse_count;
	if (pulses) {
		for (const pulse of pulses) {
			let parts = pulse;
			if (parts[0] > 0) {
				let reading = {
					panel_imei: imei,
					pulse: parts[0],
					pulse_record_time: parts[1]
				};
				await kiosk_panel_readings.create(reading);
			}
		}
	}
};

wait = milleseconds => {
	return new Promise(resolve => setTimeout(resolve, milleseconds));
};

print = value => {
	console.log(value);
};

getPanelKioskIds = async () => {
	let query = `select kiosk_id from kiosk_panel`;

	let result = await db.sequelize.query(query, {
		type: db.sequelize.QueryTypes.SELECT
	});
	return result;
};

getKioskLastProductionEntry = async kioskId => {
	let query = `select day_date as day, cumulative_production as cumul from kiosk_daily_production where kiosk_id=${kioskId} order by day_date desc limit 1`;

	let result = await db.sequelize.query(query, {
		type: db.sequelize.QueryTypes.SELECT
	});

	if (result.length > 0) {
		return result[0];
	}
	return { day: null, cumul: 0 };
};

getKioskLastReadings = async (kioskId, dateFrom) => {
	console.log(dateFrom);
	let query = `select max(r.pulse) as pulse, date(r.pulse_record_time) as day from kiosk_panel_readings r join kiosk_panel k on r.panel_imei=k.imei where k.kiosk_id=${kioskId} group by kiosk_id, day`;

	if (dateFrom) {
		try {
			query = `select max(r.pulse) as pulse, date(r.pulse_record_time) as day from kiosk_panel_readings r join kiosk_panel k on r.panel_imei=k.imei  where k.kiosk_id=${kioskId} and r.pulse_record_time >= '${dateFrom.toISOString()}' group by kiosk_id, day`;
		} catch (error) {}
	}
	let result = await db.sequelize.query(query, {
		type: db.sequelize.QueryTypes.SELECT
	});

	return result;
};

updateDailyProduction = async () => {
	//1. Get all Kiosk Ids
	let kioskIds = await getPanelKioskIds();

	for (const k of kioskIds) {
		let kioskId = k.kiosk_id;
		//2. For each kiosk get last known update
		let lastProductionEntry = await getKioskLastProductionEntry(kioskId);

		//2.1. Get last known Readings
		let lastReadings = await getKioskLastReadings(
			kioskId,
			lastProductionEntry.day
		);

		//2.2 Update daily production
		let cumul = lastProductionEntry.cumul;

		for (const r of lastReadings) {
			let prod = {
				kiosk_id: kioskId,
				day_date: r.day,
				production: r.pulse - cumul,
				cumulative_production: r.pulse,
				cumulative_meter_adjustment: 0,
				water_meter_reading: r.pulse - cumul,
				cumulative_billing_adjustment: 0,
				billable_production: r.pulse - cumul
			};

			cumul = r.pulse;
			//4. Insert daily production into kiosk_daily_production
			try {
				dProd.create(prod);
			} catch (error) {}
		}
	}
};

ct = async () => {
	console.log('called');
	let query = `select max(r.pulse) as pulse, date(r.pulse_record_time) as day from kiosk_panel_readings r join kiosk_panel k on r.panel_imei=k.imei where k.kiosk_id=6190 group by kiosk_id, day`;
	let result = await db.sequelize.query(query, {
		type: db.sequelize.QueryTypes.SELECT
	});

	console.log(result);
};

getLastUpdateDate = async imei => {
	let filter = {
		where: {
			imei: imei,
			is_empty: false
		},
		order: [['date', 'DESC']]
	};
	return updateHelper.findOne(filter);
};

getDaysWithMissingDate = async imei => {
	let filter = {
		where: {
			imei: imei,
			is_empty: true
		}
	};
	return updateHelper.findAll(filter);
};

getDateWithoutRecords = async () => {
	let panels = await kiosk_panel.findAll();
	if (panels) {
		try {
			for (let i = 0; i < panels.length; i++) {
				let e = panels[i];
				let imei = e.imei;

				let lastUpdate = await getLastUpdateDate(imei);

				let start = lastUpdate
					? lastUpdate.date
					: new Date('2018-08-01');
				let end = new Date();
				end = end.addDays(-1);
				for (; start < end; start.addDays(1)) {
					let date = moment(start).format('YYYY-MM-DD');
					let query = `select * from kiosk_panel_readings where pulse_record_time like '${date}%' and panel_imei=${imei} limit 1`;
					__pool.getConnection((err, connection) => {
						connection.query(query, (err, result) => {
							connection.release();
							if (result) {
								if (result.length == 0) {
									updateHelper
										.create({
											imei: imei,
											date: date,
											is_empty: true
										})
										.then(e =>
											console.log(imei + ' ' + date)
										);
								}
							}
						});
					});
				}
				if (!getLastUpdateDate(imei)) {
					updateHelper
						.create({
							imei: imei,
							date: moment(new Date()).format('YYYY-MM-DD'),
							is_empty: false
						})
						.then(e =>
							console.log(`EVERYTING IS FIND FOR ${imei} ${e}`)
						);
				}
			}
		} catch (error) {}
	}
};

getMissingData = async () => {
	// form data
	let postData = querystring.stringify({
		username: process.env.BBOXX_USER,
		password: process.env.BBOXX_PWD
	});
	request.post(
		{
			uri: process.env.BBOXX_LOGIN,
			headers: {
				'content-type': 'application/x-www-form-urlencoded'
			},
			body: postData
		},
		async (err, res, body) => {
			let creds = JSON.parse(body);
			if (creds) {
				let token = creds.message.login_successful.API_token;
				let panels = await kiosk_panel.findAll();
				if (panels) {
					try {
						for (let i = 0; i < panels.length; i++) {
							let e = panels[i];
							let imei = e.imei;
							let kioskId = e.kiosk_id;
							let list = await getDaysWithMissingDate(imei);

							if (list) {
								for (const e of list) {
									let start = e.date;
									let end = addDays(1, start);

									downloadToUpdateBBOXX(
										imei,
										token,
										start,
										kioskId,
										end,
										e.id
									);
								}
							}
						}
					} catch (error) {
						console.log(error);
					}
				}
			}
		}
	);
};

downloadToUpdateBBOXX = (imei, token, start, kioskId, end, id) => {
	let url = `${
		process.env.BBOXX_BASE_URL
	}/${imei}/data?start=${start}&end=${end}&measurement=telemetry&fields=pulse_count`;
	request.get(
		{
			uri: url,
			headers: {
				'content-type': 'application/json',
				Authorization: `Token token=${token}`
			}
		},
		async (err, res, body) => {
			if (body) {
				//If we have data insert into the db
				insertMissingPulsesToDB(imei, body, kioskId, start, id);
			}
			if (err) {
				console.log(err);
			}
		}
	);
};

insertMissingPulsesToDB = async (imei, pulses, kioskId, date, id) => {
	pulses = JSON.parse(pulses);
	pulses = pulses.data.pulse_count;
	if (pulses) {
		console.log(`Start to insert pulse for ${kioskId} for ${date}`);

		for (let i = 0; i < pulses.length; i++) {
			let parts = pulses[i];
			if (parts[0] > 0) {
				let reading = {
					panel_imei: imei,
					pulse: parts[0],
					pulse_record_time: parts[1]
				};
				await kiosk_panel_readings.create(reading);
			}
		}

		updateProductionAtAGivenDate(kioskId, date);

		//Mark a given record as having data now
		updateHelper.update({ is_empty: false }, { where: { id: id } });
	}
};

updateProductionAtAGivenDate = (kioskId, date) => {
	console.log(`Updating ${kioskId} for ${date}`);
	date = new Date(date);
	if (date) {
		let query = `select max(r.pulse) as pulse, date(r.pulse_record_time) as day from kiosk_panel_readings r join kiosk_panel k on r.panel_imei=k.imei  where k.kiosk_id=${kioskId} and r.pulse_record_time ='${date.toISOString()}' group by kiosk_id, day`;

		productionUpdateHelper(query, kioskId, date);
	}
};

productionUpdateHelper = async (query, kioskId, date) => {
	let previousUpdate = await dProd.findOne({
		where: {
			kiosk_id: kioskId,
			day_date: addDays(-1, date)
		}
	});

	let previousValue = previousUpdate
		? previousUpdate.cumulative_production
		: 0;

	__pool.getConnection((err, connection) => {
		connection.query(query, (err, result) => {
			connection.release();
			if (!err) {
				let pulses = [...result];

				for (const e of pulses) {
					let prod = {
						kiosk_id: id.kiosk_id,
						day_date: e.day,
						production: e.pulse - previousValue,
						cumulative_production: r.pulse,
						cumulative_meter_adjustment: 0,
						water_meter_reading: e.pulse - previousValue,
						cumulative_billing_adjustment: 0,
						billable_production: e.pulse - previousValue
					};

					previousValue = e.pulse;
					//4. Insert daily production into kiosk_daily_production
					try {
						dProd.create(prod).then(p => {
							console.log(p);
						});
					} catch (error) {}
				}
			}
		});
	});
};

addDays = (days, date) => {
	var date = new Date(date);
	date.setDate(date.getDate() + days);
	return moment(date).format('YYYY-MM-DD');
};

module.exports = {
	downloadCronJob: downloadCronJob,
	updateCronJob: updateCronJob,
	identifyDaysWithoutRecords: identifyDaysWithoutRecords,
	downloadMissingData: downloadMissingData
};
