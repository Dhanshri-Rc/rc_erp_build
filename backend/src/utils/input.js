export const pick = (source, fields) => Object.fromEntries(
  fields.filter((field) => Object.prototype.hasOwnProperty.call(source || {}, field)).map((field) => [field, source[field]])
);

export const asString = (value, max = 5000) => typeof value === 'string' ? value.trim().slice(0, max) : '';
