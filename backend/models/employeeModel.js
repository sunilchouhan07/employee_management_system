const db = require('../config/db');

const getEmployees = async () => {
    const result = await db.query(
        'SELECT * FROM employees ORDER BY id'
    );

    return result.rows;
};

const addEmployee = async (
    name,
    email,
    department,
    salary
) => {

    const result = await db.query(
        `INSERT INTO employees
        (name,email,department,salary)
        VALUES($1,$2,$3,$4)
        RETURNING *`,
        [name,email,department,salary]
    );

    return result.rows[0];
};

module.exports = {
    getEmployees,
    addEmployee
};

const updateEmployee = async (
    id,
    name, 
    email, 
    department,
    salary
) => {
    const result = await db.query(
        `UPDATE employees
        SET name=$1,
            email=$2,
            department=$3,
            salary=$4
        WHERE id=$5
        RETURNING *`,
        [
            name,
            email,
            department,
            salary,
            id
        ]
    );
    return result.rows[0]
};

const deleteEmployee = async (id) => {

    const result = await db.query(
        `DELETE FROM employees
         WHERE id=$1
         RETURNING *`,
        [id]
    );

    return result.rows[0];
};

module.exports = {
    getEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee
};
