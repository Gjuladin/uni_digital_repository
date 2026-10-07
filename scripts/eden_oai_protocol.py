#!/usr/bin/env python3
"""Read-only OAI protocol checks, using only the Python standard library."""

from __future__ import annotations

import argparse
import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable
from urllib.parse import urlencode, urlsplit

OAI = "{http://www.openarchives.org/OAI/2.0/}"
IDENTIFIER = "{http://www.openarchives.org/OAI/2.0/oai-identifier}"
GRANULARITIES = {"YYYY-MM-DD": "%Y-%m-%d", "YYYY-MM-DDThh:mm:ssZ": "%Y-%m-%dT%H:%M:%SZ"}


def parse_datestamp(value: str, granularity: str) -> datetime:
    pattern = r"\d{4}-\d{2}-\d{2}" if granularity == "YYYY-MM-DD" else r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z"
    if granularity not in GRANULARITIES or not re.fullmatch(pattern, value):
        raise ValueError("Invalid OAI datestamp or granularity")
    return datetime.strptime(value, GRANULARITIES[granularity]).replace(tzinfo=timezone.utc)


class OaiProtocolAudit:
    def __init__(self, endpoint: str, fetch: Callable[[str], tuple[int, bytes]], max_pages: int = 100):
        parsed = urlsplit(endpoint)
        if parsed.scheme not in {"http", "https"} or not parsed.hostname or parsed.username or parsed.password or parsed.query or parsed.fragment:
            raise ValueError("Use an HTTP(S) OAI endpoint without credentials, query or fragment")
        if max_pages < 1:
            raise ValueError("max_pages must be positive")
        self.endpoint, self.fetch, self.max_pages = endpoint, fetch, max_pages
        self.checks: list[dict] = []
        self.facts: dict = {"formats": {}, "counts": {}, "pagination": {}}

    def add(self, assertion: str, url: str, passed: bool, expected, observed):
        self.checks.append({"assertion": assertion, "url": url, "passed": bool(passed), "expected": expected, "observed": observed})

    def request(self, parameters: dict, allowed_errors=()) -> ET.Element | None:
        url = self.endpoint + "?" + urlencode(parameters)
        try:
            status, body = self.fetch(url)
            if b"<!DOCTYPE" in body.upper():
                raise ValueError("DTD declarations are not supported")
            root = ET.fromstring(body)
            errors = [element.get("code") for element in root.findall(OAI + "error")]
            valid = status == 200 and root.tag == OAI + "OAI-PMH" and all(code in allowed_errors for code in errors)
            self.add(f"{parameters['verb']} is an OAI response without unexpected protocol errors", url, valid,
                     "HTTP 200, OAI-PMH namespace, no unexpected error", {"status": status, "root": root.tag, "errors": errors})
            return root if valid else None
        except (OSError, ValueError, ET.ParseError) as error:
            self.add(f"{parameters['verb']} is reachable and valid XML", url, False, "valid OAI XML", type(error).__name__)
            return None

    def collect(self, verb: str, prefix: str, namespace: str, granularity: str) -> tuple[dict[str, str], bool]:
        headers: dict[str, str] = {}
        parameters = {"verb": verb, "metadataPrefix": prefix}
        seen_tokens: set[str] = set()
        complete_size = None
        complete = False
        pages = 0
        for page in range(self.max_pages):
            root = self.request(parameters, allowed_errors=("noRecordsMatch",) if page == 0 else ())
            pages += 1
            if root is None:
                break
            if root.find(OAI + "error") is not None:
                complete = True
                break
            listing = root.find(OAI + verb)
            if listing is None:
                self.add(f"{verb} {prefix} contains its response container", self.endpoint, False, verb, "missing")
                break
            entries = listing.findall(OAI + "header") if verb == "ListIdentifiers" else listing.findall(OAI + "record")
            if not entries:
                self.add(f"{verb} {prefix} has headers or noRecordsMatch", self.endpoint, False, "at least one header", 0)
                break
            valid_page = True
            for entry in entries:
                header = entry if verb == "ListIdentifiers" else entry.find(OAI + "header")
                identifier = header.findtext(OAI + "identifier", "") if header is not None else ""
                stamp = header.findtext(OAI + "datestamp", "") if header is not None else ""
                try:
                    parse_datestamp(stamp, granularity)
                except ValueError:
                    self.add(f"{verb} {prefix} datestamp matches declared granularity", self.endpoint, False, granularity, {"identifier": identifier, "datestamp": stamp})
                    valid_page = False
                if not identifier or identifier in headers:
                    self.add(f"{verb} {prefix} identifiers are present and unique", self.endpoint, False, "unique non-empty identifiers", identifier)
                    valid_page = False
                headers[identifier] = stamp
                if verb == "ListRecords":
                    metadata = entry.find(OAI + "metadata")
                    deleted = header is not None and header.get("status") == "deleted"
                    if deleted:
                        valid_metadata = metadata is None
                    else:
                        valid_metadata = metadata is not None and len(metadata) == 1 and metadata[0].tag.startswith("{" + namespace + "}")
                    if not valid_metadata:
                        self.add(f"ListRecords {prefix} metadata agrees with advertised namespace and deletion status", self.endpoint, False,
                                 namespace if not deleted else "no metadata for deleted header", identifier)
                        valid_page = False
            if not valid_page:
                break
            token = listing.find(OAI + "resumptionToken")
            if token is not None and token.get("completeListSize") is not None:
                try:
                    size = int(token.get("completeListSize"))
                    if size < 0 or (complete_size is not None and size != complete_size):
                        raise ValueError("Changed total")
                    complete_size = size
                except ValueError:
                    self.add(f"{verb} {prefix} total remains consistent", self.endpoint, False, "stable non-negative completeListSize", token.get("completeListSize"))
                    break
            next_token = (token.text or "").strip() if token is not None else ""
            if not next_token:
                complete = True
                break
            if next_token in seen_tokens:
                self.add(f"{verb} {prefix} pagination advances", self.endpoint, False, "new resumption token", "repeated token")
                break
            seen_tokens.add(next_token)
            parameters = {"verb": verb, "resumptionToken": next_token}
        total_matches = complete_size is None or complete_size == len(headers)
        self.add(f"{verb} {prefix} census is complete", self.endpoint, complete and total_matches,
                 "all pages fetched without duplicates and advertised total matched", {"pages": pages, "headers": len(headers), "completeListSize": complete_size, "complete": complete})
        self.facts["counts"][f"{verb}:{prefix}"] = len(headers)
        self.facts["pagination"][f"{verb}:{prefix}"] = {"pages": pages, "complete": complete and total_matches, "completeListSize": complete_size}
        return headers, complete and total_matches

    def run(self) -> dict:
        identify = self.request({"verb": "Identify"})
        formats = self.request({"verb": "ListMetadataFormats"})
        self.request({"verb": "ListSets"}, allowed_errors=("noSetHierarchy",))
        if identify is None or formats is None:
            return self.report()
        granularity = identify.findtext(OAI + "Identify/" + OAI + "granularity", "")
        earliest = identify.findtext(OAI + "Identify/" + OAI + "earliestDatestamp", "")
        self.facts.update({"granularity": granularity, "earliestDatestamp": earliest})
        try:
            earliest_date = parse_datestamp(earliest, granularity)
        except ValueError:
            earliest_date = None
        self.add("Identify earliestDatestamp matches declared granularity", self.endpoint, earliest_date is not None, granularity, earliest)
        format_rows = formats.findall(OAI + "ListMetadataFormats/" + OAI + "metadataFormat")
        for row in format_rows:
            prefix = row.findtext(OAI + "metadataPrefix", "")
            namespace = row.findtext(OAI + "metadataNamespace", "")
            schema = row.findtext(OAI + "schema", "")
            valid = bool(prefix and namespace and schema and prefix not in self.facts["formats"])
            self.add("Metadata format has a unique prefix, namespace and schema", self.endpoint, valid, "non-empty, unique advertised format", {"prefix": prefix, "namespace": namespace, "schema": schema})
            if valid:
                self.facts["formats"][prefix] = {"namespace": namespace, "schema": schema}
        self.add("Required oai_dc format is advertised", self.endpoint, "oai_dc" in self.facts["formats"], "oai_dc", list(self.facts["formats"]))
        if granularity not in GRANULARITIES:
            return self.report()
        for prefix, format_info in self.facts["formats"].items():
            identifiers, ids_complete = self.collect("ListIdentifiers", prefix, format_info["namespace"], granularity)
            records, records_complete = self.collect("ListRecords", prefix, format_info["namespace"], granularity)
            if ids_complete and records_complete:
                self.add(f"{prefix} ListRecords and ListIdentifiers agree", self.endpoint, identifiers == records,
                         "same identifiers and datestamps", {"identifiers": len(identifiers), "records": len(records)})
            if identifiers and ids_complete and earliest_date is not None:
                oldest = min(parse_datestamp(stamp, granularity) for stamp in identifiers.values())
                self.add(f"Identify lower bound covers all {prefix} record datestamps", self.endpoint, earliest_date <= oldest,
                         "earliestDatestamp <= oldest returned header", {"earliestDatestamp": earliest, "oldestHeader": oldest.isoformat()})
        samples = [element.text or "" for element in identify.iter(IDENTIFIER + "sampleIdentifier")]
        self.facts["sampleIdentifiers"] = samples
        self.add("Identify publishes an OAI identifier sample", self.endpoint, bool(samples) and all(samples), "non-empty sampleIdentifier", samples)
        prefix = "oai_dc" if "oai_dc" in self.facts["formats"] else next(iter(self.facts["formats"]), None)
        for identifier in samples:
            if not identifier or prefix is None:
                continue
            record = self.request({"verb": "GetRecord", "identifier": identifier, "metadataPrefix": prefix})
            if record is not None:
                result = record.find(OAI + "GetRecord/" + OAI + "record")
                header = result.find(OAI + "header") if result is not None else None
                observed = header.findtext(OAI + "identifier", "") if header is not None else ""
                present = result is not None and result.find(OAI + "metadata") is not None and header is not None and header.get("status") != "deleted"
                self.add("Identify sample resolves to the advertised public record", self.endpoint, present and observed == identifier, identifier, observed)
        return self.report()

    def report(self) -> dict:
        return {"generatedAt": datetime.now(timezone.utc).isoformat(), "endpoint": self.endpoint, "readOnly": True,
                "scope": "OAI protocol consistency; publication content is not graded or edited",
                "summary": {"passed": sum(check["passed"] for check in self.checks), "failed": sum(not check["passed"] for check in self.checks)},
                "facts": self.facts, "checks": self.checks}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--endpoint", default="http://localhost:8080/server/oai/request")
    parser.add_argument("--out", type=Path, default=Path("/tmp/uist-oai-protocol.json"))
    parser.add_argument("--timeout", type=float, default=15)
    parser.add_argument("--max-pages", type=int, default=100)
    args = parser.parse_args()

    def fetch(url):
        request = urllib.request.Request(url, headers={"User-Agent": "UIST-OAI-Protocol-Validator/1.0", "Accept": "application/xml"})
        with urllib.request.urlopen(request, timeout=args.timeout) as response:
            body = response.read(8 * 1024 * 1024 + 1)
            if len(body) > 8 * 1024 * 1024:
                raise ValueError("OAI page exceeds 8 MiB limit")
            return response.status, body

    report = OaiProtocolAudit(args.endpoint, fetch, args.max_pages).run()
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"report": str(args.out), **report["summary"]}))
    return 1 if report["summary"]["failed"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
