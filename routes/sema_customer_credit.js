const express = require('express');
const router = express.Router();
const semaLog = require(`${__basedir}/seama_services/sema_logger`);
const customer_credit = require('../models').customer_credit;

/* GET Customer Credit in the database. */
router.get('/:customerId', function (req, res) {
	semaLog.info('Customer Credit - Enter');
	customer_credit.find({ customer_account_id: req.params.customerId }).then(customerCredit => {
		res.send(customerCredit)
	});
});

module.exports = router;
