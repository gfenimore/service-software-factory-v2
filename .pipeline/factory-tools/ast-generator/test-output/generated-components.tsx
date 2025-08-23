import React, { useState, useEffect } from 'react';

export enum AccountType {
  Residential = 'Residential',
  Commercial = 'Commercial',
  Industrial = 'Industrial',
  Other = 'Other',
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  status: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AccountListProps {
  accounts: Account[];
  onSelect: (account: Account) => void;
}

export const AccountList = (props: AccountListProps) => {
  const [filter, setFilter] = useState('');
  const [selectedType, setSelectedType] = useState(null);

  useEffect(() => {
    console.log("AccountList mounted");
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };
  const handleTypeFilter = (type: AccountType) => {
    setSelectedType(type);
  };

  return (
    <div className="account-list">
      <h2>
        Account List
      </h2>
      <div className="filters">
        <input type="text" placeholder="Filter accounts..." onChange="handleFilterChange" />
      </div>
      <div className="account-items">
        {/* Account items */}
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
            Name
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
          Account Name
        </label>
        <input type="text" name="name" value="name" />
      </div>
      <div className="form-field">
        <label>
          Account Type
        </label>
        <input type="text" name="type" value="type" />
      </div>
      <div className="form-field">
        <label>
          Email Address
        </label>
        <input type="text" name="email" value="email" />
      </div>
      <div className="form-field">
        <label>
          Phone Number
        </label>
        <input type="text" name="phone" value="phone" />
      </div>
      <div className="form-field">
        <label>
          Address
        </label>
        <input type="text" name="address" value="address" />
      </div>
      <button type="submit">
        Submit
      </button>
    </form>
  );
};

interface ServiceSchedulerProps {
  account: any;
  services: Service[];
}

export const ServiceScheduler = (props: ServiceSchedulerProps) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  const handleSchedule = (service, date) => {
    // Handler implementation
  };

  return (
    <div>
      ServiceScheduler Component
    </div>
  );
};
