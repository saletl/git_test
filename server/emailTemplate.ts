/**
 * The one-time sticker book email. The template is fixed: nothing typed by a visitor is ever inserted,
 * not even the recipient's address.
 */

export const EMAIL_SUBJECT = 'Your Curious Creature Clinic sticker book!';

const BRAND_URL = 'https://theburrowparenting.com';

export function stickerBookEmail({ newsletterRequested }: { newsletterRequested: boolean }) {
  const footerNote = newsletterRequested
    ? 'You also asked to hear from The Burrow Parenting. If this is a new sign-up, a separate email will ask you to confirm.'
    : "This is a one-time email. You haven't been added to any mailing list.";

  const text = [
    'Your little doctor did some important work today!',
    '',
    "Here's the sticker book you saved from The Curious Creature Clinic. It's attached as a PDF you can print or keep.",
    '',
    'We hope your family had a little fun while you waited.',
    '',
    'Created with care by The Burrow Parenting.',
    '',
    'Enjoy!',
    '',
    '---',
    footerNote,
    BRAND_URL,
  ].join('\n');

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${EMAIL_SUBJECT}</title>
  </head>
  <body style="margin:0;padding:0;background:#fbf4e6;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbf4e6;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fffaf0;border:3px solid #cfe0c6;border-radius:20px;">
            <tr>
              <td style="padding:28px 28px 8px;font-family:'Trebuchet MS',Arial,sans-serif;color:#36513f;font-size:24px;font-weight:bold;text-align:center;">
                Your little doctor did some important work today!
              </td>
            </tr>
            <tr>
              <td style="padding:8px 28px;font-family:'Trebuchet MS',Arial,sans-serif;color:#3d3631;font-size:16px;line-height:1.55;">
                <p style="margin:0 0 14px;">Here's the sticker book you saved from The Curious Creature Clinic. It's attached as a PDF you can print or keep.</p>
                <p style="margin:0 0 14px;">We hope your family had a little fun while you waited.</p>
                <p style="margin:0 0 14px;">Created with care by The Burrow Parenting.</p>
                <p style="margin:0 0 6px;font-weight:bold;color:#d4694f;">Enjoy!</p>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 28px 26px;font-family:Arial,sans-serif;color:#6b5f57;font-size:12px;line-height:1.5;border-top:1px solid #f3e5cc;">
                ${footerNote}<br />
                <a href="${BRAND_URL}" style="color:#4f7259;">theburrowparenting.com</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject: EMAIL_SUBJECT, html, text };
}
