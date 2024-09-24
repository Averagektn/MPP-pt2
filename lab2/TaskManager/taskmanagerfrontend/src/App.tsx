import { useState } from 'react'
import '../public/stylesheets/main.css'
import React from 'react'

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({ name: '', description: '', file: null });
    const [filter, setFilter] = useState('None');

    const handleAddTask = (e) => {
        e.preventDefault();
        // Logic to add a new task
        const formData = new FormData();
        formData.append('name', newTask.name);
        formData.append('description', newTask.description);
        formData.append('file', newTask.file);

        // Fetch API call to add task
        fetch('/add-task', { method: 'POST', body: formData })
            .then(response => response.json())
            .then(data => setTasks([...tasks, data]));

        // Reset form
        setNewTask({ name: '', description: '', file: null });
    };

    const handleFileChange = (e) => {
        setNewTask({ ...newTask, file: e.target.files[0] });
    };

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
        // Logic to filter tasks based on status
    };

    const handleUpdateTask = (taskId) => {
        // Logic to update a task
    };

    const handleDeleteTask = (taskId) => {
        // Logic to delete a task
    };

    return (
        <div className="container">
            <h1>Task List</h1>
            <hr />
            <section>
                <div className="row">
                    <form onSubmit={handleAddTask}>
                        <input
                            type="text"
                            name="name"
                            placeholder="Task name"
                            required
                            value={newTask.name}
                            onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                        />
                        <input
                            type="text"
                            name="description"
                            placeholder="Task description"
                            required
                            value={newTask.description}
                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        />
                        <input
                            type="file"
                            name="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            required
                        />
                        <button type="submit" className="btn">Add Task</button>
                    </form>
                </div>

                <div className="row">
                    <form onSubmit={(e) => { e.preventDefault(); handleFilterChange(e); }}>
                        <div className="box">
                            <select name="status" value={filter} onChange={handleFilterChange}>
                                <option value="None">None</option>
                                <option value="Pending">Pending</option>
                                <option value="Done">Done</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                            <button type="submit" className="btn">Filter</button>
                        </div>
                    </form>
                </div>

                <div className="row" style={{ textAlign: 'center' }}>
                    {tasks.map(task => (
                        <div className="col" key={task.id}>
                            <strong>{task.name}:</strong>
                            <br />
                            {task.description}
                            <br />
                            <form onSubmit={(e) => { e.preventDefault(); handleUpdateTask(task.id); }}>
                                <input type="date" name="date" defaultValue={task.date} />
                                <div className="box">
                                    <select name="status" defaultValue={task.status}>
                                        <option value="None">None</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Done">Done</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn">Update</button>
                            </form>

                            <img src={task.photo} alt="Task Photo" />

                            <form onSubmit={(e) => { e.preventDefault(); handleDeleteTask(task.id); }}>
                                <button type="submit" className="btn">Delete</button>
                            </form>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default TaskList;