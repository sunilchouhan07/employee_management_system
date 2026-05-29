const Employee =
require('../models/employeeModel');

const getEmployees = async (
    req,
    res
) => {

    try {

        const employees =
        await Employee.getEmployees();

        res.json(employees);

    } catch(error) {
        console.error(error)
        
        res.status(500).json({
            message:error.message
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

        res.status(201).json(employee);

    } catch(error) {
        console.error(error);

        res.status(500).json({
            message:error.message
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

        res.json(employee);

    } catch(error) {

        console.error(error);

        res.status(500).json({
            message:error.message
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

        res.json(employee);

    } catch(error) {

        console.error(error);

        res.status(500).json({
            message:error.message
        });

    }
};

module.exports = {
    getEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee
};