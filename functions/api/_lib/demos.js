// Load demos.json from the bundled static asset (always in sync with the
// current deployment), falling back to the GitHub raw copy. Cached in KV
// (short TTL). Used to re-verify price + checkout field schema server-side.
async function putCache(env, key, data) {
  if (!env.ORDERS) return;
  await env.ORDERS.put(key, JSON.stringify(data), { expirationTtl: 600 }).catch(() => {});
}

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

  let list = null;

  // 1) Bundled static asset — this deployment's demos.json, zero network.
  try {
    if (env.ASSETS) {
      const res = await env.ASSETS.fetch(new Request('https://asset.local/demos.json'));
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) list = data;
      }
    }
  } catch (e) {
    // fall through
  }

  // 2) GitHub raw fallback.
  if (!list) {
    const repo = env.GH_REPO_DEMOS || 'uroo-dev/uroo.dev';
    try {
      const res = await fetch(`https://raw.githubusercontent.com/${repo}/main/demos.json`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) list = data;
      }
    } catch (e) {
      // fall through
    }
  }

  if (!list) list = [];
  if (list.length) {
    await putCache(env, cacheKey, list);
  }
  return list;
}

export function findDemo(demos, project) {
  return demos.find((d) => d.project === project && d.status === 'live');
}