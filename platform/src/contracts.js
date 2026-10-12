export const DEMO_COMPANY_ALIASES = Object.freeze({mdx:'cmp_mdx001',gms:'cmp_gms001'});
export const ROLES = Object.freeze(['employee','receptionist','supervisor','company_admin']);
export function companyId(value) { const id=DEMO_COMPANY_ALIASES[value] || value; if(typeof id!=='string'||!/^cmp_[a-zA-Z0-9_-]+$/.test(id)) throw new Error('Invalid company ID'); return id; }
export function canAdmin(member) { return member?.active===true && member.role==='company_admin'; }
export function requireActive(member) { if(member?.active!==true || !ROLES.includes(member.role)) throw new Error('Active membership required'); return member; }
export function integrationEvent({companyId: tenant,eventId,type,resourceId,occurredAt}) { return {version:1,companyId:companyId(tenant),eventId,type,resourceId,occurredAt}; }
