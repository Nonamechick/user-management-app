import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Button, Table, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { useTable, useSortBy } from '@tanstack/react-table';
import ReactTooltip from 'react-tooltip';

function UserTable({ token, setToken }) {
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/.netlify/functions/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        setToken(null);
        toast.error('Session expired, please log in again');
      } else {
        toast.error('Failed to fetch users');
      }
    }
  };

  const handleAction = async (action) => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one user');
      return;
    }
    try {
      await axios.post(`/.netlify/functions/users/${action}`, { ids: selectedIds }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
      toast.success(`Users ${action === 'block' ? 'blocked' : action === 'unblock' ? 'unblocked' : 'deleted'}`);
      setSelectedIds([]);
    } catch (error) {
      toast.error(`Failed to ${action} users`);
    }
  };

  const columns = React.useMemo(
    () => [
      {
        id: 'selection',
        Header: () => (
          <input
            type="checkbox"
            checked={selectedIds.length === users.length}
            onChange={(e) => setSelectedIds(e.target.checked ? users.map(u => u.id) : [])}
          />
        ),
        Cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedIds.includes(row.original.id)}
            onChange={(e) => {
              setSelectedIds(e.target.checked ? [...selectedIds, row.original.id] : selectedIds.filter(id => id !== row.original.id));
            }}
          />
        ),
      },
      { Header: 'Name', accessor: 'name' },
      { Header: 'Email', accessor: 'email' },
      {
        Header: 'Last seen',
        accessor: 'last_login',
        Cell: ({ value }) => value ? new Date(value).toLocaleString() : 'Never',
      },
    ],
    [selectedIds, users]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data: users }, useSortBy);

  return (
    <div>
      <div className="mb-3 d-flex justify-content-between">
        <div>
          <OverlayTrigger placement="top" overlay={<Tooltip>Block selected users</Tooltip>}>
            <Button variant="outline-primary" onClick={() => handleAction('block')} className="me-2">Block</Button>
          </OverlayTrigger>
          <OverlayTrigger placement="top" overlay={<Tooltip>Unblock selected users</Tooltip>}>
            <Button variant="outline-secondary" onClick={() => handleAction('unblock')} className="me-2"><i className="bi bi-unlock"></i></Button>
          </OverlayTrigger>
          <OverlayTrigger placement="top" overlay={<Tooltip>Delete selected users</Tooltip>}>
            <Button variant="outline-danger" onClick={() => handleAction('delete')}><i className="bi bi-trash"></i></Button>
          </OverlayTrigger>
        </div>
        <input type="text" className="form-control w-25" placeholder="Filter" />
      </div>
      <Table {...getTableProps()} striped bordered hover>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render('Header')}
                  <span>{column.isSorted ? (column.isSortedDesc ? ' ↓' : ' ↑') : ''}</span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()} className="align-middle">
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </Table>
      <ReactTooltip />
    </div>
  );
}

export default UserTable;