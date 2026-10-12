import React from 'react';
import { getCompany } from '@/lib/demoWorkspace';
export default function WorkspaceSelector(){return <span className="text-sm truncate">{getCompany()?.label||'Your company'}</span>;}
