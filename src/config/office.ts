import { offices, type OfficeConfig } from './offices';

const OFFICE_CODE = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/;

/** Reads `?office=` from a query string and returns the matching office, or null. */
export function resolveOffice(search: string, registry: Record<string, OfficeConfig> = offices): OfficeConfig | null {
  let code: string | null;
  try {
    code = new URLSearchParams(search).get('office');
  } catch {
    return null;
  }
  if (!code) return null;
  code = code.trim().toLowerCase();
  if (!OFFICE_CODE.test(code)) return null;
  if (!Object.prototype.hasOwnProperty.call(registry, code)) return null;
  const office = registry[code];
  if (!office) return null;
  const logoSrc = office.logoSrc && /^\/[a-z0-9/_.-]+$/i.test(office.logoSrc) && !office.logoSrc.includes('..') ? office.logoSrc : undefined;
  return {
    displayName: office.displayName.slice(0, 60),
    welcomeMessage: office.welcomeMessage?.slice(0, 140),
    logoSrc,
  };
}
