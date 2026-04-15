function slugify(text = '') {
  const base = String(text)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return base || 'article';
}

async function generateUniqueSlug(title, existsFn) {
  const base = slugify(title);
  let candidate = base;
  let suffix = 1;

  while (await existsFn(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

module.exports = {
  slugify,
  generateUniqueSlug
};