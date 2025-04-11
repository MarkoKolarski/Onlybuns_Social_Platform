import React, { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../axiosInstance';
import '../styles/RegisteredUsers.css';

const RegisteredUsers = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [searchParams, setSearchParams] = useState({
        first_name: '',
        last_name: '',
        email: '',
        min_post_count: '',
        max_post_count: '',
        sort_by: '',
        sort_order: 'asc'
    });

    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1); // Track the current page
    const [pageCount, setPageCount] = useState(0); // Total number of pages

    const handleChange = (e) => {
        const { name, value } = e.target;

        if ((name === 'min_post_count' || name === 'max_post_count') && value < 0) {
            return;
        }

        setSearchParams((prevParams) => ({
            ...prevParams,
            [name]: value === '' ? undefined : value,
        }));
    };

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/admin/registered-users/', {
                params: {
                    ...searchParams,
                    page: currentPage, // Pass the current page as a query parameter
                    min_post_count: searchParams.min_post_count ? Number(searchParams.min_post_count) : undefined,
                    max_post_count: searchParams.max_post_count ? Number(searchParams.max_post_count) : undefined,
                },
            });
            setUsers(response.data.results); // Update the user list with paginated results
            setPageCount(Math.ceil(response.data.count / 5)); // Calculate the total number of pages
        } catch (error) {
            setError('Failed to load users.');
        } finally {
            setLoading(false);
        }
    }, [searchParams, currentPage]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSort = (sortBy) => {
        setSearchParams((prevParams) => ({
            ...prevParams,
            sort_by: sortBy,
            sort_order: prevParams.sort_order === 'asc' ? 'desc' : 'asc',
        }));
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage); // Update the current page
    };

    return (
        <div className="registered-users-container">
            <h2>Registered Users</h2>

            <div className="search-form">
                <input type="text" name="first_name" placeholder="First Name" value={searchParams.first_name} onChange={handleChange} />
                <input type="text" name="last_name" placeholder="Last Name" value={searchParams.last_name} onChange={handleChange} />
                <input type="email" name="email" placeholder="Email" value={searchParams.email} onChange={handleChange} />
                <input type="number" name="min_post_count" placeholder="Min Post Count" value={searchParams.min_post_count} onChange={handleChange} />
                <input type="number" name="max_post_count" placeholder="Max Post Count" value={searchParams.max_post_count} onChange={handleChange} />
                <button onClick={fetchUsers}>Search</button>
            </div>

            <div className="sort-buttons">
                <button onClick={() => handleSort('email')}>Sort by Email ↕</button>
                <button onClick={() => handleSort('follower_count')}>Sort by Follower Count ↕</button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p className="error-message">{error}</p>}

            <table>
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Post Count</th>
                        <th>Follower Count</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr key={index}>
                            <td>{user.first_name}</td>
                            <td>{user.last_name}</td>
                            <td>{user.email}</td>
                            <td>{user.post_count}</td>
                            <td>{user.follower_count}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination">
                {Array.from({ length: pageCount }, (_, index) => (
                    <button
                        key={index}
                        className={currentPage === index + 1 ? 'active' : ''}
                        onClick={() => handlePageChange(index + 1)}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default RegisteredUsers;
