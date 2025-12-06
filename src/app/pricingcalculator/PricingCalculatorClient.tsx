'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { dispatchLead } from '@/lib/leadSubmit';
import { hasSupabaseConfig, supabase } from '@/lib/supabase';

const TEAM_RATE = 90;
const SOLO_RATE = 47;
const CURATED_HOURS = 4;

type ClutterLevel = 'low' | 'medium' | 'high';

type ModelCoefficients = {
  intercept: number;
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  deep_clean: number;
  fridge: number;
  oven: number;
  clutter_high: number;
  clutter_low: number;
  clutter_medium: number;
};

type Standardization = {
  means: {
    sqft: number;
    bedrooms: number;
    bathrooms: number;
  };
  stds: {
    sqft: number;
    bedrooms: number;
    bathrooms: number;
  };
};

type TrainedModel = {
  coefficients: ModelCoefficients;
  standardization: Standardization;
  alpha: number;
};

type TrainingRow = {
  beds: number;
  baths: number;
  sqft: number;
  isDeep: boolean;
  fridge: boolean;
  oven: boolean;
  clutter: ClutterLevel;
  hours: number;
};

type DatasetPreviewRow = {
  beds: number;
  baths: number;
  sqft: number;
  type: 'standard' | 'deep';
  fridge: boolean;
  oven: boolean;
  clutter: ClutterLevel;
  hours: number;
};

type DatasetRecord = {
  id: string;
  user_id: string;
  file_name: string;
  storage_path: string;
  row_count: number | null;
  created_at: string;
  model: TrainedModel | null;
  sample_preview?: DatasetPreviewRow[] | null;
};

type Profile = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  active_dataset_id: string | null;
};

type ParsedCsvResult = {
  rows: TrainingRow[];
  errors: string[];
  missing: string[];
};

const DEFAULT_MODEL: TrainedModel = {
  coefficients: {
    intercept: 2.791896,
    sqft: -0.080504,
    bedrooms: 0.594798,
    bathrooms: -0.099479,
    deep_clean: 2.117875,
    fridge: -0.558166,
    oven: 0.8788,
    clutter_high: 0.290614,
    clutter_low: -0.245159,
    clutter_medium: -0.045455,
  },
  standardization: {
    means: { sqft: 2349.8462, bedrooms: 3.6923, bathrooms: 2.6346 },
    stds: { sqft: 1438.2056, bedrooms: 0.9515, bathrooms: 0.9152 },
  },
  alpha: 0.25,
};

const DEFAULT_REFERENCE: DatasetPreviewRow[] = [
  { beds: 4, baths: 3, sqft: 2758, type: 'standard', fridge: false, oven: false, clutter: 'high', hours: 3 },
  { beds: 3, baths: 2, sqft: 1554, type: 'standard', fridge: false, oven: false, clutter: 'low', hours: 1.75 },
  { beds: 6, baths: 5, sqft: 6648, type: 'standard', fridge: false, oven: false, clutter: 'high', hours: 4 },
  { beds: 6, baths: 5, sqft: 6648, type: 'deep', fridge: false, oven: false, clutter: 'high', hours: 6.2 },
  { beds: 2, baths: 2, sqft: 1002, type: 'standard', fridge: false, oven: false, clutter: 'high', hours: 2 },
  { beds: 3, baths: 2, sqft: 1167, type: 'deep', fridge: true, oven: true, clutter: 'high', hours: 5 },
  { beds: 2, baths: 2, sqft: 1188, type: 'standard', fridge: false, oven: false, clutter: 'low', hours: 2.3 },
  { beds: 5, baths: 4, sqft: 4214, type: 'standard', fridge: false, oven: false, clutter: 'high', hours: 3.5 },
  { beds: 4, baths: 3, sqft: 2551, type: 'standard', fridge: false, oven: false, clutter: 'low', hours: 3 },
  { beds: 4, baths: 2, sqft: 2042, type: 'deep', fridge: true, oven: false, clutter: 'low', hours: 4 },
  { beds: 3, baths: 2, sqft: 1497, type: 'standard', fridge: false, oven: false, clutter: 'low', hours: 2 },
  { beds: 3, baths: 2, sqft: 1497, type: 'deep', fridge: true, oven: true, clutter: 'low', hours: 4 },
  { beds: 4, baths: 2, sqft: 1846, type: 'deep', fridge: true, oven: true, clutter: 'high', hours: 6 },
  { beds: 3, baths: 2, sqft: 1957, type: 'standard', fridge: false, oven: false, clutter: 'medium', hours: 2.5 },
  { beds: 4, baths: 2, sqft: 1777, type: 'standard', fridge: false, oven: false, clutter: 'low', hours: 2.5 },
  { beds: 3, baths: 2, sqft: 1260, type: 'deep', fridge: true, oven: true, clutter: 'medium', hours: 5.2 },
  { beds: 3, baths: 3, sqft: 1687, type: 'deep', fridge: false, oven: false, clutter: 'medium', hours: 4.1 },
  { beds: 3, baths: 2, sqft: 1875, type: 'deep', fridge: true, oven: false, clutter: 'low', hours: 4.4 },
  { beds: 4, baths: 2, sqft: 2271, type: 'standard', fridge: false, oven: false, clutter: 'low', hours: 2.5 },
  { beds: 4, baths: 2, sqft: 2467, type: 'standard', fridge: false, oven: false, clutter: 'low', hours: 3.2 },
  { beds: 4, baths: 3, sqft: 2090, type: 'deep', fridge: false, oven: false, clutter: 'low', hours: 5.17 },
  { beds: 4, baths: 3, sqft: 2023, type: 'standard', fridge: false, oven: false, clutter: 'medium', hours: 3.5 },
  { beds: 4, baths: 2, sqft: 1428, type: 'deep', fridge: false, oven: true, clutter: 'high', hours: 7 },
  { beds: 4, baths: 4, sqft: 3859, type: 'deep', fridge: false, oven: true, clutter: 'low', hours: 5.5 },
  { beds: 3, baths: 2.5, sqft: 1700, type: 'standard', fridge: false, oven: false, clutter: 'medium', hours: 2 },
  { beds: 4, baths: 3, sqft: 2090, type: 'standard', fridge: false, oven: false, clutter: 'medium', hours: 2.6 },
];

