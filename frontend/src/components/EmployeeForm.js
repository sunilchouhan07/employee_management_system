import {
    useState,
    useEffect
} from 'react';

import api from '../services/api';

function EmployeeForm({
    refresh,
    editingEmployee,
    setEditingEmployee
}) {

    const [form, setForm] = useState({
        name: '',
        email: '',
        department: '',
        salary: ''
    });

    const [message, setMessage] =
        useState('');

    useEffect(() => {

        if (editingEmployee) {

            setForm({
                name: editingEmployee.name,
                email: editingEmployee.email,
                department: editingEmployee.department,
                salary: editingEmployee.salary
            });

        }

    }, [editingEmployee]);

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (
            !form.name ||
            !form.email ||
            !form.department ||
            !form.salary
        ) {

            setMessage(
                '⚠️ All fields are required'
            );

            return;
        }

        try {

            if (editingEmployee) {

                await api.put(
                    `/employees/${editingEmployee.id}`,
                    form
                );

                setMessage(
                    '✅ Employee Updated Successfully'
                );

                setEditingEmployee(
                    null
                );

            } else {

                await api.post(
                    '/employees',
                    form
                );

                setMessage(
                    '✅ Employee Added Successfully'
                );
            }

            refresh();

            setForm({
                name: '',
                email: '',
                department: '',
                salary: ''
            });

        } catch (error) {

            console.error(error);

            setMessage(
                '❌ Something went wrong'
            );
        }
    };

    return (

        <div>

            {
                message &&
                (
                    <p className="message">
                        {message}
                    </p>
                )
            }

            <form
                className="form-container"
                onSubmit={handleSubmit}
            >

                <input
                    type="text"
                    placeholder="👤 Name"
                    value={form.name}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            name: e.target.value
                        })
                    }
                />

                <input
                    type="email"
                    placeholder="📧 Email"
                    value={form.email}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            email: e.target.value
                        })
                    }
                />

                <input
                    type="text"
                    placeholder="🏢 Department"
                    value={form.department}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            department: e.target.value
                        })
                    }
                />

                <input
                    type="number"
                    placeholder="💰 Salary"
                    value={form.salary}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            salary: e.target.value
                        })
                    }
                />

                <button
                    type="submit"
                    className="btn-primary"
                >
                    {
                        editingEmployee
                            ? 'Update Employee'
                            : 'Add Employee'
                    }
                </button>

                {
                    editingEmployee &&
                    (
                        <button
                            type="button"
                            className="delete-btn"
                            onClick={() => {

                                setEditingEmployee(
                                    null
                                );

                                setForm({
                                    name: '',
                                    email: '',
                                    department: '',
                                    salary: ''
                                });

                                setMessage('');

                            }}
                        >
                            Cancel
                        </button>
                    )
                }

            </form>

        </div>
    );
}

export default EmployeeForm;