import { useEffect, useRef, useState } from 'react'
import '../stylesheets/main.css'
import React from 'react'
import Task from '../model/Task'
import AuthModal from './Auth';
import AddTask from './AddTask';
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
            const client = createClient({
                url: 'ws://localhost:1337/graphql',
            });
            const refreshToken = localStorage.getItem('refreshJwt') ?? '';
            const query = client.iterate({
                query: `query GetAccessToken($refreshToken: String!) {
                    getAccessToken(refreshToken: $refreshToken) {
                        accessToken
                    }
                }`,
                variables: { refreshToken },
            });

            const { value } = await query.next();

            console.log(value);

            if (value.errors) {
                setIsAuthModalOpen(true);
            } else {
                setAccessToken(value.data.getAccessToken.accessToken);
                setIsValidAccessToken(true);
            }
            client.dispose();
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
        const client = createClient({
            url: 'ws://localhost:1337/graphql',
        });

        const query = client.iterate({
            query: `query GetTasks($limit: Int, $startWith: Int, $status: String, $accessToken: String) {
              tasksFilter(limit: $limit, startWith: $startWith, status: $status, accessToken: $accessToken) {
                tasks {
                  id
                  name
                  description
                  date
                  status
                  photo
                }
                page
              }
            }`,
            variables: { limit, startWith: currentPage, status, accessToken },
        });

        const { value } = await query.next();

        console.log(value);

        if (value.errors) {
            const message = value.errors[0].message
            if (message === '401') {
                setIsValidAccessToken(false);
            } else if (message === '404') {
                if (currentPage !== 0) {
                    setCurrentPage(currentPage - 1);
                }
                setTasks([]);
            }
        } else {
            const newTasks = value.data.tasksFilter.tasks;
            setCurrentPage(value.data.tasksFilter.page);
            setTasks(newTasks);
        }

        client.dispose();
    }

    const handleDelete = async (taskId: string): Promise<void> => {
        if (!isValidAccessToken) {
            setDeleteTask(taskId);
        } else {
            const status = selectFilterRef.current?.value;

            const client = createClient({
                url: 'ws://localhost:1337/graphql',
            });

            const query = client.iterate({
                query: `mutation RemoveTask($taskId: String!, $accessToken: String!) {
                            removeTask(taskId: $taskId, accessToken: $accessToken)
                        }`,
                variables: { taskId, accessToken },
            });

            const { value } = await query.next();

            console.log(value);

            if (value.errors) {
                const message = value.errors[0].message
                if (message === '401') {
                    setIsValidAccessToken(false);
                    setDeleteTask(taskId);
                } 
            } else {
                await loadFilteredTasks(status!, currentPage, defLimit);
            }

            client.dispose();
        }
    };

    const handleUpdate = async (taskId: string, date: string, status: string): Promise<void> => {
        if (!isValidAccessToken) {
            setUpdateTask(new Task('', '', status, taskId, date, null));
        } else {
            const task = new Task('', '', status, taskId, date, '')

            const client = createClient({
                url: 'ws://localhost:1337/graphql',
            });

            const query = client.iterate({
                query: `mutation UpdateTask($task: TaskInput!, $accessToken: String!) {
                            updateTask(task: $task, accessToken: $accessToken) {
                                id
                            }
                        }`,
                variables: { task, accessToken },
            });

            const { value } = await query.next();
            console.log(value);

            if (value.errors) {
                const message = value.errors[0].message
                if (message === '401') {
                    setIsValidAccessToken(false);
                    setUpdateTask(task);
                }
            } else {
                alert('Updated');
                const selectedStatus = selectFilterRef.current?.value;
                await loadFilteredTasks(selectedStatus!, currentPage, defLimit);
            }

            client.dispose();
        }
    };

    const handleLast = async (): Promise<void> => {
        if (isValidAccessToken) {
            const client = createClient({
                url: 'ws://localhost:1337/graphql',
            });

            const query = client.iterate({
                query: `query GetPageCount($limit: Int!, $accessToken: String!) {
                            getPageCount(limit: $limit, accessToken: $accessToken)
                        }`,
                variables: { limit: defLimit, accessToken },
            });

            try {
                const { value } = await query.next();
                console.log(value);

                if (value.errors) {
                    const message = value.errors[0].message
                    if (message === '401') {
                        setIsValidAccessToken(false);
                    }
                } else {
                    const status = selectFilterRef.current?.value;
                    await loadFilteredTasks(status!, value.data.getPageCount - 1, defLimit);
                }

                client.dispose();
            } catch (err) {
                console.log(err);
            }
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