import React from 'react';
import styles from './Card.module.css';

interface CardProps {
    selected?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
    selected = false,
    onClick,
    children
}) => {
    return (
        <div
            className={`${styles.card} ${selected ? styles.selected : ''}`}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onClick?.();
                }
            }}
        >
            {children}
        </div>
    );
};
