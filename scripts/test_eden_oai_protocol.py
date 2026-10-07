"""Protocol regressions without network access or third-party test libraries."""

import sys
import unittest
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

sys.path.insert(0, str(Path(__file__).resolve().parent))
from eden_oai_protocol import OaiProtocolAudit, parse_datestamp


def envelope(content):
    return (200, ('<OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/">' + content + '</OAI-PMH>').encode())


def header(identifier, stamp="2026-09-02T12:03:48Z", deleted=False):
    status = ' status="deleted"' if deleted else ''
    return f'<header{status}><identifier>{identifier}</identifier><datestamp>{stamp}</datestamp></header>'


def record(identifier, stamp="2026-09-02T12:03:48Z", deleted=False, namespace="http://www.openarchives.org/OAI/2.0/oai_dc/"):
    metadata = "" if deleted else f'<metadata><dc xmlns="{namespace}"/></metadata>'
    return f'<record>{header(identifier, stamp, deleted)}{metadata}</record>'


class Fixture:
    def __init__(self):
        self.earliest = "2026-08-01T00:00:00Z"
        self.samples_resolve = True
        self.duplicates = False
        self.loop = False
        self.total = 2
        self.namespace = "http://www.openarchives.org/OAI/2.0/oai_dc/"
        self.granularity = "YYYY-MM-DDThh:mm:ssZ"
        self.stamp = "2026-09-02T12:03:48Z"
        self.deleted = False
        self.bad_page = False
        self.fail_getrecord = False
        self.calls = []

    def fetch(self, url):
        args = {key: values[0] for key, values in parse_qs(urlsplit(url).query).items()}
        self.calls.append(args)
        verb = args["verb"]
        if verb == "Identify":
            return envelope(f'''<Identify><earliestDatestamp>{self.earliest}</earliestDatestamp><granularity>{self.granularity}</granularity>
                <description><oai-identifier xmlns="http://www.openarchives.org/OAI/2.0/oai-identifier"><sampleIdentifier>oai:repo.test:20.500.15029/93</sampleIdentifier></oai-identifier></description></Identify>''')
        if verb == "ListMetadataFormats":
            return envelope('''<ListMetadataFormats><metadataFormat><metadataPrefix>oai_dc</metadataPrefix><schema>http://www.openarchives.org/OAI/2.0/oai_dc.xsd</schema><metadataNamespace>http://www.openarchives.org/OAI/2.0/oai_dc/</metadataNamespace></metadataFormat></ListMetadataFormats>''')
        if verb == "ListSets":
            return envelope('<error code="noSetHierarchy">No sets</error>')
        if verb == "GetRecord":
            if self.fail_getrecord:
                raise OSError("Unavailable")
            if not self.samples_resolve:
                return envelope('<error code="idDoesNotExist">Missing</error>')
            return envelope('<GetRecord>' + record(args["identifier"], self.stamp) + '</GetRecord>')
        if verb in {"ListRecords", "ListIdentifiers"}:
            second_page = "resumptionToken" in args
            if second_page:
                assert set(args) == {"verb", "resumptionToken"}, args
                assert args["resumptionToken"] == "next&cursor=1+ok", args
            if second_page and self.bad_page:
                return envelope('<error code="badResumptionToken">Expired</error>')
            identifier = "oai:repo.test:20.500.15029/93" if not second_page or self.duplicates else "oai:repo.test:20.500.15029/94"
            entry = record(identifier, self.stamp, self.deleted, self.namespace) if verb == "ListRecords" else header(identifier, self.stamp, self.deleted)
            token = 'next&amp;cursor=1+ok' if not second_page or self.loop else ""
            return envelope(f'<{verb}>{entry}<resumptionToken completeListSize="{self.total}">{token}</resumptionToken></{verb}>')
        raise AssertionError(verb)

    def run(self, max_pages=100):
        return OaiProtocolAudit("https://repo.test/oai/request", self.fetch, max_pages).run()


class OaiProtocolTests(unittest.TestCase):
    def failures(self, report):
        return [check for check in report["checks"] if not check["passed"]]

    def test_complete_two_page_census_and_token_encoding(self):
        report = Fixture().run()
        self.assertEqual(self.failures(report), [])
        self.assertEqual(report["facts"]["counts"]["ListRecords:oai_dc"], 2)
        self.assertTrue(report["facts"]["pagination"]["ListIdentifiers:oai_dc"]["complete"])

    def test_earliest_date_cannot_exclude_existing_records(self):
        fixture = Fixture()
        fixture.earliest = "2026-10-06T00:00:00Z"
        self.assertTrue(any("lower bound" in check["assertion"] for check in self.failures(fixture.run())))

    def test_advertised_sample_is_checked_instead_of_replaced_with_a_valid_one(self):
        fixture = Fixture()
        fixture.samples_resolve = False
        self.assertTrue(any("GetRecord" in check["assertion"] for check in self.failures(fixture.run())))

    def test_repeated_headers_do_not_produce_a_successful_census(self):
        fixture = Fixture()
        fixture.duplicates = True
        report = fixture.run()
        self.assertTrue(any("unique" in check["assertion"] for check in self.failures(report)))
        self.assertFalse(report["facts"]["pagination"]["ListRecords:oai_dc"]["complete"])

    def test_token_loop_and_page_limit_cannot_silently_truncate(self):
        fixture = Fixture()
        fixture.loop = True
        self.assertTrue(self.failures(fixture.run()))
        self.assertTrue(self.failures(Fixture().run(max_pages=1)))

    def test_expired_token_is_a_failure(self):
        fixture = Fixture()
        fixture.bad_page = True
        self.assertTrue(any("badResumptionToken" in str(check["observed"]) for check in self.failures(fixture.run())))

    def test_advertised_total_must_match_actual_headers(self):
        fixture = Fixture()
        fixture.total = 3
        self.assertTrue(any("census" in check["assertion"] for check in self.failures(fixture.run())))

    def test_record_namespace_must_match_advertised_format(self):
        fixture = Fixture()
        fixture.namespace = "https://example.invalid/not-dc"
        self.assertTrue(any("namespace" in check["assertion"] for check in self.failures(fixture.run())))

    def test_deleted_headers_are_counted_without_metadata(self):
        fixture = Fixture()
        fixture.deleted = True
        self.assertEqual(self.failures(fixture.run()), [])

    def test_day_granularity_remains_supported(self):
        fixture = Fixture()
        fixture.granularity = "YYYY-MM-DD"
        fixture.earliest = "2026-08-01"
        fixture.stamp = "2026-09-02"
        self.assertEqual(self.failures(fixture.run()), [])

    def test_xml_error_page_is_not_a_valid_oai_response(self):
        report = OaiProtocolAudit("https://repo.test/oai", lambda url: (200, b"<html>Error</html>")).run()
        self.assertTrue(self.failures(report))

    def test_malformed_and_invalid_datestamps_are_rejected(self):
        for stamp in ["2026-02-30", "2026-2-3", "2026-01-01T00:00:00+02:00"]:
            with self.assertRaises(ValueError):
                parse_datestamp(stamp, "YYYY-MM-DD")

    def test_network_failure_becomes_a_failed_check(self):
        fixture = Fixture()
        fixture.fail_getrecord = True
        self.assertTrue(any("GetRecord" in check["assertion"] for check in self.failures(fixture.run())))


if __name__ == "__main__":
    unittest.main()
