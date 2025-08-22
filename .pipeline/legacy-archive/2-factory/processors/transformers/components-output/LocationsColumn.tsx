import React, { useState, useEffect } from 'react';
import { SearchBox } from './SearchBox';
import { Card } from './Card';
import { Location } from './types';
import { fetchLocations } from './mockData';
import styles from './LocationsColumn.module.css';

interface LocationsColumnProps {
    accountId?: number;
    selectedLocation: Location | null;
    onLocationSelect: (location: Location) => void;
}

export const LocationsColumn: React.FC<LocationsColumnProps> = ({
    accountId, selectedLocation, onLocationSelect
}) => {
    const [items, setItems] = useState<Location[]>([]);
    const [filteredItems, setFilteredItems] = useState<Location[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        if (accountId) {
            setLoading(true);
            fetchLocations(accountId)
                .then(setItems)
                .finally(() => setLoading(false));
        } else {
            setItems([]);
        }
    }, [accountId]);
    
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
                <h2>Service Locations</h2>
                <span className={styles.count}>{filteredItems.length}</span>
            </div>
            
            <SearchBox
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search service locations..."
            />
            
            <div className={styles.content}>
                {loading ? (
                    <div className={styles.loading}>Loading...</div>
                ) : (
                    filteredItems.map(item => (
                        <Card
                            key={item.id}
                            selected={selectedLocation?.id === item.id}
                            onClick={() => onLocationSelect(item)}
                        >
                            <>
                            <div className={styles.cardTitle}>{item.name}</div>
                            <div className={styles.cardSubtitle}>{item.address}</div>
                            <div className={styles.cardMeta}>{item.workOrders} work orders</div>
                        </>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
