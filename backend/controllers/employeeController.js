const Employee =
require('../models/employeeModel');

const getEmployees = async (
    req,
    res
) => {

    try {

        const employees =
        await Employee.getEmployees();

        console.log(
            `Employees Fetched: ${employees.length}`
        );

        res.json(employees);

    } catch(error) {

        console.error(
            `Get Employees Error: ${error.message}`
        );

        res.status(500).json({
            message: error.message
        });

    }
};

const addEmployee = async (
    req,
    res
) => {

    try {

        const {
            name,
            email,
            department,
            salary
        } = req.body;

        const employee =
        await Employee.addEmployee(
            name,
            email,
            department,
            salary
        );

        console.log(
            `Employee Created | Name=${name} | Email=${email}`
        );

        res.status(201).json(employee);

    } catch(error) {

        console.error(
            `Create Employee Error: ${error.message}`
        );

        res.status(500).json({
            message: error.message
        });

    }
};

const updateEmployee = async (
    req,
    res
) => {

    try {

        const { id } = req.params;

        const {
            name,
            email,
            department,
            salary
        } = req.body;

        const employee =
        await Employee.updateEmployee(
            id,
            name,
            email,
            department,
            salary
        );

        console.log(
            `Employee Updated | ID=${id}`
        );

        res.json(employee);

    } catch(error) {

        console.error(
            `Update Employee Error: ${error.message}`
        );

        res.status(500).json({
            message: error.message
        });

    }
};

const deleteEmployee = async (
    req,
    res
) => {

    try {

        const { id } = req.params;

        const employee =
        await Employee.deleteEmployee(id);

        console.log(
            `Employee Deleted | ID=${id}`
        );

        res.json(employee);

    } catch(error) {

        console.error(
            `Delete Employee Error: ${error.message}`
        );

        res.status(500).json({
            message: error.message
        });

    }
};

module.exports = {
    getEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee
};
