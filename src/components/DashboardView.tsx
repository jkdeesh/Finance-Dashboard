import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AssetData, TabType, CURRENCIES, CurrencyCode, convertCurrency } from '../types';
import { GlassCard } from './GlassCard';
import { 
  TrendingUp, 
  Wallet, 
  Calendar, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  PieChart as PieIcon, 
  ChevronRight, 
  Info,
  BadgeDollarSign,
  GripVertical,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  Landmark,
  IndianRupee
} from 'lucide-react';

const RupeeCoin = ({ className, ...props }: any) => {
  return (
    <div className={`inline-flex items-center justify-center rounded-full border border-current shrink-0 p-[1px] aspect-square ${className || ''}`}>
      <IndianRupee className="h-[70%] w-[70%] stroke-[2.5]" {...props} />
    </div>
  );
};

interface DashboardViewProps {
  data: AssetData;
  setActiveTab: (tab: TabType) => void;
  selectedCurrency: CurrencyCode;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ data, setActiveTab, selectedCurrency }) => {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [activeHistoryPoint, setActiveHistoryPoint] = useState<number | null>(5); // Default to latest month

  const [widgetOrder, setWidgetOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('asset_tracker_widget_order');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 4) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse widget order', e);
    }
    return ['trend', 'allocation', 'mutualFunds', 'insights'];
  });

  const saveWidgetOrder = (newOrder: string[]) => {
    setWidgetOrder(newOrder);
    try {
      localStorage.setItem('asset_tracker_widget_order', JSON.stringify(newOrder));
    } catch (e) {
      console.warn('Failed to save widget order', e);
    }
  };

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      const newOrder = [...widgetOrder];
      const [draggedItem] = newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedItem);
      saveWidgetOrder(newOrder);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < widgetOrder.length) {
      const newOrder = [...widgetOrder];
      const temp = newOrder[index];
      newOrder[index] = newOrder[targetIndex];
      newOrder[targetIndex] = temp;
      saveWidgetOrder(newOrder);
    }
  };

  const [widgetSizes, setWidgetSizes] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('asset_tracker_widget_sizes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            trend: parsed.trend ?? 2,
            allocation: parsed.allocation ?? 1,
            mutualFunds: parsed.mutualFunds ?? 1,
            insights: parsed.insights ?? 2
          };
        }
      }
    } catch (e) {
      console.warn('Failed to parse widget sizes', e);
    }
    return {
      trend: 2,
      allocation: 1,
      mutualFunds: 1,
      insights: 2
    };
  });

  const saveWidgetSize = (widgetId: string, size: number) => {
    const newSizes = { ...widgetSizes, [widgetId]: size };
    setWidgetSizes(newSizes);
    try {
      localStorage.setItem('asset_tracker_widget_sizes', JSON.stringify(newSizes));
    } catch (e) {
      console.warn('Failed to save widget sizes', e);
    }
  };

  const handleResizeStart = (e: React.MouseEvent, widgetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const initialSize = widgetSizes[widgetId] || 1;
    let lastSize = initialSize;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      // Step interval is roughly 150px
      const step = Math.round(deltaX / 150);
      let newSize = initialSize + step;
      if (newSize < 1) newSize = 1;
      if (newSize > 3) newSize = 3;
      
      if (newSize !== lastSize) {
        lastSize = newSize;
        saveWidgetSize(widgetId, newSize);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // --- CALCULATIONS WITH CURRENCY CONVERSION ---
  const totalSavings = data.bankSavings.reduce((sum, item) => sum + convertCurrency(item.balance, item.currency || 'INR', selectedCurrency), 0);
  const totalFDPrincipal = data.fixedDeposits.reduce((sum, item) => sum + convertCurrency(item.principal, item.currency || 'INR', selectedCurrency), 0);
  
  // Calculate FD current accrued value roughly
  const totalFDValue = totalFDPrincipal;

  const totalMutualFundsInvested = data.mutualFunds.reduce((sum, item) => sum + convertCurrency(item.units * item.averageNav, item.currency || 'INR', selectedCurrency), 0);
  const totalMutualFundsCurrent = data.mutualFunds.reduce((sum, item) => sum + convertCurrency(item.units * item.currentNav, item.currency || 'INR', selectedCurrency), 0);
  const mutualFundsProfit = totalMutualFundsCurrent - totalMutualFundsInvested;
  const mutualFundsProfitPercent = totalMutualFundsInvested > 0 ? (mutualFundsProfit / totalMutualFundsInvested) * 100 : 0;

  const totalPortfolioValue = totalSavings + totalFDValue + totalMutualFundsCurrent;
  const totalInvestedPrincipal = totalSavings + totalFDPrincipal + totalMutualFundsInvested;
  const overallProfit = totalPortfolioValue - totalInvestedPrincipal;
  const overallProfitPercent = totalInvestedPrincipal > 0 ? (overallProfit / totalInvestedPrincipal) * 100 : 0;

  // Percentage allocation
  const savingsPercent = totalPortfolioValue > 0 ? (totalSavings / totalPortfolioValue) * 100 : 0;
  const fdPercent = totalPortfolioValue > 0 ? (totalFDValue / totalPortfolioValue) * 100 : 0;
  const fundsPercent = totalPortfolioValue > 0 ? (totalMutualFundsCurrent / totalPortfolioValue) * 100 : 0;

  // Formatting helper
  const formatCurrency = (val: number) => {
    const config = CURRENCIES[selectedCurrency] || CURRENCIES.INR;
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      maximumFractionDigits: 0,
    }).format(val);
  };

  // --- 6-MONTH HISTORICAL TREND DATA (DYNAMICALLY SCALED BASED ON USER STATE) ---
  const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  
  const historyData = months.map((month, idx) => {
    const savingsHist = totalSavings * (0.95 + idx * 0.01);
    const fdHist = totalFDValue * (0.9 + idx * 0.02);
    const fundsHist = totalMutualFundsCurrent * (0.75 + idx * 0.05);
    const total = savingsHist + fdHist + fundsHist;

    return {
      month,
      savings: savingsHist,
      deposits: fdHist,
      funds: fundsHist,
      total: total,
    };
  });

  const activePoint = activeHistoryPoint !== null ? historyData[activeHistoryPoint] : historyData[5];

  // SVG Chart Dimensions
  const lineChartWidth = 600;
  const lineChartHeight = 200;
  const paddingX = 40;
  const paddingY = 20;

  // Find max value in history to scale the line chart
  const maxVal = Math.max(...historyData.map(d => d.total)) * 1.05;
  const minVal = Math.min(...historyData.map(d => d.total)) * 0.95;

  // Map data to SVG coordinates
  const points = historyData.map((d, i) => {
    const x = paddingX + (i * (lineChartWidth - 2 * paddingX)) / (historyData.length - 1);
    const y = lineChartHeight - paddingY - ((d.total - minVal) / (maxVal - minVal)) * (lineChartHeight - 2 * paddingY);
    return { x, y, ...d };
  });

  // Generate SVG path string
  const linePath = points.reduce((path, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
  }, '');

  // Elegant closed area path under the line
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${lineChartHeight - paddingY} L ${points[0].x} ${lineChartHeight - paddingY} Z`;

  // Circular Donut helper
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  
  // Segment lengths
  const savingsStroke = (savingsPercent / 100) * circumference;
  const fdStroke = (fdPercent / 100) * circumference;
  const fundsStroke = (fundsPercent / 100) * circumference;

  // Offsets (Standardized for continuous clockwise stacking)
  const savingsOffset = 0;
  const fdOffset = -savingsStroke;
  const fundsOffset = -(savingsStroke + fdStroke);

  const renderWidget = (widgetId: string, index: number) => {
    const isDragged = draggedIndex === index;
    const isDragOver = dragOverIndex === index;
    const size = widgetSizes[widgetId] || 1;

    const containerProps = {
      draggable: true,
      onDragStart: (e: React.DragEvent) => handleDragStart(e, index),
      onDragOver: (e: React.DragEvent) => handleDragOver(e, index),
      onDrop: (e: React.DragEvent) => handleDrop(e, index),
      onDragEnd: handleDragEnd,
      className: `transition-all duration-300 relative group/widget rounded-3xl ${
        isDragged ? 'opacity-30 scale-[0.97]' : ''
      } ${
        isDragOver ? 'ring-2 ring-dashed ring-indigo-500 scale-[1.01] bg-indigo-50/10' : ''
      } ${
        size === 1 ? 'col-span-1' :
        size === 2 ? 'col-span-1 lg:col-span-2' :
        'col-span-1 lg:col-span-3'
      }`
    };

    const renderControls = () => (
      <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover/widget:opacity-100 focus-within/widget:opacity-100 transition-opacity absolute right-3 top-3 z-30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md px-1.5 py-1 rounded-xl shadow-sm border border-slate-200/40 dark:border-white/10">
        <button 
          onClick={(e) => { e.stopPropagation(); moveWidget(index, 'up'); }}
          disabled={index === 0}
          className="p-1 rounded-lg transition-colors cursor-pointer text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
          title="Move Left/Up"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <div className="h-4 w-px bg-slate-200 dark:bg-white/10" />
        <div className="p-1 text-slate-400 cursor-grab active:cursor-grabbing" title="Drag to reorder">
          <GripVertical className="h-3.5 w-3.5" />
        </div>
        <div className="h-4 w-px bg-slate-200 dark:bg-white/10" />
        <button 
          onClick={(e) => { e.stopPropagation(); moveWidget(index, 'down'); }}
          disabled={index === widgetOrder.length - 1}
          className="p-1 rounded-lg transition-colors cursor-pointer text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
          title="Move Right/Down"
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <div className="h-4 w-px bg-slate-200 dark:bg-white/10" />
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            const currentSize = widgetSizes[widgetId] || 1;
            if (currentSize > 1) saveWidgetSize(widgetId, currentSize - 1);
          }}
          disabled={(widgetSizes[widgetId] || 1) <= 1}
          className="p-1 rounded-lg transition-colors cursor-pointer text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
          title="Shrink Width"
        >
          <Minimize2 className="h-3.5 w-3.5" />
        </button>
        <div className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 select-none" title="Current Column Span">
          {widgetSizes[widgetId]}/3
        </div>
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            const currentSize = widgetSizes[widgetId] || 1;
            if (currentSize < 3) saveWidgetSize(widgetId, currentSize + 1);
          }}
          disabled={(widgetSizes[widgetId] || 1) >= 3}
          className="p-1 rounded-lg transition-colors cursor-pointer text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
          title="Expand Width"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      </div>
    );

    if (widgetId === 'trend') {
      return (
        <div key="trend" {...containerProps}>
          {renderControls()}
          <GlassCard className="h-full relative overflow-hidden pt-14 px-6 pb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
              <div>
                <h4 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <TrendingUp className="h-5 w-5 text-indigo-600" /> Portfolio Growth Trend
                </h4>
                <p className="text-xs text-slate-500 font-medium">Simulated 6-month growth based on current holdings</p>
              </div>
              <div className="flex items-center gap-1 bg-white/30 rounded-lg p-1 text-[11px] font-medium border border-white/40 z-10">
                {historyData.map((d, idx) => (
                  <button
                    key={d.month}
                    onClick={() => setActiveHistoryPoint(idx)}
                    className={`px-2 py-1 rounded transition-all cursor-pointer ${
                      activeHistoryPoint === idx 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'text-slate-700 dark:text-slate-200 hover:bg-white/20'
                    }`}
                  >
                    {d.month}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative pt-2">
              <svg 
                viewBox={`0 0 ${lineChartWidth} ${lineChartHeight}`} 
                className="w-full h-auto overflow-visible select-none"
              >
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.01" />
                  </linearGradient>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>

                <line x1={paddingX} y1={paddingY} x2={lineChartWidth - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                <line x1={paddingX} y1={(lineChartHeight)/2} x2={lineChartWidth - paddingX} y2={(lineChartHeight)/2} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                <line x1={paddingX} y1={lineChartHeight - paddingY} x2={lineChartWidth - paddingX} y2={lineChartHeight - paddingY} stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />

                <path d={areaPath} fill="url(#areaGrad)" />

                <path 
                  d={linePath} 
                  fill="none" 
                  stroke="url(#lineGrad)" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />

                {points.map((p, idx) => {
                  const isActive = activeHistoryPoint === idx;
                  return (
                    <g key={idx} className="cursor-pointer" onClick={() => setActiveHistoryPoint(idx)}>
                      <circle 
                        cx={p.x} 
                        cy={p.y} 
                        r={isActive ? "7" : "4"} 
                        fill={isActive ? "#4f46e5" : "#ffffff"} 
                        stroke={isActive ? "#ffffff" : "#6366f1"} 
                        strokeWidth={isActive ? "3" : "2"}
                        className="transition-all duration-300 shadow"
                      />
                      {isActive && (
                        <line 
                          x1={p.x} 
                          y1={paddingY} 
                          x2={p.x} 
                          y2={lineChartHeight - paddingY} 
                          stroke="rgba(99, 102, 241, 0.25)" 
                          strokeWidth="1.5" 
                          strokeDasharray="2,2" 
                        />
                      )}
                      <text 
                        x={p.x} 
                        y={lineChartHeight - 5} 
                        textAnchor="middle" 
                        fill="#475569" 
                        fontSize="10" 
                        fontWeight={isActive ? "600" : "400"}
                        className="font-sans transition-all"
                      >
                        {p.month}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className={`mt-4 grid gap-2 bg-white/20 backdrop-blur-md rounded-xl p-3 border border-white/30 text-xs ${
                size === 1 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'
              }`}>
                <div className="flex flex-col min-w-0 items-center text-center">
                  <span className="w-full block text-slate-500 font-semibold uppercase tracking-wider text-[9px] whitespace-nowrap overflow-hidden text-ellipsis text-center">Select Month</span>
                  <span className="w-full block font-display font-bold text-slate-900 dark:text-slate-100 text-sm whitespace-nowrap overflow-hidden text-ellipsis text-center">{activePoint.month} 2026</span>
                </div>
                <div className="flex flex-col min-w-0 items-center text-center">
                  <span className="w-full flex items-center justify-center gap-1 text-slate-500 font-semibold uppercase tracking-wider text-[9px] whitespace-nowrap overflow-hidden text-ellipsis text-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500 shrink-0" /> Savings
                  </span>
                  <span className="w-full block font-mono font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap overflow-hidden text-ellipsis text-center">{formatCurrency(activePoint.savings)}</span>
                </div>
                <div className="flex flex-col min-w-0 items-center text-center">
                  <span className="w-full flex items-center justify-center gap-1 text-slate-500 font-semibold uppercase tracking-wider text-[9px] whitespace-nowrap overflow-hidden text-ellipsis text-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" /> Fixed Deposits
                  </span>
                  <span className="w-full block font-mono font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap overflow-hidden text-ellipsis text-center">{formatCurrency(activePoint.deposits)}</span>
                </div>
                <div className="flex flex-col min-w-0 items-center text-center">
                  <span className="w-full flex items-center justify-center gap-1 text-indigo-600 font-semibold uppercase tracking-wider text-[9px] whitespace-nowrap overflow-hidden text-ellipsis text-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 shrink-0" /> Mutual Funds
                  </span>
                  <span className="w-full block font-mono font-bold text-indigo-900 dark:text-indigo-300 whitespace-nowrap overflow-hidden text-ellipsis text-center">{formatCurrency(activePoint.funds)}</span>
                </div>
              </div>
            </div>
          </GlassCard>
          {/* Resize drag handle */}
          <div 
            onMouseDown={(e) => handleResizeStart(e, 'trend')}
            className="absolute top-0 right-0 bottom-0 w-3 cursor-col-resize group-hover/widget:bg-indigo-500/5 hover:bg-indigo-500/15 active:bg-indigo-600/25 transition-colors z-20 rounded-r-3xl hidden md:flex items-center justify-center"
            title="Drag right edge to resize"
          >
            <div className="w-1 h-8 rounded-full bg-slate-300 dark:bg-slate-700 opacity-0 group-hover/widget:opacity-100 transition-opacity flex flex-col gap-1 justify-between py-1">
              <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500" />
              <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500" />
              <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500" />
            </div>
          </div>
        </div>
      );
    }

    if (widgetId === 'allocation') {
      return (
        <div key="allocation" {...containerProps}>
          {renderControls()}
          <GlassCard className="flex flex-col justify-between h-full relative overflow-hidden pt-14 px-6 pb-6">
            <div>
              <h4 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-2">
                <PieIcon className="h-5 w-5 text-indigo-600" /> Asset Allocation
              </h4>
              <p className="text-xs text-slate-500 font-medium mb-6">Percentage share of active savings vs investments</p>
            </div>

            <div className="flex justify-center items-center relative py-4">
              <svg width="150" height="150" viewBox="0 0 120 120" className="transform -rotate-90 drop-shadow-sm">
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="10"
                />

                {savingsStroke > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="#0ea5e9"
                    strokeWidth={hoveredSegment === 'savings' ? '14' : '10'}
                    strokeDasharray={`${savingsStroke + 0.5} ${circumference}`}
                    strokeDashoffset={savingsOffset}
                    onMouseEnter={() => setHoveredSegment('savings')}
                    onMouseLeave={() => setHoveredSegment(null)}
                    className="transition-all duration-300 cursor-pointer origin-center"
                  />
                )}

                {fdStroke > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="#f59e0b"
                    strokeWidth={hoveredSegment === 'deposits' ? '14' : '10'}
                    strokeDasharray={`${fdStroke + 0.5} ${circumference}`}
                    strokeDashoffset={fdOffset}
                    onMouseEnter={() => setHoveredSegment('deposits')}
                    onMouseLeave={() => setHoveredSegment(null)}
                    className="transition-all duration-300 cursor-pointer origin-center"
                  />
                )}

                {fundsStroke > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="#6366f1"
                    strokeWidth={hoveredSegment === 'funds' ? '14' : '10'}
                    strokeDasharray={`${fundsStroke + 0.5} ${circumference}`}
                    strokeDashoffset={fundsOffset}
                    onMouseEnter={() => setHoveredSegment('funds')}
                    onMouseLeave={() => setHoveredSegment(null)}
                    className="transition-all duration-300 cursor-pointer origin-center"
                  />
                )}
              </svg>

              <div className="absolute flex flex-col justify-center items-center text-center pointer-events-none select-none">
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase transition-all duration-300">
                  {hoveredSegment === 'savings' ? 'Savings' : hoveredSegment === 'deposits' ? 'Deposits' : hoveredSegment === 'funds' ? 'Mutual Funds' : 'Active'}
                </span>
                <span className="text-lg font-display font-black text-slate-900 dark:text-slate-100 transition-all duration-300">
                  {hoveredSegment === 'savings' ? `${savingsPercent.toFixed(1)}%` : hoveredSegment === 'deposits' ? `${fdPercent.toFixed(1)}%` : hoveredSegment === 'funds' ? `${fundsPercent.toFixed(1)}%` : '100%'}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div 
                onMouseEnter={() => setHoveredSegment('savings')}
                onMouseLeave={() => setHoveredSegment(null)}
                className={`flex justify-between items-center p-2 rounded-xl border transition-all ${
                  hoveredSegment === 'savings' ? 'bg-white/40 border-sky-300/50 shadow-sm' : 'border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-sky-500 border border-white/40" />
                  <span className="font-medium text-slate-600 dark:text-slate-200">Bank Savings</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{savingsPercent.toFixed(1)}%</span>
              </div>

              <div 
                onMouseEnter={() => setHoveredSegment('deposits')}
                onMouseLeave={() => setHoveredSegment(null)}
                className={`flex justify-between items-center p-2 rounded-xl border transition-all ${
                  hoveredSegment === 'deposits' ? 'bg-white/40 border-amber-300/50 shadow-sm' : 'border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-amber-500 border border-white/40" />
                  <span className="font-medium text-slate-600 dark:text-slate-200">Fixed Deposits</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{fdPercent.toFixed(1)}%</span>
              </div>

              <div 
                onMouseEnter={() => setHoveredSegment('funds')}
                onMouseLeave={() => setHoveredSegment(null)}
                className={`flex justify-between items-center p-2 rounded-xl border transition-all ${
                  hoveredSegment === 'funds' ? 'bg-white/40 border-indigo-300/50 shadow-sm' : 'border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-indigo-500 border border-white/40" />
                  <span className="font-medium text-slate-600 dark:text-slate-200">Mutual Funds</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{fundsPercent.toFixed(1)}%</span>
              </div>
            </div>
          </GlassCard>
          {/* Resize drag handle */}
          <div 
            onMouseDown={(e) => handleResizeStart(e, 'allocation')}
            className="absolute top-0 right-0 bottom-0 w-3 cursor-col-resize group-hover/widget:bg-indigo-500/5 hover:bg-indigo-500/15 active:bg-indigo-600/25 transition-colors z-20 rounded-r-3xl hidden md:flex items-center justify-center"
            title="Drag right edge to resize"
          >
            <div className="w-1 h-8 rounded-full bg-slate-300 dark:bg-slate-700 opacity-0 group-hover/widget:opacity-100 transition-opacity flex flex-col gap-1 justify-between py-1">
              <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500" />
              <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500" />
              <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500" />
            </div>
          </div>
        </div>
      );
    }

    if (widgetId === 'mutualFunds') {
      return (
        <div key="mutualFunds" {...containerProps}>
          {renderControls()}
          <GlassCard hoverable onClick={() => setActiveTab('funds')} className="cursor-pointer flex flex-col justify-between h-full relative overflow-hidden pt-14 px-6 pb-6">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Layers className="h-5 w-5 text-indigo-600" /> Mutual Funds Growth
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">Invested equity vs. current valuation returns</p>
                </div>
                {size === 1 ? (
                  <span className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl text-xs font-bold leading-tight ${mutualFundsProfit >= 0 ? 'bg-emerald-500/20 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-rose-500/20 text-rose-800 dark:bg-rose-500/10 dark:text-rose-300'}`}>
                    <span>{mutualFundsProfit >= 0 ? '+' : ''}{mutualFundsProfitPercent.toFixed(1)}%</span>
                    <span>Return</span>
                  </span>
                ) : (
                  <span className={`flex max-md:portrait:flex-col items-center justify-center gap-0.5 max-md:portrait:gap-0 px-2.5 max-md:portrait:px-3 py-1 max-md:portrait:py-1.5 rounded-full max-md:portrait:rounded-xl text-xs font-bold max-md:portrait:leading-tight ${mutualFundsProfit >= 0 ? 'bg-emerald-500/20 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-rose-500/20 text-rose-800 dark:bg-rose-500/10 dark:text-rose-300'}`}>
                    <span>{mutualFundsProfit >= 0 ? '+' : ''}{mutualFundsProfitPercent.toFixed(1)}%</span>
                    <span>Return</span>
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span className="text-slate-500 font-medium">Current Portfolio Value</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(totalMutualFundsCurrent)}</span>
                  </div>
                  <div className="w-full bg-slate-200/40 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${totalMutualFundsCurrent > 0 ? (totalMutualFundsCurrent / totalPortfolioValue) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span className="text-slate-500 font-medium">Invested Principle Capital</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(totalMutualFundsInvested)}</span>
                  </div>
                  <div className="w-full bg-slate-200/40 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-slate-400 h-2 rounded-full" 
                      style={{ width: `${totalMutualFundsInvested > 0 ? (totalMutualFundsInvested / totalPortfolioValue) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200/20 flex justify-between items-center text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span>Overall Capital Gains:</span>
                <span className={`font-mono font-bold ${mutualFundsProfit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                  {mutualFundsProfit >= 0 ? '+' : ''}{formatCurrency(mutualFundsProfit)}
                </span>
              </div>
              <span 
                onClick={(e) => { e.stopPropagation(); setActiveTab('funds'); }}
                className="font-bold text-indigo-800 dark:text-indigo-300 flex items-center hover:underline cursor-pointer"
              >
                Manage <ChevronRight className="h-3 w-3" />
              </span>
            </div>
          </GlassCard>
          {/* Resize drag handle */}
          <div 
            onMouseDown={(e) => handleResizeStart(e, 'mutualFunds')}
            className="absolute top-0 right-0 bottom-0 w-3 cursor-col-resize group-hover/widget:bg-indigo-500/5 hover:bg-indigo-500/15 active:bg-indigo-600/25 transition-colors z-20 rounded-r-3xl hidden md:flex items-center justify-center"
            title="Drag right edge to resize"
          >
            <div className="w-1 h-8 rounded-full bg-slate-300 dark:bg-slate-700 opacity-0 group-hover/widget:opacity-100 transition-opacity flex flex-col gap-1 justify-between py-1">
              <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500" />
              <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500" />
              <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500" />
            </div>
          </div>
        </div>
      );
    }

    if (widgetId === 'insights') {
      return (
        <div key="insights" {...containerProps}>
          {renderControls()}
          <GlassCard className="flex flex-col justify-between h-full relative overflow-hidden pt-14 px-6 pb-6">
            <div>
              <h4 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-2">
                <Sparkles className="h-5 w-5 text-indigo-600" /> Smart Portfolio Insights
              </h4>
              <p className="text-xs text-slate-500 font-medium mb-4">Dynamically computed tips based on your asset split</p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3 bg-white/25 dark:bg-slate-800/35 rounded-xl p-3 border border-white/40 dark:border-white/10 text-xs">
                <Info className="h-5 w-5 text-indigo-600 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 block">Emergency Fund Status</span>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
                    Your Bank Savings (HYSAs) account for <b>{savingsPercent.toFixed(0)}%</b> of your net worth. Keeping 15-20% in high-yield liquid savings is ideal for an emergency fund.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 bg-white/25 dark:bg-slate-800/35 rounded-xl p-3 border border-white/40 dark:border-white/10 text-xs">
                <BadgeDollarSign className="h-5 w-5 text-amber-600 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 block">Fixed Income Yields</span>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
                    You have <b>{data.fixedDeposits.length}</b> Fixed Deposits active. These secure CDs provide predictable interest cashflows that balance out equity volatility.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <span className="text-[10px] text-slate-500 font-semibold italic">
                "Financial tracking is the first step toward compounding freedom."
              </span>
            </div>
          </GlassCard>
          {/* Resize drag handle */}
          <div 
            onMouseDown={(e) => handleResizeStart(e, 'insights')}
            className="absolute top-0 right-0 bottom-0 w-3 cursor-col-resize group-hover/widget:bg-indigo-500/5 hover:bg-indigo-500/15 active:bg-indigo-600/25 transition-colors z-20 rounded-r-3xl hidden md:flex items-center justify-center"
            title="Drag right edge to resize"
          >
            <div className="w-1 h-8 rounded-full bg-slate-300 dark:bg-slate-700 opacity-0 group-hover/widget:opacity-100 transition-opacity flex flex-col gap-1 justify-between py-1">
              <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500" />
              <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500" />
              <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500" />
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6" id="dashboard-view-root">
      
      {/* Top Banner Message */}
      <div className="glass-card rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 shadow-xl">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            Asset Tracker Dashboard <Sparkles className="h-7 w-7 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          </h1>
          <div className="text-slate-600 dark:text-slate-300 text-xs md:text-sm font-medium mt-1.5 block max-w-xl">
            Minimalist glassmorphic dashboard tracking your personal financial portfolio.
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/45 dark:bg-slate-800/40 text-indigo-950 dark:text-indigo-100 text-xs font-bold border border-white/50 dark:border-white/15 backdrop-blur-md shadow-inner">
          <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
          <span>Last Updated: Today</span>
        </div>
      </div>

      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Net Worth Card */}
        <GlassCard className="col-span-1 md:col-span-2 bg-gradient-to-br from-indigo-500/20 to-violet-500/10 border-indigo-200/30">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-slate-500 dark:text-slate-300 text-xs font-bold tracking-wider uppercase">Net Portfolio Value</span>
              <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-slate-100 mt-1">{formatCurrency(totalPortfolioValue)}</h2>
            </div>
            <div className="p-3 bg-indigo-500/15 rounded-xl border border-indigo-500/20 text-indigo-700">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs">
            <span className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full font-semibold ${overallProfit >= 0 ? 'bg-emerald-500/20 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-rose-500/20 text-rose-800 dark:bg-rose-500/10 dark:text-rose-300'}`}>
              {overallProfit >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {overallProfit >= 0 ? '+' : ''}{overallProfitPercent.toFixed(1)}%
            </span>
            <span className="text-slate-500 dark:text-slate-300 font-medium">Total overall returns: {formatCurrency(overallProfit)}</span>
          </div>
        </GlassCard>

        {/* Bank Savings Card */}
        <GlassCard hoverable onClick={() => setActiveTab('savings')} className="cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-slate-500 dark:text-slate-300 text-xs font-bold tracking-wider uppercase">Bank Savings</span>
              <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100 mt-1">{formatCurrency(totalSavings)}</h3>
            </div>
            <div className="p-2.5 bg-sky-500/15 rounded-xl text-sky-700">
              <Landmark className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-slate-500 pt-2 border-t border-slate-200/20 font-medium">
            <span>{data.bankSavings.length} Accounts</span>
            <span 
              onClick={(e) => { e.stopPropagation(); setActiveTab('savings'); }}
              className="font-bold text-indigo-800 dark:text-indigo-300 flex items-center hover:underline cursor-pointer"
            >
              Manage <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </GlassCard>

        {/* Fixed Deposits Card */}
        <GlassCard hoverable onClick={() => setActiveTab('deposits')} className="cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-slate-500 dark:text-slate-300 text-xs font-bold tracking-wider uppercase">Fixed Deposits</span>
              <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100 mt-1">{formatCurrency(totalFDValue)}</h3>
            </div>
            <div className="p-2.5 bg-amber-500/15 rounded-xl text-amber-700">
              <RupeeCoin className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-slate-500 pt-2 border-t border-slate-200/20 font-medium">
            <span>{data.fixedDeposits.length} Active CDs</span>
            <span 
              onClick={(e) => { e.stopPropagation(); setActiveTab('deposits'); }}
              className="font-bold text-indigo-800 dark:text-indigo-300 flex items-center hover:underline cursor-pointer"
            >
              Manage <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </GlassCard>
      </div>

      {/* Main Charts & Analytics Section (Movable Draggable Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {widgetOrder.map((widgetId, index) => renderWidget(widgetId, index))}
      </div>

    </div>
  );
};
