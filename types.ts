export enum GradeType {
  SPECIAL = 'SPECIAL',     // For Community Chest
  SPECIAL_1 = 'SPECIAL_1', // For Local Gov
  SPECIAL_2 = 'SPECIAL_2', // For Local Gov
  GRADE_1 = 'GRADE_1',
  GRADE_2 = 'GRADE_2',
  GRADE_3 = 'GRADE_3',
  GRADE_4 = 'GRADE_4',
  GRADE_5 = 'GRADE_5',
  
  // Seoul HRD Grades
  SEOUL_SPECIAL = 'SEOUL_SPECIAL', // 특강
  SEOUL_EXPERT = 'SEOUL_EXPERT',   // 전문
  SEOUL_ASSISTANT = 'SEOUL_ASSISTANT', // 보조
}

export enum StandardType {
  COMMUNITY_CHEST = 'COMMUNITY_CHEST',
  LOCAL_GOV = 'LOCAL_GOV',
  SEOUL_HRD = 'SEOUL_HRD',
}

export enum TaxType {
  BUSINESS = 'BUSINESS', // 3.3%
  OTHER = 'OTHER',       // 8.8%
}

export enum ManuscriptType {
  A4 = 'A4',
  PPT = 'PPT',
}

export interface FeeStandard {
  base: number;
  excess: number;
  name: string;
  description: string;
  qualifications: string[];
}

export interface CalculationResult {
  lectureFee: number;
  manuscriptFee: number;
  totalGross: number;
  tax: number;
  totalNet: number;
  hoursCalculated: number;
  excessHours: number;
}