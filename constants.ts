import { GradeType, FeeStandard, StandardType, TaxType } from './types';

export const STANDARD_LABELS: Record<StandardType, string> = {
  [StandardType.COMMUNITY_CHEST]: '사회복지공동모금회',
  [StandardType.LOCAL_GOV]: '지방자치인재개발원',
  [StandardType.SEOUL_HRD]: '서울시인재개발원',
};

export const TAX_RATES: Record<TaxType, number> = {
  [TaxType.BUSINESS]: 0.033,
  [TaxType.OTHER]: 0.088,
};

export const TAX_LABELS: Record<TaxType, string> = {
  [TaxType.BUSINESS]: '사업소득 (3.3%)',
  [TaxType.OTHER]: '기타소득 (8.8%)',
};

// Data Structure covering both standards
// Using Partial because not all standards use all grades
export const FEE_STANDARDS_DATA: Record<StandardType, Partial<Record<GradeType, FeeStandard>>> = {
  [StandardType.COMMUNITY_CHEST]: {
    [GradeType.SPECIAL]: {
      name: '특별 강사',
      base: 350000,
      excess: 150000,
      description: '전/현직 장·차관, 대학총장, 대기업 총수 등',
      qualifications: [
        '전/현직 장/차관(급) 이상',
        '전/현직 대학총장(급)',
        '전/현직 국회의원',
        '대기업 총수(회장) 또는 국영기업체장',
        '활동경력 30년 이상의 문화예술, 시민단체, 전문직 종사자'
      ]
    },
    [GradeType.GRADE_1]: {
      name: '1급 강사',
      base: 250000,
      excess: 150000,
      description: '대학 조교수, 전문직(박사+5년), 연구기관장 등',
      qualifications: [
        '대학 조교수 이상, 전문대학 부교수 이상',
        '인간문화재, 유명예술인 및 종교인',
        '정부출연 연구기관장, 기업/기관 등의 책임급 연구원',
        '판/검사, 변호사, 의사, 회계사 등 전문자격증 소지자',
        '전/현직 3급 이상 공무원',
        '활동경력 20년 이상의 전문가'
      ]
    },
    [GradeType.GRADE_2]: {
      name: '2급 강사',
      base: 230000,
      excess: 120000,
      description: '대학 전임강사, 박사학위 소지자, 사무관(5급) 등',
      qualifications: [
        '대학 전임강사 및 전문대학 조교수',
        '전/현직 4/5급 공무원',
        '중소기업체 임원급, 기관/단체 부장급',
        '통계이론, SAS, SPSS 등의 전문가',
        '박사학위소지자',
        '활동경력 10년 이상의 전문가'
      ]
    },
    [GradeType.GRADE_3]: {
      name: '3급 강사',
      base: 170000,
      excess: 100000,
      description: '6급 이하 공무원, 석사 학위, 전문강사 등',
      qualifications: [
        '전/현직 6급 이하 공무원',
        '전임이외의 외래시간 강사',
        '외국어/전산 등 학원강사',
        '체육, 레크레이션 등 전문강사',
        '관련분야 석사학위가 없는 중간관리자'
      ]
    }
  },
  [StandardType.LOCAL_GOV]: {
    [GradeType.SPECIAL_1]: {
      name: '특1급',
      base: 400000,
      excess: 300000,
      description: '전직 장관급, 대학총장, 대기업 회장 등',
      qualifications: [
        '전직 장관급 및 대학총장',
        '전직 국회의원 및 광역자치단체장',
        '대기업 회장',
        '기타 이에 준하는 자로 원장이 인정하는 자'
      ]
    },
    [GradeType.SPECIAL_2]: {
      name: '특2급',
      base: 300000,
      excess: 200000,
      description: '전직 차관급, 공기업 대표, 기초자치단체장 등',
      qualifications: [
        '전직 차관(급)',
        '전직 공기업 대표',
        '전직 기초자치단체장',
        '기타 이에 준하는 자로 원장이 인정하는 자'
      ]
    },
    [GradeType.GRADE_1]: {
      name: '1급',
      base: 250000,
      excess: 120000,
      description: '4급 이상 공무원, 교수, 전문직(5년 이상) 등',
      qualifications: [
        '전직 4급 이상 공무원',
        '전직 지방의회의원(의장 포함)',
        '유명 예술인·종교인',
        '기업·기관·단체의 임원, 중역',
        '전문자격증(변호사, 의사 등) 소지자로서 5년 이상 실무경력자',
        '박사학위 취득 후 해당분야 5년 이상 실무 경력자',
        '국가대표 지도자 및 국가대표 출신 강사'
      ]
    },
    [GradeType.GRADE_2]: {
      name: '2급',
      base: 150000,
      excess: 80000,
      description: '5급 이하 공무원, 중소기업 임원, 박사, 전문직(3년 이상)',
      qualifications: [
        '전직 5급 이하 공무원',
        '중소기업 임원급, 기업·기관·단체의 부장급',
        '체육지도사 1급이상 자격증 소지자 및 해당 교과분야 3년 이상 강의 경력자',
        '원어민 어학 강사(동일어권 국가에서 20년 이상 체류하고 고등교육 이수)',
        '전문자격증을 가진 자로서 3년 이상 실무경력자'
      ]
    },
    [GradeType.GRADE_3]: {
      name: '3급',
      base: 100000,
      excess: 50000,
      description: '외국어/전산 강사, 분야 5년 이상 경력자',
      qualifications: [
        '외국어, 전산 등 강사',
        '체육, 레크리에이션 등 취미소양 강사로서 해당 분야 5년 이상(외부 경력 포함) 또는 3년 이상(자치인재원 경력) 강의 경력자',
        '기타 이에 준하는 자로 원장이 인정하는 자'
      ]
    },
    [GradeType.GRADE_4]: {
      name: '4급',
      base: 80000,
      excess: 40000,
      description: '체육, 레크리에이션 등 취미소양 강사',
      qualifications: [
        '체육, 레크리에이션 등 취미소양 강사'
      ]
    },
    [GradeType.GRADE_5]: {
      name: '5급',
      base: 60000,
      excess: 30000,
      description: '각종 교육운영(실기실습 등) 보조자',
      qualifications: [
        '각종 교육운영(실기실습 등) 보조자'
      ]
    }
  },
  [StandardType.SEOUL_HRD]: {
    [GradeType.SEOUL_SPECIAL]: {
      name: '특강',
      base: 400000,
      excess: 200000,
      description: '전/현직 차관급 이상, 대학총장, 대기업 회장 등',
      qualifications: [
        '전/현직 차관(급) 이상',
        '전/현직 기초자치단체장 이상 및 이에 준하는 자',
        '대학교 총장(급) 및 이에 준하는 학계인사',
        '사회적 명망과 인지도가 높은 문화/예술/종교인/기업대표(급)',
        '대기업 회장'
      ]
    },
    [GradeType.SEOUL_EXPERT]: {
      name: '전문',
      base: 240000,
      excess: 120000,
      description: '전/현직 공무원, 분야별 5년 이상 전문가',
      qualifications: [
        '전/현직 공무원 및 이에 준하는 자',
        '법률/경제/사회/문화/보건 등 해당 분야 5년 이상 활동경력자',
        '기타 이에 준하는 자로 원장이 인정하는 자'
      ]
    },
    [GradeType.SEOUL_ASSISTANT]: {
      name: '보조강사',
      base: 40000,
      excess: 40000,
      description: '각종 교육운영(실기실습 등) 보조자',
      qualifications: [
        '각종 교육운영(실기실습 등) 보조자'
      ]
    }
  }
};

// Manuscript fee constants
export const MANUSCRIPT_FEE_A4 = 12000;
export const MANUSCRIPT_FEE_PPT_SEOUL = 6000;    // Seoul HRD: PPT is 6,000 KRW
export const MANUSCRIPT_MAX_PAGES_PER_HOUR = 6;  // Standard A4 limit
export const MANUSCRIPT_MAX_TOTAL = 300000;