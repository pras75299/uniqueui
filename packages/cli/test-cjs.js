try {
    const fetch = require('node-fetch');
    console.log('Require success. Type:', typeof fetch);
    
    // Check if it's the default export or the module namespace
    const fetchFn = fetch.default || fetch;
    console.log('Fetch function:', typeof fetchFn);

    const url = 'https://raw.githubusercontent.com/pras75299/uniqueui/main/registry.json';
    console.log(`Fetching ${url}...`);
    
    fetchFn(url)
        .then(res => {
            console.log('Status:', res.status);
            if (res.ok) console.log('OK');
            else console.log('Fail');
        })
        .catch(err => {
            console.error('Fetch Failed:', err);
        });

} catch (e) {
    console.error('Require Failed:', e);
}
