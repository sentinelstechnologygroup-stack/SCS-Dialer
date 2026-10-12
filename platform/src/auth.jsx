import React,{createContext,useContext,useEffect,useState} from 'react';
import {onAuthStateChanged,signInWithEmailAndPassword,signOut,sendPasswordResetEmail,createUserWithEmailAndPassword,sendEmailVerification,confirmPasswordReset} from 'firebase/auth';
import {firebaseServices} from './firebase.js';
import {httpsCallable} from 'firebase/functions';
import {MembershipWorkspace} from './workspace.jsx';
import {SupportConsole} from './support.jsx';
const Context=createContext(null);
const env=import.meta.env;
export const demoMode=env.VITE_SCS_MODE==='demo';
let services;
const service=()=>services||(services=firebaseServices(env));
export const authService={
  async login(email,password){if(demoMode)throw new Error('Demo mode does not authenticate employees');return signInWithEmailAndPassword(service().auth,email,password);},
  async logout(){if(!demoMode)await signOut(service().auth);location.assign('/login');},
  resetRequest:(email)=>sendPasswordResetEmail(service().auth,email),
  reset:(code,password)=>confirmPasswordReset(service().auth,code,password),
  async register(email,password,inviteToken){if(!inviteToken)throw new Error('An administrator invitation is required');const result=await createUserWithEmailAndPassword(service().auth,email,password);await sendEmailVerification(result.user);return result;}
};
export function AuthProvider({children}){
 const [user,setUser]=useState(demoMode?{id:'demo',role:'employee'}:null);const [loading,setLoading]=useState(!demoMode);const [error,setError]=useState(null);
 useEffect(()=>{if(demoMode)return;try{return onAuthStateChanged(service().auth,u=>{setUser(u);setLoading(false);},e=>{setError(e.message);setLoading(false);});}catch(e){setError(e.message);setLoading(false);}},[]);
 return <Context.Provider value={{user,isAuthenticated:!!user,isLoadingAuth:loading,isLoadingPublicSettings:false,authChecked:!loading,authError:error?{type:'configuration',message:error}:null,checkUserAuth:()=>{},navigateToLogin:()=>location.assign('/login'),logout:authService.logout}}>{children}</Context.Provider>;
}
export const useAuth=()=>useContext(Context);
export function AuthScreen({mode='login'}){
 const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
 const title={login:'Employee sign in',register:'Accept employee invitation',forgot:'Reset your password',reset:'Choose a new password'}[mode];
 async function submit(e){e.preventDefault();setBusy(true);setMessage('');try{if(mode==='login'){await authService.login(email,password);location.assign('/');}else if(mode==='forgot'){await authService.resetRequest(email);setMessage('If this account is eligible, check your email for reset instructions.');}else if(mode==='reset'){await authService.reset(new URLSearchParams(location.search).get('oobCode'),password);setMessage('Password updated. Sign in to continue.');}else{const invite=Object.fromEntries(new URLSearchParams(location.hash.slice(1)));if(!invite.token||!invite.companyId||!invite.invitationId)throw new Error('Open your administrator invitation link first');let current=service().auth.currentUser;if(!current){const verifiedInvite=(await httpsCallable(service().functions,'inspectEmployeeInvitation')(invite)).data;if(email.trim().toLowerCase()!==verifiedInvite.email)throw new Error('Use the email address on this invitation');current=(await authService.register(email,password,invite.token)).user;setMessage('Verify your email, then sign in and reopen this invitation link.');return;}await current.reload();await current.getIdToken(true);if(!current.emailVerified)throw new Error('Verify your email before accepting the invitation');await httpsCallable(service().functions,'acceptEmployeeInvitation')(invite);location.hash='';setMessage('Invitation accepted. You can open your workspace.');}}catch(error){setMessage(error.message);}finally{setBusy(false);}}
 return <main style={{maxWidth:420,margin:'48px auto',padding:24}}><h1>{title}</h1><p>Company employees only. Your administrator grants access to your workspace.</p><form onSubmit={submit}>{mode!=='reset'&&<label>Email<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} style={{display:'block',width:'100%',padding:12}}/></label>}{['login','register','reset'].includes(mode)&&<label>Password<input required minLength={12} type="password" autoComplete={mode==='login'?'current-password':'new-password'} value={password} onChange={e=>setPassword(e.target.value)} style={{display:'block',width:'100%',padding:12}}/></label>}<button disabled={busy} style={{padding:12,marginTop:16}}>{busy?'Working…':'Continue'}</button></form><p role="status">{message}</p><a href="/forgot-password">Forgot password</a> · <a href="/login">Sign in</a></main>;
}
export function ProductionGate({children}){if(['/login','/register','/forgot-password','/reset-password'].includes(location.pathname)&&!demoMode)return children;if(demoMode)return <><div role="status" style={{height:40,padding:8,background:'#fff3cd',color:'#343434',fontSize:12,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>SCS local prototype — fictional data; calling and messaging are simulated.</div>{children}</>;if(env.VITE_USE_EMULATORS==='true'&&['localhost','127.0.0.1'].includes(location.hostname))return <EmulatorWorkspace/>;return <div role="alert" style={{padding:32}}>SCS production workspace is not enabled yet. Firebase authentication foundation is available; membership-controlled data and telephony adapters must pass acceptance before production access.</div>;}

function EmulatorWorkspace(){const {user,isLoadingAuth}=useAuth();if(isLoadingAuth)return <p role="status">Checking employee session�</p>;if(!user)return <main style={{padding:24}}><h1>Employee sign in required</h1><a href="/login">Sign in</a></main>;return user?.emailVerified?(location.pathname.startsWith('/support')?<SupportConsole/>:<MembershipWorkspace user={user}/>):<p role="alert">Verify your employee email before accessing workspace data.</p>;}
