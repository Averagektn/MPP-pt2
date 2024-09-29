import { useEffect, useRef, useState } from 'react'
import '../stylesheets/main.css'
import React from 'react'
import Task from '../model/Task'
import AuthModal from './Auth';
import AddTask from './AddTask';
import { io } from 'socket.io-client';
import WsResponse from '../model/WsResponse';
import WsRequest from '../model/WsRequest';

const TaskList: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]); 
    const [currentPage, setCurrentPage] = useState(0);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isValidAccessToken, setIsValidAccessToken] = useState(true);
    const [deleteTask, setDeleteTask] = useState<string>('');
    const [updateTask, setUpdateTask] = useState<Task | null>(null);
    const [accessToken, setAccessToken] = useState<string>('');

    const selectFilterRef = useRef<HTMLSelectElement | null>(null);

    const socket = io('http://localhost:1337');
    socket.on('users/access', (response: WsResponse) => {
        if (response.status >= 200 && response.status < 300) {
            setAccessToken(response.data.accessToken);
            setIsValidAccessToken(true);
        } else {
            setIsAuthModalOpen(true);
        }
    });

    socket.on('tasks/filter', (response: WsResponse) => {
        if (response.status >= 200 && response.status < 300) {
            console.log(response.data);
            const newTasks = JSON.parse(response.data);
            //if (newTasks.length > 0) {
                setCurrentPage(currentPage);
                setTasks(newTasks);
            //}
        } else if (response.status === 401) {
            setIsValidAccessToken(false);
        } else {
            console.error('Get error', response.message);
        }
    })

    const statuses = ['Pending', 'Rejected', 'Accepted'];
    const defLimit = 8;

    useEffect(() => {
        const fetchTasks = async (): Promise<void> => {
            try {
                const status = selectFilterRef.current?.value;
                await loadFilteredTasks(status!, currentPage, defLimit);
            } catch (error) {
                console.error('Error:', error);
            }
        };

        if (isValidAccessToken) {
            fetchTasks();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isValidAccessToken, currentPage]);

    useEffect(() => {
        const executeDelete = async () => {
            if (deleteTask !== '') {
                await handleDelete(deleteTask);
                setDeleteTask('');
            }
        };

        const executeUpdate = async () => {
            if (updateTask !== null) {
                await handleUpdate(updateTask!.id!, updateTask?.date ?? '', updateTask?.status ?? 'Pending');
                setUpdateTask(null);
            }
        };

        const getNewToken = () => {
            const refreshToken = localStorage.getItem('refreshJwt') ?? '';
            socket.emit('users/access', JSON.stringify(new WsRequest(null, '', refreshToken)));
        };

        if (isValidAccessToken) {
            executeDelete();
            executeUpdate();
        } else {
            getNewToken();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isValidAccessToken]);

    const loadFilteredTasks = async (status: string, currentPage: number, limit: number): Promise<void> => {
        socket.emit('tasks/filter', JSON.stringify(new WsRequest({ status, limit, startWith: currentPage }, accessToken, '')));
    }

    const handleDelete = async (taskId: string): Promise<void> => {
        if (!isValidAccessToken) {
            setDeleteTask(taskId);
        }

        try {
            const response = await fetch(`http://localhost:1337/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': accessToken
                }
            });

            if (response.ok) {
                const status = selectFilterRef.current?.value;
                await loadFilteredTasks(status!, currentPage, defLimit);
            } else if (response.status === 401) {
                setIsValidAccessToken(false);
            } else {
                console.error('Delete error', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleUpdate = async (taskId: string, date: string, status: string): Promise<void> => {
        if (!isValidAccessToken) {
            setUpdateTask(new Task('', '', status, taskId, date, null));
        }

        try {
            const response = await fetch(`http://localhost:1337/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': accessToken
                },
                body: JSON.stringify({ date, status })
            });

            if (response.ok) {
                const updatedTask = await response.json();
                setTasks((prevTasks) =>
                    prevTasks.map((task) =>
                        task.id === taskId ? updatedTask : task
                    )
                );
                alert('Updated');
            } else if (response.status === 401) {
                setIsValidAccessToken(false);
            } else {
                console.error('Update error', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleLast = async (): Promise<void> => {
        try {
            const response = await fetch(`http://localhost:1337/tasks/pages?limit=${defLimit}`, {
                method: 'GET',
                headers: {
                    'Authorization': accessToken
                }
            });

            if (response.ok) {
                const { pages } = await response.json();
                setCurrentPage(pages - 1);
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

    const handleTaskCreated = (newTask: Task) => {
        if (tasks.length < defLimit) {
            setTasks((prevTasks) => [...prevTasks, newTask]);
        }
    };

    return (
        <div className="container">
            <h1>Task List</h1>
            <hr />
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={(token) => {
                    setIsAuthModalOpen(false);
                    setIsValidAccessToken(true);
                    setAccessToken(token);
                }} />
            <section>
                <AddTask accessToken={accessToken} onTaskCreated={handleTaskCreated} />

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

                            <img src={task.photo ?? 'ERROR'} alt="Task Photo" width="200" />

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
                    <button type="submit" className="btn" id="prevButton" onClick={() => setCurrentPage(0)}>
                        First
                    </button>

                    <button type="submit" className="btn" id="prevButton" onClick={() => setCurrentPage(currentPage - 1)}>
                        Prev
                    </button>

                    <button type="submit" className="btn" id="nextButton" onClick={() => setCurrentPage(currentPage + 1)}>
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