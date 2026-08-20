import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const formatMoney = (num) => `$${Number(num).toFixed(2)}`;

export const formatTime = (ts) => {
    const date = new Date(ts);
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    
    const timeStr = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    
    return isToday ? `Today, ${timeStr}` : `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${timeStr}`;
};

export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
};