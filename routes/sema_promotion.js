const express = require('express');
const Sequelize = require('sequelize');
const router = express.Router();
const semaLog = require(`${__basedir}/seama_services/sema_logger`);
const promotion = require('../models').promotion;

/* GET Promotion in the database. */
router.get('/', function (req, res) {
    semaLog.info('Promotion - Enter');
    promotion.findAndCountAll().then((promotion, count) => {
        res.status(200).json({ data: promotion, total: count });
    });
});

router.post('/', function (req, res, next) {
    semaLog.info(req.body);
    req.check('type', 'Parameter kiosk_id is missing').exists();
    req.check('sku', 'Parameter product_id is missing').exists();
    req.check('product_id', 'Parameter quantity is missing').exists();
    req.check('end_date', 'Parameter end_date is missing').exists();
    req.check('start_date', 'Parameter start_date is missing').exists();
    req.check('base64encoded_image', 'Parameter base64encoded_image is missing').exists();
    req.check('applies_to', 'Parameter applies_to is missing').exists();
    req.check('amount', 'Parameter amount is missing').exists();
    

    req.getValidationResult().then(function (result) {
        if (!result.isEmpty()) {
            const errors = result.array().map(elem => {
                return elem.msg;
            });
            semaLog.error(
                'CREATE promotion: Validation error: ' + errors.toString()
            );
            res.status(400).send(errors.toString());
        } else {

            promotion.create(req.body).then(promotion => {
                res.status(200).json(promotion);
            })
                .catch(Sequelize.ForeignKeyConstraintError, function handleError() {
                    res.status(400).json({ message: 'Invalid Assignment Error' });
                })
                .catch(next);
        }
    })


});

module.exports = router;
