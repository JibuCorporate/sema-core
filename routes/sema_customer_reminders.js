const express = require('express');
const router = express.Router();
const semaLog = require(`${__basedir}/seama_services/sema_logger`);
const customer_reminders = require('../models').customer_reminders;

/* GET Customer Reminders in the database. */
router.get('/:customerId', function (req, res) {
    semaLog.info('Customer Reminders - Enter');
    customer_reminders.find({ customer_account_id: req.params.customerId }).then(customerReminders => {
        res.send(customerReminders)
    });
});

module.exports = router;
