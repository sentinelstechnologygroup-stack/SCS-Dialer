export function authorizeMember(auth,member,roles){if(!auth?.uid||auth.token?.email_verified!==true)throw new Error('Verified employee login required');if(member?.active!==true)throw new Error('Active company membership required');if(roles&&!roles.includes(member.role))throw new Error('Insufficient company permission');return auth.uid;}
export function validateCompany(id){if(typeof id!=='string'||!/^cmp_[a-zA-Z0-9_-]+$/.test(id))throw new Error('Invalid company ID');return id;}
export function validateInvite({email,role}){if(typeof email!=='string'||!/^\S+@\S+\.\S+$/.test(email)||email.length>254)throw new Error('Valid employee email required');if(!['employee','receptionist','supervisor','company_admin'].includes(role))throw new Error('Invalid employee role');return {email:email.trim().toLowerCase(),role};}
export function validateContact(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Contact details required');
 if(Object.keys(input).some(k=>!['name','email','phone'].includes(k)))throw new Error('Unsupported contact field');
 const name=typeof input.name==='string'?input.name.trim():'';
 if(!name||name.length>150)throw new Error('Contact name is required (maximum 150 characters)');
 const email=typeof input.email==='string'?input.email.trim().toLowerCase():'';
 if(email&&(email.length>254||!/^\S+@\S+\.\S+$/.test(email)))throw new Error('Invalid contact email');
 const phone=typeof input.phone==='string'?input.phone.trim():'';
 if(phone&&!/^\+[1-9]\d{7,14}$/.test(phone))throw new Error('Use an international phone number beginning with +');
 return {name,email,phone};
}
