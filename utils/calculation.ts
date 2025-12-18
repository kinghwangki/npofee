import { FeeStandard, StandardType, ManuscriptType } from '../types';
import { MANUSCRIPT_FEE_A4, MANUSCRIPT_FEE_PPT_SEOUL, MANUSCRIPT_MAX_TOTAL, MANUSCRIPT_MAX_PAGES_PER_HOUR } from '../constants';

export const calculateLectureFee = (
  standard: FeeStandard,
  hours: number,
  minutes: number
) => {
  let totalMinutes = hours * 60 + minutes;
  
  // Rule: Less than 30 mins total doesn't count
  // Standard logic: 1st hour is Base. Remaining time determines Excess.
  
  let recognizedBaseHours = 0;
  let recognizedExcessHours = 0;

  if (totalMinutes < 30) {
    // Usually very short lectures might have different internal rules, 
    // but based on typical guidelines:
    // If total time < 1 hour, check if >= 30 min.
    
    if (totalMinutes >= 30) {
        recognizedBaseHours = 1; // Count as 1 hour base
    } else {
        recognizedBaseHours = 0; // Too short to bill
    }
  } else {
    // 1st hour is mandatory base
    recognizedBaseHours = 1;
    
    // Calculate remaining minutes after first hour
    const remainingMinutes = totalMinutes - 60;
    
    if (remainingMinutes > 0) {
       // Excess hours logic: 30 mins or more counts as 1 hour.
       const fullExcessHours = Math.floor(remainingMinutes / 60);
       const leftOverMinutes = remainingMinutes % 60;
       
       recognizedExcessHours = fullExcessHours;
       if (leftOverMinutes >= 30) {
         recognizedExcessHours += 1;
       }
    }
  }

  const fee = (recognizedBaseHours * standard.base) + (recognizedExcessHours * standard.excess);
  
  return {
    fee,
    hoursCalculated: recognizedBaseHours + recognizedExcessHours,
    excessHours: recognizedExcessHours
  };
};

export const calculateManuscriptFee = (
  pages: number,
  hoursCalculated: number,
  standardType: StandardType,
  manuscriptType: ManuscriptType = ManuscriptType.A4
) => {
  let recognizedPages = pages;
  let fee = 0;
  const isPPT = manuscriptType === ManuscriptType.PPT;

  if (standardType === StandardType.SEOUL_HRD) {
    // Seoul HRD: 
    // Rate: A4 12,000 / PPT 6,000
    // Limit: 6 A4 pages equivalent per hour.
    // Monetary limit per hour: 6 * 12,000 = 72,000 KRW.
    
    const rate = isPPT ? MANUSCRIPT_FEE_PPT_SEOUL : MANUSCRIPT_FEE_A4;
    const maxFeePerHour = MANUSCRIPT_MAX_PAGES_PER_HOUR * MANUSCRIPT_FEE_A4; // 72,000
    const maxFeeTotal = maxFeePerHour * hoursCalculated;
    
    const calculatedFee = pages * rate;
    
    if (calculatedFee > maxFeeTotal) {
      fee = maxFeeTotal;
      // Reverse calculate recognized pages from fee
      recognizedPages = Math.floor(fee / rate);
    } else {
      fee = calculatedFee;
    }
    
  } else if (standardType === StandardType.COMMUNITY_CHEST && isPPT) {
    // Community Chest PPT Special Logic:
    // 3 Slides = 1 A4 Page.
    // Fee = floor(slides / 3) * 12,000.
    
    const a4Count = Math.floor(pages / 3);
    let currentFee = a4Count * MANUSCRIPT_FEE_A4;

    // Limits
    // Hourly: Max 6 A4 pages per hour -> Fee 72,000 * hours
    const maxFeePerHour = hoursCalculated * MANUSCRIPT_MAX_PAGES_PER_HOUR * MANUSCRIPT_FEE_A4;
    
    if (currentFee > maxFeePerHour) {
        currentFee = maxFeePerHour;
    }
    
    // Total: Max 300,000
    if (currentFee > MANUSCRIPT_MAX_TOTAL) {
        currentFee = MANUSCRIPT_MAX_TOTAL;
    }

    fee = currentFee;
    // Reverse calculate recognized input slides (must be multiples of 3 to be paid)
    // recognizedPages in UI is compared to input pages. 
    // If I put 4 slides, I get paid for 3 (1 A4). recognizedPages should be 3.
    // fee is always a multiple of 12000 (or capped). 
    // recognizedPages = (fee / 12000) * 3
    recognizedPages = (fee / MANUSCRIPT_FEE_A4) * 3;

  } else {
    // Community Chest (A4) OR Local Gov (Default)
    // Rate: A4 12,000
    
    const rate = MANUSCRIPT_FEE_A4; 
    
    // Simple logic: Max 6 pages/hr, Max 300k total
    const maxPagesByTime = hoursCalculated * MANUSCRIPT_MAX_PAGES_PER_HOUR;
    
    if (recognizedPages > maxPagesByTime) {
      recognizedPages = maxPagesByTime;
    }
    
    fee = recognizedPages * rate;
    
    if (fee > MANUSCRIPT_MAX_TOTAL) {
      fee = MANUSCRIPT_MAX_TOTAL;
      recognizedPages = Math.floor(fee / rate);
    }
  }
  
  return {
    fee,
    recognizedPages
  };
};