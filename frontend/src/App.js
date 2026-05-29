import { useState, useEffect } from 'react';

import api from './services/api';
import './App.css';

import EmployeeForm from './components/EmployeeForm';
import EmployeeList from './components/EmployeeList';

function App() {

    const [employees, setEmployees] =
        useState([]);

    const [search, setSearch] =
        useState('');

    const [loading, setLoading] =
        useState(true);

    const [editingEmployee,
        setEditingEmployee] =
        useState(null);

    const loadEmployees =
        async () => {

            try {

                setLoading(true);

                const response =
                    await api.get(
                        '/employees'
                    );

                setEmployees(
                    response.data
                );

            } catch (error) {

                console.error(error);

            } finally {

                setLoading(false);

            }
        };

    useEffect(() => {

        loadEmployees();

    }, []);

    const filteredEmployees =
        employees.filter(emp =>
            emp.name
                .toLowerCase()
                .includes(
                    search.toLowerCase()
                )
        );

    if (loading) {

        return (
            <div className="container">
                <h2>Loading...</h2>
            </div>
        );

    }

    return (

        <div className="container">

            <h1>
                Employee Management System
            </h1>

            <input
                className="search-box"
                type="text"
                placeholder="🔍 Search Employee"
                value={search}
                onChange={(e) =>
                    setSearch(
                        e.target.value
                    )
                }
            />

            <EmployeeForm
                refresh={loadEmployees}
                editingEmployee={
                    editingEmployee
                }
                setEditingEmployee={
                    setEditingEmployee
                }
            />

            <EmployeeList
                employees={
                    filteredEmployees
                }
                refresh={
                    loadEmployees
                }
                setEditingEmployee={
                    setEditingEmployee
                }
            />

        </div>

    );
}

export default App;