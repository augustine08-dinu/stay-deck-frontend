import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { enIN } from 'date-fns/locale';

// Indian date format: DD/MM/YYYY
export const formatDateIN = (date) => {
  if (!date) return 'N/A';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'dd/MM/yyyy');
  } catch (error) {
    return 'Invalid Date';
  }
};

// Indian date + time: DD/MM/YYYY, hh:mm a
export const formatDateTimeIN = (date) => {
  if (!date) return 'N/A';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'dd/MM/yyyy, hh:mm a');
  } catch (error) {
    return 'Invalid Date';
  }
};

// Indian time format: hh:mm a (2:30 PM)
export const formatTimeIN = (date) => {
  if (!date) return 'N/A';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'hh:mm a');
  } catch (error) {
    return 'Invalid Date';
  }
};

// Long date: 29 September 2026
export const formatLongDateIN = (date) => {
  if (!date) return 'N/A';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'dd MMMM yyyy', { locale: enIN });
  } catch (error) {
    return 'Invalid Date';
  }
};

// Day + date: Monday, 29 September 2026
export const formatDayDateIN = (date) => {
  if (!date) return 'N/A';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'EEEE, dd MMMM yyyy', { locale: enIN });
  } catch (error) {
    return 'Invalid Date';
  }
};

// Relative time: "2 hours ago", "in 3 days"
export const formatRelativeIN = (date) => {
  if (!date) return 'N/A';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(d, { addSuffix: true, locale: enIN });
  } catch (error) {
    return 'Invalid Date';
  }
};

// For HTML input type="date" (needs YYYY-MM-DD)
export const toInputDate = (date) => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'yyyy-MM-dd');
  } catch (error) {
    return '';
  }
};

// For HTML input type="time" (needs HH:mm in 24-hour format)
export const toInputTime = (date) => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'HH:mm');
  } catch (error) {
    return '';
  }
};

// Get current date in IST as YYYY-MM-DD (for form default values)
export const getTodayIST = () => {
  const now = new Date();
  // Convert to IST
  const istOffset = 5.5 * 60 * 60 * 1000; // UTC+5:30 in milliseconds
  const istTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + istOffset);
  return format(istTime, 'yyyy-MM-dd');
};

// Get current IST time as HH:mm
export const getCurrentTimeIST = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + istOffset);
  return format(istTime, 'HH:mm');
};

// Get current IST datetime as ISO string
export const getNowIST = () => {
  const now = new Date();
  return formatDateTimeIN(now);
};
