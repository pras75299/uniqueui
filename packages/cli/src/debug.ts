import fetch from 'node-fetch';

async function run() {
    console.log('Node:', process.version);
    const urls = [
        'https://uniqueui-platform.vercel.app/registry.json',
        'https://uniqueui-platform.vercel.app/api/registry',
        'https://raw.githubusercontent.com/pras75299/uniqueui/main/registry.json'
    ];

    for (const url of urls) {
        try {
            console.log(`\nTesting ${url}...`);
            const res = await fetch(url);
            console.log('Status:', res.status);
            if (!res.ok) {
                try {
                    const body = await res.text();
                    console.log('Error Body:', body.slice(0, 200));
                } catch (e) {
                    console.log('No body');
                }
            } else {
                console.log('Success. Body length:', (await res.text()).length);
            }
        } catch (e) {
            console.error('Fetch Error:', e);
        }
    }
}
run();
