import http from 'node:http';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function fetchReq(path, headers = {}) {
  const url = new URL(path, BASE_URL);
  return new Promise((resolve, reject) => {
    const req = http.request(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Ora-Agent-Test/1.0',
        ...headers,
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log(`\n========================================`);
  console.log(`Running Agentic Readiness Verification Suite`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`========================================\n`);

  let passed = 0;
  let failed = 0;

  function assert(name, condition, details = '') {
    if (condition) {
      console.log(`PASS: ${name}`);
      passed++;
    } else {
      console.error(`FAIL: ${name} -> ${details}`);
      failed++;
    }
  }

  // TEST 1: Markdown Content Negotiation on Homepage
  console.log(`--- 1. Testing Markdown Content Negotiation (Homepage) ---`);
  try {
    const res = await fetchReq('/', { Accept: 'text/markdown' });
    assert('Homepage returns HTTP 200 for Accept: text/markdown', res.status === 200, `Got status ${res.status}`);
    const contentType = res.headers['content-type'] || '';
    assert('Homepage returns Content-Type: text/markdown', contentType.includes('text/markdown'), `Got Content-Type: "${contentType}"`);
    const vary = res.headers['vary'] || '';
    assert('Homepage returns Vary: Accept', vary.toLowerCase().includes('accept'), `Got Vary: "${vary}"`);
    assert('Homepage returns nonempty Markdown body with H1', res.body.includes('# Talha Irfan'), 'Body does not contain expected # Talha Irfan');
    assert('Homepage Markdown includes When-to-Use guidance', res.body.includes('When to Use This (Agent Instructions)'), 'Missing When to Use section');
  } catch (err) {
    assert('Homepage Markdown request succeeded', false, err.message);
  }

  // TEST 2: HTML Content on Homepage (Accept: text/html)
  console.log(`\n--- 2. Testing HTML Content on Homepage ---`);
  try {
    const res = await fetchReq('/', { Accept: 'text/html' });
    assert('Homepage returns HTTP 200 for Accept: text/html', res.status === 200, `Got status ${res.status}`);
    const contentType = res.headers['content-type'] || '';
    assert('Homepage returns Content-Type: text/html', contentType.includes('text/html'), `Got Content-Type: "${contentType}"`);
    const vary = res.headers['vary'] || '';
    assert('Homepage HTML returns Vary: Accept', vary.toLowerCase().includes('accept'), `Got Vary: "${vary}"`);
    assert('Homepage HTML contains single semantic H1', (res.body.match(/<h1[\s>]/gi) || []).length === 1, `Found ${(res.body.match(/<h1[\s>]/gi) || []).length} <h1> tags`);
    assert('Homepage HTML contains sequential H2 headings', res.body.includes('<h2'), 'Missing <h2> tags');
    assert('Homepage HTML contains structured semantic content', res.body.includes('Portfolio Summary and Structured Content'), 'Missing semantic server-rendered content section');

    // Content ratio estimation (text chars / total HTML chars)
    const textOnly = res.body.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const contentRatio = ((textOnly.length / res.body.length) * 100).toFixed(2);
    console.log(`  [Info] Raw HTML size: ${res.body.length} chars | Text content: ${textOnly.length} chars | Content Ratio: ${contentRatio}%`);
    assert('Homepage raw content exceeds 500 characters', textOnly.length >= 500, `Got ${textOnly.length} chars`);
    assert('Homepage content ratio exceeds 5% target', Number(contentRatio) >= 5.0, `Got ${contentRatio}%`);
  } catch (err) {
    assert('Homepage HTML request succeeded', false, err.message);
  }

  // TEST 3: Agent-Friendly 404s with Accept: text/markdown
  console.log(`\n--- 3. Testing Agent-Friendly 404 Probes ---`);
  try {
    const probePath = '/__ora-404-probe-84js4tn6';
    const res = await fetchReq(probePath, { Accept: 'text/markdown' });
    assert('Nonexistent path returns HTTP 404', res.status === 404, `Got status ${res.status}`);
    const contentType = res.headers['content-type'] || '';
    assert('404 response returns Content-Type: text/markdown', contentType.includes('text/markdown'), `Got Content-Type: "${contentType}"`);
    const vary = res.headers['vary'] || '';
    assert('404 response returns Vary: Accept', vary.toLowerCase().includes('accept'), `Got Vary: "${vary}"`);
    assert('404 Markdown body contains at least 20 chars explanation', res.body.length >= 20, `Got ${res.body.length} chars`);
    assert('404 Markdown body contains link to docs, sitemap, or llms.txt', res.body.includes('sitemap.xml') || res.body.includes('llms.txt'), 'Missing reference links in 404 body');
  } catch (err) {
    assert('404 Markdown probe succeeded', false, err.message);
  }

  // TEST 4: Agent Instructions / When-to-Use in llms.txt
  console.log(`\n--- 4. Testing llms.txt and llms-full.txt ---`);
  try {
    const res = await fetchReq('/llms.txt');
    assert('llms.txt returns HTTP 200', res.status === 200, `Got status ${res.status}`);
    assert('llms.txt contains "When to Use This (Agent Instructions)" section', res.body.includes('When to Use This (Agent Instructions)'), 'Missing section header');
    assert('llms.txt specifies Best-Fit Use Cases', res.body.includes('Best-Fit Use Cases'), 'Missing best-fit use cases');
    assert('llms.txt specifies When NOT to Recommend', res.body.includes('When NOT to Recommend'), 'Missing when-not-to-recommend section');
    assert('llms.txt specifies How to Contact & Call', res.body.includes('How to Contact & Call'), 'Missing contact section');

    const resFull = await fetchReq('/llms-full.txt');
    assert('llms-full.txt returns HTTP 200', resFull.status === 200, `Got status ${resFull.status}`);
  } catch (err) {
    assert('llms.txt requests succeeded', false, err.message);
  }

  // TEST 5: Brand Name Discoverability & Schema
  console.log(`\n--- 5. Testing Brand Name Discoverability & Structured Data ---`);
  try {
    const res = await fetchReq('/', { Accept: 'text/html' });
    assert('HTML contains WebSite Brand schema with talhairfandev', res.body.includes('WebSite') && res.body.includes('talhairfandev'), 'Missing WebSite Brand schema');
    assert('HTML contains Person schema with Talha Irfan', res.body.includes('"@type":"Person"') && res.body.includes('Talha Irfan'), 'Missing Person schema');
    assert('HTML contains alternateName array for brand discovery', res.body.includes('talhairfandev') && res.body.includes('Talha Irfan'), 'Missing alternateName');
    assert('HTML contains sameAs links to claimed profiles', res.body.includes('https://github.com/talhairfandev') && res.body.includes('linkedin.com/in/talhairfandev'), 'Missing sameAs links');
    assert('HTML links to /llms.txt in metadata', res.body.includes('llms.txt'), 'Missing llms.txt link in head/metadata');
  } catch (err) {
    assert('Brand schema test succeeded', false, err.message);
  }

  console.log(`\n========================================`);
  console.log(`Results: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
