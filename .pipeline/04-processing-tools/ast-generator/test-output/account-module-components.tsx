import React, { useState, useEffect, useMemo } from 'react';

export enum AccountType {
  Residential = 'Residential',
  Commercial = 'Commercial',
  Industrial = 'Industrial',
  Other = 'Other',
}

export enum AccountStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Suspended = 'Suspended',
  Pending = 'Pending',
}

export interface Account {
  id: string;
  name: string;
  type: string;
  status: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AccountListViewProps {
  items: Account[];
  onSelect?: (item: Account) => void;
  loading?: boolean;
}

export const AccountListView = (props: AccountListViewProps) => {
  const [filter, setFilter] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const handleFilter = (value: string) => {
    setFilter(value);
  };
  const handleSelect = (item: Account) => {
    setSelectedItem(item);
    props.onSelect?.(item);
  };

  return (
    <div className="list-view">
      <div className="list-header">
        <h2>
          Account List
        </h2>
        <input type="text" placeholder="Search..." onChange="(e) => handleFilter(e.target.value)" />
      </div>
      <div className="list-items">
        {props.items.map(item => (
          <div key={item.id} onClick={() => handleSelect(item)}>
            {item.name || item.id}
          </div>
        ))}
      </div>
    </div>
  );
};

interface AccountTableProps {
  data: Account[];
  onEdit?: (item: Account) => void;
  onDelete?: (id: string) => void;
}

export const AccountTable = (props: AccountTableProps) => {
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSort = (field) => {
    setSortBy(field);
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th onClick="() => handleSort('id')">
            ID
          </th>
          <th onClick="() => handleSort('name')">
            Account Name
          </th>
          <th onClick="() => handleSort('type')">
            Type
          </th>
          <th onClick="() => handleSort('status')">
            Status
          </th>
          <th onClick="() => handleSort('email')">
            Email
          </th>
        </tr>
      </thead>
      <tbody>
        {/* Table rows */}
      </tbody>
    </table>
  );
};

interface AccountFormProps {
  onSubmit: (data: Account) => void;
  initialData?: Account;
}

export const AccountForm = (props: AccountFormProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Initialize form with data
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate and submit
  };

  return (
    <form onSubmit="handleSubmit">
      <div className="form-field">
        <label>
          name
        </label>
        <input type="text" name="name" value="name" />
      </div>
      <div className="form-field">
        <label>
          type
        </label>
        <input type="text" name="type" value="type" />
      </div>
      <div className="form-field">
        <label>
          status
        </label>
        <input type="text" name="status" value="status" />
      </div>
      <div className="form-field">
        <label>
          email
        </label>
        <input type="text" name="email" value="email" />
      </div>
      <div className="form-field">
        <label>
          phone
        </label>
        <input type="text" name="phone" value="phone" />
      </div>
      <div className="form-field">
        <label>
          address
        </label>
        <input type="text" name="address" value="address" />
      </div>
      <button type="submit">
        Submit
      </button>
    </form>
  );
};

interface AccountDetailProps {
  item: Account;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const AccountDetail = (props: AccountDetailProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    props.onEdit?.();
  };

  return (
    <div className="detail-view">
      <h2>
        Account Details
      </h2>
      <div className="detail-content">
        {/* Detail fields */}
      </div>
      <div className="actions">
        <button onClick="handleEdit">
          Edit
        </button>
      </div>
    </div>
  );
};
