/**
 * Fetch questions from multiple API URLs.
 * Each URL should return JSON that is or contains an array of question-like objects.
 * Supports: array root, or { data }, { questions }, { results }, { items }.
 */
export async function fetchQuestionsFromUrls(urls) {
  if (!urls?.length) return [];
  const results = await Promise.allSettled(
    urls.map(async (url) => {
      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) return data;
      if (data?.data && Array.isArray(data.data)) return data.data;
      if (data?.questions && Array.isArray(data.questions)) return data.questions;
      if (data?.results && Array.isArray(data.results)) return data.results;
      if (data?.items && Array.isArray(data.items)) return data.items;
      return [];
    })
  );
  const all = [];
  results.forEach((r) => {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) all.push(...r.value);
  });
  return all;
}
