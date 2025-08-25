/* eslint-disable */
// @ts-nocheck
/**
 * AccountListView Component
 * Generated with Default Theme Theme
 * 2025-08-22T21:53:01.930Z
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Account, AccountListProps } from '../types/AccountListTypes';
import { mockAccountData } from '../data/AccountListMockData';

export const AccountListView: React.FC<AccountListProps> = ({ 
    initialData,
    onRowClick,
    className = ''
}) => {
    // State management
    const [data, setData] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortField, setSortField] = useState<keyof Account | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [filterText, setFilterText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Load data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            // Simulate API call
            setTimeout(() => {
                setData(initialData || mockAccountData);
                setLoading(false);
            }, 500);
        };
        loadData();
    }, [initialData]);

    // Sorting logic
    const handleSort = (field: keyof Account) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Filtering logic
    const filteredData = useMemo(() => {
        if (!filterText) return data;
        
        return data.filter(row => {
            return Object.values(row).some(value => 
                String(value).toLowerCase().includes(filterText.toLowerCase())
            );
        });
    }, [data, filterText]);

    // Sorting application
    const sortedData = useMemo(() => {
        if (!sortField) return filteredData;
        
        return [...filteredData].sort((a, b) => {
            const aVal = a[sortField];
            const bVal = b[sortField];
            
            if (aVal === null || aVal === undefined) return 1;
            if (bVal === null || bVal === undefined) return -1;
            
            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortField, sortDirection]);

    // Pagination
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        return sortedData.slice(start, end);
    }, [sortedData, currentPage, pageSize]);

    const totalPages = Math.ceil(sortedData.length / pageSize);

    // Loading state with themed spinner
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className={` ${className}`}>
            {/* Header with themed typography */}
            <div className="flex justify-between items-center">
                <h2 className="">
                    Account Management
                </h2>
                <div className="">
                    {sortedData.length} records
                </div>
            </div>

            {/* Filter with themed input */}
            <div className="flex gap-4">
                <input
                    type="text"
                    placeholder="Search..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {/* Table with themed styles */}
            <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                            <th 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('accountName' as keyof Account)}
                            >
                                <div className="flex items-center gap-1">
                                    Account Name
                                    {sortField === 'accountName' && (
                                        <span className="text-blue-600">
                                            {sortDirection === 'asc' ? '↑' : '↓'}
                                        </span>
                                    )}
                                </div>
                            </th>
                            <th 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('status' as keyof Account)}
                            >
                                <div className="flex items-center gap-1">
                                    Status
                                    {sortField === 'status' && (
                                        <span className="text-blue-600">
                                            {sortDirection === 'asc' ? '↑' : '↓'}
                                        </span>
                                    )}
                                </div>
                            </th>
                            <th 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('balance' as keyof Account)}
                            >
                                <div className="flex items-center gap-1">
                                    Balance
                                    {sortField === 'balance' && (
                                        <span className="text-blue-600">
                                            {sortDirection === 'asc' ? '↑' : '↓'}
                                        </span>
                                    )}
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {paginatedData.map((row, index) => (
                            <tr 
                                key={index}
                                className="hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => onRowClick?.(row)}
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {row.accountName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(row.status)}`}>
                                        {row.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {row.balance}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination with themed buttons */}
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    <select
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        className="px-4 py-2 border border-gray-300 rounded-md"
                    >
                        <option value={5}>5 per page</option>
                        <option value={10}>10 per page</option>
                        <option value={25}>25 per page</option>
                        <option value={50}>50 per page</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <div className="px-4 py-2">
                        Page {currentPage} of {totalPages}
                    </div>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

function getStatusStyle(status: string): string {
    const styles: Record<string, string> = {
        'Active': 'bg-green-100 text-green-800',
        'Inactive': 'bg-gray-100 text-gray-800',
        'Pending': 'bg-yellow-100 text-yellow-800',
        'On Hold': 'bg-yellow-100 text-yellow-800',
        'Completed': 'bg-green-100 text-green-800',
        'Error': 'bg-red-100 text-red-800',
        'Commercial': 'bg-purple-100 text-purple-800',
        'Residential': 'bg-indigo-100 text-indigo-800',
        'Industrial': 'bg-pink-100 text-pink-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
}

/* eslint-enable */