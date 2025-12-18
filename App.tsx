import React, { useState, useEffect, useMemo } from 'react';
import { GradeType, CalculationResult, StandardType, TaxType, ManuscriptType } from './types';
import { FEE_STANDARDS_DATA, STANDARD_LABELS, TAX_RATES, MANUSCRIPT_MAX_PAGES_PER_HOUR } from './constants';
import { calculateLectureFee, calculateManuscriptFee } from './utils/calculation';
import InfoTooltip from './components/InfoTooltip';
import SimpleTooltip from './components/SimpleTooltip';
import { Calculator, FileText, Clock, Award, CheckCircle2, AlertCircle, Scale, HelpCircle, ChevronDown, ChevronUp, BookOpen, Presentation } from 'lucide-react';

// Helper to sort grades logically
const GRADE_ORDER: GradeType[] = [
  // Community Chest & Common
  GradeType.SPECIAL,
  GradeType.SPECIAL_1,
  GradeType.SPECIAL_2,
  GradeType.GRADE_1,
  GradeType.GRADE_2,
  GradeType.GRADE_3,
  GradeType.GRADE_4,
  GradeType.GRADE_5,
  
  // Seoul HRD
  GradeType.SEOUL_SPECIAL,
  GradeType.SEOUL_EXPERT,
  GradeType.SEOUL_ASSISTANT,
];