const REQUIRED_COLUMNS = ['sqft', 'bedrooms', 'bathrooms', 'clean_type', 'clutter'];
const HOURS_COLUMNS = ['clock_hours', 'labor_hours', 'hours', 'time_hours', 'total_hours'];

const sanitizePhone = (input: string) => input.replace(/\D/g, '');

const parseBoolean = (value: string) => {
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'yes' || normalized === 'true' || normalized === 'y';
};

const parseCsv = (text: string): ParsedCsvResult => {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return { rows: [], errors: ['The CSV file is empty.'], missing: REQUIRED_COLUMNS };

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const missing = REQUIRED_COLUMNS.filter((col) => !header.includes(col));
  const hoursColumn = HOURS_COLUMNS.find((col) => header.includes(col));
  const missingColumns = [...missing];
  if (!hoursColumn) {
    missingColumns.push('clock_hours');
    return {
      rows: [],
      errors: ['Missing an hours column (clock_hours, labor_hours, hours, time_hours, or total_hours).'],
      missing: missingColumns,
    };
  }

  const errors: string[] = [];
  const rows: TrainingRow[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const rawCells = lines[i];
    if (!rawCells) continue;
    const cells = rawCells.split(',').map((cell) => cell.trim());

    const getCell = (col: string) => {
      const idx = header.indexOf(col);
      return idx >= 0 ? cells[idx] || '' : '';
    };

    const sqft = parseFloat(getCell('sqft'));
    const beds = parseFloat(getCell('bedrooms'));
    const baths = parseFloat(getCell('bathrooms'));
    const clutterRaw = getCell('clutter').toLowerCase();
    const clutter: ClutterLevel = clutterRaw === 'high' ? 'high' : clutterRaw === 'medium' ? 'medium' : 'low';
    const cleanType = getCell('clean_type').toLowerCase();
    const isDeep = cleanType.includes('deep');
    const fridge = parseBoolean(getCell('fridge'));
    const oven = parseBoolean(getCell('oven'));
    const hoursValue = hoursColumn ? parseFloat(getCell(hoursColumn)) : NaN;

    if ([sqft, beds, baths, hoursValue].some((v) => Number.isNaN(v))) {
      errors.push(`Row ${i + 1}: skipped because it has invalid numbers.`);
      continue;
    }

    rows.push({
      beds,
      baths,
      sqft,
      isDeep,
      fridge,
      oven,
      clutter,
      hours: hoursValue,
    });
  }

  return { rows, errors, missing: missingColumns };
};

const solveLinearSystem = (matrix: number[][], vector: number[]) => {
  const n = matrix.length;
  const augmented = matrix.map((row, i) => [...row, vector[i]]);

  for (let i = 0; i < n; i += 1) {
    let pivotRow = i;
    for (let j = i + 1; j < n; j += 1) {
      if (Math.abs(augmented[j][i]) > Math.abs(augmented[pivotRow][i])) {
        pivotRow = j;
      }
    }
    if (Math.abs(augmented[pivotRow][i]) < 1e-8) {
      throw new Error('Singular matrix during model fit.');
    }
    [augmented[i], augmented[pivotRow]] = [augmented[pivotRow], augmented[i]];
    const pivot = augmented[i][i];
    for (let k = i; k <= n; k += 1) {
      augmented[i][k] /= pivot;
    }
    for (let j = 0; j < n; j += 1) {
      if (j === i) continue;
      const factor = augmented[j][i];
      for (let k = i; k <= n; k += 1) {
        augmented[j][k] -= factor * augmented[i][k];
      }
    }
  }

  return augmented.map((row) => row[n]);
};

const trainRidgeModel = (rows: TrainingRow[], alpha = 0.25): TrainedModel => {
  const mean = {
    sqft: rows.reduce((sum, r) => sum + r.sqft, 0) / rows.length,
    bedrooms: rows.reduce((sum, r) => sum + r.beds, 0) / rows.length,
    bathrooms: rows.reduce((sum, r) => sum + r.baths, 0) / rows.length,
  };
  const std = {
    sqft: Math.sqrt(rows.reduce((sum, r) => sum + (r.sqft - mean.sqft) ** 2, 0) / rows.length) || 1,
    bedrooms: Math.sqrt(rows.reduce((sum, r) => sum + (r.beds - mean.bedrooms) ** 2, 0) / rows.length) || 1,
    bathrooms: Math.sqrt(rows.reduce((sum, r) => sum + (r.baths - mean.bathrooms) ** 2, 0) / rows.length) || 1,
  };

  const designRows = rows.map((r) => [
    1,
    (r.sqft - mean.sqft) / std.sqft,
    (r.beds - mean.bedrooms) / std.bedrooms,
    (r.baths - mean.bathrooms) / std.bathrooms,
    r.isDeep ? 1 : 0,
    r.fridge ? 1 : 0,
    r.oven ? 1 : 0,
    r.clutter === 'high' ? 1 : 0,
    r.clutter === 'low' ? 1 : 0,
    r.clutter === 'medium' ? 1 : 0,
  ]);

  const featureCount = designRows[0]?.length || 0;
  const xtx = Array.from({ length: featureCount }, () => Array(featureCount).fill(0));
  const xty = Array(featureCount).fill(0);

  designRows.forEach((row, idx) => {
    const y = rows[idx].hours;
    for (let i = 0; i < featureCount; i += 1) {
      xty[i] += row[i] * y;
      for (let j = 0; j < featureCount; j += 1) {
        xtx[i][j] += row[i] * row[j];
      }
    }
  });

  for (let i = 1; i < featureCount; i += 1) {
    xtx[i][i] += alpha;
  }

  const weights = solveLinearSystem(xtx, xty);

  return {
    coefficients: {
      intercept: weights[0] || 0,
      sqft: weights[1] || 0,
      bedrooms: weights[2] || 0,
      bathrooms: weights[3] || 0,
      deep_clean: weights[4] || 0,
      fridge: weights[5] || 0,
      oven: weights[6] || 0,
      clutter_high: weights[7] || 0,
      clutter_low: weights[8] || 0,
      clutter_medium: weights[9] || 0,
    },
    standardization: {
      means: mean,
      stds: std,
    },
    alpha,
  };
};

