/**
 * Brand settings for The Burrow Parenting.
 * Edit these values to change the credit line, parent-area copy, and links.
 * Logos live in /public/brand. Set `logoSrc` to null to show the text credit only.
 */
export const brand = {
  name: 'The Burrow Parenting',
  website: 'https://theburrowparenting.com',
  websiteLabel: 'theburrowparenting.com',
  credit: 'Created with care by The Burrow Parenting',
  logoSrc: null as string | null,
  aboutHeading: 'About The Burrow Parenting',
  aboutCopy:
    "Parenting can get complicated, especially when the usual advice isn't working. The Burrow helps parents better understand their kids, untangle what's been hard, and figure out what to try next.",
} as const;

export const game = {
  title: 'The Curious Creature Clinic',
  tagline: 'Little patients. Big imaginations.',
} as const;
