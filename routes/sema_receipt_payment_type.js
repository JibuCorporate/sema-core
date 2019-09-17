const express = require('express');
const router = express.Router();
const semaLog = require(`${__basedir}/seama_services/sema_logger`);
const receipt_payment_type=require('../models').receipt_payment_type;

/* GET Payment Type Credit in the database. */
router.get('/', function(req, res) {
	semaLog.info('Payment Type - Enter');
	receipt_payment_type.findAll().then(receiptPaymentType=>{
		res.send(receiptPaymentType)
	});
});

module.exports = router;
