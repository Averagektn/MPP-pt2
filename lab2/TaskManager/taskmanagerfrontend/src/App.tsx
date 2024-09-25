import { useEffect, useRef, useState } from 'react'
import '../public/stylesheets/main.css'
import React from 'react'

const TaskList = () => {
    const [taskName, setTaskName] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [file, setFile] = useState(null);
    const [tasks, setTasks] = useState([]); 
    const statuses = ['Pending', 'Rejected', 'Accepted'];
    const fileInputRef = useRef(null);
    const selectFilterRef = useRef(null);
    const [currentPage, setCurrentPage] = useState(0);
    const defLimit = 8;

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch(`http://localhost:1337/tasks?limit=${defLimit}&startWith=0`);
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

            const res = await taskResponse.json();

            if (taskResponse.ok) {
                if (tasks.length < defLimit) {
                    setTasks((prevTasks) => [...prevTasks, res]);
                }
                setTaskName('');
                setTaskDescription('');
                setFile(null); 
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                console.log('Task added');
            } else {
                console.error('Task add error:', taskResponse.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async (taskId, index) => {
        try {
            const response = await fetch(`http://localhost:1337/tasks/${taskId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                const status = selectFilterRef.current.value;
                const response = await fetch(`http://localhost:1337/tasks/filter?status=${status}&limit=${defLimit}&startWith=${currentPage}`, {
                    method: 'GET'
                });

                if (response.ok) {
                    const newTasks = await response.json();
                    if (newTasks.length > 0) {
                        setCurrentPage(currentPage);
                        setTasks(newTasks);
                    }
                } else {
                    console.error('Get error', response.statusText);
                }
            } else {
                console.error('Delete error', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const handleUpdate = async (taskId, date, status) => {
        try {
            const response = await fetch(`http://localhost:1337/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ date, status }), 
            });

            if (response.ok) {
                const updatedTask = await response.json();
                setTasks((prevTasks) =>
                    prevTasks.map((task) =>
                        task.id === taskId ? updatedTask : task
                    )
                );
            } else {
                console.error('Update error', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleFilter = async () => {
        try {
            const status = selectFilterRef.current.value;
            const response = await fetch(`http://localhost:1337/tasks/filter?status=${status}&limit=${defLimit}&startWith=${currentPage}`, {
                method: 'GET'
            });

            if (response.ok) {
                const newTasks = await response.json();
                setTasks(newTasks);
            } else {
                console.error('Update error', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleNext = async () => {
        try {
            const status = selectFilterRef.current.value;
            const response = await fetch(`http://localhost:1337/tasks/filter?status=${status}&limit=${defLimit}&startWith=${currentPage + 1}`, {
                method: 'GET'
            });

            if (response.ok) {
                const newTasks = await response.json();
                if (newTasks.length > 0) {
                    setCurrentPage(currentPage + 1);
                    setTasks(newTasks);
                }
            } else {
                console.error('Get error', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const handlePrev = async () => {
        try {
            const status = selectFilterRef.current.value;
            const response = await fetch(`http://localhost:1337/tasks/filter?status=${status}&limit=${defLimit}&startWith=${currentPage - 1}`, {
                method: 'GET'
            });

            if (response.ok) {
                const newTasks = await response.json();
                if (newTasks.length > 0) {
                    setCurrentPage(currentPage - 1);
                    setTasks(newTasks);
                }
            } else {
                console.error('Get error', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const handleStatusChange = (taskId, event) => {
        const newTasks = [...tasks];
        newTasks[taskId] = {
            ...newTasks[taskId],
            status: event.target.value,
        };
        setTasks(newTasks);
    };

    const handleDateChange = (taskId, event) => {
        const newTasks = [...tasks];
        newTasks[taskId] = {
            ...newTasks[taskId],
            date: event.target.value,
        };
        setTasks(newTasks);
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
                            ref={fileInputRef}
                            required
                        />
                        <button type="submit" className="btn">Add Task</button>
                    </form>
                </div>

                <div className="row">
                    <div className="box">
                        <select name="status" ref={selectFilterRef}>
                            <option value="None">None</option>
                            {statuses.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            className="btn"
                            onClick={handleFilter}
                        >
                            Filter
                        </button>
                    </div>
                </div>

                <div className="row" style={{ textAlign: 'center' }}>
                    {tasks.map((task, index) => (
                        <div className="col" key={task.id}>
                            <strong>{task.name}</strong>
                            <br />
                            {task.description}
                            <br />

                            <input
                                type="date"
                                name="date"
                                value={task.date || ''} 
                                onChange={(event) => handleDateChange(index, event)}
                            />
                            <div className="box">
                                <select
                                    name="status"
                                    value={task.status} 
                                    onChange={(event) => handleStatusChange(index, event)}
                                >
                                    {statuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="button"
                                className="btn"
                                onClick={() => {
                                    handleUpdate(task.id, task.date, task.status);
                                }}
                            >
                                Update
                            </button>

                            <img src={task.photo} alt="Task Photo" />

                            <button
                                type="submit"
                                className="btn"
                                onClick={() => {
                                    handleDelete(task.id, index);
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
                <button
                    type="submit"
                    className="btn"
                    id="prevButton"
                    onClick={handlePrev}
                >
                    Prev
                </button>
                <button
                    type="submit"
                    className="btn"
                    id="nextButton"
                    onClick={handleNext}
                >
                    Next
                </button>
            </section>
        </div>
    );
};

export default TaskList;