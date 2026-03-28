import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

// ============================================================================
// BASE CONTAINERS
// ============================================================================

interface BaseCardProps extends HTMLMotionProps<"div"> {
  accent?: boolean;
}

export function BaseCard({ children, accent, className, ...props }: BaseCardProps) {
  return (
    <motion.div
      className={cn("card", accent && "card--accent", className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 24 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// TYPOGRAPHY & ELEMENTS
// ============================================================================

export function TrendBadge({ value, isUp }: { value: string | number; isUp: boolean }) {
  return (
    <span className={cn("trend trend-badge", isUp ? "trend--up" : "trend--down")}>
      {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {value}
    </span>
  );
}

// ============================================================================
// KPI CARDS
// ============================================================================

interface KpiCardProps {
  title: string;
  value: string | number;
  icon?: React.ElementType;
  trendValue?: string;
  trendUp?: boolean;
  accent?: boolean;
  delay?: number;
  actionIcon?: React.ElementType;
  onActionClick?: () => void;
  className?: string;
}

/**
 * Standard huge-number KPI card following SKILL.md specs
 */
export function KpiCard({
  title,
  value,
  icon: Icon,
  trendValue,
  trendUp = true,
  accent = false,
  delay = 0,
  actionIcon: ActionIcon,
  onActionClick,
  className
}: KpiCardProps) {
  return (
    <BaseCard className={className} accent={accent} transition={{ delay, type: "spring", stiffness: 300, damping: 24 }}>
      {/* Header Row */}
      <div className="card-header">
        {Icon && (
          <span className="card-icon" style={accent ? { background: 'rgba(0,0,0,0.15)', color: '#000' } : {}}>
            <Icon className="w-4 h-4" />
          </span>
        )}
        <span className={cn("card-title", accent && "text-black/70")}>{title}</span>
        
        {ActionIcon && (
          <button 
            className="card-action" 
            onClick={onActionClick}
            style={accent ? { borderColor: 'rgba(0,0,0,0.2)' } : {}}
          >
            <ActionIcon className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Hero Value */}
      <div className={cn("kpi-value", accent && "text-black")}>
        {value}
      </div>

      {/* Optional Trend */}
      {trendValue && (
        <div className="mt-3">
          <TrendBadge value={trendValue} isUp={trendUp} />
        </div>
      )}
    </BaseCard>
  );
}

// ============================================================================
// NAVIGATION & FILTERS
// ============================================================================

interface FilterPillProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  badgeCount?: number;
}

export function FilterPill({ label, active, onClick, badgeCount }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className={cn("nav-item", active && "nav-item--active")}
    >
      {label}
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="nav-badge">{badgeCount}</span>
      )}
    </button>
  );
}
