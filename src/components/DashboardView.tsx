import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AssetData, TabType, CURRENCIES, CurrencyCode, convertCurrency } from '../types';
import { GlassCard } from './GlassCard';
import { calculatePreciousAssetUSD } from '../services/marketRates';
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
  IndianRupee,
  Building2,
  ShieldCheck,
  ShieldAlert,
  Coins
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
  marketRates?: any;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ data, setActiveTab, selectedCurrency, marketRates }) => {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [activeHistoryPoint, setActiveHistoryPoint] = useState<number | null>(5); // Default to latest month

  const [widgetOrder, setWidgetOrder] = useState<string[]>(() => {
    const defaultWidgets = ['trend', 'allocation', 'savings', 'deposits', 'mutualFunds', 'landedEstates', 'precious', 'insurances', 'liabilities', 'insights'];
    try {
      const saved = localStorage.getItem('asset_tracker_widget_order');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(w => defaultWidgets.includes(w));
          defaultWidgets.forEach(w => {
            if (!filtered.includes(w)) {
              filtered.push(w);
            }
          });
          return filtered;
        }
      }
    } catch (e) {
      console.warn('Failed to parse widget order', e);
    }
    return defaultWidgets;
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
            savings: parsed.savings ?? 1,
            deposits: parsed.deposits ?? 1,
            precious: parsed.precious ?? 1,
            mutualFunds: parsed.mutualFunds ?? 1,
            landedEstates: parsed.landedEstates ?? 1,
            insurances: parsed.insurances ?? 1,
            liabilities: parsed.liabilities ?? 1,
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
      savings: 1,
      deposits: 1,
      precious: 1,
      mutualFunds: 1,
      landedEstates: 1,
      insurances: 1,
      liabilities: 1,
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

  // Immovable assets (Landed Estates)
  const totalLandedEstates = (data.immovableAssets || []).reduce((sum, item) => sum + convertCurrency(item.estimatedValue, item.currency || 'INR', selectedCurrency), 0);

  // Precious Vault Reserves
  const metalRates = marketRates?.metalRates || {
    gold24k: 78.50,
    gold22k: 72.00,
    gold18k: 58.80,
    gold14k: 45.80,
    silver999: 0.98,
    silver925: 0.91,
    platinum: 32.50,
    diamondBase: 4500.00
  };
  const exchangeRates = marketRates?.exchangeRates || {};
  const exchangeRate = exchangeRates[selectedCurrency] || (selectedCurrency === 'INR' ? 83.5 : 1);

  const totalPreciousUSD = (data.preciousAssets || []).reduce((sum, item) => {
    return sum + calculatePreciousAssetUSD(item, metalRates);
  }, 0);
  const totalPreciousValue = totalPreciousUSD * exchangeRate;

  // Estimate precious invested price (fallback to 85% if bought without recording price)
  const totalPreciousInvested = (data.preciousAssets || []).reduce((sum, item) => {
    if (item.purchasePrice) {
      return sum + convertCurrency(item.purchasePrice, item.purchaseCurrency || 'USD', selectedCurrency);
    }
    const usdVal = calculatePreciousAssetUSD(item, metalRates);
    return sum + (usdVal * 0.85) * exchangeRate;
  }, 0);

  // InsureShield calculations (Active cover sum assured and premium outgoes)
  let totalInsuranceCover = 0;
  let totalMonthlyPremium = 0;
  (data.insurances || []).forEach(policy => {
    const policyCurr = policy.currency || 'INR';
    if (policy.status === 'Active') {
      totalInsuranceCover += convertCurrency(policy.sumAssured, policyCurr, selectedCurrency);
    }
    const premiumInSelected = convertCurrency(policy.premiumAmount, policyCurr, selectedCurrency);
    let factor = 12;
    if (policy.frequency === 'Monthly') factor = 1;
    else if (policy.frequency === 'Quarterly') factor = 3;
    else if (policy.frequency === 'Half-Yearly') factor = 6;
    else if (policy.frequency === 'Annually') factor = 12;
    totalMonthlyPremium += (premiumInSelected / factor);
  });

  const totalPortfolioValue = totalSavings + totalFDValue + totalMutualFundsCurrent + totalLandedEstates + totalPreciousValue;
  const totalLiabilities = (data.liabilities || []).reduce((sum, item) => sum + convertCurrency(item.outstandingAmount, item.currency || 'INR', selectedCurrency), 0);
  const netWorthValue = totalPortfolioValue - totalLiabilities;
  const totalInvestedPrincipal = totalSavings + totalFDPrincipal + totalMutualFundsInvested + totalLandedEstates + totalPreciousInvested;
  const overallProfit = totalPortfolioValue - totalInvestedPrincipal;
  const overallProfitPercent = totalInvestedPrincipal > 0 ? (overallProfit / totalInvestedPrincipal) * 100 : 0;

  // Percentage allocation
  const savingsPercent = totalPortfolioValue > 0 ? (totalSavings / totalPortfolioValue) * 100 : 0;
  const fdPercent = totalPortfolioValue > 0 ? (totalFDValue / totalPortfolioValue) * 100 : 0;
  const fundsPercent = totalPortfolioValue > 0 ? (totalMutualFundsCurrent / totalPortfolioValue) * 100 : 0;
  const landedEstatesPercent = totalPortfolioValue > 0 ? (totalLandedEstates / totalPortfolioValue) * 100 : 0;
  const preciousPercent = totalPortfolioValue > 0 ? (totalPreciousValue / totalPortfolioValue) * 100 : 0;

  // Mutual fund type breakdown
  const mutualFundsByType = (data.mutualFunds || []).reduce((acc, item) => {
    const type = item.investmentType || 'Lumpsum';
    const curr = item.currency || 'INR';
    const currentVal = convertCurrency(item.units * item.currentNav, curr, selectedCurrency);
    const investedVal = convertCurrency(item.units * item.averageNav, curr, selectedCurrency);
    
    if (!acc[type]) {
      acc[type] = { invested: 0, current: 0 };
    }
    acc[type].invested += investedVal;
    acc[type].current += currentVal;
    return acc;
  }, {} as Record<string, { invested: number; current: number }>);

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
    const landedHist = totalLandedEstates * (0.99 + idx * 0.002); // 2% annualized stable appreciation
    const preciousHist = totalPreciousValue * (0.97 + idx * 0.005);
    const total = savingsHist + fdHist + fundsHist + landedHist + preciousHist;

    return {
      month,
      savings: savingsHist,
      deposits: fdHist,
      funds: fundsHist,
      landed: landedHist,
      precious: preciousHist,
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
  const valRange = maxVal - minVal;

  // Map data to SVG coordinates
  const points = historyData.map((d, i) => {
    const x = paddingX + (i * (lineChartWidth - 2 * paddingX)) / (historyData.length - 1);
    const y = valRange === 0
      ? lineChartHeight - paddingY - (lineChartHeight - 2 * paddingY) / 2
      : lineChartHeight - paddingY - ((d.total - minVal) / valRange) * (lineChartHeight - 2 * paddingY);
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
  const landedStroke = (landedEstatesPercent / 100) * circumference;
  const preciousStroke = (preciousPercent / 100) * circumference;

  // Offsets (Standardized for continuous clockwise stacking)
  const savingsOffset = 0;
  const fdOffset = -savingsStroke;
  const fundsOffset = -(savingsStroke + fdStroke);
  const landedOffset = -(savingsStroke + fdStroke + fundsStroke);
  const preciousOffset = -(savingsStroke + fdStroke + fundsStroke + landedStroke);

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
        size === 2 ? 'col-span-1 xl:col-span-2' :
        'col-span-1 xl:col-span-3'
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
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Portfolio Growth Trend
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">Simulated 6-month growth based on current holdings</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-white/30 dark:bg-slate-800/30 rounded-lg p-1 text-[10px] font-semibold border border-white/40 dark:border-slate-700/30 w-fit max-w-full overflow-x-auto scrollbar-none z-10">
                {historyData.map((d, idx) => (
                  <button
                    key={d.month}
                    onClick={() => setActiveHistoryPoint(idx)}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                      activeHistoryPoint === idx 
                        ? 'bg-indigo-600 text-white shadow-sm font-bold' 
                        : 'text-slate-700 dark:text-slate-200 hover:bg-white/20 dark:hover:bg-slate-800/20'
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

              <div className={`mt-4 grid gap-2.5 bg-white/30 dark:bg-slate-950/40 backdrop-blur-md rounded-xl p-3.5 border border-white/40 dark:border-slate-800/40 text-xs ${
                size === 1 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-5'
              }`}>
                <div className="flex flex-col min-w-0 items-center text-center">
                  <span className="w-full block text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[9px] whitespace-nowrap overflow-hidden text-ellipsis text-center">Select Month</span>
                  <span className="w-full block font-display font-black text-slate-900 dark:text-white text-xs sm:text-sm whitespace-nowrap overflow-hidden text-ellipsis text-center">{activePoint.month} 2026</span>
                </div>
                <div className="flex flex-col min-w-0 items-center text-center">
                  <span className="w-full flex items-center justify-center gap-1 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[9px] whitespace-nowrap overflow-hidden text-ellipsis text-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500 shrink-0" /> Savings
                  </span>
                  <span className="w-full block font-mono font-bold text-sky-800 dark:text-sky-300 text-xs sm:text-sm whitespace-nowrap overflow-hidden text-ellipsis text-center">{formatCurrency(activePoint.savings)}</span>
                </div>
                <div className="flex flex-col min-w-0 items-center text-center">
                  <span className="w-full flex items-center justify-center gap-1 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[9px] whitespace-nowrap overflow-hidden text-ellipsis text-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" /> Fixed Deposits
                  </span>
                  <span className="w-full block font-mono font-bold text-amber-800 dark:text-amber-300 text-xs sm:text-sm whitespace-nowrap overflow-hidden text-ellipsis text-center">{formatCurrency(activePoint.deposits)}</span>
                </div>
                <div className="flex flex-col min-w-0 items-center text-center">
                  <span className="w-full flex items-center justify-center gap-1 text-indigo-700 dark:text-indigo-300 font-bold uppercase tracking-wider text-[9px] whitespace-nowrap overflow-hidden text-ellipsis text-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" /> Mutual Funds
                  </span>
                  <span className="w-full block font-mono font-bold text-indigo-800 dark:text-indigo-200 text-xs sm:text-sm whitespace-nowrap overflow-hidden text-ellipsis text-center">{formatCurrency(activePoint.funds)}</span>
                </div>
                <div className="flex flex-col min-w-0 items-center text-center">
                  <span className="w-full flex items-center justify-center gap-1 text-amber-500 dark:text-amber-400 font-bold uppercase tracking-wider text-[9px] whitespace-nowrap overflow-hidden text-ellipsis text-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 shrink-0" /> Precious
                  </span>
                  <span className="w-full block font-mono font-bold text-amber-600 dark:text-amber-300 text-xs sm:text-sm whitespace-nowrap overflow-hidden text-ellipsis text-center">{formatCurrency(activePoint.precious || 0)}</span>
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

                {landedStroke > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="#ec4899"
                    strokeWidth={hoveredSegment === 'landed' ? '14' : '10'}
                    strokeDasharray={`${landedStroke + 0.5} ${circumference}`}
                    strokeDashoffset={landedOffset}
                    onMouseEnter={() => setHoveredSegment('landed')}
                    onMouseLeave={() => setHoveredSegment(null)}
                    className="transition-all duration-300 cursor-pointer origin-center"
                  />
                )}

                {preciousStroke > 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="#eab308"
                    strokeWidth={hoveredSegment === 'precious' ? '14' : '10'}
                    strokeDasharray={`${preciousStroke + 0.5} ${circumference}`}
                    strokeDashoffset={preciousOffset}
                    onMouseEnter={() => setHoveredSegment('precious')}
                    onMouseLeave={() => setHoveredSegment(null)}
                    className="transition-all duration-300 cursor-pointer origin-center"
                  />
                )}
              </svg>

              <div className="absolute flex flex-col justify-center items-center text-center pointer-events-none select-none">
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase transition-all duration-300">
                  {hoveredSegment === 'savings' ? 'Savings' : hoveredSegment === 'deposits' ? 'Deposits' : hoveredSegment === 'funds' ? 'Mutual Funds' : hoveredSegment === 'landed' ? 'Properties' : hoveredSegment === 'precious' ? 'Gold & Ornaments' : 'Active'}
                </span>
                <span className="text-lg font-display font-black text-slate-900 dark:text-slate-100 transition-all duration-300">
                  {hoveredSegment === 'savings' ? `${savingsPercent.toFixed(1)}%` : hoveredSegment === 'deposits' ? `${fdPercent.toFixed(1)}%` : hoveredSegment === 'funds' ? `${fundsPercent.toFixed(1)}%` : hoveredSegment === 'landed' ? `${landedEstatesPercent.toFixed(1)}%` : hoveredSegment === 'precious' ? `${preciousPercent.toFixed(1)}%` : '100%'}
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

              <div 
                onMouseEnter={() => setHoveredSegment('landed')}
                onMouseLeave={() => setHoveredSegment(null)}
                className={`flex justify-between items-center p-2 rounded-xl border transition-all ${
                  hoveredSegment === 'landed' ? 'bg-white/40 border-pink-300/50 shadow-sm' : 'border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-pink-500 border border-white/40" />
                  <span className="font-medium text-slate-600 dark:text-slate-200">Landed Estates</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{landedEstatesPercent.toFixed(1)}%</span>
              </div>

              <div 
                onMouseEnter={() => setHoveredSegment('precious')}
                onMouseLeave={() => setHoveredSegment(null)}
                className={`flex justify-between items-center p-2 rounded-xl border transition-all ${
                  hoveredSegment === 'precious' ? 'bg-white/40 border-yellow-300/50 shadow-sm' : 'border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-yellow-500 border border-white/40" />
                  <span className="font-medium text-slate-600 dark:text-slate-200">Gold & Ornaments</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{preciousPercent.toFixed(1)}%</span>
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
                {(() => {
                  const maxVal = Math.max(totalMutualFundsCurrent, totalMutualFundsInvested) || 1;
                  return (
                    <>
                      <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span className="text-slate-500 font-medium">Current Portfolio Value</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(totalMutualFundsCurrent)}</span>
                        </div>
                        <div className="w-full bg-slate-200/40 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full" 
                            style={{ width: `${totalMutualFundsCurrent > 0 ? (totalMutualFundsCurrent / maxVal) * 100 : 0}%` }}
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
                            style={{ width: `${totalMutualFundsInvested > 0 ? (totalMutualFundsInvested / maxVal) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Investment Type Breakdown */}
                      <div className="mt-4 pt-3 border-t border-slate-200/10">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2">Breakdown by Type</div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          {['Lumpsum', 'SIP', 'SWP'].map(type => {
                            const stats = mutualFundsByType[type] || { invested: 0, current: 0 };
                            const profit = stats.current - stats.invested;
                            return (
                              <div key={type} className="p-1.5 rounded-xl bg-slate-500/5 dark:bg-slate-400/5 border border-slate-200/10">
                                <div className="text-[9px] uppercase font-extrabold text-slate-500">{type}</div>
                                <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate" title={formatCurrency(stats.current)}>
                                  {formatCurrency(stats.current)}
                                </div>
                                {stats.invested > 0 ? (
                                  <div className={`text-[9px] font-bold ${profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                                    {profit >= 0 ? '+' : ''}{((profit / stats.invested) * 100).toFixed(0)}%
                                  </div>
                                ) : (
                                  <div className="text-[9px] text-slate-400">—</div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  );
                })()}
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

              {preciousPercent > 0 && (
                <div className="flex gap-3 bg-white/25 dark:bg-slate-800/35 rounded-xl p-3 border border-white/40 dark:border-white/10 text-xs">
                  <Coins className="h-5 w-5 text-yellow-500 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">Inflation Hedge Status</span>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
                      Your precious reserves represent <b>{preciousPercent.toFixed(0)}%</b> of your portfolio. Precious metals and gems act as a robust hedge against currency dilution.
                    </p>
                  </div>
                </div>
              )}
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

    if (widgetId === 'precious') {
      const reserves = data.preciousAssets || [];
      return (
        <div key="precious" {...containerProps}>
          {renderControls()}
          <GlassCard hoverable onClick={() => setActiveTab('precious')} className="cursor-pointer flex flex-col justify-between h-full relative overflow-hidden pt-14 px-6 pb-6">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Coins className="h-3 w-3 text-amber-500" />
                    Vault Reserves Value
                  </h4>
                  <h3 className="text-xl font-display font-black text-slate-900 dark:text-slate-100 mt-1">
                    {formatCurrency(totalPreciousValue)}
                  </h3>
                </div>
                <div className="text-[9px] bg-amber-500/10 text-amber-600 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                  {reserves.length} Reserves
                </div>
              </div>

              {reserves.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 font-medium">
                  No precious reserves added yet. Click to record ornaments or bars/coins.
                </div>
              ) : (
                <div className="space-y-2 mt-4 max-h-[140px] overflow-y-auto pr-1">
                  {reserves.slice(0, 3).map((asset, idx) => {
                    const usdVal = calculatePreciousAssetUSD(asset, metalRates);
                    const convertedVal = usdVal * exchangeRate;
                    return (
                      <div key={asset.id || idx} className="flex justify-between items-center p-2 rounded-xl bg-white/30 dark:bg-slate-800/20 border border-white/20 dark:border-white/5 hover:bg-white/50 transition-all text-xs">
                        <div className="min-w-0 mr-2">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">{asset.name}</span>
                          <span className="text-[9px] text-slate-500 block truncate">
                            {asset.type} • {asset.weight} {asset.unit} {asset.karat ? `(${asset.karat})` : asset.purity ? `(${asset.purity})` : ''}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 shrink-0">
                          {formatCurrency(convertedVal)}
                        </span>
                      </div>
                    );
                  })}
                  {reserves.length > 3 && (
                    <p className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 text-center uppercase tracking-wide mt-1">
                      + {reserves.length - 3} more precious reserves
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/20 flex justify-between items-center text-[10px] font-semibold text-indigo-800 dark:text-indigo-400">
              <span className="uppercase tracking-wider">Gold, Silver & Gems Vault</span>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveTab('precious'); }}
                className="flex items-center gap-0.5 hover:underline text-indigo-600 dark:text-indigo-300 font-bold cursor-pointer bg-transparent border-none p-0"
              >
                Unlock Vault <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </GlassCard>
          {/* Resize drag handle */}
          <div 
            onMouseDown={(e) => handleResizeStart(e, 'precious')}
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

    if (widgetId === 'landedEstates') {
      const estates = data.immovableAssets || [];
      return (
        <div key="landedEstates" {...containerProps}>
          {renderControls()}
          <GlassCard hoverable onClick={() => setActiveTab('terrafirma')} className="cursor-pointer flex flex-col justify-between h-full relative overflow-hidden pt-14 px-6 pb-6">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-pink-500" />
                    Landed Estates Inventory
                  </h4>
                  <h3 className="text-xl font-display font-black text-slate-900 dark:text-slate-100 mt-1">
                    {formatCurrency(totalLandedEstates)}
                  </h3>
                </div>
                <div className="text-[9px] bg-pink-500/10 text-pink-500 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                  {estates.length} Assets
                </div>
              </div>

              {estates.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 font-medium">
                  No immovable properties added yet. Click to record property.
                </div>
              ) : (
                <div className="space-y-2 mt-4 max-h-[140px] overflow-y-auto pr-1">
                  {estates.slice(0, 3).map((estate, idx) => (
                    <div key={estate.id || idx} className="flex justify-between items-center p-2 rounded-xl bg-white/30 dark:bg-slate-800/20 border border-white/20 dark:border-white/5 hover:bg-white/50 transition-all text-xs">
                      <div className="min-w-0 mr-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">{estate.propertyName}</span>
                        <span className="text-[9px] text-slate-500 block truncate">{estate.area} {estate.unit} • {estate.locationName || 'Unspecified'}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100 shrink-0">
                        {formatCurrency(convertCurrency(estate.estimatedValue, estate.currency || 'INR', selectedCurrency))}
                      </span>
                    </div>
                  ))}
                  {estates.length > 3 && (
                    <p className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 text-center uppercase tracking-wide mt-1">
                      + {estates.length - 3} more properties
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/20 flex justify-between items-center text-[10px] font-semibold text-indigo-800 dark:text-indigo-400">
              <span className="uppercase tracking-wider">Property & Land Holdings</span>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveTab('terrafirma'); }}
                className="flex items-center gap-0.5 hover:underline text-indigo-600 dark:text-indigo-300 font-bold cursor-pointer bg-transparent border-none p-0"
              >
                View Inventory <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </GlassCard>
          {/* Resize drag handle */}
          <div 
            onMouseDown={(e) => handleResizeStart(e, 'landedEstates')}
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

    if (widgetId === 'insurances') {
      const policies = data.insurances || [];
      const activePolicies = policies.filter(p => p.status === 'Active');
      return (
        <div key="insurances" {...containerProps}>
          {renderControls()}
          <GlassCard hoverable onClick={() => setActiveTab('insurances')} className="cursor-pointer flex flex-col justify-between h-full relative overflow-hidden pt-14 px-6 pb-6">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                    InsureShield Coverage
                  </h4>
                  <h3 className="text-xl font-display font-black text-slate-900 dark:text-slate-100 mt-1">
                    {formatCurrency(totalInsuranceCover)}
                  </h3>
                </div>
                <div className="text-[9px] bg-emerald-500/10 text-emerald-500 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                  {activePolicies.length} Active
                </div>
              </div>

              {policies.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 font-medium">
                  No protection policies tracked yet. Click to record policy.
                </div>
              ) : (
                <div className="space-y-2 mt-4 max-h-[140px] overflow-y-auto pr-1">
                  {policies.slice(0, 3).map((policy, idx) => {
                    // Check if policy has premium due soon
                    const isUrgent = policy.status === 'Active' && policy.dueDate && (() => {
                      const diff = new Date(policy.dueDate).getTime() - new Date().getTime();
                      return diff > 0 && diff < (15 * 24 * 60 * 60 * 1000); // 15 days
                    })();

                    return (
                      <div key={policy.id || idx} className={`flex justify-between items-center p-2 rounded-xl border transition-all text-xs ${
                        isUrgent 
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-250' 
                          : 'bg-white/30 dark:bg-slate-800/20 border-white/20 dark:border-white/5 hover:bg-white/50'
                      }`}>
                        <div className="min-w-0 mr-2">
                          <span className="font-bold block truncate">{policy.policyName}</span>
                          <span className="text-[9px] text-slate-500 block truncate">
                            {policy.policyType} • Due: {policy.dueDate || 'N/A'}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold block">
                            {formatCurrency(convertCurrency(policy.sumAssured, policy.currency || 'INR', selectedCurrency))}
                          </span>
                          <span className="text-[8px] text-slate-400 block font-sans">
                            Prem: {formatCurrency(convertCurrency(policy.premiumAmount, policy.currency || 'INR', selectedCurrency))}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {policies.length > 3 && (
                    <p className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 text-center uppercase tracking-wide mt-1">
                      + {policies.length - 3} more insurance policies
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/20 flex justify-between items-center text-[10px] font-semibold text-indigo-800 dark:text-indigo-400">
              <span className="uppercase tracking-wider truncate mr-1">Premium Burden: {formatCurrency(totalMonthlyPremium)}/mo</span>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveTab('insurances'); }}
                className="flex items-center gap-0.5 hover:underline text-indigo-600 dark:text-indigo-300 font-bold cursor-pointer bg-transparent border-none p-0 shrink-0"
              >
                View Policies <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </GlassCard>
          {/* Resize drag handle */}
          <div 
            onMouseDown={(e) => handleResizeStart(e, 'insurances')}
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

    if (widgetId === 'savings') {
      const accounts = data.bankSavings || [];
      return (
        <div key="savings" {...containerProps}>
          {renderControls()}
          <GlassCard hoverable onClick={() => setActiveTab('savings')} className="cursor-pointer flex flex-col justify-between h-full relative overflow-hidden pt-14 px-6 pb-6">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Landmark className="h-3 w-3 text-sky-500" />
                    Active Savings Accounts
                  </h4>
                  <h3 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-slate-100 mt-1 whitespace-nowrap">
                    {formatCurrency(totalSavings)}
                  </h3>
                </div>
                <div className="text-[9px] bg-sky-500/10 text-sky-500 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                  {accounts.length} Accounts
                </div>
              </div>

              {accounts.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 font-medium">
                  No bank accounts tracked yet. Click to record one.
                </div>
              ) : (
                <div className={`mt-4 ${size === 1 ? 'space-y-2 max-h-[140px] overflow-y-auto' : 'grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto'} pr-1`}>
                  {accounts.slice(0, size === 1 ? 3 : 6).map((acc, idx) => {
                    const pctOfTotal = totalSavings > 0 ? (convertCurrency(acc.balance, acc.currency || 'INR', selectedCurrency) / totalSavings) * 100 : 0;
                    return (
                      <div key={acc.id || idx} className="p-2.5 rounded-xl border transition-all text-xs bg-white/30 dark:bg-slate-800/20 border-white/20 dark:border-white/5 hover:bg-white/50 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <span className="font-bold block truncate text-slate-850 dark:text-slate-100">{acc.bankName}</span>
                            <span className="text-[9px] text-slate-500 dark:text-slate-400 block truncate whitespace-nowrap">
                              {acc.accountType} • {acc.interestRate.toFixed(2)}% APY
                            </span>
                          </div>
                          <div className="text-right shrink-0 font-mono font-bold text-slate-900 dark:text-slate-50">
                            {formatCurrency(convertCurrency(acc.balance, acc.currency || 'INR', selectedCurrency))}
                          </div>
                        </div>
                        {size > 1 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-200/10">
                            <div className="flex justify-between text-[8px] text-slate-400 font-semibold mb-1">
                              <span>Allocation Share</span>
                              <span>{pctOfTotal.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-slate-200/30 dark:bg-slate-700/30 h-1 rounded-full overflow-hidden">
                              <div className="bg-sky-500 h-full rounded-full" style={{ width: `${pctOfTotal}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/20 flex justify-between items-center text-[10px] font-semibold text-indigo-800 dark:text-indigo-400">
              <span className="uppercase tracking-wider truncate mr-1">Liquid Capital</span>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveTab('savings'); }}
                className="flex items-center gap-0.5 hover:underline text-indigo-600 dark:text-indigo-300 font-bold cursor-pointer bg-transparent border-none p-0 shrink-0"
              >
                View Savings <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </GlassCard>
          {/* Resize drag handle */}
          <div 
            onMouseDown={(e) => handleResizeStart(e, 'savings')}
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

    if (widgetId === 'deposits') {
      const deposits = data.fixedDeposits || [];
      return (
        <div key="deposits" {...containerProps}>
          {renderControls()}
          <GlassCard hoverable onClick={() => setActiveTab('deposits')} className="cursor-pointer flex flex-col justify-between h-full relative overflow-hidden pt-14 px-6 pb-6">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <RupeeCoin className="h-3 w-3 text-amber-500" />
                    Fixed Deposits / CDs
                  </h4>
                  <h3 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-slate-100 mt-1 whitespace-nowrap">
                    {formatCurrency(totalFDPrincipal)}
                  </h3>
                </div>
                <div className="text-[9px] bg-amber-500/10 text-amber-600 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                  {deposits.length} FDs
                </div>
              </div>

              {deposits.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 font-medium">
                  No fixed deposits tracked yet. Click to record one.
                </div>
              ) : (
                <div className={`mt-4 ${size === 1 ? 'space-y-2 max-h-[140px] overflow-y-auto' : 'grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto'} pr-1`}>
                  {deposits.slice(0, size === 1 ? 3 : 6).map((fd, idx) => {
                    let progressPct = 50; // Default if dates are missing
                    if (fd.startDate && fd.maturityDate) {
                      const sTime = new Date(fd.startDate).getTime();
                      const mTime = new Date(fd.maturityDate).getTime();
                      const nowTime = new Date().getTime();
                      if (mTime > sTime && nowTime > sTime) {
                        progressPct = Math.min(100, Math.max(0, ((nowTime - sTime) / (mTime - sTime)) * 100));
                      }
                    }
                    return (
                      <div key={fd.id || idx} className="p-2.5 rounded-xl border transition-all text-xs bg-white/30 dark:bg-slate-800/20 border-white/20 dark:border-white/5 hover:bg-white/50 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <span className="font-bold block truncate text-slate-850 dark:text-slate-100">{fd.bankName}</span>
                            <span className="text-[9px] text-slate-500 dark:text-slate-400 block truncate whitespace-nowrap">
                              {fd.interestRate.toFixed(2)}% APY • Due: {fd.maturityDate || 'N/A'}
                            </span>
                          </div>
                          <div className="text-right shrink-0 font-mono font-bold text-slate-900 dark:text-slate-50">
                            {formatCurrency(convertCurrency(fd.principal, fd.currency || 'INR', selectedCurrency))}
                          </div>
                        </div>
                        {size > 1 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-200/10">
                            <div className="flex justify-between text-[8px] text-slate-400 font-semibold mb-1">
                              <span>Maturity Progress</span>
                              <span>{progressPct.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-slate-200/30 dark:bg-slate-700/30 h-1 rounded-full overflow-hidden">
                              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${progressPct}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/20 flex justify-between items-center text-[10px] font-semibold text-indigo-800 dark:text-indigo-400">
              <span className="uppercase tracking-wider truncate mr-1">Secured Income</span>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveTab('deposits'); }}
                className="flex items-center gap-0.5 hover:underline text-indigo-600 dark:text-indigo-300 font-bold cursor-pointer bg-transparent border-none p-0 shrink-0"
              >
                View Deposits <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </GlassCard>
          {/* Resize drag handle */}
          <div 
            onMouseDown={(e) => handleResizeStart(e, 'deposits')}
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

    if (widgetId === 'liabilities') {
      const liabilitiesList = data.liabilities || [];
      const totalMonthlyRepayment = liabilitiesList.reduce((sum, item) => sum + convertCurrency(item.monthlyPayment || 0, item.currency || 'INR', selectedCurrency), 0);
      return (
        <div key="liabilities" {...containerProps}>
          {renderControls()}
          <GlassCard hoverable onClick={() => setActiveTab('liabilities')} className="cursor-pointer flex flex-col justify-between h-full relative overflow-hidden pt-14 px-6 pb-6">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-rose-500 rotate-180" />
                    Outstanding Debt
                  </h4>
                  <h3 className="text-xl sm:text-2xl font-display font-black text-rose-600 dark:text-rose-400 mt-1 whitespace-nowrap">
                    {formatCurrency(totalLiabilities)}
                  </h3>
                </div>
                <div className="text-[9px] bg-rose-500/10 text-rose-500 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                  {liabilitiesList.length} Debts
                </div>
              </div>

              {liabilitiesList.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 font-medium">
                  No liability accounts tracked. Click to record debt.
                </div>
              ) : (
                <div className={`mt-4 ${size === 1 ? 'space-y-2 max-h-[140px] overflow-y-auto' : 'grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto'} pr-1`}>
                  {liabilitiesList.slice(0, size === 1 ? 3 : 6).map((item, idx) => {
                    const original = item.totalAmount || item.outstandingAmount || 1;
                    const paidOffPct = Math.min(100, Math.max(0, ((original - item.outstandingAmount) / original) * 100));
                    return (
                      <div key={item.id || idx} className="p-2.5 rounded-xl border transition-all text-xs bg-white/30 dark:bg-slate-800/20 border-white/20 dark:border-white/5 hover:bg-white/50 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <span className="font-bold block truncate text-slate-850 dark:text-slate-100">{item.lenderName}</span>
                            <span className="text-[9px] text-slate-500 dark:text-slate-400 block truncate whitespace-nowrap">
                              {item.liabilityType} • {item.interestRate.toFixed(2)}%
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono font-bold block whitespace-nowrap text-rose-600 dark:text-rose-400">
                              {formatCurrency(convertCurrency(item.outstandingAmount, item.currency || 'INR', selectedCurrency))}
                            </span>
                            <span className="text-[8px] text-slate-400 dark:text-slate-500 block font-sans">
                              EMI: {formatCurrency(convertCurrency(item.monthlyPayment || 0, item.currency || 'INR', selectedCurrency))}
                            </span>
                          </div>
                        </div>
                        {size > 1 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-200/10">
                            <div className="flex justify-between text-[8px] text-slate-400 font-semibold mb-1">
                              <span>Paid Off Progress</span>
                              <span>{paidOffPct.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-slate-200/30 dark:bg-slate-700/30 h-1 rounded-full overflow-hidden">
                              <div className="bg-rose-500 h-full rounded-full" style={{ width: `${paidOffPct}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/20 flex justify-between items-center text-[10px] font-semibold text-rose-800 dark:text-rose-455">
              <span className="uppercase tracking-wider truncate mr-1">EMI Burden: {formatCurrency(totalMonthlyRepayment)}/mo</span>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveTab('liabilities'); }}
                className="flex items-center gap-0.5 hover:underline text-indigo-600 dark:text-indigo-300 font-bold cursor-pointer bg-transparent border-none p-0 shrink-0"
              >
                View Ledger <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </GlassCard>
          {/* Resize drag handle */}
          <div 
            onMouseDown={(e) => handleResizeStart(e, 'liabilities')}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-8 gap-4">
        {/* Net Worth Card */}
        <GlassCard className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-1 bg-gradient-to-br from-indigo-500/20 to-violet-500/10 border-indigo-200/30 flex flex-col justify-between p-5 min-h-[145px]">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-300 text-[10px] font-bold tracking-wider uppercase mr-1">Estimated Net Worth</span>
              <div className="p-2 bg-indigo-500/15 rounded-xl border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 shrink-0">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-slate-100 tracking-tight whitespace-nowrap" title={formatCurrency(netWorthValue)}>
                {formatCurrency(netWorthValue)}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-[10px] font-medium font-sans pt-2 border-t border-slate-200/10">
            <span className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold shrink-0 ${overallProfit >= 0 ? 'bg-emerald-500/20 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-rose-500/20 text-rose-800 dark:bg-rose-500/10 dark:text-rose-300'}`}>
              {overallProfit >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {overallProfit >= 0 ? '+' : ''}{overallProfitPercent.toFixed(1)}%
            </span>
            <span className="text-slate-500 dark:text-slate-400 break-words font-semibold" title={`Assets: ${formatCurrency(totalPortfolioValue)}, Debt: ${formatCurrency(totalLiabilities)}`}>
              Assets: {formatCurrency(totalPortfolioValue)}
            </span>
          </div>
        </GlassCard>

        {/* Bank Savings Card */}
        <GlassCard hoverable onClick={() => setActiveTab('savings')} className="cursor-pointer flex flex-col justify-between p-5 min-h-[145px]">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-300 text-[10px] font-bold tracking-wider uppercase mr-1">Bank Savings</span>
              <div className="p-2 bg-sky-500/15 rounded-xl text-sky-700 dark:text-sky-355 shrink-0">
                <Landmark className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-slate-100 tracking-tight whitespace-nowrap" title={formatCurrency(totalSavings)}>
                {formatCurrency(totalSavings)}
              </h3>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 text-[10px] text-slate-500 pt-2 border-t border-slate-200/20 font-medium font-sans">
            <span className="break-words">{data.bankSavings.length} Accounts</span>
            <span 
              onClick={(e) => { e.stopPropagation(); setActiveTab('savings'); }}
              className="font-bold text-indigo-850 dark:text-indigo-300 flex items-center hover:underline cursor-pointer shrink-0"
            >
              Manage <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </GlassCard>

        {/* Fixed Deposits Card */}
        <GlassCard hoverable onClick={() => setActiveTab('deposits')} className="cursor-pointer flex flex-col justify-between p-5 min-h-[145px]">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-300 text-[10px] font-bold tracking-wider uppercase mr-1">Fixed Deposits</span>
              <div className="p-2 bg-amber-500/15 rounded-xl text-amber-700 dark:text-amber-355 shrink-0">
                <RupeeCoin className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-slate-100 tracking-tight whitespace-nowrap" title={formatCurrency(totalFDValue)}>
                {formatCurrency(totalFDValue)}
              </h3>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 text-[10px] text-slate-500 pt-2 border-t border-slate-200/20 font-medium font-sans">
            <span className="break-words">{data.fixedDeposits.length} Active CDs</span>
            <span 
              onClick={(e) => { e.stopPropagation(); setActiveTab('deposits'); }}
              className="font-bold text-indigo-850 dark:text-indigo-300 flex items-center hover:underline cursor-pointer shrink-0"
            >
              Manage <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </GlassCard>

        {/* Mutual Funds Card */}
        <GlassCard hoverable onClick={() => setActiveTab('funds')} className="cursor-pointer flex flex-col justify-between p-5 min-h-[145px]">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-300 text-[10px] font-bold tracking-wider uppercase mr-1">Mutual Funds</span>
              <div className="p-2 bg-indigo-500/15 rounded-xl text-indigo-700 dark:text-indigo-355 shrink-0">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-slate-100 tracking-tight whitespace-nowrap" title={formatCurrency(totalMutualFundsCurrent)}>
                {formatCurrency(totalMutualFundsCurrent)}
              </h3>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 text-[10px] text-slate-500 pt-2 border-t border-slate-200/20 font-medium font-sans">
            <span className={`break-words font-semibold ${mutualFundsProfit >= 0 ? 'text-emerald-600 dark:text-emerald-450' : 'text-rose-600 dark:text-rose-400'}`}>
              {mutualFundsProfit >= 0 ? '+' : ''}{mutualFundsProfitPercent.toFixed(1)}% Return
            </span>
            <span 
              onClick={(e) => { e.stopPropagation(); setActiveTab('funds'); }}
              className="font-bold text-indigo-850 dark:text-indigo-300 flex items-center hover:underline cursor-pointer shrink-0"
            >
              Growth <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </GlassCard>

        {/* Landed Estates Card */}
        <GlassCard hoverable onClick={() => setActiveTab('terrafirma')} className="cursor-pointer flex flex-col justify-between p-5 min-h-[145px]">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-300 text-[10px] font-bold tracking-wider uppercase mr-1">Landed Estates</span>
              <div className="p-2 bg-pink-500/15 rounded-xl text-pink-750 dark:text-pink-355 shrink-0">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-slate-100 tracking-tight whitespace-nowrap" title={formatCurrency(totalLandedEstates)}>
                {formatCurrency(totalLandedEstates)}
              </h3>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 text-[10px] text-slate-500 pt-2 border-t border-slate-200/20 font-medium font-sans">
            <span className="break-words">{(data.immovableAssets || []).length} Holdings</span>
            <span 
              onClick={(e) => { e.stopPropagation(); setActiveTab('terrafirma'); }}
              className="font-bold text-indigo-850 dark:text-indigo-300 flex items-center hover:underline cursor-pointer shrink-0"
            >
              Manage <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </GlassCard>

        {/* Gold & Ornaments Card */}
        <GlassCard hoverable onClick={() => setActiveTab('precious')} className="cursor-pointer flex flex-col justify-between p-5 min-h-[145px]">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-300 text-[10px] font-bold tracking-wider uppercase mr-1">Gold & Ornaments</span>
              <div className="p-2 bg-yellow-500/15 rounded-xl text-yellow-700 dark:text-yellow-355 shrink-0">
                <Coins className="h-4 w-4 text-yellow-600 animate-pulse" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-slate-100 tracking-tight whitespace-nowrap" title={formatCurrency(totalPreciousValue)}>
                {formatCurrency(totalPreciousValue)}
              </h3>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 text-[10px] text-slate-500 pt-2 border-t border-slate-200/20 font-medium font-sans">
            <span className="break-words">{(data.preciousAssets || []).length} Reserves</span>
            <span 
              onClick={(e) => { e.stopPropagation(); setActiveTab('precious'); }}
              className="font-bold text-indigo-850 dark:text-indigo-300 flex items-center hover:underline cursor-pointer shrink-0"
            >
              Vault <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </GlassCard>

        {/* InsureShield Card */}
        <GlassCard hoverable onClick={() => setActiveTab('insurances')} className="cursor-pointer flex flex-col justify-between p-5 min-h-[145px]">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-300 text-[10px] font-bold tracking-wider uppercase mr-1">Active Coverage</span>
              <div className="p-2 bg-emerald-500/15 rounded-xl text-emerald-700 dark:text-emerald-355 shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-slate-100 tracking-tight whitespace-nowrap" title={formatCurrency(totalInsuranceCover)}>
                {formatCurrency(totalInsuranceCover)}
              </h3>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 text-[10px] text-slate-500 pt-2 border-t border-slate-200/20 font-medium font-sans">
            <span className="break-words">Prem: {formatCurrency(totalMonthlyPremium)}/mo</span>
            <span 
              onClick={(e) => { e.stopPropagation(); setActiveTab('insurances'); }}
              className="font-bold text-indigo-850 dark:text-indigo-300 flex items-center hover:underline cursor-pointer shrink-0"
            >
              Manage <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </GlassCard>

        {/* Liabilities Card */}
        <GlassCard hoverable onClick={() => setActiveTab('liabilities')} className="cursor-pointer flex flex-col justify-between p-5 min-h-[145px] border-rose-500/15 dark:border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 transition-all">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-300 text-[10px] font-bold tracking-wider uppercase mr-1">Outstanding Debt</span>
              <div className="p-2 bg-rose-500/15 rounded-xl text-rose-700 dark:text-rose-300 shrink-0">
                <TrendingUp className="h-4 w-4 rotate-180" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-xl sm:text-2xl font-display font-black text-rose-600 dark:text-rose-400 tracking-tight whitespace-nowrap" title={formatCurrency(totalLiabilities)}>
                {formatCurrency(totalLiabilities)}
              </h3>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 text-[10px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/20 font-medium font-sans">
            <span className="break-words">{(data.liabilities || []).length} Debts</span>
            <span 
              onClick={(e) => { e.stopPropagation(); setActiveTab('liabilities'); }}
              className="font-bold text-indigo-850 dark:text-indigo-300 flex items-center hover:underline cursor-pointer shrink-0"
            >
              Ledger <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </GlassCard>
      </div>

      {/* Main Charts & Analytics Section (Movable Draggable Grid) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {widgetOrder.map((widgetId, index) => renderWidget(widgetId, index))}
      </div>

    </div>
  );
};
