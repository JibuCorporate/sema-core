const express = require('express');
const router = express.Router();
const semaLog = require(`${__basedir}/seama_services/sema_logger`);
const payment_type=require('../models').payment_type;

/* GET Payment Type Credit in the database. */
router.get('/', function(req, res) {
	semaLog.info('Payment Type - Enter');
	payment_type.findAll().then(paymentType=>{
		res.send(paymentType)
	});
});

module.exports = router;
