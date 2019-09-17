const express = require('express');
const router = express.Router();
const semaLog = require(`${__basedir}/seama_services/sema_logger`);
const pricing = require('../models').pricing;

/* GET Pricing in the database. */
router.get('/', function (req, res) {
	semaLog.info('Pricing - Enter');
	pricing.findAndCountAll().then((pricing, count) => {
        res.status(200).json({ data: pricing, total: count });
    });
});

module.exports = router;
