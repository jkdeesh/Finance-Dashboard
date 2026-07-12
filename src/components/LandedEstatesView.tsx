import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  Maximize2, 
  TrendingUp, 
  Info, 
  Coins, 
  ArrowLeft, 
  Check, 
  X,
  Map as MapIcon, 
  Globe,
  AlertTriangle
} from 'lucide-react';
import { ImmovableAsset, CurrencyCode, CURRENCIES, convertCurrency } from '../types';
import { GlassCard } from './GlassCard';

interface LandedEstatesViewProps {
  assets: ImmovableAsset[];
  onAddAsset: (asset: Omit<ImmovableAsset, 'id'>) => void;
  onEditAsset: (asset: ImmovableAsset) => void;
  onDeleteAsset: (id: string) => void;
  selectedCurrency: CurrencyCode;
  onBackToDashboard: () => void;
  selectedUserIds: string[];
}

export function LandedEstatesView({
  assets,
  onAddAsset,
  onEditAsset,
  onDeleteAsset,
  selectedCurrency,
  onBackToDashboard,
  selectedUserIds
}: LandedEstatesViewProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<ImmovableAsset | null>(null);
  const [selectedAssetForMap, setSelectedAssetForMap] = useState<ImmovableAsset | null>(null);
  const [mapMode, setMapMode] = useState<'m' | 'h'>('m');
  const [assetToDelete, setAssetToDelete] = useState<ImmovableAsset | null>(null);

  const formatCurrency = (val: number, curr?: CurrencyCode) => {
    const config = CURRENCIES[curr || selectedCurrency] || CURRENCIES.INR;
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Form States
  const [propertyName, setPropertyName] = useState('');
  const [propertyType, setPropertyType] = useState('Residential');
  const [area, setArea] = useState('');
  const [unit, setUnit] = useState<'sqft' | 'cents' | 'grounds' | 'acres' | 'hectares'>('sqft');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [notes, setNotes] = useState('');
  const [ownerIdsInput, setOwnerIdsInput] = useState('');

  // Set the first item as the active map selection if available
  useState(() => {
    if (assets.length > 0) {
      setSelectedAssetForMap(assets[0]);
    }
  });

  // Automatically update selected map asset if assets list changes or selection is invalid
  const activeMapAsset = useMemo(() => {
    if (!selectedAssetForMap && assets.length > 0) {
      return assets[0];
    }
    if (selectedAssetForMap && !assets.some(a => a.id === selectedAssetForMap.id)) {
      return assets[0] || null;
    }
    return selectedAssetForMap || assets[0] || null;
  }, [assets, selectedAssetForMap]);

  // Aggregate stats
  const totalValue = useMemo(() => {
    return assets.reduce((sum, asset) => {
      const assetCurr = asset.currency || 'INR';
      const converted = convertCurrency(asset.estimatedValue, assetCurr, selectedCurrency);
      return sum + converted;
    }, 0);
  }, [assets, selectedCurrency]);

  const currencySymbol = CURRENCIES[selectedCurrency].symbol;

  const handleOpenAddModal = () => {
    setPropertyName('');
    setPropertyType('Residential');
    setArea('');
    setUnit('sqft');
    setLocationName('');
    // Defaults near India's central/major hubs as logical centers
    setLatitude('12.9716'); 
    setLongitude('77.5946');
    setEstimatedValue('');
    setNotes('');
    setOwnerIdsInput(selectedUserIds.join(', '));
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (asset: ImmovableAsset) => {
    setEditingAsset(asset);
    setPropertyName(asset.propertyName);
    setPropertyType(asset.propertyType);
    setArea(String(asset.area));
    setUnit(asset.unit);
    setLocationName(asset.locationName);
    setLatitude(String(asset.latitude));
    setLongitude(String(asset.longitude));
    setEstimatedValue(String(asset.estimatedValue));
    setNotes(asset.notes || '');
    setOwnerIdsInput(asset.ownerIds.join(', '));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyName || !area || !estimatedValue) return;

    onAddAsset({
      propertyName,
      propertyType,
      area: Number(area),
      unit,
      locationName,
      latitude: Number(latitude) || 0,
      longitude: Number(longitude) || 0,
      estimatedValue: Number(estimatedValue),
      currency: selectedCurrency,
      notes: notes || undefined,
      ownerIds: ownerIdsInput ? ownerIdsInput.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : [...selectedUserIds]
    });

    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset || !propertyName || !area || !estimatedValue) return;

    onEditAsset({
      ...editingAsset,
      propertyName,
      propertyType,
      area: Number(area),
      unit,
      locationName,
      latitude: Number(latitude) || 0,
      longitude: Number(longitude) || 0,
      estimatedValue: Number(estimatedValue),
      currency: editingAsset.currency || selectedCurrency,
      notes: notes || undefined,
      ownerIds: ownerIdsInput ? ownerIdsInput.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : [...editingAsset.ownerIds]
    });

    setEditingAsset(null);
  };

  return (
    <div id="landed-estates-container" className="space-y-6">
      {/* Header section with Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            id="back-btn"
            onClick={onBackToDashboard}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2 uppercase">
              <Building2 className="h-6 w-6 text-indigo-400" />
              Landed Estates
            </h1>
            <p className="text-xs text-slate-300">Immovable Assets & Real Estate Holdings</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <GlassCard id="total-value-card" className="px-5 py-2.5 flex items-center gap-4 border border-white/10">
            <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-lg">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Properties Value</p>
              <h2 className="text-lg md:text-xl font-extrabold text-white">
                {formatCurrency(totalValue)}
              </h2>
            </div>
          </GlassCard>

          <button
            id="add-property-btn"
            onClick={handleOpenAddModal}
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-650/30 flex items-center gap-1.5 uppercase cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {/* Main Grid layout: List + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Property Listings */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-xs font-extrabold uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-indigo-400" />
            Property Inventory ({assets.length})
          </h3>

          {assets.length === 0 ? (
            <GlassCard id="empty-assets-card" className="p-12 text-center border border-white/5 flex flex-col items-center justify-center">
              <div className="p-4 bg-white/5 rounded-full text-slate-400 mb-4">
                <Building2 className="h-8 w-8" />
              </div>
              <p className="text-sm font-semibold text-white">No immovable assets tracked yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Track apartments, commercial stores, plots of land, and warehouses to complete your net-worth portfolio.
              </p>
              <button
                id="empty-add-btn"
                onClick={handleOpenAddModal}
                className="mt-4 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Log First Property
              </button>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {assets.map((asset) => {
                const assetCurr = asset.currency || 'INR';
                const converted = convertCurrency(asset.estimatedValue, assetCurr, selectedCurrency);
                const isSelected = activeMapAsset?.id === asset.id;

                return (
                  <motion.div
                    key={asset.id}
                    layoutId={`asset-card-${asset.id}`}
                    onClick={() => setSelectedAssetForMap(asset)}
                    className={`p-4 rounded-xl cursor-pointer border transition-all flex justify-between gap-4 relative group ${
                      isSelected 
                        ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-650/10' 
                        : 'bg-white/5 hover:bg-white/8 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-2.5">
                        <div className={`p-2 rounded-lg ${
                          isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-slate-300'
                        }`}>
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs tracking-wide text-white">{asset.propertyName}</h4>
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-[10px] text-slate-400">
                            <span className="px-1.5 py-0.5 bg-white/5 text-slate-300 rounded font-semibold text-[9px] uppercase">
                              {asset.propertyType}
                            </span>
                            <span className="flex items-center gap-0.5 text-slate-300 font-medium">
                              <Maximize2 className="h-3 w-3 text-slate-400" />
                              {asset.area} {asset.unit}
                            </span>
                          </div>
                        </div>
                      </div>

                      {asset.locationName && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 pl-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{asset.locationName}</span>
                        </div>
                      )}

                      {asset.notes && (
                        <p className="text-[10px] text-slate-400 italic pl-1 border-l border-white/5">
                          {asset.notes}
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 pt-1 pl-1">
                        <span className="text-[8px] uppercase font-bold text-slate-500">Owners:</span>
                        <div className="flex flex-wrap gap-1">
                          {asset.ownerIds.map((owner) => (
                            <span key={owner} className="px-1.5 py-0.5 bg-white/5 text-slate-400 rounded-full text-[8px] font-semibold uppercase">
                              {owner}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between text-right shrink-0">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Estimated Value</p>
                        <h4 className="text-sm font-extrabold text-white mt-0.5">
                          {formatCurrency(converted)}
                        </h4>
                        {assetCurr !== selectedCurrency && (
                          <p className="text-[8px] text-slate-400">
                            ({formatCurrency(asset.estimatedValue, assetCurr)})
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          id={`edit-property-btn-${asset.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModal(asset);
                          }}
                          className="p-1.5 bg-white/5 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-300 rounded-lg transition-all cursor-pointer"
                          title="Edit details"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          id={`delete-property-btn-${asset.id}`}
                          onClick={(e) => {
                            e.stopPropagation(); // <--- THIS IS THE KEY
                            /* e.preventDefault();  // Good practice in forms/interactive cards
                            if (confirm('Are you sure you want to delete this property?')) {
                              onDeleteAsset(asset.id);
                            } */
                           setAssetToDelete(asset);
                          }}
                          className="p-1.5 bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 rounded-lg transition-all cursor-pointer"
                          title="Delete Property"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
          { /*{assetToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-slate-900 p-6 rounded-2xl border border-white/10 shadow-xl">
                <h3 className="text-white font-bold">Confirm Delete</h3>
                <p className="text-slate-400 text-sm mt-2">Are you sure you want to delete {assetToDelete.propertyName}?</p>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setAssetToDelete(null)} className="px-4 py-2 text-white bg-white/10 rounded-lg">Cancel</button>
                  <button onClick={() => { onDeleteAsset(assetToDelete.id); setAssetToDelete(null); }} className="px-4 py-2 text-white bg-rose-600 rounded-lg">Delete</button>
                </div>
              </div>
            </div>
          )}*/ }
        </div>

        {/* Right Side: Google Maps Location Viewer */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-extrabold uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
            <MapIcon className="h-4 w-4 text-indigo-400" />
            Estate Location Map
          </h3>

          <GlassCard id="map-holder-card" className="p-2 border border-white/10 h-[380px] md:h-[450px] relative overflow-hidden flex flex-col">
            {activeMapAsset ? (
              <div className="flex-1 flex flex-col overflow-hidden rounded-lg">
                <div className="px-3 py-2 bg-black/20 backdrop-blur-md flex items-center justify-between border-b border-white/5">
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase font-bold text-indigo-300">Active Map Selection</p>
                    <h4 className="font-extrabold text-xs text-white truncate">{activeMapAsset.propertyName}</h4>
                  </div>
                  <div className="text-[9px] text-slate-400 bg-white/5 px-2 py-0.5 rounded shrink-0">
                    Lat: {activeMapAsset.latitude}, Lng: {activeMapAsset.longitude}
                  </div>
                </div>

                <div className="flex-1 w-full relative bg-slate-950">
                  <iframe
                    key={`${activeMapAsset.id}-${mapMode}`}
                    id="gmaps-free-iframe"
                    title="Google Maps Location"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${activeMapAsset.latitude || 12.9716},${activeMapAsset.longitude || 77.5946}&t=${mapMode}&z=15&ie=UTF8&iwloc=&output=embed`}
                  />
                  
                  {/* Floating Map Mode Toggle */}
                  <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-1.5 py-1 rounded-xl flex items-center gap-1 border border-white/10 shadow-lg z-10">
                    <button
                      type="button"
                      onClick={() => setMapMode('m')}
                      className={`px-2 py-1 rounded-lg text-[9px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
                        mapMode === 'm'
                          ? 'bg-indigo-600 text-white shadow-sm font-extrabold'
                          : 'text-slate-300 hover:text-white hover:bg-white/5 font-medium'
                      }`}
                    >
                      Map
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapMode('h')}
                      className={`px-2 py-1 rounded-lg text-[9px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
                        mapMode === 'h'
                          ? 'bg-indigo-600 text-white shadow-sm font-extrabold'
                          : 'text-slate-300 hover:text-white hover:bg-white/5 font-medium'
                      }`}
                    >
                      Satellite
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <MapPin className="h-10 w-10 text-slate-500 mb-2" />
                <p className="text-xs font-semibold">Select a property to view its location</p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Add & Edit Modal Dialogs */}
      <AnimatePresence>
        {(isAddModalOpen || editingAsset) && (
          <div id="property-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden font-sans text-white"
            >
              <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/55">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-indigo-400" />
                  {isAddModalOpen ? 'Add Landed Estate' : 'Edit Landed Estate'}
                </h3>
                <button
                  id="close-modal-btn"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingAsset(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={isAddModalOpen ? handleAddSubmit : handleEditSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Property Name *</label>
                    <input
                      type="text"
                      required
                      value={propertyName}
                      onChange={(e) => setPropertyName(e.target.value)}
                      placeholder="e.g. Prestige Heights Apartment"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Property Type</label>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Agricultural">Agricultural</option>
                      <option value="Vacant Land">Vacant Land</option>
                      <option value="Industrial">Industrial</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Est. Value ({currencySymbol}) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={estimatedValue}
                      onChange={(e) => setEstimatedValue(e.target.value)}
                      placeholder="e.g. 15000000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Area Size *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="e.g. 1500"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Measurement Unit</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="sqft">Square Feet (sqft)</option>
                      <option value="cents">Cents</option>
                      <option value="grounds">Grounds</option>
                      <option value="acres">Acres</option>
                      <option value="hectares">Hectares</option>
                    </select>
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Address / Location Name</label>
                    <input
                      type="text"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder="e.g. Whitefield, Bangalore"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Latitude (For Pin)</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="e.g. 12.9845"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Longitude (For Pin)</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="e.g. 77.7324"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Owner IDs (comma separated)</label>
                    <input
                      type="text"
                      value={ownerIdsInput}
                      onChange={(e) => setOwnerIdsInput(e.target.value)}
                      placeholder="e.g. Ramesh, Anita"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Family rental apartment, primary registry completed."
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-850 bg-slate-900/50">
                  <button
                    id="cancel-modal-btn"
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingAsset(null);
                    }}
                    className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-xs font-bold text-slate-300 rounded-xl cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    id="submit-modal-btn"
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-xs font-bold text-white rounded-xl shadow-lg cursor-pointer transition-all flex items-center gap-1"
                  >
                    <Check className="h-4 w-4" />
                    <span>{isAddModalOpen ? 'Create Record' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      {/* Delete Immovable Asset Properties */}
        {assetToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAssetToDelete(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl z-10 flex flex-col text-slate-800 dark:text-slate-100"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/40 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">
                  Confirm Delete
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                  Are you sure you want to delete {assetToDelete.propertyName}?
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setAssetToDelete(null)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteAsset(assetToDelete.id);
                    setAssetToDelete(null);
                  }}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
