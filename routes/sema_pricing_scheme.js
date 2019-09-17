const express = require('express');
const router = express.Router();
const semaLog = require(`${__basedir}/seama_services/sema_logger`);
const pricing_scheme=require('../models').pricing_scheme;

/* GET Pricing Schemes in the database. */
router.get('/', function(req, res) {
	semaLog.info('Pricing Schemes - Enter');
	pricing_scheme.findAll().then(receiptPaymentType=>{
		res.send(receiptPaymentType)
	});
});

module.exports = router;
