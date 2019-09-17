const express = require('express');
const router = express.Router();
const semaLog = require(`${__basedir}/seama_services/sema_logger`);
const region_pricing = require('../models').region_pricing;

/* GET Region Pricing in the database. */
router.get('/', function (req, res) {
	semaLog.info('Region Pricing - Enter');
	region_pricing.findAndCountAll().then((regionPricing, count) => {
        res.status(200).json({ data: regionPricing, total: count });
    });
});

module.exports = router;
