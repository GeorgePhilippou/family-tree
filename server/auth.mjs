const encoder=new TextEncoder();
const COOKIE='__Host-family';
const DAYS=90, TTL=DAYS*86400;
const encode=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
const decode=value=>Uint8Array.from(atob(value.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0));
export async function hash(value){return encode(await crypto.subtle.digest('SHA-256',encoder.encode(value)))}
async function key(env){return crypto.subtle.importKey('raw',encoder.encode(env.FAMILY_SESSION_KEY),{name:'HMAC',hash:'SHA-256'},false,['sign','verify'])}
async function issue(env){const payload=`${Math.floor(Date.now()/1000)+TTL}.${encode(crypto.getRandomValues(new Uint8Array(16)))}`;return payload+'.'+encode(await crypto.subtle.sign('HMAC',await key(env),encoder.encode(payload+'.'+env.FAMILY_PASSWORD_HASH)))}
async function valid(request,env){try{const token=(request.headers.get('cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);if(!token||token.length>300)return false;const parts=token.split('.');if(parts.length!==3||!/^\d{10}$/.test(parts[0]))return false;const expiry=Number(parts[0]),now=Math.floor(Date.now()/1000);if(expiry<=now||expiry>now+TTL+60)return false;return await crypto.subtle.verify('HMAC',await key(env),decode(parts[2]),encoder.encode(parts.slice(0,2).join('.')+'.'+env.FAMILY_PASSWORD_HASH))}catch{return false}}
function headers(type='text/html; charset=utf-8'){return {'Content-Type':type,'Cache-Control':'private, no-store, max-age=0','Vary':'Cookie','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",'X-Robots-Tag':'noindex, nofollow, noarchive','Strict-Transport-Security':'max-age=31536000'}}
const cookie=(value,age)=>`${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${age}`;
function response(body,status=200,extra={},type){return new Response(body,{status,headers:{...headers(type),...extra}})}
function redirect(path,extra={}){return response(null,303,{Location:path,...extra})}
function login(error=''){return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="theme-color" content="#f5f8f7"><title>Our Family</title><style>*{box-sizing:border-box}body{font:18px/1.5 -apple-system,BlinkMacSystemFont,sans-serif;background:#f5f8f7;color:#253c35;margin:0;min-height:100dvh;display:grid;place-items:center;padding:24px}main{width:100%;max-width:400px}h1{font-size:32px;letter-spacing:-1px}p{color:#5b7166}label{display:block;margin-top:24px}input,button{font:inherit;width:100%;border-radius:12px;padding:14px;margin-top:8px}input{border:1px solid #9eb5a8}button{background:#326c51;color:white;border:0;margin-top:20px;cursor:pointer}input:focus-visible,button:focus-visible{outline:3px solid #438365;outline-offset:3px}.remember{display:flex;gap:12px;align-items:center;font-size:16px}.remember input{width:22px;height:22px;margin:0}.error{color:#982f2f}small{font-size:14px;color:#5b7166}</style></head><body><main><h1>Our Family</h1><p>A place for our family’s stories.</p>${error?`<p class="error" role="alert">${error}</p>`:''}<form action="/login" method="post"><input type="text" name="username" autocomplete="username" value="family" hidden><label for="password">Family password</label><input id="password" name="password" type="password" autocomplete="current-password" required maxlength="200"><label class="remember"><input type="checkbox" name="remember" value="yes" checked>Remember this iPad or computer</label><button type="submit">Open family tree</button></form><p><small>No email address needed. Ask your family for the password.</small></p></main></body></html>`}
// Per-isolate throttling is an additional safeguard; the generated password has 192 bits of entropy.
const attempts=new Map();
function allowed(ip){const now=Date.now();for(const [k,v] of attempts)if(v.until<=now)attempts.delete(k);if(attempts.size>=10000&&!attempts.has(ip))return false;const v=attempts.get(ip)||{count:0,until:now+60000};v.count++;attempts.set(ip,v);return v.count<=10}
export function createHandler(assets){return {async fetch(request,env){
 if(!env.FAMILY_PASSWORD_HASH||!env.FAMILY_SESSION_KEY)return response('Family access is being set up. Please try again later.',503,{},'text/plain; charset=utf-8');
 const url=new URL(request.url);
 if(url.protocol!=='https:')return response('Please open the secure HTTPS address.',400,{},'text/plain; charset=utf-8');
 const authenticated=await valid(request,env);
 if(url.pathname==='/login'){
 if(request.method==='GET')return authenticated?redirect('/'):response(login());
 if(request.method!=='POST')return response('Method not allowed',405,{Allow:'GET, POST'});
 if(request.headers.get('origin')!==url.origin)return response('Please sign in from this website.',403);
 if(!allowed(request.headers.get('cf-connecting-ip')||'unknown'))return response(login('Please wait one minute before trying again.'),429,{'Retry-After':'60'});
 if(!request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded'))return response('Invalid form',400);
 if(Number(request.headers.get('content-length')||0)>4096)return response('Form too large',413);
 const reader=request.body?.getReader();if(!reader)return response('Invalid form',400);let length=0,chunks=[];while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>4096){await reader.cancel();return response('Form too large',413)}chunks.push(value)}const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}const form=new URLSearchParams(new TextDecoder().decode(bytes)),password=form.get('password')||'';
 if(password.length>200||await hash(password)!==env.FAMILY_PASSWORD_HASH)return response(login('That password wasn’t recognised. Please try again.'),401);
 const token=await issue(env);const value=form.get('remember')==='yes'?cookie(token,TTL):cookie(token,TTL).replace(`; Max-Age=${TTL}`,'');return redirect('/',{'Set-Cookie':value});
 }
 if(url.pathname==='/logout'&&request.method==='POST'){if(request.headers.get('origin')!==url.origin)return response('Forbidden',403);return redirect('/login',{'Set-Cookie':cookie('',0)})}
 if(!authenticated)return redirect('/login');
 if(!['GET','HEAD'].includes(request.method))return response('Method not allowed',405,{Allow:'GET, HEAD'});
 const path=url.pathname==='/'?'/index.html':url.pathname;
 if(!Object.hasOwn(assets,path))return response('Not found',404,{},'text/plain; charset=utf-8');
 const asset=assets[path];return response(request.method==='HEAD'?null:asset.body,200,{},asset.type);
 }}}
