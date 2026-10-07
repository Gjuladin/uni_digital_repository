// Pure, read-only metadata checks shared by the CLI and regression tests.

const canonicalTypes = new Map(
  [
    "Dataset",
    "Article",
    "Conference paper",
    "Conference abstract",
    "Preprint",
    "Book",
    "Book chapter",
    "Chapter",
    "Report",
    "Technical Report",
    "Working Paper",
    "Software",
    "Source Code",
    "Thesis",
    "Dissertation",
    "Academic work",
    "Other",
  ].map((value) => [value.toLowerCase(), value]),
);

export function metadataValues(item, key) {
  return (item.metadata?.[key] || [])
    .map((entry) => String(entry.value || ""))
    .filter((value) => value.trim());
}

function firstValues(item, keys) {
  return keys.flatMap((key) => metadataValues(item, key));
}

function issue(item, field, code, values, correction, automaticCandidate) {
  return {
    uuid: item.uuid,
    handle: item.handle,
    title: item.name,
    field,
    code,
    values,
    correction,
    automaticCandidate,
  };
}

export function isValidMetadataDate(value) {
  const match = String(value).trim().match(/^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(Z|[+-]\d{2}:\d{2}))?$/);
  if (!match) return false;
  const [, yearText, monthText, dayText, hourText, minuteText, secondText, zone] = match;
  const year = Number(yearText);
  if (year === 0) return false;
  if (hourText !== undefined && !dayText) return false;
  const month = Number(monthText);
  if (monthText && (month < 1 || month > 12)) return false;
  if (dayText) {
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (Number(dayText) < 1 || Number(dayText) > days[month - 1]) return false;
  }
  if (hourText !== undefined) {
    if (Number(hourText) > 23 || Number(minuteText) > 59 || Number(secondText) > 59) return false;
    if (zone !== "Z") {
      const [zoneHour, zoneMinute] = zone.slice(1).split(":").map(Number);
      if (zoneHour > 14 || zoneMinute > 59 || (zoneHour === 14 && zoneMinute !== 0)) return false;
    }
  }
  return true;
}

