/* eslint-disable */
/* cspell:disable */
import type { CompiledTemplate } from '../types.ts';

const template: CompiledTemplate = {
  slots: ["actionLabel","actionUrl","heading","ignore","intro","linkHint","preheader"],
  html: "<!DOCTYPE html>\n<html lang=\"en\" dir=\"ltr\" xmlns:v=\"urn:schemas-microsoft-com:vml\" xmlns:o=\"urn:schemas-microsoft-com:office:office\"> <head><meta charset=\"utf-8\"> <meta name=\"x-apple-disable-message-reformatting\"> <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"> </head> <body xml:lang=\"en\" dir=\"ltr\" style=\"margin: 0; padding: 0; width: 100%; height: 100%; word-break: break-word;\"><span style=\"display: none\"><!--[if mso]>\n  <xml>\n    <o:OfficeDocumentSettings>\n      <o:PixelsPerInch>96</o:PixelsPerInch>\n    </o:OfficeDocumentSettings>\n    <w:WordDocument>\n      <w:DontUseAdvancedTypographyReadingMail />\n    </w:WordDocument>\n  </xml>\n<![endif]--></span><div role=\"article\" aria-roledescription=\"email\" lang=\"en\" dir=\"ltr\" style=\"font-size: medium; font-size: max(16px, 1rem)\"><!--[if mso]><table role=\"none\" cellpadding=\"0\" cellspacing=\"0\" style=\"width: 600px\" align=\"center\"><tr><td><![endif]--> <div><p>{{preheader}}</p> <h1>{{heading}}</h1> <p>{{intro}}</p> <div><a href=\"{{actionUrl}}\"><!--[if mso]><i style=\"mso-font-width: 150%; mso-text-raise: 31px;\" hidden>&emsp;</i><![endif]--> <span style=\"mso-text-raise: 16px;\">{{actionLabel}}</span> <!--[if mso]><i style=\"mso-font-width: 150%;\" hidden>&emsp;&#8203;</i><![endif]--></a></div> <p>{{linkHint}}<br>{{actionUrl}}</p> <p>{{ignore}}</p></div> <!--[if mso]></td></tr></table><![endif]--></div></body></html>",
  text: "{{preheader}} {{heading}} {{intro}} {{actionLabel}}\n\n{{actionUrl}}\n\n{{linkHint}} {{actionUrl}} {{ignore}}",
};

export default template;
