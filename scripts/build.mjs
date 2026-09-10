import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
const assets={};const types={html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8',webmanifest:'application/manifest+json'};
for(const file of await readdir('web')){const ext=file.split('.').at(-1);if(!types[ext])throw Error('Unsupported asset: '+file);assets['/'+file]={body:await readFile('web/'+file,'utf8'),type:types[ext]}}
await mkdir('dist/server',{recursive:true});await mkdir('dist/.openai',{recursive:true});
const auth=await readFile('server/auth.mjs','utf8');await writeFile('dist/server/index.js',auth+'\nconst assets='+JSON.stringify(assets)+';\nexport default createHandler(assets);\n');await writeFile('dist/.openai/hosting.json',await readFile('.openai/hosting.json'));
console.log('Built protected Worker. No public static assets.');
