import { zh } from './zh';
import { en } from './en';

const lang = localStorage.getItem('lang') || 'zh';
export const t = lang === 'en' ? en : zh;
