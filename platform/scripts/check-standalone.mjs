import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
const root=resolve(process.argv[2]||'.');
const violations=[];
function inspect(path){for(const item of readdirSync(path,{withFileTypes:true})){const file=join(path,item.name);if(item.isDirectory())inspect(file);else if(/\.(jsx?|tsx?|json|html|css|svg)$/.test(item.name)&&/base44|\/api\/apps\//i.test(readFileSync(file,'utf8')))violations.push(file);}}
for(const dir of ['src','public','dist'])if(existsSync(join(root,dir)))inspect(join(root,dir));
for(const file of ['package.json','package-lock.json','vite.config.js'])if(/base44/i.test(readFileSync(join(root,file),'utf8')))violations.push(file);
if(existsSync(join(root,'base44')))violations.push('Retired resource directory still active');
if(violations.length){throw new Error(`Standalone migration violations:\n${violations.join('\n')}`);}
console.log('Standalone check passed: no retired provider packages, source endpoints or bundled references.');
