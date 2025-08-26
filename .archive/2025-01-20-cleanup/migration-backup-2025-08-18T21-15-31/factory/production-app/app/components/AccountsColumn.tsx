import React, { useState, useEffect } from 'react';
import { SearchBox } from './SearchBox';
import { Card } from './Card';
import { Account } from '../types/types';
import { fetchAccounts } from '../services/mockData';
import styles from '../styles/AccountsColumn.module.css';

interface AccountsColumnProps {
    selectedAccount: Account | null;
    onAccountSelect: (account: Account) => void;
}

export const AccountsColumn: React.FC<AccountsColumnProps> = ({
    selectedAccount, onAccountSelect
}) => {
    const [items, setItems] = useState<Account[]>([]);
    const [filteredItems, setFilteredItems] = useState<Account[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        setLoading(true);
        fetchAccounts()
            .then(setItems)
            .finally(() => setLoading(false));
    }, []);
    
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
                <h2>Accounts</h2>
                <span className={styles.count}>{filteredItems.length}</span>
            </div>
            
            <SearchBox
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search accounts..."
            />
            
            <div className={styles.content}>
                {loading ? (
                    <div className={styles.loading}>Loading...</div>
                ) : (
                    filteredItems.map(item => (
                        <Card
                            key={item.id}
                            selected={selectedAccount?.id === item.id}
                            onClick={() => onAccountSelect(item)}
                        >
                            <>
                            <div className={styles.cardTitle}>{item.name}</div>
                            <div className={styles.cardSubtitle}>{item.type}</div>
                            <div className={styles.cardMeta}>{item.locations} locations</div>
                        </>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
