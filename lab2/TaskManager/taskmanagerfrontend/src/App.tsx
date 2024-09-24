import { useEffect, useState } from 'react'
import '../public/stylesheets/main.css'
import React from 'react'

const TaskList = () => {
    const [taskName, setTaskName] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [file, setFile] = useState(null);
    const [tasks, setTasks] = useState([]); 
    const statuses = ['Pending', 'Rejected', 'Accepted'];

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch('http://localhost:1337/tasks');
                if (!response.ok) {
                    throw new Error('Tasks loading error');
                }
                const data = await response.json();
                setTasks(data); 
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchTasks(); 
    }, []); 

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpdateTask = async (event) => {

    }

    const handleCreateTask = async (event) => {
        event.preventDefault();

        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:1337/tasks/photo', {
                method: 'POST',
                body: formData,
            });

            const { photo } = await response.json();

            const taskData = {
                name: taskName,
                description: taskDescription,
                photo: photo,
            };

            const taskResponse = await fetch('http://localhost:1337/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData),
            });

            if (taskResponse.ok) {
                setTasks((prevTasks) => [...prevTasks, taskData]);
                setTaskName('');
                setTaskDescription('');
                setFile(null);
                console.log('Task added');
            } else {
                console.error('Task add error:', taskResponse.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="container">
            <h1>Task List</h1>
            <hr />
            <section>
                <div className="row">
                    <form onSubmit={handleCreateTask}>
                        <input
                            type="text"
                            name="name"
                            placeholder="Task name"
                            value={taskName}
                            onChange={(e) => setTaskName(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            name="description"
                            placeholder="Task description"
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                            required
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
                    <form>
                        <div className="box">
                            <select name="status">
                                <option value="None">None</option>
                                {statuses.map((status) => (
                                    <option value={status}>{status}</option>
                                ))}
                            </select>
                            <button type="submit" className="btn">Filter</button>
                        </div>
                    </form>
                </div>

                <div className="row" style={{ textAlign: 'center' }}>
                    {tasks.map((task, index) => (
                        <div className="col" key={index}>
                            <strong>{task.TaskName}</strong>
                            <br />
                            {task.TaskDescription}
                            <br />

                            <input type="date" name="date" />
                            <div className="box">
                                <select name="status">
                                    {statuses.map((status) => (
                                        <option value={status} selected={status === task.status}>{status}</option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="btn">Update</button>

                            <img src={task.photo} alt="Task Photo" />

                            <button type="submit" className="btn">Delete</button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default TaskList;