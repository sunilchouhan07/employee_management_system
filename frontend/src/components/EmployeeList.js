import api from '../services/api';

function EmployeeList({
    employees,
    refresh,
    setEditingEmployee
}) {

    const handleDelete =
        async (id) => {

            const confirmDelete =
                window.confirm(
                    "Delete Employee?"
                );

            if (!confirmDelete)
                return;

            try {

                await api.delete(
                    `/employees/${id}`
                );

                refresh();

            } catch (error) {

                console.error(error);

            }
        };

    return (

        <table
            border="1"
            cellPadding="10"
            cellSpacing="0"
        >

            <thead>

                <tr>

                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Salary</th>
                    <th>Actions</th>

                </tr>

            </thead>

            <tbody>

                {employees.map(emp => (

                    <tr key={emp.id}>

                        <td>{emp.name}</td>
                        <td>{emp.email}</td>
                        <td>{emp.department}</td>
                        <td>{emp.salary}</td>

                        <td>

                            <button
                                onClick={() =>
                                    setEditingEmployee(emp)
                                }
                            >
                                Edit
                            </button>

                            {' '}

                            <button
                                onClick={() =>
                                    handleDelete(
                                        emp.id
                                    )
                                }
                            >
                                Delete
                            </button>

                        </td>

                    </tr>

                ))}

            </tbody>

        </table>

    );
}

export default EmployeeList;