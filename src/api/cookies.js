export const getCookie = (name, defaultValue = '') => {
  if (typeof document === 'undefined') return defaultValue;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift() || defaultValue;
  return defaultValue;
};

export const setCookie = (key, value, days = 7) => {
  if (typeof document === 'undefined') return;
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${key}=${value || ''}${expires}; path=/;`;
};

export const removeCookie = (key) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};