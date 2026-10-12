import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {PRODUCT_OWNER, transitionCall} from './domain';
import './style.css';

const companies = [{id:'mdx', name:'MDX Phone', color:'#315bea', integration:'Atlas'}, {id:'gms', name:'Golden Marketing Services', color:'#8b640c', integration:'GMS — planned'}];
const tabs = ['Favorites', 'Recents', 'Contacts', 'Keypad', 'Voicemail', 'Messages'];
function App() {
  const [company, setCompany] = useState(companies[0]);
  const [tab, setTab] = useState('Keypad');
  const [number, setNumber] = useState('');
  const [call, setCall] = useState({status:'idle'});
  const [more, setMore] = useState(false);
  const [admin, setAdmin] = useState(false);
  const active = ['ringing','connected','held'].includes(call.status);
  function changeCall(status) {setCall(current => transitionCall(current, status));}
  return <div className="app" style={{'--brand':company.color}}>
    <header><div><strong>{company.name}</strong><small>Owned by {PRODUCT_OWNER}</small></div><button onClick={() => setAdmin(!admin)}>{admin ? 'Phone' : 'Administration'}</button></header>
    <div className="demo" role="status">Demo workspace · No live calls or texts · Device services disconnected</div>
    <label className="workspace">Preview company <select disabled={active} value={company.id} onChange={e => {setCompany(companies.find(c => c.id === e.target.value)); setNumber('');}}>{companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
    <main>{admin ? <><h1>Administration</h1><p>Company settings and service readiness</p><div className="cards">{[['Employees & extensions','Invite-only accounts; provisioning not connected'],['Numbers & routing','Main number, direct numbers and department coverage'],['Integration',company.integration + ' · Not connected'],['Security','Firebase membership enforcement · Server provisioning pending'],['Branding',company.name + ' · Shared product, company branding'],['Service health','Telnyx not configured · Live calling disabled']].map(([title, detail]) => <section key={title}><h2>{title}</h2><p>{detail}</p></section>)}</div></> : active ? <div className="call"><p>Simulated {call.status}</p><h1>{number}</h1><div className="controls">{call.status === 'ringing' ? <button onClick={() => changeCall('connected')}>Simulate answer</button> : <><button onClick={() => changeCall(call.status === 'held' ? 'connected' : 'held')}>{call.status === 'held' ? 'Resume' : 'Hold'}</button><button onClick={() => setMore(!more)}>More</button></>}<button className="end" onClick={() => {changeCall('ended');setMore(false);}}>End call</button></div>{more && <section><h2>Call options</h2><p>Transfer, add people, audio devices, recording and contact details will be available after implementation. Recording is not active.</p><button onClick={() => setMore(false)}>Close options</button></section>}</div> : tab === 'Keypad' ? <div className="dialer"><h1 className="sr">Keypad</h1><input aria-label="Phone number" type="tel" placeholder="Enter number" value={number} onChange={e => setNumber(e.target.value)}/><button className="erase" disabled={!number} onClick={() => setNumber(n=>n.slice(0,-1))}>Delete last digit</button><div className="keys">{['1','2','3','4','5','6','7','8','9','*','0','#'].map((key,i)=><button key={key} onClick={()=>setNumber(n=>n+key)}>{key}<small>{['','ABC','DEF','GHI','JKL','MNO','PQRS','TUV','WXYZ','','+',''][i]}</small></button>)}</div><button className="dial" disabled={!number.trim()} onClick={()=>setCall({status:'ringing'})}>Simulate call</button></div> : <><h1>{tab}</h1><section><h2>No demo {tab.toLowerCase()} yet</h2><p>This workspace is a new standalone foundation. {tab} services are not connected.</p><button onClick={()=>setTab('Keypad')}>Open keypad</button></section></>}</main>
    {!admin && <nav aria-label="Phone navigation">{tabs.map(t=><button key={t} aria-current={t===tab?'page':undefined} onClick={()=>setTab(t)}>{t}</button>)}</nav>}
  </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
