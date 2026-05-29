const express = require('express');
const cors = require('cors');

const employeeRoutes =
require('./routes/employeeRoutes');
require('dotenv').config();

const app = express();

app.use(cors());

app.use(express.json());

app.use(
    '/api/employees',
    employeeRoutes
);

app.listen(5000, () => {

    console.log(
        'Server running on port 5000'
    );

});