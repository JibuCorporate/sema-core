const express = require('express');
const router = express.Router();
const semaLog = require(`${__basedir}/seama_services/sema_logger`);
const customer_debt = require('../models').customer_debt;

/* GET Customer Debt in the database. */
router.get('/:customerId', function (req, res) {
	semaLog.info('Customer Debt - Enter');
	customer_debt.find({ customer_account_id: req.params.customerId }).then(customerDebt => {
		res.send(customerDebt)
	});
});

module.exports = router;
