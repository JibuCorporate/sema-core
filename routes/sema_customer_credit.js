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

router.post('/', function (req, res, next) {
    semaLog.info(req.body);
    req.check('customer_account_id', 'Parameter customer_account_id is missing').exists();
    req.check('topup', 'Parameter topup is missing').exists();
    req.check('balance', 'Parameter balance is missing').exists();

    req.getValidationResult().then(function (result) {
        if (!result.isEmpty()) {
            const errors = result.array().map(elem => {
                return elem.msg;
            });
            semaLog.error(
                'CREATE customer_credit: Validation error: ' + errors.toString()
            );
            res.status(400).send(errors.toString());
        } else {

            customer_credit.create(req.body).then(kioskClosingStock => {
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
