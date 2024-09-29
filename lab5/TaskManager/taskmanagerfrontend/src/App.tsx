import { useEffect, useRef, useState } from 'react'
import '../stylesheets/main.css'
import React from 'react'
import Task from '../model/Task'
import AuthModal from './Auth';
import AddTask from './AddTask';
import { io } from 'socket.io-client';
import WsResponse from '../model/WsResponse';
import WsRequest from '../model/WsRequest';
import { createClient } from 'graphql-ws';

const TaskList: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]); 
    const [currentPage, setCurrentPage] = useState(0);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isValidAccessToken, setIsValidAccessToken] = useState(false);
    const [deleteTask, setDeleteTask] = useState<string>('');
    const [updateTask, setUpdateTask] = useState<Task | null>(null);
    const [accessToken, setAccessToken] = useState<string>('');

    const selectFilterRef = useRef<HTMLSelectElement | null>(null);

    const statuses = ['Pending', 'Rejected', 'Accepted'];
    const defLimit = 8;

    //const socket = io('http://localhost:1337');
    const client = createClient({
        url: 'ws://localhost:1337/graphql',
    });
/*    socket.on('users/access', (res) => {
        const data: WsResponse = JSON.parse(res);

        if (data.status >= 200 && data.status < 300) {
            setAccessToken(data.data.accessToken);
            setIsValidAccessToken(true);
        } else {
            setIsAuthModalOpen(true);
        }
    });
    socket.on('tasks/pages', (res) => {
        const data: WsResponse = JSON.parse(res);

        if (data.status >= 200 && data.status < 300) {
            setCurrentPage(data.data - 1);
        } 
    });
    socket.on('tasks/filter', (res) => {
        const data: WsResponse = JSON.parse(res);

        if (data.status >= 200 && data.status < 300) {
            const newTasks = data.data.tasks;
            setCurrentPage(data.data.page);
            setTasks(newTasks);
        } else if (data.status === 401) {
            setIsValidAccessToken(false);
        } else if (data.status === 404 && currentPage === 0) {
            setTasks([]);
        }
    });*/

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

        const getNewToken = async () => {
            const query = client.iterate({
                query: '{ hello }',
            });

            const { value } = await query.next();
            console.log('value: ', value);

            const subscription = client.iterate({
                query: 'subscription { greetings }',
            });

            for await (const event of subscription) {
                console.log(event);
            }

            const refreshToken = localStorage.getItem('refreshJwt') ?? '';
            //socket.emit('users/access', JSON.stringify(new WsRequest(null, '', refreshToken)));
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
        //socket.emit('tasks/filter', JSON.stringify(new WsRequest({ status, limit, startWith: currentPage }, accessToken, '')));
    }

    const handleDelete = async (taskId: string): Promise<void> => {
        if (!isValidAccessToken) {
            setDeleteTask(taskId);
        } else {
            const status = selectFilterRef.current?.value;
            //socket.emit('tasks/delete', JSON.stringify(new WsRequest({ taskId, status, startWith: currentPage, limit: defLimit }, accessToken, '')));
        }
    };

    const handleUpdate = async (taskId: string, date: string, status: string): Promise<void> => {
        if (!isValidAccessToken) {
            setUpdateTask(new Task('', '', status, taskId, date, null));
        } else {
            const filterStatus = selectFilterRef.current?.value;
            const task = new Task('', '', status, taskId, date, '');
            //socket.emit('tasks/update', JSON.stringify(new WsRequest({ task, startWith: currentPage, limit: defLimit, status: filterStatus }, accessToken, '')));
        }
    };

    const handleLast = async (): Promise<void> => {
        //socket.emit('tasks/pages', JSON.stringify(new WsRequest({ limit: defLimit }, accessToken, '')));
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
{/*            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={(token) => {
                    setIsAuthModalOpen(false);
                    setIsValidAccessToken(true);
                    setAccessToken(token);
                }} />*/}
            <section>
                {/*<AddTask accessToken={accessToken} onTaskCreated={handleTaskCreated} />*/}

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

                    <button type="submit" className="btn" id="prevButton" onClick={async () => {
                        const status = selectFilterRef.current?.value;
                        await loadFilteredTasks(status!, currentPage - 1, defLimit)
                    }}>
                        Prev
                    </button>

                    <button type="submit" className="btn" id="nextButton" onClick={async () => {
                        const status = selectFilterRef.current?.value;
                        await loadFilteredTasks(status!, currentPage + 1, defLimit)
                    }}>
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