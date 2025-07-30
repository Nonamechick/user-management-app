import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Button, Table, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { useReactTable, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';
import { Tooltip as ReactTooltip } from 'react-tooltip';

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
        header: () => (
          <input
            type="checkbox"
            checked={selectedIds.length === users.length}
            onChange={(e) => setSelectedIds(e.target.checked ? users.map(u => u.id) : [])}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedIds.includes(row.original.id)}
            onChange={(e) => {
              setSelectedIds(e.target.checked ? [...selectedIds, row.original.id] : selectedIds.filter(id => id !== row.original.id));
            }}
          />
        ),
      },
      { header: 'Name', accessorKey: 'name' },
      { header: 'Email', accessorKey: 'email' },
      {
        header: 'Last seen',
        accessorKey: 'last_login',
        cell: ({ getValue }) => getValue() ? new Date(getValue()).toLocaleString() : 'Never',
      },
    ],
    [selectedIds, users]
  );

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting: [],
    },
  });

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
      <Table striped bordered hover>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th key={column.id} {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.columnDef.header}
                  <span>{column.getIsSorted() ? (column.getIsSorted() === 'desc' ? ' ↓' : ' ↑') : ''}</span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} {...row.getRowProps()}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} {...cell.getCellProps()} className="align-middle">
                  {cell.renderCell ? cell.renderCell() : cell.renderValue()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
      <ReactTooltip />
    </div>
  );
}

export default UserTable;