import { ChangeEvent, useEffect, useRef, useState } from 'react'
import '../public/stylesheets/main.css'
import React from 'react'
import Task from '../model/Task'

const TaskList: React.FC = () => {
    const [taskName, setTaskName] = useState<string>('');
    const [taskDescription, setTaskDescription] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]); 
    const [currentPage, setCurrentPage] = useState(0);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const selectFilterRef = useRef<HTMLSelectElement | null>(null);

    const statuses = ['Pending', 'Rejected', 'Accepted'];
    const defLimit = 8;

    useEffect(() => {
        const fetchTasks = async (): Promise<void> => {
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

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const selectedFile = event.target.files?.[0] || null;
        setFile(selectedFile);
    };

    const handleCreateTask = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();

        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:1337/tasks/photo', {
                method: 'POST',
                body: formData,
            });
            const { photo } = await response.json();
            const taskData = new Task(taskName, taskDescription, null, null, null, photo);

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
            } else {
                console.error('Task add error:', taskResponse.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async (taskId: string): Promise<void> => {
        try {
            const response = await fetch(`http://localhost:1337/tasks/${taskId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                const status = selectFilterRef.current?.value;
                await loadFilteredTasks(status!, currentPage, defLimit, true);
            } else {
                console.error('Delete error', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const handleUpdate = async (taskId: string, date: string, status: string): Promise<void> => {
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

    const handleNext = async (): Promise<void> => {
        try {
            const status = selectFilterRef.current?.value;
            await loadFilteredTasks(status!, currentPage + 1, defLimit);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const loadFilteredTasks = async (status: string, currentPage: number, limit: number, loadEmptyArray = false): Promise<void> => {
        const response = await fetch(`http://localhost:1337/tasks/filter?status=${status}&limit=${limit}&startWith=${currentPage}`, {
             method: 'GET'
         });

         if (response.ok) {
             const newTasks = await response.json();
             if (newTasks.length > 0 || loadEmptyArray) {
                 setCurrentPage(currentPage);
                 setTasks(newTasks);
             }
         } else {
             console.error('Get error', response.statusText);
         }
    }

    const handleFirst = async (): Promise<void> => {
        try {
            const status = selectFilterRef.current?.value;
            await loadFilteredTasks(status!, 0, defLimit);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const handlePrev = async (): Promise<void> => {
        try {
            const status = selectFilterRef.current?.value;
            await loadFilteredTasks(status!, currentPage - 1, defLimit);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const handleLast = async (): Promise<void> => {
        try {
            const response = await fetch(`http://localhost:1337/tasks/pages?limit=${defLimit}`, {
                method: 'GET'
            });

            if (response.ok) {
                const status = selectFilterRef.current?.value;
                const { pages } = await response.json();
                await loadFilteredTasks(status!, pages - 1, defLimit)
            } else {
                console.error('Get error', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const handleStatusChange = (taskId: string, event: React.ChangeEvent<HTMLSelectElement>) => {
        const newTasks = [...tasks];
        const selectedStatus = event.target.value;

        const taskIndex = newTasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            newTasks[taskIndex] = {
                ...newTasks[taskIndex],
                status: selectedStatus,
            };
            setTasks(newTasks);
        }
    };

    const handleDateChange = (taskId: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const newTasks = [...tasks];
        const selectedDate = event.target.value;

        const taskIndex = newTasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            newTasks[taskIndex] = {
                ...newTasks[taskIndex],
                date: selectedDate,
            };
            setTasks(newTasks);
        }
    };

    const onChangeFilterStatus = async (): Promise<void> => {
        try {
            const status = selectFilterRef.current?.value; 
            if (status) {
                await loadFilteredTasks(status, currentPage, defLimit);
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
                            ref={fileInputRef}
                            required
                        />
                        <button type="submit" className="btn">Add Task</button>
                    </form>
                </div>

                <div className="row">
                    <strong>Filter by</strong>
                    <div className="box">
                        <select name="status" ref={selectFilterRef} onChange={onChangeFilterStatus}>
                            <option value="None">None</option>
                                {statuses.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                        </select>
                    </div>
                </div>

                <div className="row" style={{ textAlign: 'center' }}>
                    {tasks.map((task) => (
                        <div className="col" key={task.id}>
                            <strong>{task.name}</strong>
                            <br />
                            {task.description}
                            <br />

                            <input
                                type="date"
                                name="date"
                                value={task.date ?? ''} 
                                onChange={(event) => handleDateChange(task.id!, event)}/>
                            <div className="box">
                                <select
                                    name="status"
                                    value={task.status ?? ''}
                                    onChange={(event) => handleStatusChange(task.id!, event)}>
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
                                    handleUpdate(task.id!, task.date!, task.status!);
                                }}>
                                Update
                            </button>

                            <img src={task.photo ?? 'ERROR'} alt="Task Photo" />

                            <button
                                type="submit"
                                className="btn"
                                onClick={() => {
                                    handleDelete(task.id!);
                                }}>
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
                <div className="row" style={{ textAlign: 'center' }}>
                    <button type="submit" className="btn" id="prevButton" onClick={handleFirst}>
                        First
                    </button>

                    <button type="submit" className="btn" id="prevButton" onClick={handlePrev}>
                        Prev
                    </button>

                    <button type="submit" className="btn" id="nextButton" onClick={handleNext}>
                        Next
                    </button>

                    <button type="submit" className="btn" id="prevButton" onClick={handleLast}>
                        Last
                    </button>
                </div>
            </section>
        </div>
    );
};

export default TaskList;