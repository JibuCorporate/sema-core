const express = require('express');
const Sequelize = require('sequelize');
const router = express.Router();
const semaLog = require(`${__basedir}/seama_services/sema_logger`);
const kiosk_closing_stock = require('../models').kiosk_closing_stock;

/* GET kiosk Closing Stock in the database. */
router.get('/', function (req, res) {
    semaLog.info('Kiosk Closing Stock - Enter');
    kiosk_closing_stock.findAndCountAll().then((kioskClosingStock, count) => {
        res.status(200).json({ data: kioskClosingStock, total: count });
    });
});

router.post('/', function (req, res, next) {
    semaLog.info(req.body);
    req.check('kiosk_id', 'Parameter kiosk_id is missing').exists();
    req.check('product_id', 'Parameter product_id is missing').exists();
    req.check('quantity', 'Parameter quantity is missing').exists();

    req.getValidationResult().then(function (result) {
        if (!result.isEmpty()) {
            const errors = result.array().map(elem => {
                return elem.msg;
            });
            semaLog.error(
                'CREATE kiosk_closing_stock: Validation error: ' + errors.toString()
            );
            res.status(400).send(errors.toString());
        } else {

            kiosk_closing_stock.create(req.body).then(kioskClosingStock => {
                res.status(200).json(kioskClosingStock);
            })
                .catch(Sequelize.ForeignKeyConstraintError, function handleError() {
                    res.status(400).json({ message: 'Invalid Assignment Error' });
                })
                .catch(next);
        }
    })


});

module.exports = router;
