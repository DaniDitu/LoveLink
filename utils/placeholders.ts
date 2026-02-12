
import { GenderType, User } from '../types';

export const getPlaceholderSvg = (type: GenderType = 'MAN'): string => {
  const colors = {
    MAN: { bg: '#dbeafe', fg: '#3b82f6' }, // Blue
    WOMAN: { bg: '#ffe4e6', fg: '#f43f5e' }, // Rose
    COUPLE: { bg: '#f3e8ff', fg: '#9333ea' }, // Purple
  };

  const c = colors[type] || colors.MAN;

  // Simple SVG strings encoded
  const svgs = {
    MAN: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${c.fg}"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>`,
    WOMAN: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${c.fg}"><path d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>`, // Using generic for now, typically hair differs
    COUPLE: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${c.fg}"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`
  };

  const svgString = svgs[type] || svgs.MAN;
  const encoded = encodeURIComponent(svgString);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
};

export const getUserAvatar = (user: User): string => {
  if (user.photoURL) return user.photoURL;
  if (user.photos && user.photos.length > 0) return user.photos[0];
  
  // Fallback to Categorical SVG
  return getPlaceholderSvg(user.type || 'MAN');
};
