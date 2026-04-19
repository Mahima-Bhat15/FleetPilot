// src/utils/theme.js

export const statusColor = (status) => {
  switch (status) {
    case 'Available':  return 'var(--green)';
    case 'In Transit': return 'var(--primary)';
    case 'Warning':    return 'var(--amber)';
    case 'Dark':       return 'var(--red)';
    case 'Resting':    return 'var(--purple)';
    default:           return 'var(--text3)';
  }
};

export const hosColor = (hos) => {
  if (hos < 2) return 'var(--red)';
  if (hos < 4) return 'var(--amber)';
  return 'var(--green)';
};

export const riskGrade = (driver) => {
  if (driver.hos < 2 || driver.cycle > 65) return { grade: 'C', color: 'var(--red)',   label: 'HIGH' };
  if (driver.hos < 4 || driver.pattern || driver.cycle > 55) return { grade: 'B', color: 'var(--amber)', label: 'MED' };
  return { grade: 'A', color: 'var(--green)', label: 'LOW' };
};
