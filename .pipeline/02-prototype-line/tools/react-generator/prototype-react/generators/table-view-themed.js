/**
 * THEMED Table View Generator
 * Generates React table with configurable themes
 * NO TypeScript/ESLint conflicts guaranteed!
 */

const { loadTheme, applyTheme, wrapWithEscapeHatches } = require('./theme-engine');

/**
 * Generate table view with theme support
 * @param {Object} config - Parsed configuration
 * @param {string} themeName - Theme to use (default, healthcare, etc.)
 * @param {Object} options - Generation options
 * @returns {string} React component code
 */
function generateThemedTableView(config, themeName = 'default', options = {}) {
    const { componentName, entityNamePascal, fields, layout } = config;
    
    // Load the theme
    const theme = loadTheme(themeName);
    console.log(`Using theme: ${theme.name}`);
    
    // Build component with theme classes
    const componentCode = `/**
 * ${componentName}View Component
 * Generated with ${theme.name} Theme
 * ${new Date().toISOString()}
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ${entityNamePascal}, ${componentName}Props } from '../types/${componentName}Types';
import { mock${entityNamePascal}Data } from '../data/${componentName}MockData';

export const ${componentName}View: React.FC<${componentName}Props> = ({ 
    initialData,
    onRowClick,
    className = ''
}) => {
    // State management
    const [data, setData] = useState<${entityNamePascal}[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortField, setSortField] = useState<keyof ${entityNamePascal} | null>(null);
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
                setData(initialData || mock${entityNamePascal}Data);
                setLoading(false);
            }, 500);
        };
        loadData();
    }, [initialData]);

    // Sorting logic
    const handleSort = (field: keyof ${entityNamePascal}) => {
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
                <div className="${applyTheme('loading', 'spinner', theme)}"></div>
            </div>
        );
    }

    return (
        <div className={\`${applyTheme('spacing', 'page', theme)} \${className}\`}>
            {/* Header with themed typography */}
            <div className="flex justify-between items-center">
                <h2 className="${applyTheme('typography', 'title', theme)}">
                    ${config.hierarchy.module.name}
                </h2>
                <div className="${applyTheme('typography', 'caption', theme)}">
                    {sortedData.length} records
                </div>
            </div>

            {/* Filter with themed input */}
            ${layout.features.filtering ? `<div className="flex gap-4">
                <input
                    type="text"
                    placeholder="Search..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="${applyTheme('input', 'base', theme)} ${applyTheme('input', 'focus', theme)}"
                />
            </div>` : ''}

            {/* Table with themed styles */}
            <div className="${applyTheme('table', 'container', theme)}">
                <table className="${applyTheme('table', 'base', theme)}">
                    <thead className="${applyTheme('table', 'header', theme)}">
                        <tr>
${fields.map(field => `                            <th 
                                className="${applyTheme('table', 'headerCell', theme)} ${field.isSortable ? 'cursor-pointer ' + applyTheme('table', 'headerCellHover', theme) : ''}"
                                ${field.isSortable ? `onClick={() => handleSort('${field.fieldCamel}' as keyof ${entityNamePascal})}` : ''}
                            >
                                <div className="flex items-center gap-1">
                                    ${field.label}
                                    ${field.isSortable ? `{sortField === '${field.fieldCamel}' && (
                                        <span className="text-${theme.colors?.primary || 'blue-600'}">
                                            {sortDirection === 'asc' ? '↑' : '↓'}
                                        </span>
                                    )}` : ''}
                                </div>
                            </th>`).join('\n')}
                        </tr>
                    </thead>
                    <tbody className="${applyTheme('table', 'divider', theme)}">
                        {paginatedData.map((row, index) => (
                            <tr 
                                key={index}
                                className="${applyTheme('table', 'row', theme)}"
                                onClick={() => onRowClick?.(row)}
                            >
${fields.map(field => `                                <td className="${applyTheme('table', 'cell', theme)}">
                                    ${renderThemedFieldValue(field, theme)}
                                </td>`).join('\n')}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination with themed buttons */}
            ${layout.features.pagination ? `<div className="flex justify-between items-center">
                <div className="flex gap-2">
                    <select
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        className="${applyTheme('input', 'base', theme)}"
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
                        className="${applyTheme('button', 'secondary', theme)} ${applyTheme('button', 'disabled', theme)}"
                    >
                        Previous
                    </button>
                    <div className="px-4 py-2">
                        Page {currentPage} of {totalPages}
                    </div>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="${applyTheme('button', 'secondary', theme)} ${applyTheme('button', 'disabled', theme)}"
                    >
                        Next
                    </button>
                </div>
            </div>` : ''}
        </div>
    );
};

${generateThemedStatusHelper(fields, entityNamePascal, theme)}
`;

    // Apply escape hatches if requested
    if (options.disableLinting) {
        return wrapWithEscapeHatches(componentCode, {
            disableTypeScript: options.disableTypeScript || false,
            disableESLint: options.disableESLint || false,
            disablePrettier: options.disablePrettier || false
        });
    }
    
    return componentCode;
}

/**
 * Render field value with theme-aware badges
 */
function renderThemedFieldValue(field, theme) {
    if (field.type === 'boolean') {
        return `{row.${field.fieldCamel} ? '✓' : '✗'}`;
    } else if (field.type === 'enum' || field.type === 'status') {
        return `<span className={\`${theme.components.badge.base} \${getStatusStyle(row.${field.fieldCamel})}\`}>
                                        {row.${field.fieldCamel}}
                                    </span>`;
    } else if (field.type === 'date') {
        return `{new Date(row.${field.fieldCamel}).toLocaleDateString()}`;
    } else {
        return `{row.${field.fieldCamel}}`;
    }
}

/**
 * Generate themed status helper
 */
function generateThemedStatusHelper(fields, entityType, theme) {
    const hasStatus = fields.some(f => f.field === 'status' || f.type === 'enum');
    
    if (!hasStatus) return '';
    
    const badge = theme.components.badge;
    
    return `function getStatusStyle(status: string): string {
    const styles: Record<string, string> = {
        'Active': '${badge.active || "bg-green-100 text-green-800"}',
        'Inactive': '${badge.inactive || "bg-gray-100 text-gray-800"}',
        'Pending': '${badge.pending || "bg-yellow-100 text-yellow-800"}',
        'On Hold': '${badge.pending || "bg-orange-100 text-orange-800"}',
        'Completed': '${badge.active || "bg-blue-100 text-blue-800"}',
        'Error': '${badge.error || "bg-red-100 text-red-800"}',
        'Commercial': 'bg-purple-100 text-purple-800',
        'Residential': 'bg-indigo-100 text-indigo-800',
        'Industrial': 'bg-pink-100 text-pink-800'
    };
    return styles[status] || '${badge.inactive || "bg-gray-100 text-gray-800"}';
}`;
}

module.exports = {
    generateThemedTableView
};