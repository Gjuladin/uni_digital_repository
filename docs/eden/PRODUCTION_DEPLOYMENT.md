# Production hosting and deployment work

The code can be prepared locally, but these actions require access to or cooperation from the UIST production hosting environment.

## Access and ownership required from UIST

- Identify the production system owner and release approver.
- Provide the approved deployment path: CI/CD, container registry, or administrator-run commands.
- Confirm the production frontend and backend versions, Compose/service names, persistent volumes, and environment-specific configuration locations.
- Provide a maintenance window and rollback authority.
- Confirm who controls DNS, TLS certificates, reverse-proxy rules, firewall rules, and backups.
- Provide a safe way to supply registry or Handle credentials if those services are enabled; credentials must not be committed to either repository.

## Deployment sequence

1. Back up the database, asset store, production configuration, and current deployable images/packages.
2. Deploy the backend JSON-LD and Signposting changes first.
3. Run backend smoke tests before exposing links from the frontend.
4. Deploy the frontend discovery, repository JSON-LD, FAIRiCat, OpenSearch, and robots changes.
5. Rebuild Discovery and OAI-PMH indexes where metadata/configuration changes require it.
6. Restart or reload only the necessary services and confirm stable health.
7. Run the post-deployment checks in [VALIDATION_AND_RELEASE.md](VALIDATION_AND_RELEASE.md).
8. Roll back if privacy/authorization checks fail, public endpoints regress, or item links point to unavailable resources.

## Reverse-proxy and origin requirements

- Preserve the public origin `https://repository.uist.edu.mk` in forwarded host and protocol headers.
- Route `/.well-known/repository.jsonld`, `/.well-known/api-catalog`, `/robots.txt`, `/home/robots.txt`, `/sitemap_index.xml`, `/signposting/*`, and `/server/*` to the intended service without HTML error-page substitution.
- Preserve declared response content types.
- Ensure canonical and generated URLs use HTTPS and do not leak container names, localhost, or internal ports.
- Verify request-size, timeout, caching, compression, and CORS behavior for REST/OAI/OpenSearch endpoints.
- Permit required outbound DNS/HTTPS access for normal application and registry checks while keeping local harvester private-target mode disabled in production.

## Production-only diagnosis

The aggregate DSpace actuator may be `DOWN` even when OpenSearch works. Inspect individual health components and logs. Treat OpenSearch as healthy only when `/server/opensearch/service` and actual Atom/RSS searches succeed. A localhost sitemap causes the SEO health indicator to be `DOWN` in development; production must generate public HTTPS URLs.

## Operational handoff

UIST must nominate owners for application monitoring, certificate renewal, backups/restores, Handle service operation, registry record maintenance, policy reviews, and repository contact responses.
