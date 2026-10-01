export default async function handler(req, res) {
  // كاش سحابي ذكي يتحدث تلقائياً كل 30 ثانية دون إعادة بناء للموقع
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  const headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJubXVuY3hrZnlva25tcWVqZ2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4MjAyNDgsImV4cCI6MjEwNjM5NjI0OH0.brz_j92R3j1FmDUyryxpaoIfn4vK_rcZjelYaCd5T0w',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJubXVuY3hrZnlva25tcWVqZ2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4MjAyNDgsImV4cCI6MjEwNjM5NjI0OH0.brz_j92R3j1FmDUyryxpaoIfn4vK_rcZjelYaCd5T0w'
  };

  try {
    const [bRes, bnRes, jRes, pRes] = await Promise.allSettled([
      fetch('https://rnmuncxkfyoknmqejghl.supabase.co/rest/v1/businesses?select=*&order=created_at.desc&limit=20', { headers }).then(r => r.json()),
      fetch('https://rnmuncxkfyoknmqejghl.supabase.co/rest/v1/banks?select=*&limit=6', { headers }).then(r => r.json()),
      fetch('https://rnmuncxkfyoknmqejghl.supabase.co/rest/v1/jobs?select=*&order=created_at.desc&limit=6', { headers }).then(r => r.json()),
      fetch('https://rnmuncxkfyoknmqejghl.supabase.co/rest/v1/properties?select=*&order=created_at.desc&limit=6', { headers }).then(r => r.json())
    ]);

    return res.status(200).json({
      businesses: bRes.status === 'fulfilled' && Array.isArray(bRes.value) ? bRes.value : [],
      banks: bnRes.status === 'fulfilled' && Array.isArray(bnRes.value) ? bnRes.value : [],
      jobs: jRes.status === 'fulfilled' && Array.isArray(jRes.value) ? jRes.value : [],
      properties: pRes.status === 'fulfilled' && Array.isArray(pRes.value) ? pRes.value : [],
      timestamp: Date.now()
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to aggregate feed' });
  }
}
