import React from 'react';
import { cn } from '../utils/helpers.js';
import { Check, X, AlertTriangle } from 'lucide-react';

const StatusBadge = ({ status, text, className, withIcon = false }) => {
    let statusClass = "badge-neutral";
    let Icon = null;
    
    if (status === 'APPROVED' || status === 'approve') {
        statusClass = "badge-approve";
        Icon = Check;
    }
    if (status === 'DENIED' || status === 'deny' || status === 'BLOCKED') {
        statusClass = "badge-deny";
        Icon = X;
    }
    if (status === 'ESCALATE' || status === 'escalate' || status === 'PENDING') {
        statusClass = "badge-escalate";
        Icon = AlertTriangle;
    }

    return (
        <span className={cn(statusClass, className)}>
            {withIcon && Icon && <Icon size={12} className="mr-1" strokeWidth={3} />}
            {text || status}
        </span>
    );
};

export default StatusBadge;
