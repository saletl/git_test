/**
 * Pediatric offices that share the game.
 *
 * Each key is the office code used in the link, for example:
 *   https://your-site.netlify.app/?office=example-pediatrics
 *
 * Only offices listed here can change what the game shows. Unknown codes are ignored,
 * so nobody can put their own text on the welcome screen by editing a link.
 *
 * Rules for codes: lowercase letters, numbers and dashes, up to 40 characters.
 * Logos go in /public/offices and are referenced as '/offices/<file>'.
 */
export interface OfficeConfig {
  /** Shown on the welcome screen, e.g. "Example Pediatrics". */
  displayName: string;
  /** Optional short note for families, shown under the office name. */
  welcomeMessage?: string;
  /** Optional logo path inside /public, e.g. '/offices/example.svg'. */
  logoSrc?: string;
}

export const offices: Record<string, OfficeConfig> = {
  // Sample entry so you can see how customization looks. Replace or delete it.
  'example-pediatrics': {
    displayName: 'Example Pediatrics',
    welcomeMessage: 'Welcome, little doctors! Your care team will see you soon.',
    logoSrc: '/offices/example.svg',
  },
};
