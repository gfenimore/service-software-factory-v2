import React from 'react';
import styles from './SearchBox.module.css';

interface SearchBoxProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
    value,
    onChange,
    placeholder = "Search..."
}) => {
    return (
        <div className={styles.searchBox}>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={styles.input}
            />
        </div>
    );
};
