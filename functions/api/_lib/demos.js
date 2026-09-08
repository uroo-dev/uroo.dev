// Load demos.json from the uroo.dev repo, cached in KV (short TTL).
// Used to re-verify price + checkout field schema server-side (anti-tamper).

export async function loadDemos(env) {
  const cacheKey = 'demos:cached';
  if (env.ORDERS) {
    const cached = await env.ORDERS.get(cacheKey).catch(() => null);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        if (Array.isArray(data)) return data;
      } catch (e) {
        // ignore stale cache
      }
    }
  }

  const repo = env.GH_REPO_DEMOS || 'uroo-dev/uroo.dev';
  try {
    const res = await fetch(`https://raw.githubusercontent.com/${repo}/main/demos.json`, {
      cf: { cacheTtl: 300 },
    });
    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      if (env.ORDERS) {
        await env.ORDERS.put(cacheKey, JSON.stringify(list), { expirationTtl: 600 }).catch(() => {});
      }
      return list;
    }
  } catch (e) {
    // network error → fall through to cache-only result
  }

  return [];
}

export function findDemo(demos, project) {
  return demos.find((d) => d.project === project && d.status === 'live');
}