export function auditItems(items) {
  const issues = [];
  for (const item of items) {
    if (metadataValues(item, "dc.title").length === 0) {
      issues.push(issue(item, "dc.title", "missing", [], "Supply the work title from the source; do not substitute its filename.", false));
    }
    const descriptions = firstValues(item, ["dc.description.abstract", "dc.description"]);
    if (descriptions.length === 0) {
      issues.push(issue(item, "description", "missing", [], "Add an accurate abstract or summary from the work or its author; a repository description is not an item summary.", false));
    }
    if (metadataValues(item, "dc.subject").length === 0) {
      issues.push(issue(item, "dc.subject", "missing", [], "Ask the depositor or curator for suitable subjects; this is a discovery gap, not a mandatory protocol field.", false));
    }
    if (firstValues(item, ["dcterms.accessRights", "dc.rights.accessRights"]).length === 0) {
      issues.push(issue(item, "access-rights", "missing", [], "Record an evidenced access statement separately from reuse rights; absence does not mean closed access.", false));
    }
    for (const [field, entries] of Object.entries(item.metadata || {})) {
      const values = entries.map(entry => String(entry.value || ""));
      const encoded = values.filter(value => /&(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);/i.test(value));
      if (encoded.length) {
        issues.push(issue(item, field, "literal-html-entity-review", encoded, "Compare with the source and review field by field; do not blindly decode intentional entity examples or change source data.", false));
      }
    }
    const types = metadataValues(item, "dc.type");
    if (types.length === 0) {
      issues.push(
        issue(
          item,
          "dc.type",
          "missing",
          [],
          "Curatorial review is required; do not infer a resource type.",
          false,
        ),
      );
    }
    for (const type of types) {
      const trimmed = type.trim();
      const canonical = canonicalTypes.get(trimmed.toLowerCase());
      if (!canonical) {
        issues.push(
          issue(
            item,
            "dc.type",
            "unsupported-value",
            [type],
            "Map only after confirming the resource class with repository staff.",
            false,
          ),
        );
      } else if (type !== canonical) {
        issues.push(
          issue(
            item,
            "dc.type",
            "noncanonical-spelling",
            [type],
            `Normalize to ${canonical}.`,
            true,
          ),
        );
      }
    }

    const languages = firstValues(item, ["dc.language.iso", "dc.language"]);
    if (languages.length === 0) {
      issues.push(
        issue(
          item,
          "dc.language",
          "missing",
          [],
          "Supply a language only from the item or an approved curator.",
          false,
        ),
      );
    }
    for (const language of languages) {
      if (!/^[A-Za-z]{2,3}(?:[-_][A-Za-z0-9]{2,8})*$/.test(language.trim())) {
        issues.push(
          issue(
            item,
            "dc.language",
            "invalid-code",
            [language],
            "Review against the repository language vocabulary.",
            false,
          ),
        );
      } else if (language.includes("_") || language !== language.trim()) {
        issues.push(
          issue(
            item,
            "dc.language",
            "noncanonical-code",
            [language],
            `Normalize mechanically to ${language.trim().replaceAll("_", "-")}.`,
            true,
          ),
        );
      }
    }

    if (
      firstValues(item, ["dc.author", "dc.contributor.author", "dc.creator"])
        .length === 0
    ) {
      issues.push(
        issue(
          item,
          "creator",
          "missing",
          [],
          "Curatorial review is required; do not invent a creator.",
          false,
        ),
      );
    }

    const rightsUris = metadataValues(item, "dc.rights.uri");
    const rights = firstValues(item, ["dc.rights.uri", "dc.rights.license", "dcterms.license", "dc.rights"]);
    const licenceUrls = rights.filter(value => {
      try {
        return ["http:", "https:"].includes(new URL(value).protocol);
      } catch {
        return false;
      }
    });
    if (rights.length === 0) {
      issues.push(
        issue(
          item,
          "licence",
          "missing",
          [],
          "No rights or licence statement is supplied; obtain item-level evidence. Do not apply a repository-wide default.",
          false,
        ),
      );
    }
    const policyUris = licenceUrls.filter(value => /^https?:\/\/(?:dx\.)?doi\.org\/10\.15223\/policy-\d+$/i.test(value.trim()));
    if (policyUris.length) {
      issues.push(issue(item, "dc.rights.uri", "publisher-sharing-policy-review", policyUris, "This points to an STM Article Sharing Framework policy. Review its conditions and applicability to this deposited version; presence is not evidence of unrestricted reuse.", false));
    }
    if (!licenceUrls.length && metadataValues(item, "dc.rights.license").length) {
      issues.push(issue(item, "dc.rights.license", "licence-uri-not-supplied", metadataValues(item, "dc.rights.license"), "Retain the supplied text. Add a resolvable licence URI only after verifying the licence version and deposited work; do not guess a CC version.", false));
    }
    for (const value of rightsUris) {
      try {
        const parsed = new URL(value);
        if (!["http:", "https:"].includes(parsed.protocol)) {
          throw new Error("unsupported protocol");
        }
      } catch {
        issues.push(
          issue(
            item,
            "dc.rights.uri",
            "invalid-url",
            [value],
            "Correct only from the licence statement or curator-supplied URI.",
            false,
          ),
        );
      }
    }

    const publishedDates = metadataValues(item, "dc.date.issued");
    if (publishedDates.length === 0) {
      issues.push(
        issue(
          item,
          "publication-date",
          "missing",
          [],
          "Supply an evidenced issued date. An accession/availability date is not evidence of when the work was published.",
          false,
        ),
      );
    }
    for (const field of ["dc.date.issued", "dc.date.copyright", "dc.date.available", "dc.date.accessioned"]) {
      for (const date of metadataValues(item, field)) {
        if (!isValidMetadataDate(date)) {
          issues.push(
            issue(
              item,
              field,
              "invalid-iso-date",
              [date],
              "Normalize only when the original date meaning is unambiguous.",
              false,
            ),
          );
        }
      }
    }

    const identifiers = firstValues(item, [
      "dc.identifier.doi",
      "dc.identifier.handle",
      "dc.identifier.uri",
      "dc.identifier.isbn",
      "dc.identifier.issn",
    ]);
    if (identifiers.length === 0) {
      issues.push(
        issue(
          item,
          "identifier",
          "missing",
          [],
          "Keep the UUID route; add an identifier only from verified evidence.",
          false,
        ),
      );
    }
    const placeholderHandles = identifiers.filter((value) =>
      /(?:handle(?:\.net)?\/|^)123456789\//i.test(value),
    );
    if (placeholderHandles.length > 0) {
      issues.push(
        issue(
          item,
          "identifier",
          "unregistered-example-handle-prefix",
          placeholderHandles,
          "Treat as a local legacy identifier; verify the configured registered prefix and migration plan before asserting global resolution.",
          false,
        ),
      );
    }
  }

  return issues;
}
