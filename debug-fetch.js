var fetch = require('node-fetch');

async function testUrl(url) {
    console.log(`Testing: ${url}`);
    try {
        const res = await fetch(url);
        console.log(`Status: ${res.status} ${res.statusText}`);
        if (res.ok) {
            try {
                const text = await res.text();
                // Try parsing JSON to ensure it's valid
                JSON.parse(text);
                console.log('Body: Valid JSON');
            } catch (e) {
                console.log('Body: Invalid JSON or empty');
            }
        } else {
             console.log('Body:', await res.text());
        }
    } catch (e) {
        console.error('Fetch error:', e.message);
    }
    console.log('---');
}

async function run() {
    await testUrl('https://uniqueui-platform.vercel.app/registry.json');
    await testUrl('https://uniqueui-platform.vercel.app/api/registry');
    await testUrl('https://raw.githubusercontent.com/pras75299/uniqueui/main/registry.json');
}

run();
