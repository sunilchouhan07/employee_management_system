const express = require('express');

const router = express.Router();



const {
    getEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee
}
=
require(
'../controllers/employeeController'
);

router.get(
    '/',
    getEmployees
);

router.get("/stress", (req, res) => {

    let result = 0;

    for (let i = 0; i < 500000000; i++) {
        result += Math.sqrt(i);
    }

    res.json({ result });

});

router.post(
    '/',
    addEmployee
);

router.put(
    '/:id',
    updateEmployee
);

router.delete(
    '/:id',
    deleteEmployee
);

module.exports = router;