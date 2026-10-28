/** A URI field must contain a complete HTTP(S) URL, never a rights narrative. */
export function isLicenseUrl(value: string): boolean {
  // URL() repairs missing/extra slashes. Require an explicit authority before
  // parsing so the original metadata is safe to publish without repair.
  const authority = value?.match(/^https?:\/\/([^/?#]+)/i)?.[1];
  if (!authority || authority.includes('@') || /[\s<>"\\]/.test(value)) {
    return false;
  }
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname) &&
      !url.username && !url.password;
  } catch {
    return false;
  }
}

/** Preserve textual licences and notices without guessing a licence from prose. */
export function getItemLicenseMetadata(
  rightsUri?: string,
  licenseText?: string,
  rightsText?: string,
): { license?: string; copyrightNotice?: string } {
  const uri = rightsUri?.trim();
  const license = licenseText?.trim();
  const rights = rightsText?.trim();
  const licenseValue = isLicenseUrl(uri) ? uri
    : isLicenseUrl(license) ? license
      : isLicenseUrl(rights) ? rights
        : license || undefined;
  const notices = [...new Set([rights, uri].filter(
    (value) => value && !isLicenseUrl(value) && value !== licenseValue,
  ))];
  return {
    license: licenseValue,
    copyrightNotice: notices.length > 0 ? notices.join('\n') : undefined,
  };
}