// Custom Number Input Component with Explicit Arrows
const NumberInputWithControls = ({ 
  value, 
  onChange, 
  min = 0, 
  max, 
  unit, 
  step = 1 
}: { 
  value: number; 
  onChange: (val: number) => void; 
  min?: number; 
  max?: number; 
  unit: string;
  step?: number;
}) => {
  const handleIncrement = () => {
    const next = value + step;
    if (max !== undefined && next > max) return;
    onChange(next);
  };

  const handleDecrement = () => {
    const next = value - step;
    if (next < min) return;
    onChange(next);
  };

  return (
    <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all overflow-hidden group hover:border-teal-300">
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          let val = parseInt(e.target.value) || 0;
          if (max !== undefined && val > max) val = max;
          if (val < min) val = min;
          onChange(val);
        }}
        className="block w-full p-4 pr-16 text-center bg-transparent border-none focus:ring-0 font-semibold text-lg text-slate-900 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <span className="absolute right-12 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium pointer-events-none select-none">
        {unit}
      </span>
      
      {/* Custom Arrows */}
      <div className="absolute right-1 flex flex-col border-l border-slate-200 h-full">
        <button 
          type="button"
          onClick={handleIncrement}
          className="flex-1 px-1.5 hover:bg-slate-100 text-slate-400 hover:text-teal-600 active:bg-slate-200 transition-colors flex items-center justify-center border-b border-slate-200"
        >
          <ChevronUp size={14} strokeWidth={3} />
        </button>
        <button 
          type="button"
          onClick={handleDecrement}
          className="flex-1 px-1.5 hover:bg-slate-100 text-slate-400 hover:text-teal-600 active:bg-slate-200 transition-colors flex items-center justify-center"
        >
          <ChevronDown size={14} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [selectedStandard, setSelectedStandard] = useState<StandardType>(StandardType.COMMUNITY_CHEST);
  
  // Initialize grade based on standard
  const [selectedGrade, setSelectedGrade] = useState<GradeType>(GradeType.GRADE_2);
  const [taxType, setTaxType] = useState<TaxType>(TaxType.OTHER);

  const [hours, setHours] = useState<number>(1);
  const [minutes, setMinutes] = useState<number>(0);
  const [manuscriptPages, setManuscriptPages] = useState<number>(0);
  const [manuscriptType, setManuscriptType] = useState<ManuscriptType>(ManuscriptType.A4);
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Additional state for UI feedback
  const [recognizedPages, setRecognizedPages] = useState<number>(0);

  // Reset grade when standard changes if current grade is invalid
  useEffect(() => {
    const feeTable = FEE_STANDARDS_DATA[selectedStandard];
    if (!feeTable[selectedGrade]) {
      // Default to the first available grade or a safe default
      const availableGrades = GRADE_ORDER.filter(g => feeTable[g]);
      if (availableGrades.length > 0) {
        // Prefer GRADE_2, then SEOUL_EXPERT, then whatever is first
        const defaultGrade = availableGrades.find(g => g === GradeType.GRADE_2) 
                          || availableGrades.find(g => g === GradeType.SEOUL_EXPERT) 
                          || availableGrades[0];
        setSelectedGrade(defaultGrade);
      }
    }
    
    // Reset manuscript type default when standard changes
    setManuscriptType(ManuscriptType.A4);
  }, [selectedStandard, selectedGrade]);

  useEffect(() => {
    // Get the current fee table based on selected standard
    const feeTable = FEE_STANDARDS_DATA[selectedStandard];
    const currentGradeStandard = feeTable[selectedGrade];

    if (!currentGradeStandard) return;

    const { fee, hoursCalculated, excessHours } = calculateLectureFee(currentGradeStandard, hours, minutes);
    
    const { fee: mFee, recognizedPages: rPages } = calculateManuscriptFee(manuscriptPages, hoursCalculated, selectedStandard, manuscriptType);
    
    setRecognizedPages(rPages);

    const totalGross = fee + mFee;
    
    // Tax Calculation logic
    let tax = 0;
    
    // NOTE: User requested Manuscript Fee to be excluded from withholding tax.
    // Therefore, taxable amount is only the Lecture Fee.
    const taxableAmount = fee;

    if (taxType === TaxType.OTHER) {
      // Other Income (8.8%): Taxable if amount > 125,000 KRW (Tax Base 50,000)
      if (taxableAmount > 125000) {
        tax = Math.floor((taxableAmount * TAX_RATES[TaxType.OTHER]) / 10) * 10; // Floor to 1s place
      }
    } else {
      // Business Income (3.3%)
      const rawTax = Math.floor((taxableAmount * TAX_RATES[TaxType.BUSINESS]) / 10) * 10;
      
      // Small sum collection exemption: Tax < 1,000 KRW is exempt
      if (rawTax >= 1000) {
        tax = rawTax;
      }
    }

    setResult({
      lectureFee: fee,
      manuscriptFee: mFee,
      totalGross,
      tax,
      totalNet: totalGross - tax,
      hoursCalculated,
      excessHours
    });
  }, [selectedStandard, selectedGrade, hours, minutes, manuscriptPages, manuscriptType, taxType]);

  const currentFeeData = useMemo(() => FEE_STANDARDS_DATA[selectedStandard], [selectedStandard]);
  
  // Get available grades for current standard and sort them
  const availableGrades = useMemo(() => {
    return GRADE_ORDER.filter(grade => currentFeeData[grade] !== undefined);
  }, [currentFeeData]);

  const selectedStandardData = currentFeeData[selectedGrade];
  
  const showManuscriptTypeSelector = selectedStandard === StandardType.SEOUL_HRD || selectedStandard === StandardType.COMMUNITY_CHEST;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans py-10 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3 flex items-center justify-center gap-3">
            <span className="bg-gradient-to-br from-teal-500 to-teal-700 text-white p-2.5 rounded-xl shadow-lg shadow-teal-500/30">
              <Calculator size={28} />
            </span>
            비영리조직 강사비 계산기
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            기준과 등급을 선택하여 복잡한 강사비 계산을 쉽고 정확하게 확인하세요.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Input Form */}
          <section className="lg:col-span-7 space-y-6">
            
            {/* 1. Standard Selection */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                <Scale className="text-teal-600" size={20} />
                산출 기준 선택 <span className="text-slate-500 font-normal text-sm ml-1">(2025년 기준)</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(Object.keys(STANDARD_LABELS) as StandardType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedStandard(type)}
                    className={`
                      relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200
                      ${selectedStandard === type
                        ? 'border-teal-500 bg-teal-50/50 text-teal-900 ring-2 ring-teal-500/20 shadow-sm'
                        : 'border-slate-100 bg-white text-slate-600 hover:border-teal-200 hover:bg-slate-50'
                      }
                    `}
                  >
                    <span className={`text-sm font-bold text-center ${selectedStandard === type ? 'text-teal-800' : 'text-slate-700'}`}>
                      {STANDARD_LABELS[type]}
                    </span>
                    {selectedStandard === type && (
                      <div className="absolute top-3 right-3 text-teal-600">
                        <CheckCircle2 size={16} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Combined Calculation Config */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-8">
              <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
                <div className="bg-teal-100 p-1.5 rounded-lg text-teal-600">
                  <Calculator size={18} />
                </div>
                강사료 및 원고료 산출 정보
              </h2>
              
              {/* Grade Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  강사 등급
                </label>
                <div className="relative">
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value as GradeType)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-base rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 block p-4 pr-10 transition-all cursor-pointer font-medium"
                  >
                    {availableGrades.map((grade) => (
                      <option key={grade} value={grade}>
                        {currentFeeData[grade]?.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <ChevronDown size={20} />
                  </div>
                </div>

                {/* Grade Detail Card */}
                {selectedStandardData && (
                  <div className="mt-4 bg-slate-50 rounded-xl p-5 border border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-slate-800">{selectedStandardData.name}</span>
                        <InfoTooltip qualifications={selectedStandardData.qualifications} />
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-teal-700">
                          {selectedStandardData.base.toLocaleString()}원
                        </div>
                        <div className="text-xs font-medium text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200 inline-block">
                          초과: {selectedStandardData.excess.toLocaleString()}원
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-200 pt-3 mt-1">
                      {selectedStandardData.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Inputs Grid: Time & Manuscript */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-6">
                {/* Time Input */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                    <Clock size={18} className="text-teal-600" />
                    강의 시간
                  </label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <NumberInputWithControls 
                        value={hours}
                        onChange={setHours}
                        min={0}
                        unit="시간"
                      />
                    </div>
                    <div className="flex-1">
                      <NumberInputWithControls 
                        value={minutes}
                        onChange={setMinutes}
                        min={0}
                        max={59}
                        unit="분"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 pl-1">
                    * 30분 이상 1시간 인정 (미만 절사)
                  </p>
                </div>

                {/* Manuscript Input */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                    <BookOpen size={18} className="text-slate-400" />
                    <span className="text-slate-500">원고료 (선택사항)</span>
                  </label>
                  
                  {/* Manuscript Type Selector */}
                  {showManuscriptTypeSelector && (
                    <div className="flex bg-slate-100 rounded-lg p-1 mb-3">
                      <button
                        onClick={() => setManuscriptType(ManuscriptType.A4)}
                        className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5
                          ${manuscriptType === ManuscriptType.A4 
                            ? 'bg-white text-teal-700 shadow-sm ring-1 ring-black/5' 
                            : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        <FileText size={14} /> A4 (12,000원)
                      </button>
                      <button
                        onClick={() => setManuscriptType(ManuscriptType.PPT)}
                        className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5
                          ${manuscriptType === ManuscriptType.PPT
                            ? 'bg-white text-teal-700 shadow-sm ring-1 ring-black/5' 
                            : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        <Presentation size={14} /> 
                        {selectedStandard === StandardType.SEOUL_HRD ? 'PPT (6,000원)' : 'PPT (슬라이드)'}
                      </button>
                    </div>
                  )}

                  <div className="max-w-full">
                     <NumberInputWithControls 
                        value={manuscriptPages}
                        onChange={setManuscriptPages}
                        min={0}
                        unit={manuscriptType === ManuscriptType.PPT ? "매(슬라이드)" : "매(A4)"}
                      />
                  </div>
                   <div className="mt-2 space-y-1">
                    <p className="text-xs text-slate-400 pl-1">
                       {selectedStandard === StandardType.SEOUL_HRD && manuscriptType === ManuscriptType.PPT
                         ? '* 파워포인트 슬라이드 1면당 6,000원'
                         : selectedStandard === StandardType.COMMUNITY_CHEST && manuscriptType === ManuscriptType.PPT
                           ? '* 파워포인트 3장당 A4 1면 인정 (나머지 절사)'
                           : '* A4 1면당 12,000원'
                       }
                    </p>
                    
                    {/* Helper text for Community Chest - PPT/Manuscript Conversion */}
                    {selectedStandard === StandardType.COMMUNITY_CHEST && (
                      <div className="bg-slate-100 rounded-lg p-2.5 mt-2 text-[11px] text-slate-600 border border-slate-200 text-center">
                         <span className="font-semibold text-teal-700">A4 1면 인정 기준</span> : 파워포인트 슬라이드 3면 ∙ 200자 원고지 3.5매
                      </div>
                    )}

                    {/* Helper text for Seoul HRD */}
                    {selectedStandard === StandardType.SEOUL_HRD && (
                      <div className="bg-slate-100 rounded-lg p-2.5 mt-2 text-[11px] text-slate-600 border border-slate-200 space-y-1">
                         <p className="flex items-start gap-1.5">
                           <span className="shrink-0 font-bold text-teal-600">•</span> 
                           <span>강의시간당 A4용지 6매분까지 지급</span>
                         </p>
                         <p className="flex items-start gap-1.5">
                           <span className="shrink-0 font-bold text-teal-600">※</span>
                           <span>강사 1인에 대한 1주(5일간) 원고료는 A4용지 최고 40매로 제한</span>
                         </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Manuscript Warning - Only show if active */}
              {manuscriptPages > 0 && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs">
                   <div className="flex items-start gap-2 text-slate-600">
                     <AlertCircle size={14} className="mt-0.5 shrink-0 text-slate-400" />
                     <div className="space-y-1">
                       <p>원고료 한도: {selectedStandard === StandardType.SEOUL_HRD 
                            ? '시간당 A4 6매(PPT 12매)분 금액' 
                            : selectedStandard === StandardType.COMMUNITY_CHEST
                                ? '시간당 A4 6매분 금액 (총액 30만원 한도)'
                                : '최대 300,000원'
                        }</p>
                       
                       {/* Warning for Seoul HRD */}
                       {selectedStandard === StandardType.SEOUL_HRD && result && recognizedPages < manuscriptPages && (
                          <p className="font-semibold text-amber-600">
                            ※ 시간당 제한 적용: 현재 {result.hoursCalculated}시간 강의로 최대 {
                              manuscriptType === ManuscriptType.PPT 
                              ? result.hoursCalculated * 12 
                              : result.hoursCalculated * MANUSCRIPT_MAX_PAGES_PER_HOUR
                            }매까지만 인정됩니다.
                          </p>
                       )}

                       {/* Warning for Community Chest */}
                       {selectedStandard === StandardType.COMMUNITY_CHEST && result && recognizedPages < manuscriptPages && (
                          <p className="font-semibold text-amber-600">
                             ※ 인정 기준 적용: (슬라이드 3면 = A4 1면) 및 한도 초과분 제외
                          </p>
                       )}
                     </div>
                   </div>
                </div>
              )}

            </div>

          </section>

          {/* Right Column: Results */}
          <section className="lg:col-span-5 space-y-6 sticky top-6">
            
            {/* Result Card */}
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="bg-slate-900 p-6 text-white">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Award size={20} className="text-teal-400" />
                  예상 지급 내역
                </h2>
              </div>

              {result && (
                <div className="p-6 md:p-8 space-y-6">
                  
                  {/* Hours Summary */}
                  <div className="flex justify-between items-baseline border-b border-slate-100 pb-4">
                     <span className="text-slate-500 font-medium">인정 강의시간</span>
                     <div className="text-right">
                        <span className="text-xl font-bold text-slate-800">{result.hoursCalculated}시간</span>
                        <div className="text-xs text-slate-400 mt-0.5">
                           (기본 1 + 초과 {result.excessHours})
                        </div>
                     </div>
                  </div>

                  {/* Fee Breakdown */}
                  <div className="space-y-3 pb-4 border-b border-slate-100">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 flex items-center">
                        강사비 (세전)
                        <SimpleTooltip content="선택한 등급의 기본급과 초과 시간 수당이 합산된 금액입니다." />
                      </span>
                      <span className="text-slate-900 font-semibold">{result.lectureFee.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 flex items-center">
                        원고료 (세전)
                        <SimpleTooltip content="제출한 원고 분량에 따른 금액입니다. (강의 시간에 따른 제한 한도 적용)" />
                      </span>
                      <div className="text-right">
                        <span className="text-slate-900 font-semibold">{result.manuscriptFee.toLocaleString()}원</span>
                        {recognizedPages < manuscriptPages && (
                          <span className="text-[10px] text-amber-600 block">
                             ({recognizedPages}매 인정)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-slate-500 font-medium">지급 총액</span>
                      <span className="text-lg font-bold text-slate-800">{result.totalGross.toLocaleString()}원</span>
                    </div>
                  </div>

                  {/* Tax Config */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center gap-1.5 mb-3">
                       <HelpCircle size={14} className="text-slate-400" />
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">세금 분류 (소득 성격)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setTaxType(TaxType.OTHER)}
                        className={`p-3 rounded-lg border text-left transition-all ${taxType === TaxType.OTHER ? 'bg-white border-teal-500 ring-1 ring-teal-500 shadow-sm' : 'bg-white border-slate-200 opacity-60 hover:opacity-100'}`}
                      >
                         <div className="text-sm font-bold text-slate-900">기타소득 (8.8%)</div>
                         <div className="text-[10px] text-slate-500 mt-1">일시적 강의</div>
                      </button>
                      <button
                        onClick={() => setTaxType(TaxType.BUSINESS)}
                        className={`p-3 rounded-lg border text-left transition-all ${taxType === TaxType.BUSINESS ? 'bg-white border-teal-500 ring-1 ring-teal-500 shadow-sm' : 'bg-white border-slate-200 opacity-60 hover:opacity-100'}`}
                      >
                         <div className="text-sm font-bold text-slate-900">사업소득 (3.3%)</div>
                         <div className="text-[10px] text-slate-500 mt-1">지속적 강의</div>
                      </button>
                    </div>
                  </div>

                  {/* Final Calculation */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-500 flex items-center">
                         원천징수세액 <span className="text-xs ml-1">({taxType === TaxType.OTHER ? '8.8%' : '3.3%'})</span>
                         <SimpleTooltip content="선택한 소득 유형에 따라 공제되는 세금입니다. (소득세 + 지방소득세)" />
                       </span>
                       <span className="text-rose-500 font-medium">-{result.tax.toLocaleString()}원</span>
                    </div>
                    
                    {/* Tax Free Notice */}
                    {result.tax === 0 && result.lectureFee > 0 && (
                      <div className="text-xs text-teal-600 bg-teal-50 px-3 py-2 rounded-lg text-right">
                        {taxType === TaxType.OTHER 
                          ? '강사료 125,000원 이하로 과세최저한 적용 (면세)' 
                          : '세액 1,000원 미만 소액부징수 (면세)'}
                      </div>
                    )}
                    {result.manuscriptFee > 0 && (
                       <div className="text-xs text-slate-400 text-right">
                         * 원고료는 원천징수 대상 제외
                       </div>
                    )}

                    <div className="pt-4 border-t-2 border-slate-900/5 flex justify-between items-center">
                       <span className="font-bold text-slate-800 text-lg">실 지급액</span>
                       <span className="font-extrabold text-3xl text-teal-600">{result.totalNet.toLocaleString()}원</span>
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div className="bg-slate-100 rounded-xl p-5 border border-slate-200">
               <h4 className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                 <AlertCircle size={14} /> 유의사항
               </h4>
               <ul className="text-xs text-slate-500 space-y-1.5 leading-relaxed list-disc pl-4">
                 <li>'2025년 배분사업 수행안내자료(사회복지공동모금회)' 및 '지방자치인재개발원 강사수당 지급기준' 참고</li>
                 <li>청탁금지법 대상자는 소속 기관 상한액 기준 우선 적용 가능</li>
                 <li>교통비/식비 등 여비는 실비 정산 원칙 (별도)</li>
               </ul>
            </div>

          </section>

        </main>
      </div>
    </div>
  );
};

export default App;