const normalizeModel = (raw: TrainedModel | null | undefined): TrainedModel => {
  if (!raw) return DEFAULT_MODEL;
  const coeffs = raw.coefficients || (raw as unknown as Record<string, number>);
  const stats = (raw as unknown as { standardization?: Standardization }).standardization || DEFAULT_MODEL.standardization;
  const parseNum = (value: unknown, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  return {
    coefficients: {
      intercept: parseNum((coeffs as ModelCoefficients).intercept ?? (coeffs as Record<string, unknown>).intercept),
      sqft: parseNum((coeffs as ModelCoefficients).sqft ?? (coeffs as Record<string, unknown>).sqft),
      bedrooms: parseNum((coeffs as ModelCoefficients).bedrooms ?? (coeffs as Record<string, unknown>).bedrooms),
      bathrooms: parseNum((coeffs as ModelCoefficients).bathrooms ?? (coeffs as Record<string, unknown>).bathrooms),
      deep_clean: parseNum((coeffs as ModelCoefficients).deep_clean ?? (coeffs as Record<string, unknown>).deep_clean),
      fridge: parseNum((coeffs as ModelCoefficients).fridge ?? (coeffs as Record<string, unknown>).fridge),
      oven: parseNum((coeffs as ModelCoefficients).oven ?? (coeffs as Record<string, unknown>).oven),
      clutter_high: parseNum((coeffs as ModelCoefficients).clutter_high ?? (coeffs as Record<string, unknown>).clutter_high),
      clutter_low: parseNum((coeffs as ModelCoefficients).clutter_low ?? (coeffs as Record<string, unknown>).clutter_low),
      clutter_medium: parseNum((coeffs as ModelCoefficients).clutter_medium ?? (coeffs as Record<string, unknown>).clutter_medium),
    },
    standardization: {
      means: {
        sqft: parseNum(stats.means?.sqft, DEFAULT_MODEL.standardization.means.sqft),
        bedrooms: parseNum(stats.means?.bedrooms, DEFAULT_MODEL.standardization.means.bedrooms),
        bathrooms: parseNum(stats.means?.bathrooms, DEFAULT_MODEL.standardization.means.bathrooms),
      },
      stds: {
        sqft: parseNum(stats.stds?.sqft, DEFAULT_MODEL.standardization.stds.sqft) || 1,
        bedrooms: parseNum(stats.stds?.bedrooms, DEFAULT_MODEL.standardization.stds.bedrooms) || 1,
        bathrooms: parseNum(stats.stds?.bathrooms, DEFAULT_MODEL.standardization.stds.bathrooms) || 1,
      },
    },
    alpha: parseNum((raw as TrainedModel).alpha, DEFAULT_MODEL.alpha),
  };
};

const estimateCleaningTime = (
  model: TrainedModel,
  beds: number,
  baths: number,
  sqft: number,
  isDeepClean: boolean,
  includeFridge: boolean,
  includeOven: boolean,
  clutterLevel: ClutterLevel
): number => {
  const { coefficients, standardization } = model;
  const safeStd = (value: number) => (Math.abs(value) < 1e-6 ? 1 : value);
  let hours = coefficients.intercept;

  const sqftStd = (sqft - standardization.means.sqft) / safeStd(standardization.stds.sqft);
  const bedsStd = (beds - standardization.means.bedrooms) / safeStd(standardization.stds.bedrooms);
  const bathsStd = (baths - standardization.means.bathrooms) / safeStd(standardization.stds.bathrooms);

  hours += coefficients.sqft * sqftStd;
  hours += coefficients.bedrooms * bedsStd;
  hours += coefficients.bathrooms * bathsStd;
  hours += coefficients.deep_clean * (isDeepClean ? 1 : 0);
  hours += coefficients.fridge * (includeFridge ? 1 : 0);
  hours += coefficients.oven * (includeOven ? 1 : 0);

  if (clutterLevel === 'high') {
    hours += coefficients.clutter_high;
  } else if (clutterLevel === 'low') {
    hours += coefficients.clutter_low;
  } else {
    hours += coefficients.clutter_medium;
  }

  hours = Math.max(0.5, hours);
  return Math.round(hours * 4) / 4;
};

const formatCurrency = (value: number | null) => (value !== null ? `$${value.toFixed(2)}` : '--');

const formatClutter = (clutter: ClutterLevel) =>
  clutter === 'high' ? 'High' : clutter === 'medium' ? 'Medium' : 'Low';

export default function PricingCalculatorClient() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPhone, setSigninPhone] = useState('');

  const [datasets, setDatasets] = useState<DatasetRecord[]>([]);
  const [activeDatasetId, setActiveDatasetId] = useState<string | null>(null);
  const [activeModel, setActiveModel] = useState<TrainedModel>(DEFAULT_MODEL);
  const [datasetPreview, setDatasetPreview] = useState<DatasetPreviewRow[] | null>(null);
  const [datasetStatus, setDatasetStatus] = useState('Using default reference model');
  const [loadingDatasets, setLoadingDatasets] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [csvWarnings, setCsvWarnings] = useState<string[] | null>(null);

  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [sqFeet, setSqFeet] = useState('');
  const [deepCleanPrice, setDeepCleanPrice] = useState<number | null>(null);
  const [standardCleanPrice, setStandardCleanPrice] = useState<number | null>(null);
  const [standardHours, setStandardHours] = useState<number | null>(null);
  const [deepCleanHours, setDeepCleanHours] = useState<number | null>(null);
  const [soloStandardHours, setSoloStandardHours] = useState<number | null>(null);
  const [soloDeepHours, setSoloDeepHours] = useState<number | null>(null);
  const [soloStandardPrice, setSoloStandardPrice] = useState<number | null>(null);
  const [soloDeepPrice, setSoloDeepPrice] = useState<number | null>(null);
  const [clutterLevel, setClutterLevel] = useState<ClutterLevel>('low');
  const [addFridge, setAddFridge] = useState(false);
  const [addOven, setAddOven] = useState(false);
  const [showReference, setShowReference] = useState(false);

  const statementItems = [
    '$50 security deposit collected. Cancel 48+ hours for refund; inside 48 hours it goes to cleaners to cover lost payroll hours.',
    'Arrival is a 60-minute window around start time; cleaners aim to be 15 minutes early but may arrive anytime in that window if a prior clean runs long.',
    'No live roaches/ongoing bug problems on site. Confirm no live bugs will be encountered.',
    'No surfaces with over 2 feet of mold. Confirm none present.',
    'Please secure pets away from work areas so cleaners can work efficiently.',
  ];
  const onboardingItems = [
    'Who will let the cleaners into the home?',
    'Is there a gate code to enter the area?',
    'Any restricted rooms or surfaces?',
    'Is parking on the side of the road okay?',
  ];
  const checklistItems = [
    'Understand what is wrong with the home, and how they want it to look.',
    'Get the address and condition of the home details.',
    "Figure out what they've tried to keep it cleaned (solo, spouse, other cleaners).",
    'Communicate how their current approach was admirable, but missing a key that we have.',
    'Quick pitch then reveal price.',
    'Attempt to value stack our 3 bonuses.',
    'Assumptive close by presenting dates that might work for them.',
    'Objection handling.',
    'Nudging questions into endzone.',
    'Qualifying statements + onboarding questions.',
  ];

  const [statementChecks, setStatementChecks] = useState<boolean[]>(() =>
    Array(statementItems.length).fill(false)
  );
  const [onboardingChecks, setOnboardingChecks] = useState<boolean[]>(() =>
    Array(onboardingItems.length).fill(false)
  );
  const [checklistState, setChecklistState] = useState<boolean[]>(() =>
    Array(checklistItems.length).fill(false)
  );

  const supabaseReady = hasSupabaseConfig && Boolean(supabase);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const ensureProfile = async (currentSession: Session) => {
    if (!supabase) return null;
    const { data: existing, error } = await supabase
      .from('pricing_calculator_profiles')
      .select('id, full_name, phone, email, active_dataset_id')
      .eq('id', currentSession.user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Failed to fetch pricing profile', error);
    }
    if (existing) {
      setProfile(existing);
      return existing;
    }

    const fallback: Profile = {
      id: currentSession.user.id,
      full_name:
        (currentSession.user.user_metadata as { full_name?: string })?.full_name ||
        currentSession.user.email ||
        'Pricing User',
      phone:
        (currentSession.user.user_metadata as { phone?: string })?.phone ||
        sanitizePhone(signupPhone) ||
        '0000000000',
      email: currentSession.user.email || signupEmail || 'unknown@example.com',
      active_dataset_id: null,
    };

    const { data: inserted, error: insertErr } = await supabase
      .from('pricing_calculator_profiles')
      .upsert(fallback)
      .select()
      .maybeSingle();

    if (insertErr) {
      console.error('Failed to create pricing profile', insertErr);
      return fallback;
    }

    const created = inserted as Profile | null;
    if (created) setProfile(created);
    return created ?? fallback;
  };

  const loadDatasets = async (currentSession: Session, profileRecord?: Profile | null) => {
    if (!supabase) return;
    setLoadingDatasets(true);
    setDatasetStatus('Loading your datasets...');

    const { data: datasetRows, error } = await supabase
      .from('pricing_calculator_datasets')
      .select('id,user_id,file_name,storage_path,row_count,created_at,model,sample_preview')
      .eq('user_id', currentSession.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load datasets', error);
      setLoadingDatasets(false);
      return;
    }

    const list = (datasetRows as DatasetRecord[]) || [];
    setDatasets(list);

    const activeId = profileRecord?.active_dataset_id || list[0]?.id || null;
    setActiveDatasetId(activeId);

    if (activeId) {
      const active = list.find((d) => d.id === activeId);
      if (active?.model) {
        setActiveModel(normalizeModel(active.model));
        setDatasetPreview(active.sample_preview ?? null);
        setDatasetStatus(`Using ${active.file_name}`);
      } else {
        setActiveModel(DEFAULT_MODEL);
        setDatasetPreview(null);
        setDatasetStatus('Active dataset has no model; using default.');
      }
    } else {
      setActiveModel(DEFAULT_MODEL);
      setDatasetPreview(null);
      setDatasetStatus('Using default reference model');
    }

    setLoadingDatasets(false);
  };

  useEffect(() => {
    if (!session || !supabaseReady) return;
    (async () => {
      const profileRecord = await ensureProfile(session);
      await loadDatasets(session, profileRecord);
    })();
  }, [session, supabaseReady]);

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    if (!supabaseReady || !supabase) {
      setAuthError('Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
      return;
    }
    const trimmedEmail = signupEmail.trim();
    const trimmedName = signupName.trim();
    const phoneDigits = sanitizePhone(signupPhone);
    if (!trimmedName || !trimmedEmail || !phoneDigits) {
      setAuthError('Name, email, and phone are required.');
      return;
    }
    if (phoneDigits.length < 6) {
      setAuthError('Use at least 6 digits so the phone-based password is valid.');
      return;
    }

    setAuthLoading(true);
    let signInSession: Session | null = null;
    let userId: string | null = null;

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: phoneDigits,
      options: { data: { full_name: trimmedName, phone: phoneDigits } },
    });

    if (error && !error.message.toLowerCase().includes('already registered')) {
      setAuthError(error.message);
      setAuthLoading(false);
      return;
    }

    if (data.session && data.user) {
      signInSession = data.session;
      userId = data.user.id;
    } else {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: phoneDigits,
      });
      if (signInError) {
        setAuthError(signInError.message);
        setAuthLoading(false);
        return;
      }
      signInSession = signInData.session;
      userId = signInData.user?.id || null;
    }

    if (!signInSession || !userId) {
      setAuthError('We could not start your session. Please try again.');
      setAuthLoading(false);
      return;
    }

    setSession(signInSession);
    await supabase
      .from('pricing_calculator_profiles')
      .upsert({
        id: userId,
        full_name: trimmedName,
        phone: phoneDigits,
        email: trimmedEmail,
      })
      .select()
      .maybeSingle();

    setProfile({
      id: userId,
      full_name: trimmedName,
      phone: phoneDigits,
      email: trimmedEmail,
      active_dataset_id: null,
    });

    dispatchLead({
      name: trimmedName,
      phone: signupPhone,
      email: trimmedEmail,
      page: 'pricingcalculator',
    });

    setAuthSuccess('Account created. You are signed in and can upload your spreadsheet.');
    setAuthLoading(false);
  };

  const handleSignin = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    if (!supabaseReady || !supabase) {
      setAuthError('Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
      return;
    }

    const trimmedEmail = signinEmail.trim();
    const phoneDigits = sanitizePhone(signinPhone);
    if (!trimmedEmail || !phoneDigits) {
      setAuthError('Email and phone are required to sign in.');
      return;
    }
    if (phoneDigits.length < 6) {
      setAuthError('Phone/password must be at least 6 digits.');
      return;
    }

    setAuthLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: phoneDigits,
    });
    if (error || !data.session) {
      setAuthError(error?.message || 'Invalid credentials');
      setAuthLoading(false);
      return;
    }

    setSession(data.session);
    setAuthSuccess('Signed in. Your saved spreadsheets and model are ready.');
    setAuthLoading(false);
  };

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    setUploadError(null);
    setUploadSuccess(null);
    setCsvWarnings(null);
    if (!session || !supabaseReady || !supabase) {
      setUploadError('Sign in to upload your spreadsheet.');
      return;
    }

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setUploadError('Choose a CSV file first.');
      return;
    }

    const csvText = await file.text();
    const parsed = parseCsv(csvText);
    if (parsed.missing.length) {
      setUploadError(`Missing columns: ${parsed.missing.join(', ')}.`);
      return;
    }
    if (!parsed.rows.length) {
      setUploadError(parsed.errors[0] || 'No valid rows detected.');
      return;
    }

    let trainedModel: TrainedModel;
    try {
      trainedModel = trainRidgeModel(parsed.rows);
    } catch (err) {
      console.error('Model training failed', err);
      setUploadError('Could not train a model from this file. Please check the numbers.');
      return;
    }

    setUploading(true);
    const storagePath = `${session.user.id}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const { error: storageError } = await supabase.storage
      .from('pricing-calculator')
      .upload(storagePath, file, { upsert: false });

    if (storageError) {
      setUploadError(storageError.message);
      setUploading(false);
      return;
    }

    const preview: DatasetPreviewRow[] = parsed.rows.slice(0, 12).map((r) => ({
      beds: r.beds,
      baths: r.baths,
      sqft: r.sqft,
      type: r.isDeep ? 'deep' : 'standard',
      fridge: r.fridge,
      oven: r.oven,
      clutter: r.clutter,
      hours: r.hours,
    }));

    const { data: inserted, error: insertErr } = await supabase
      .from('pricing_calculator_datasets')
      .insert({
        user_id: session.user.id,
        file_name: file.name,
        storage_path: storagePath,
        row_count: parsed.rows.length,
        model: trainedModel,
        sample_preview: preview,
      })
      .select()
      .maybeSingle();

    if (insertErr || !inserted) {
      console.error('Failed to save dataset metadata', insertErr);
      await supabase.storage.from('pricing-calculator').remove([storagePath]);
      setUploadError(insertErr?.message || 'Could not save dataset metadata.');
      setUploading(false);
      return;
    }

    const newDataset = inserted as DatasetRecord;

    const profilePayload = {
      id: session.user.id,
      full_name: profile?.full_name || signupName || session.user.email || 'Pricing User',
      phone: profile?.phone || sanitizePhone(signupPhone) || sanitizePhone(signinPhone) || '0000000000',
      email: profile?.email || session.user.email || signupEmail || signinEmail || 'unknown@example.com',
      active_dataset_id: newDataset.id,
    };

    await supabase
      .from('pricing_calculator_profiles')
      .upsert(profilePayload)
      .select()
      .maybeSingle();

    setProfile(profilePayload);
    setDatasets([newDataset, ...datasets]);
    setActiveDatasetId(newDataset.id);
    setActiveModel(normalizeModel(newDataset.model || trainedModel));
    setDatasetPreview(newDataset.sample_preview ?? preview);
    setDatasetStatus(`Using ${newDataset.file_name}`);
    setUploadSuccess(`Uploaded ${file.name} with ${parsed.rows.length} rows.`);
    if (parsed.errors.length) {
      setCsvWarnings(parsed.errors.slice(0, 5));
    }
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleActivateDataset = async (datasetId: string) => {
    if (!supabaseReady || !supabase || !session) return;
    const match = datasets.find((d) => d.id === datasetId);
    if (!match) return;

    const profilePayload = {
      id: session.user.id,
      full_name: profile?.full_name || session.user.email || 'Pricing User',
      phone: profile?.phone || sanitizePhone(signupPhone) || '0000000000',
      email: profile?.email || session.user.email || signupEmail || signinEmail || 'unknown@example.com',
      active_dataset_id: datasetId,
    };

    const { error } = await supabase
      .from('pricing_calculator_profiles')
      .upsert(profilePayload)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Failed to set active dataset', error);
      setDatasetStatus('Could not update active dataset.');
      return;
    }

    setProfile(profilePayload);
    setActiveDatasetId(datasetId);
    setActiveModel(normalizeModel(match.model));
    setDatasetPreview(match.sample_preview ?? null);
    setDatasetStatus(`Using ${match.file_name}`);
  };

  const calculatePricing = () => {
    const beds = parseFloat(bedrooms);
    const baths = parseFloat(bathrooms);
    const sqft = parseFloat(sqFeet);

    if (Number.isNaN(beds) || Number.isNaN(baths) || Number.isNaN(sqft)) {
      alert('Please enter valid numbers for all fields');
      return;
    }

    const standardHoursEstimate = estimateCleaningTime(
      activeModel,
      beds,
      baths,
      sqft,
      false,
      addFridge,
      addOven,
      clutterLevel
    );

    const deepHoursEstimate = estimateCleaningTime(
      activeModel,
      beds,
      baths,
      sqft,
      true,
      addFridge,
      addOven,
      clutterLevel
    );

    const hourlyRate = TEAM_RATE;
    const soloRate = SOLO_RATE;

    setStandardHours(standardHoursEstimate);
    setDeepCleanHours(deepHoursEstimate);
    setStandardCleanPrice(standardHoursEstimate * hourlyRate);
    setDeepCleanPrice(deepHoursEstimate * hourlyRate);

    if (standardHoursEstimate < 3) {
      const soloHours = standardHoursEstimate * 2;
      setSoloStandardHours(soloHours);
      setSoloStandardPrice(soloHours * soloRate);
    } else {
      setSoloStandardHours(null);
      setSoloStandardPrice(null);
    }

    if (deepHoursEstimate < 3) {
      const soloHours = deepHoursEstimate * 2;
      setSoloDeepHours(soloHours);
      setSoloDeepPrice(soloHours * soloRate);
    } else {
      setSoloDeepHours(null);
      setSoloDeepPrice(null);
    }
  };

  const resetCalculator = () => {
    setBedrooms('');
    setBathrooms('');
    setSqFeet('');
    setDeepCleanPrice(null);
    setStandardCleanPrice(null);
    setStandardHours(null);
    setDeepCleanHours(null);
    setSoloStandardHours(null);
    setSoloDeepHours(null);
    setSoloStandardPrice(null);
    setSoloDeepPrice(null);
    setClutterLevel('low');
    setAddFridge(false);
    setAddOven(false);
  };

  const toggleStatement = (idx: number) => {
    setStatementChecks((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  };
  const toggleOnboarding = (idx: number) => {
    setOnboardingChecks((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  };
  const toggleChecklist = (idx: number) => {
    setChecklistState((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  };
  const resetStatements = () => setStatementChecks(Array(statementItems.length).fill(false));
  const resetOnboarding = () => setOnboardingChecks(Array(onboardingItems.length).fill(false));
  const resetChecklist = () => setChecklistState(Array(checklistItems.length).fill(false));

  const referenceRows = useMemo(() => datasetPreview || DEFAULT_REFERENCE, [datasetPreview]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-100 px-4 py-8 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white shadow-xl rounded-xl p-6 border border-slate-200">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">Lead Magnet</p>
              <h1 className="text-3xl font-bold text-slate-900">Cleaning Pricing Calculator</h1>
              <p className="text-slate-600 mt-1.5">
                Gate the pricing matrix behind an opt-in, auto-create credentials (email + phone as password),
                and let each account power the algorithm with its own spreadsheet.
              </p>
            </div>
            <div className="text-sm text-right text-slate-600">
              <p className="font-semibold text-slate-800">Sign-in rule</p>
              <p>Email = username</p>
              <p>Password = phone number</p>
            </div>
          </div>
          {!supabaseReady && (
            <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Supabase environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and
              NEXT_PUBLIC_SUPABASE_ANON_KEY to enable auth, uploads, and per-account data.
            </div>
          )}
        </div>

        {!session ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="bg-white shadow-xl rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Get instant access</h2>
                <span className="text-xs font-semibold text-indigo-600 px-2 py-1 rounded-full bg-indigo-50">
                  Auto sign-in
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1.5">
                Enter your name, email, and phone. We will create your account, set the password to your phone,
                and log you in immediately so you can upload your spreadsheet and run the matrix.
              </p>
              <form onSubmit={handleSignup} className="mt-4 space-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-800">Full name</label>
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    placeholder="Alex Smith"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-800">Email (username)</label>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-800">Phone (password)</label>
                  <input
                    type="tel"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    placeholder="555-123-4567"
                  />
                  <p className="text-xs text-slate-500">We set your password to this phone number for quick access.</p>
                </div>
                {authError && <p className="text-sm text-rose-600">{authError}</p>}
                {authSuccess && <p className="text-sm text-emerald-600">{authSuccess}</p>}
                <button
                  type="submit"
                  disabled={authLoading || !supabaseReady}
                  className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {authLoading ? 'Creating account...' : 'Unlock the pricing matrix'}
                </button>
                <p className="text-xs text-slate-500">
                  We also log this as a lead for follow-up. Already have access? Use the sign-in card.
                </p>
              </form>
            </div>

            <div className="bg-slate-900 text-slate-50 shadow-xl rounded-xl p-6 border border-slate-800">
              <h2 className="text-xl font-semibold">Returning user</h2>
              <p className="text-sm text-slate-200 mt-1.5">
                Sign in with the email + phone you used to opt in. Password = phone number.
              </p>
              <form onSubmit={handleSignin} className="mt-4 space-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-100">Email</label>
                  <input
                    type="email"
                    value={signinEmail}
                    onChange={(e) => setSigninEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-100">Phone (password)</label>
                  <input
                    type="tel"
                    value={signinPhone}
                    onChange={(e) => setSigninPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                    placeholder="555-123-4567"
                  />
                </div>
                {authError && <p className="text-sm text-rose-300">{authError}</p>}
                {authSuccess && <p className="text-sm text-emerald-300">{authSuccess}</p>}
                <button
                  type="submit"
                  disabled={authLoading || !supabaseReady}
                  className="w-full rounded-lg bg-white text-slate-900 px-4 py-2.5 font-semibold text-sm hover:bg-slate-100 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {authLoading ? 'Signing in...' : 'Sign in'}
                </button>
                <p className="text-xs text-slate-300">
                  Need help? Re-submit the opt-in with the same email/phone to refresh your access.
                </p>
              </form>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white shadow-lg rounded-xl p-5 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase font-semibold text-indigo-600">Dataset</p>
                    <h3 className="text-lg font-semibold text-slate-900">Upload your spreadsheet</h3>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
                    {datasets.length ? 'Connected' : 'Needed'}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1.5">
                  Each account owns its own CSV. We train the model client-side, store the file in Supabase Storage,
                  and save the coefficients per user.
                </p>
                <form onSubmit={handleUpload} className="mt-4 space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-2 file:text-white hover:file:bg-indigo-700"
                  />
                  <button
                    type="submit"
                    disabled={uploading || !supabaseReady}
                    className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {uploading ? 'Uploading & training...' : 'Upload + train model'}
                  </button>
                  {uploadError && <p className="text-sm text-rose-600">{uploadError}</p>}
                  {uploadSuccess && <p className="text-sm text-emerald-600">{uploadSuccess}</p>}
                  {csvWarnings && (
                    <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 space-y-1">
                      {csvWarnings.map((w, idx) => (
                        <p key={idx}>• {w}</p>
                      ))}
                    </div>
                  )}
                </form>
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 space-y-1">
                  <p className="font-semibold text-slate-800">CSV columns</p>
                  <p>Required: sqft, bedrooms, bathrooms, clean_type (standard|deep), clutter (low|medium|high), fridge, oven, clock_hours/labor_hours.</p>
                  <p>We store the file at pricing-calculator/&lt;user_id&gt;/ and record the trained model per account.</p>
                </div>
              </div>

              <div className="bg-white shadow-lg rounded-xl p-5 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Your datasets</h3>
                  {loadingDatasets && <span className="text-xs text-slate-500">Loading...</span>}
                </div>
                {datasets.length === 0 ? (
                  <p className="text-sm text-slate-600">No uploads yet. The default model is in use.</p>
                ) : (
                  <div className="space-y-2">
                    {datasets.map((ds) => (
                      <button
                        key={ds.id}
                        type="button"
                        onClick={() => handleActivateDataset(ds.id)}
                        className={`w-full text-left rounded-lg border px-3 py-2 transition ${
                          activeDatasetId === ds.id
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                            : 'border-slate-200 bg-white hover:border-indigo-200'
                        }`}
                      >
                        <div className="flex items-center justify-between text-sm font-semibold">
                          <span>{ds.file_name}</span>
                          {activeDatasetId === ds.id && (
                            <span className="text-xs px-2 py-1 rounded-full bg-indigo-600 text-white">Active</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600">
                          {ds.row_count || 0} rows · {new Date(ds.created_at).toLocaleDateString()}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm text-slate-700">
                  <p className="font-semibold text-slate-800">Model status</p>
                  <p>{datasetStatus}</p>
                </div>
              </div>

              <div className="bg-white shadow-lg rounded-xl p-5 border border-slate-200 space-y-3">
                <h3 className="text-lg font-semibold text-slate-900">Preview (sample rows)</h3>
                {referenceRows.length === 0 ? (
                  <p className="text-sm text-slate-600">Upload a file to see sample rows here.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {referenceRows.slice(0, 12).map((row, idx) => (
                      <div key={`${row.beds}-${row.baths}-${idx}`} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-slate-800">
                            {row.beds} bd / {row.baths} ba · {row.sqft.toLocaleString()} sqft
                          </p>
                          <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-slate-200 text-slate-800">
                            {row.type === 'deep' ? 'Deep' : 'Standard'}
                          </span>
                        </div>
                        <p>
                          {row.fridge ? 'Fridge · ' : ''}
                          {row.oven ? 'Oven · ' : ''}
                          {formatClutter(row.clutter)} clutter · {row.hours} hrs
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase font-semibold text-indigo-600">Pricing matrix</p>
                    <h2 className="text-2xl font-bold text-slate-900">Cleaning Pricing Matrix</h2>
                    <p className="text-sm text-slate-600">
                      {`Uses your active dataset to predict labor hours and pricing. Team rate $${TEAM_RATE}/hr, solo rate $${SOLO_RATE}/hr.`}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-700">
                    <p className="font-semibold text-slate-800">Model in use</p>
                    <p>{datasetStatus}</p>
                  </div>
                </div>

                <div className="mb-5 border border-slate-200 rounded-lg p-3 bg-slate-50 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-800">Sales Call Checklist</p>
                    <button
                      onClick={resetChecklist}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {checklistItems.map((item, idx) => (
                      <label key={item} className="flex items-start gap-2 text-xs text-slate-700">
                        <input
                          type="checkbox"
                          checked={checklistState[idx]}
                          onChange={() => toggleChecklist(idx)}
                          className="mt-0.5 h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="leading-snug">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-800">Bedrooms</label>
                    <input
                      type="number"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      placeholder="Bedrooms"
                      min="0"
                      step="1"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-800">Bathrooms</label>
                    <input
                      type="number"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      placeholder="Bathrooms"
                      min="0"
                      step="0.5"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-800">Square Feet</label>
                    <input
                      type="number"
                      value={sqFeet}
                      onChange={(e) => setSqFeet(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      placeholder="Square feet"
                      min="0"
                      step="1"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3 mt-3">
                  <h3 className="text-sm font-semibold text-slate-800 mb-2">Clutter Level</h3>
                  <div className="space-y-2">
                    <select
                      value={clutterLevel}
                      onChange={(e) => setClutterLevel(e.target.value as ClutterLevel)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    >
                      <option value="low">Low - Minimal items out, well maintained</option>
                      <option value="medium">Medium - Moderate items, typical lived-in home</option>
                      <option value="high">High - Many items out, requires extra organization</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3 mt-3">
                  <h3 className="text-sm font-semibold text-slate-800 mb-2">Add-Ons</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addFridge}
                        onChange={(e) => setAddFridge(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700">Clean Inside Fridge</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addOven}
                        onChange={(e) => setAddOven(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700">Clean Inside Oven</span>
                    </label>
                    <p className="text-xs text-slate-500 italic mt-1.5">
                      Add-ons affect both Standard and Deep Clean estimates. Ceiling fans are included in Deep Clean only.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mb-5">
                  <button
                    onClick={calculatePricing}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm"
                  >
                    Calculate Pricing
                  </button>
                  <button
                    onClick={resetCalculator}
                    className="flex-1 bg-slate-500 hover:bg-slate-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm"
                  >
                    Reset
                  </button>
                </div>

                {deepCleanPrice !== null && standardCleanPrice !== null && (
                  <div className="mt-8 space-y-4">
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-300 rounded-lg p-4 space-y-2.5">
                      <h2 className="text-lg font-semibold text-slate-800 mb-2">Deep Clean Price</h2>
                      <p className="text-3xl font-bold text-purple-700">{formatCurrency(deepCleanPrice)}</p>
                      <p className="text-sm text-slate-600 mt-1.5">
                        Estimated time: {deepCleanHours?.toFixed(2)} hours
                      </p>
                      {soloDeepPrice !== null && soloDeepHours !== null && (
                        <div className="mt-2 p-2.5 bg-white/70 border border-purple-200 rounded-lg">
                          <p className="text-sm font-semibold text-purple-800">Solo Deep (1 cleaner)</p>
                          <p className="text-lg font-bold text-purple-700">{formatCurrency(soloDeepPrice)}</p>
                          <p className="text-xs text-slate-600">
                            {`Estimated time: ${soloDeepHours.toFixed(2)} hours @ $${SOLO_RATE}/hr`}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-300 rounded-lg p-4 space-y-2.5">
                      <h2 className="text-lg font-semibold text-slate-800 mb-2">Standard Clean Price</h2>
                      <p className="text-3xl font-bold text-blue-700">{formatCurrency(standardCleanPrice)}</p>
                      <p className="text-sm text-slate-600 mt-1.5">
                        Estimated time: {standardHours?.toFixed(2)} hours
                      </p>
                      {soloStandardPrice !== null && soloStandardHours !== null && (
                        <div className="mt-2 p-2.5 bg-white/70 border border-blue-200 rounded-lg">
                          <p className="text-sm font-semibold text-blue-800">Solo Standard (1 cleaner)</p>
                          <p className="text-lg font-bold text-blue-700">{formatCurrency(soloStandardPrice)}</p>
                          <p className="text-xs text-slate-600">
                            {`Estimated time: ${soloStandardHours.toFixed(2)} hours @ $${SOLO_RATE}/hr`}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-300 rounded-lg p-4 space-y-2.5">
                      <h2 className="text-lg font-semibold text-slate-800 mb-2">
                        Curated Clean (1 cleaner, {CURATED_HOURS} hours)
                      </h2>
                      <p className="text-3xl font-bold text-emerald-700">
                        {formatCurrency(CURATED_HOURS * SOLO_RATE)}
                      </p>
                      <p className="text-sm text-slate-600 mt-1.5">
                        {`Fixed block: ${CURATED_HOURS.toFixed(2)} hours @ $${SOLO_RATE}/hr`}
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mt-3">
                      <p className="text-xs text-slate-600 text-center">
                        {`$${TEAM_RATE}/hour service rate (2 cleaners) | Eligible solos shown when 2-person time < 3 hrs (solo time < 6 hrs) at $${SOLO_RATE}/hour | Curated Clean: 1 cleaner, 4 hrs @ $${SOLO_RATE}/hour | Deep cleans include ceiling fans`}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="border border-slate-200 rounded-lg bg-slate-50 p-3 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-slate-800">Client Statements</p>
                      <button
                        onClick={resetStatements}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                      >
                        Reset
                      </button>
                    </div>
                    <div className="space-y-2">
                      {statementItems.map((item, idx) => (
                        <label key={item} className="flex items-start gap-2 text-xs text-slate-700">
                          <input
                            type="checkbox"
                            checked={statementChecks[idx]}
                            onChange={() => toggleStatement(idx)}
                            className="mt-0.5 h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-2 focus:ring-indigo-500"
                          />
                          <span className="leading-snug">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg bg-slate-50 p-3 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-slate-800">Onboarding Questions</p>
                      <button
                        onClick={resetOnboarding}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                      >
                        Reset
                      </button>
                    </div>
                    <div className="space-y-2">
                      {onboardingItems.map((item, idx) => (
                        <label key={item} className="flex items-start gap-2 text-xs text-slate-700">
                          <input
                            type="checkbox"
                            checked={onboardingChecks[idx]}
                            onChange={() => toggleOnboarding(idx)}
                            className="mt-0.5 h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-2 focus:ring-indigo-500"
                          />
                          <span className="leading-snug">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => setShowReference((prev) => !prev)}
                    className="w-full bg-white border border-slate-200 rounded-lg shadow-sm px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>
                      Reference data {datasetPreview ? `(from your CSV)` : '(default sample)'} ({referenceRows.length}{' '}
                      properties)
                    </span>
                    <span className="text-xs text-slate-500">{showReference ? 'Hide' : 'Show'}</span>
                  </button>

                  {showReference && (
                    <div className="mt-3 bg-white rounded-lg shadow-md p-6">
                      <div className="text-xs text-slate-700 space-y-1 max-h-64 overflow-y-auto">
                        {referenceRows.map((data, idx) => (
                          <p key={`${data.beds}-${data.sqft}-${idx}`}>
                            • {data.beds} bed, {data.baths} bath, {data.sqft.toLocaleString()} sqft
                            {data.type === 'standard' ? ' (Standard)' : ' (Deep)'}
                            {data.fridge ? ' +Fridge' : ''}
                            {data.oven ? ' +Oven' : ''} - {formatClutter(data.clutter)} clutter = {data.hours} hrs
                          </p>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-xs text-slate-500">
                          Models are fit with ridge regression (L2) using your CSV rows. Numeric features are standardized
                          (sqft, beds, baths); binary flags include deep clean, fridge, oven, and clutter levels. If no
                          dataset is active, we fall back to the default reference model.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
