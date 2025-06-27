export const removeDuplicatesFromDrugDictionary = (drugDict) => {
  const cleaned = {};

  for (const key in drugDict) {
    if (Array.isArray(drugDict[key])) {
      const uniqueValues = Array.from(new Set(drugDict[key].map(v => v.trim())));
      cleaned[key] = uniqueValues;
    }
  }

  return cleaned;
}