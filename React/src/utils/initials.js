export function getInitials(name) {
  if (!name || typeof name !== 'string') {
    return 'P';
  }

  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return 'P';
  }

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

export function photoUrl(path) {
  if (!path) {
    return null;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const clean = String(path).replace(/^\/+/, '');

  return `/storage/${clean}`;
}

export default getInitials;
