import fs from 'fs';
import ObjectHelper from './ObjectHelper.js';

export interface PackageInfo {
  name: string;
  version: string;
  description: string;
  author: string;
  repository: string;
  banner: string;
}

let info: PackageInfo | null = null;

export function getPackageInfo() {
  if (info === null) {
    try {
      const packageURL = new URL('../../package.json', import.meta.url);
      const json = JSON.parse(fs.readFileSync(packageURL).toString());
      info = {
        name: json.name || '',
        version: json.version || '',
        description: json.description || '',
        author: json.author || '',
        repository: ObjectHelper.getProperty(json, 'repository.url') || '',
        banner: json.name && json.version && json.description ?
          `${json.name} v${json.version} ${json.description}` : ''
      };
    }
    catch (error) {
      console.error('Failed to read package.json:', error instanceof Error ? error.message : error);
      info = {
        name: '',
        version: '',
        description: '',
        author: '',
        repository: '',
        banner: ''
      };
    }
  }
  return info;
}
