import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Area } from '../../types';
import { MapPin, Building, Home, FileText, Layers, AlertCircle } from 'lucide-react';

export interface SmartAddressInputProps {
  areaValue: string;
  detailsValue: string;
  onAreaChange: (area: string) => void;
  onDetailsChange: (details: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

interface ParsedDetails {
  neighborhood: string;
  building: string;
  apartment: string;
  notes: string;
}

/**
 * Parses details string into structured components.
 * If detailsValue doesn't match the parsed format (e.g. old users),
 * it dumps the whole string into notes as a fallback.
 */
function parseAddressDetails(raw: string): ParsedDetails {
  if (!raw || !raw.trim()) {
    return { neighborhood: '', building: '', apartment: '', notes: '' };
  }

  const trimmed = raw.trim();
  const hasFormatKeys =
    trimmed.includes('الحي:') ||
    trimmed.includes('عمارة:') ||
    trimmed.includes('شقة:') ||
    trimmed.includes('ملاحظات:');

  if (!hasFormatKeys) {
    // Fallback: legacy unstructured text goes entirely to notes
    return {
      neighborhood: '',
      building: '',
      apartment: '',
      notes: trimmed,
    };
  }

  let neighborhood = '';
  let building = '';
  let apartment = '';
  let notes = '';
  const remainingParts: string[] = [];

  const segments = trimmed.split('|').map((s) => s.trim());
  for (const segment of segments) {
    if (segment.startsWith('الحي:')) {
      neighborhood = segment.replace(/^الحي:\s*/, '').trim();
    } else if (segment.startsWith('عمارة:')) {
      building = segment.replace(/^عمارة:\s*/, '').trim();
    } else if (segment.startsWith('شقة:')) {
      apartment = segment.replace(/^شقة:\s*/, '').trim();
    } else if (segment.startsWith('ملاحظات:')) {
      notes = segment.replace(/^ملاحظات:\s*/, '').trim();
    } else if (segment) {
      remainingParts.push(segment);
    }
  }

  if (remainingParts.length > 0) {
    notes = notes ? `${notes} ${remainingParts.join(' ')}` : remainingParts.join(' ');
  }

  return { neighborhood, building, apartment, notes };
}

export function SmartAddressInput({
  areaValue = '',
  detailsValue = '',
  onAreaChange,
  onDetailsChange,
  disabled = false,
  required = false,
  className = '',
}: SmartAddressInputProps) {
  const [areas, setAreas] = useState<Area[]>([]);
  const [isLoadingAreas, setIsLoadingAreas] = useState(true);

  // Internal Form States for Details
  const [neighborhoodSelect, setNeighborhoodSelect] = useState('');
  const [customNeighborhood, setCustomNeighborhood] = useState('');
  const [isCustomNeighborhood, setIsCustomNeighborhood] = useState(false);

  const [building, setBuilding] = useState('');
  const [apartment, setApartment] = useState('');
  const [notes, setNotes] = useState('');

  // Internal Form States for Area
  const [isCustomArea, setIsCustomArea] = useState(false);
  const [customAreaText, setCustomAreaText] = useState('');

  // Ref to track last stitched string to avoid infinite loop with parent onDetailsChange
  const lastStitchedRef = useRef<string | null>(null);
  // Ref to store parsed neighborhood before areas finish loading
  const pendingParsedNeighborhoodRef = useRef<string | null>(null);

  // 1. Fetch all areas from Supabase on mount
  useEffect(() => {
    let isMounted = true;

    const fetchAreas = async () => {
      try {
        setIsLoadingAreas(true);
        const { data, error } = await supabase
          .from('areas')
          .select('*')
          .order('name');

        if (!error && data && isMounted) {
          setAreas(data as Area[]);
        }
      } catch (err) {
        console.error('Error fetching areas in SmartAddressInput:', err);
      } finally {
        if (isMounted) setIsLoadingAreas(false);
      }
    };

    fetchAreas();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Determine Selected Area Object
  const selectedArea = useMemo(() => {
    if (isCustomArea || !areaValue) return undefined;
    return areas.find((a) => a.name.trim().toLowerCase() === areaValue.trim().toLowerCase());
  }, [areas, areaValue, isCustomArea]);

  // 3. Sync Area Value with Dropdown and Custom Input
  useEffect(() => {
    if (isLoadingAreas) return;

    if (!areaValue || !areaValue.trim()) {
      setIsCustomArea(false);
      setCustomAreaText('');
      return;
    }

    const matchedArea = areas.find(
      (a) => a.name.trim().toLowerCase() === areaValue.trim().toLowerCase()
    );

    if (matchedArea) {
      setIsCustomArea(false);
      setCustomAreaText('');
    } else {
      // Area value is not in fetched list -> treat as "أخرى"
      setIsCustomArea(true);
      setCustomAreaText(areaValue);
    }
  }, [areaValue, areas, isLoadingAreas]);

  // 4. Parse incoming detailsValue when it changes from outside
  useEffect(() => {
    if (detailsValue === lastStitchedRef.current) {
      return;
    }

    lastStitchedRef.current = detailsValue;
    const parsed = parseAddressDetails(detailsValue);

    setBuilding(parsed.building);
    setApartment(parsed.apartment);
    setNotes(parsed.notes);

    if (parsed.neighborhood) {
      pendingParsedNeighborhoodRef.current = parsed.neighborhood;
    }
  }, [detailsValue]);

  // 5. Match pending parsed neighborhood with selectedArea.neighborhoods once available
  useEffect(() => {
    const targetNeighborhood = pendingParsedNeighborhoodRef.current;
    if (!targetNeighborhood) return;

    if (selectedArea && selectedArea.has_neighborhoods) {
      const areaNeighborhoods = Array.isArray(selectedArea.neighborhoods)
        ? selectedArea.neighborhoods
        : [];

      const found = areaNeighborhoods.find(
        (n) => n.trim().toLowerCase() === targetNeighborhood.trim().toLowerCase()
      );

      if (found) {
        setNeighborhoodSelect(found);
        setIsCustomNeighborhood(false);
        setCustomNeighborhood('');
      } else {
        setNeighborhoodSelect('__other__');
        setIsCustomNeighborhood(true);
        setCustomNeighborhood(targetNeighborhood);
      }
      pendingParsedNeighborhoodRef.current = null;
    } else if (selectedArea && !selectedArea.has_neighborhoods) {
      // Area does not support neighborhoods, clear it
      setNeighborhoodSelect('');
      setIsCustomNeighborhood(false);
      setCustomNeighborhood('');
      pendingParsedNeighborhoodRef.current = null;
    }
  }, [selectedArea]);

  // 6. Data Stitching Effect: Compile details into a single string whenever internal states change
  useEffect(() => {
    // Only stitch details relevant to the currently selected area configuration
    const parts: string[] = [];

    // Neighborhood part
    if (selectedArea?.has_neighborhoods) {
      const effectiveNeighborhood = isCustomNeighborhood
        ? customNeighborhood.trim()
        : neighborhoodSelect.trim();

      if (effectiveNeighborhood && effectiveNeighborhood !== '__other__') {
        parts.push(`الحي: ${effectiveNeighborhood}`);
      }
    }

    // Building details parts
    if (selectedArea?.ask_building_details) {
      if (building.trim()) {
        parts.push(`عمارة: ${building.trim()}`);
      }
      if (apartment.trim()) {
        parts.push(`شقة: ${apartment.trim()}`);
      }
    }

    // Notes part (always allowed)
    if (notes.trim()) {
      parts.push(`ملاحظات: ${notes.trim()}`);
    }

    const compiled = parts.join(' | ');

    if (compiled !== lastStitchedRef.current) {
      lastStitchedRef.current = compiled;
      onDetailsChange(compiled);
    }
  }, [
    selectedArea,
    neighborhoodSelect,
    isCustomNeighborhood,
    customNeighborhood,
    building,
    apartment,
    notes,
    onDetailsChange,
  ]);

  // Handler for Area Dropdown Change
  const handleAreaSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__other__') {
      setIsCustomArea(true);
      setCustomAreaText('');
      onAreaChange('');
      // Reset neighborhood when switching to custom area
      setNeighborhoodSelect('');
      setIsCustomNeighborhood(false);
      setCustomNeighborhood('');
    } else {
      setIsCustomArea(false);
      setCustomAreaText('');
      onAreaChange(val);
      // Reset neighborhood on area change to avoid mismatched neighborhoods
      setNeighborhoodSelect('');
      setIsCustomNeighborhood(false);
      setCustomNeighborhood('');
    }
  };

  // Handler for Custom Area Input Change
  const handleCustomAreaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAreaText(val);
    onAreaChange(val);
  };

  // Handler for Neighborhood Dropdown Change
  const handleNeighborhoodSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__other__') {
      setIsCustomNeighborhood(true);
      setNeighborhoodSelect('__other__');
      setCustomNeighborhood('');
    } else {
      setIsCustomNeighborhood(false);
      setNeighborhoodSelect(val);
      setCustomNeighborhood('');
    }
  };

  return (
    <div className={`space-y-4 ${className}`} dir="rtl">
      {/* 1. Area Dropdown */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-foreground">
          المنطقة السكنية {required && <span className="text-destructive">*</span>}
        </label>
        <div className="relative">
          <select
            disabled={disabled || isLoadingAreas}
            required={required && !isCustomArea}
            value={isCustomArea ? '__other__' : areaValue}
            onChange={handleAreaSelectChange}
            className="w-full px-4 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm disabled:opacity-50"
          >
            <option value="">
              {isLoadingAreas ? 'جاري تحميل المناطق...' : 'اختر المنطقة'}
            </option>
            {areas.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
            <option value="__other__">أخرى (إدخال يدوي)</option>
          </select>
        </div>

        {/* 2. Custom Area Input if 'أخرى' is selected */}
        {isCustomArea && (
          <div className="pt-2">
            <input
              type="text"
              disabled={disabled}
              required={required}
              value={customAreaText}
              onChange={handleCustomAreaInputChange}
              placeholder="اكتب اسم المنطقة السكنية بالتفصيل..."
              className="w-full px-4 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm animate-in fade-in duration-150"
            />
          </div>
        )}
      </div>

      {/* 3. Neighborhood Dropdown if selectedArea.has_neighborhoods is true */}
      {selectedArea?.has_neighborhoods && (
        <div className="space-y-1.5 bg-muted/20 p-3.5 rounded-xl border border-border/80 animate-in fade-in duration-200">
          <label className="block text-sm font-medium text-foreground flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-primary" />
            <span>الحي / المجاورة</span>
          </label>

          <select
            disabled={disabled}
            value={neighborhoodSelect}
            onChange={handleNeighborhoodSelectChange}
            className="w-full px-4 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm disabled:opacity-50"
          >
            <option value="">اختر الحي أو المجاورة</option>
            {Array.isArray(selectedArea.neighborhoods) &&
              selectedArea.neighborhoods.map((nb, idx) => (
                <option key={idx} value={nb}>
                  {nb}
                </option>
              ))}
            <option value="__other__">أخرى (إدخال يدوي)</option>
          </select>

          {/* Custom Neighborhood Input if 'أخرى' is selected */}
          {isCustomNeighborhood && (
            <div className="pt-2">
              <input
                type="text"
                disabled={disabled}
                value={customNeighborhood}
                onChange={(e) => setCustomNeighborhood(e.target.value)}
                placeholder="اكتب اسم الحي أو المجاورة يدويًا..."
                className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
            </div>
          )}
        </div>
      )}

      {/* 4. Building Details (Building & Apartment) if selectedArea.ask_building_details is true */}
      {selectedArea?.ask_building_details && (
        <div className="grid grid-cols-2 gap-3 bg-muted/20 p-3.5 rounded-xl border border-border/80 animate-in fade-in duration-200">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground flex items-center gap-1.5">
              <Building className="w-4 h-4 text-primary" />
              <span>رقم العمارة</span>
            </label>
            <input
              type="text"
              disabled={disabled}
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              placeholder="مثال: 12 أو 5ب"
              className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground flex items-center gap-1.5">
              <Home className="w-4 h-4 text-primary" />
              <span>رقم الشقة</span>
            </label>
            <input
              type="text"
              disabled={disabled}
              value={apartment}
              onChange={(e) => setApartment(e.target.value)}
              placeholder="مثال: 4"
              className="w-full px-4 py-2 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>
        </div>
      )}

      {/* 5. Notes / Landmark Details (Always shown) */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-foreground flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span>علامة مميزة / ملاحظات العنوان</span>
        </label>
        <textarea
          disabled={disabled}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="مثال: الشارع، بجوار صيدلية أو مدرسة، الدور..."
          className="w-full px-4 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm disabled:opacity-50"
        />
      </div>
    </div>
  );
}

export default SmartAddressInput;
