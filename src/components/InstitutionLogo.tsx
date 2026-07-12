import React, { useState, useEffect } from 'react';

interface InstitutionLogoProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const InstitutionLogo: React.FC<InstitutionLogoProps> = ({
  name,
  size = 'md',
  className = '',
}) => {
  const normalizedName = name.toLowerCase().trim();
  const [imgError, setImgError] = useState(false);

  // Reset error flag if name changes
  useEffect(() => {
    setImgError(false);
  }, [name]);

  // Determine size classes
  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-[12px]',
    lg: 'w-12 h-12 text-[16px]',
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  // Domain map for official financial institution websites to fetch their official logo/icon
  const getDomainForInstitution = (title: string): string | null => {
    const text = title.toLowerCase();
    
    // Bank Institutions
    if (text.includes('hdfc bank')) return 'hdfcbank.com';
    if (text.includes('hdfc mutual') || text.includes('hdfc mf')) return 'hdfcfund.com';
    if (text.includes('hdfc')) return 'hdfcbank.com';
    
    if (text.includes('icici bank')) return 'icicibank.com';
    if (text.includes('icici prudential') || text.includes('icicipru') || text.includes('icici mutual') || text.includes('icici mf')) return 'icicipruamc.com';
    if (text.includes('icici')) return 'icicibank.com';
    
    if (text.includes('sbi mutual') || text.includes('sbi mf')) return 'sbimf.com';
    if (text.includes('state bank of india') || text.includes('sbi')) return 'sbi.co.in';
    
    if (text.includes('idfc') || text.includes('first bank')) return 'idfcfirstbank.com';
    if (text.includes('deutsche bank') || text.includes('deutsche')) return 'db.com';
    if (text.includes('dkb')) return 'dkb.de';
    if (text.includes('ally bank') || text.includes('ally')) return 'ally.com';
    if (text.includes('chase bank') || text.includes('chase')) return 'chase.com';
    if (text.includes('kotak bank')) return 'kotak.com';
    if (text.includes('kotak mutual') || text.includes('kotak mf') || text.includes('kotak asset')) return 'kotakmf.com';
    if (text.includes('kotak')) return 'kotak.com';
    
    if (text.includes('axis bank')) return 'axisbank.com';
    if (text.includes('axis mutual') || text.includes('axis mf')) return 'axismf.com';
    if (text.includes('axis')) return 'axisbank.com';

    // Mutual Funds & Investment Houses
    if (text.includes('parag parikh') || text.includes('ppfas')) return 'ppfas.com';
    if (text.includes('vanguard')) return 'vanguard.com';
    if (text.includes('fidelity')) return 'fidelity.com';
    if (text.includes('mirae')) return 'miraeasset.com';
    if (text.includes('nippon')) return 'nipponindiamf.com';
    if (text.includes('motilal')) return 'motilaloswal.com';
    if (text.includes('sundaram')) return 'sundarammutual.com';
    if (text.includes('uti')) return 'utimf.com';

    // Fallback search keywords
    if (text.includes('bank')) return 'bankofamerica.com'; // generic bank
    
    return null;
  };

  const domain = getDomainForInstitution(normalizedName);
  
  // Use Google Favicon Service (sz=128 for high quality square logos directly extracted from target website)
  const logoUrl = domain 
    ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` 
    : null;

  if (logoUrl && !imgError) {
    return (
      <div
        id={`logo-container-${normalizedName.replace(/\s+/g, '-')}`}
        className={`flex items-center justify-center rounded-lg bg-white/70 dark:bg-slate-900/70 p-1 select-none shrink-0 border border-white/20 dark:border-slate-800 shadow-sm aspect-square ${currentSizeClass} ${className}`}
        title={`${name} Official Logo`}
      >
        <img
          src={logoUrl}
          alt={`${name} logo`}
          className="w-full h-full object-contain rounded-md"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // GENERAL FALLBACK: Elegant, square, high-contrast placeholder
  let hash = 0;
  for (let i = 0; i < normalizedName.length; i++) {
    hash = normalizedName.charCodeAt(i) + ((hash << 5) - hash);
  }

  const gradients = [
    'from-indigo-600 to-sky-500 text-white',
    'from-pink-600 to-rose-400 text-white',
    'from-emerald-600 to-teal-500 text-white',
    'from-amber-500 to-orange-600 text-white',
    'from-violet-600 to-fuchsia-500 text-white',
    'from-blue-600 to-cyan-500 text-white',
  ];

  const selectedGradient = gradients[Math.abs(hash) % gradients.length];

  // Extract initials (up to 2 letters)
  const words = name.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  let initials = '';
  if (words.length >= 2) {
    initials = (words[0][0] + words[1][0]).toUpperCase();
  } else if (words.length === 1) {
    initials = words[0].slice(0, 2).toUpperCase();
  } else {
    initials = normalizedName.slice(0, 2).toUpperCase() || 'BK';
  }

  return (
    <div
      id={`logo-fallback-${normalizedName.replace(/\s+/g, '-')}`}
      className={`flex items-center justify-center rounded-lg bg-gradient-to-br ${selectedGradient} font-black tracking-tight select-none shrink-0 shadow-inner border border-white/20 uppercase aspect-square ${currentSizeClass} ${className}`}
      title={`${name} Logo`}
    >
      <span>{initials}</span>
    </div>
  );
};
