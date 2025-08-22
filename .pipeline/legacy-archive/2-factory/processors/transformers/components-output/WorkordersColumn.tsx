import React, { useState, useEffect } from 'react';
import { SearchBox } from './SearchBox';
import { Card } from './Card';
import { WorkOrder } from './types';
import { fetchWorkOrders } from './mockData';
import styles from './WorkordersColumn.module.css';

interface WorkordersColumnProps {
    locationId?: number;
    selectedWorkOrder: WorkOrder | null;
    onWorkOrderSelect: (workOrder: WorkOrder) => void;
}

export const WorkordersColumn: React.FC<WorkordersColumnProps> = ({
    locationId, selectedWorkOrder, onWorkOrderSelect
}) => {
    const [items, setItems] = useState<WorkOrder[]>([]);
    const [filteredItems, setFilteredItems] = useState<WorkOrder[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        if (locationId) {
            setLoading(true);
            fetchWorkOrders(locationId)
                .then(setItems)
                .finally(() => setLoading(false));
        } else {
            setItems([]);
        }
    }, [locationId]);
    
    useEffect(() => {
        const filtered = items.filter(item =>
            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.title?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredItems(filtered);
    }, [items, searchTerm]);
    
    return (
        <div className={styles.column}>
            <div className={styles.header}>
                <h2>Work Orders</h2>
                <span className={styles.count}>{filteredItems.length}</span>
            </div>
            
            <SearchBox
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search work orders..."
            />
            
            <div className={styles.content}>
                {loading ? (
                    <div className={styles.loading}>Loading...</div>
                ) : (
                    filteredItems.map(item => (
                        <Card
                            key={item.id}
                            selected={selectedWorkOrder?.id === item.id}
                            onClick={() => onWorkOrderSelect(item)}
                        >
                            <>
                            <div className={styles.cardTitle}>{item.title}</div>
                            <div className={styles.cardSubtitle}>{item.status}</div>
                            <div className={styles.cardMeta}>{item.date}</div>
                        </>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
