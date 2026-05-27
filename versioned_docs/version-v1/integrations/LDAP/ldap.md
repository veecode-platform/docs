---
sidebar_position: 1
sidebar_label: LDAP / Active Directory
title: LDAP & Active Directory Auth
---

VeeCode DevPortal ships two LDAP profiles:

| Profile | `VEECODE_PROFILE` | Use case |
|---|---|---|
| `ldap` | `ldap` | Generic OpenLDAP-compatible directories (uses `uid` as username attribute) |
| `ldap-ad` | `ldap-ad` | Active Directory / Samba AD (uses `sAMAccountName`, AD object classes) |

Both profiles configure the `ldap` auth provider for direct user authentication and the `ldapOrg` catalog provider for org sync.

:::note
LDAP authentication works differently from OAuth/OIDC: the Backstage backend binds directly to the LDAP server using an admin credential, then validates user credentials by attempting a bind as the authenticating user. There is no redirect flow.
:::

## Required environment variables (both profiles)

| Variable | Description |
|---|---|
| `LDAP_URL` | LDAP server URL (e.g., `ldap://ldap.example.com:389` or `ldaps://ldap.example.com:636`) |
| `LDAP_DN` | Bind DN for the admin/service account (e.g., `cn=admin,dc=example,dc=com`) |
| `LDAP_SECRET` | Password for the admin bind DN |
| `LDAP_USERS_BASE_DN` | Base DN for user search (e.g., `ou=users,dc=example,dc=com`) |
| `LDAP_GROUPS_BASE_DN` | Base DN for group search (e.g., `ou=groups,dc=example,dc=com`) |

## Optional environment variables

| Variable | Default (ldap) | Default (ldap-ad) | Description |
|---|---|---|---|
| `LDAP_USERS_FILTER` | `(uid=*)` | — | LDAP filter for user search |
| `LDAP_GROUPS_FILTER` | `(objectClass=groupOfNames)` | — | LDAP filter for group search |
| `LDAP_TLS_REJECT_UNAUTHORIZED` | — | `true` | Whether to reject self-signed TLS certs. **`ldap-ad` only** — the `ldap` profile hardcodes `rejectUnauthorized: false` and ignores this variable. |
| `LDAP_SYNC_FREQUENCY` | `PT1H` (set by entrypoint) | `PT1H` | ISO 8601 duration for org sync frequency (`ldap-ad` only) |

## Auth configuration

### `ldap` profile

```yaml
signInPage: ldap

auth:
  environment: development
  providers:
    ldap:
      development:
        cookies:
          secure: false
          field: "backstage-token"
        ldapAuthenticationOptions:
          userSearchBase: "${LDAP_USERS_BASE_DN}"
          usernameAttribute: "uid"
          adminDn: "${LDAP_DN}"
          adminPassword: "${LDAP_SECRET}"
          ldapOpts:
            url: "${LDAP_URL}"
            tlsOptions:
              rejectUnauthorized: false
```

### `ldap-ad` profile (Active Directory)

The `ldap-ad` profile uses `sAMAccountName` as the username attribute, which is the standard login name in Active Directory. TLS verification defaults to `true`.

```yaml
signInPage: ldap

auth:
  environment: development
  providers:
    ldap:
      development:
        cookies:
          secure: false
          field: "backstage-token"
        ldapAuthenticationOptions:
          userSearchBase: "${LDAP_USERS_BASE_DN}"
          usernameAttribute: sAMAccountName
          adminDn: "${LDAP_DN}"
          adminPassword: "${LDAP_SECRET}"
          ldapOpts:
            url: "${LDAP_URL}"
            tlsOptions:
              rejectUnauthorized: ${LDAP_TLS_REJECT_UNAUTHORIZED}
```

## Org sync configuration

### `ldap` profile

```yaml
catalog:
  providers:
    ldapOrg:
      default:
        target: "${LDAP_URL}"
        bind:
          dn: "${LDAP_DN}"
          secret: "${LDAP_SECRET}"
        users:
          - dn: "${LDAP_USERS_BASE_DN}"
            options:
              filter: "${LDAP_USERS_FILTER:(uid=*)}"
            map:
              description: l
        groups:
          - dn: "${LDAP_GROUPS_BASE_DN}"
            options:
              filter: "${LDAP_GROUPS_FILTER:(objectClass=groupOfNames)}"
            map:
              description: l
        schedule:
          frequency: PT1H
          timeout: PT15M
```

### `ldap-ad` profile (Active Directory)

The AD variant maps AD-specific attributes (`sAMAccountName`, `memberOf`, `member`, `displayName`, `mail`) to Backstage entity fields.

```yaml
catalog:
  providers:
    ldapOrg:
      default:
        target: "${LDAP_URL}"
        bind:
          dn: "${LDAP_DN}"
          secret: "${LDAP_SECRET}"
        users:
          - dn: "${LDAP_USERS_BASE_DN}"
            options:
              filter: "${LDAP_USERS_FILTER}"
              scope: sub
            map:
              rdn: cn
              name: sAMAccountName
              description: description
              displayName: displayName
              email: mail
              memberOf: memberOf
        groups:
          - dn: "${LDAP_GROUPS_BASE_DN}"
            options:
              filter: "${LDAP_GROUPS_FILTER}"
              scope: sub
            map:
              rdn: cn
              name: cn
              description: description
              displayName: cn
              memberOf: memberOf
              members: member
        schedule:
          frequency: ${LDAP_SYNC_FREQUENCY}
          timeout: PT15M
```

## Quick start

### OpenLDAP (`ldap` profile)

```bash
docker run -p 7007:7007 \
  -e VEECODE_PROFILE=ldap \
  -e LDAP_URL=ldap://ldap.example.com:389 \
  -e LDAP_DN="cn=admin,dc=example,dc=com" \
  -e LDAP_SECRET=<admin-password> \
  -e LDAP_USERS_BASE_DN="ou=users,dc=example,dc=com" \
  -e LDAP_GROUPS_BASE_DN="ou=groups,dc=example,dc=com" \
  veecode/devportal:latest
```

### Active Directory (`ldap-ad` profile)

```bash
docker run -p 7007:7007 \
  -e VEECODE_PROFILE=ldap-ad \
  -e LDAP_URL=ldaps://ad.example.com:636 \
  -e LDAP_DN="CN=svc-devportal,OU=ServiceAccounts,DC=example,DC=com" \
  -e LDAP_SECRET=<service-account-password> \
  -e LDAP_USERS_BASE_DN="OU=Users,DC=example,DC=com" \
  -e LDAP_GROUPS_BASE_DN="OU=Groups,DC=example,DC=com" \
  -e LDAP_USERS_FILTER="(objectClass=user)" \
  -e LDAP_GROUPS_FILTER="(objectClass=group)" \
  -e LDAP_TLS_REJECT_UNAUTHORIZED=true \
  veecode/devportal:latest
```

## Choosing between `ldap` and `ldap-ad`

| Concern | `ldap` | `ldap-ad` |
|---|---|---|
| Username attribute | `uid` | `sAMAccountName` |
| User object class filter | `uid=*` | Set via `LDAP_USERS_FILTER` |
| Group object class filter | `objectClass=groupOfNames` | Set via `LDAP_GROUPS_FILTER` |
| Group membership attribute | standard LDAP `member` | `member` (DN-based, AD style) |
| TLS rejection default | `false` | `true` |
| Sync frequency | `PT1H` | Configurable via `LDAP_SYNC_FREQUENCY` |

For Windows Active Directory or Samba AD, always use `ldap-ad`. For FreeIPA, OpenLDAP, or 389 Directory Server, use `ldap` and adjust filters as needed.

## Troubleshooting

- **Bind error at startup**: Verify `LDAP_DN` and `LDAP_SECRET` can bind to the server. Test with `ldapsearch -H $LDAP_URL -D "$LDAP_DN" -w "$LDAP_SECRET" -b "$LDAP_USERS_BASE_DN" "(uid=*)"`.
- **TLS certificate error**: For self-signed certs, set `LDAP_TLS_REJECT_UNAUTHORIZED=false` (or add the CA cert to the container's trust store).
- **No users ingested**: Check that `LDAP_USERS_FILTER` matches at least one entry under `LDAP_USERS_BASE_DN`. For AD, a common filter is `(objectClass=user)`.
- **Sign-in fails but user exists in catalog**: The username attribute in the auth options must match what the user types at the login prompt. For AD, users log in with their `sAMAccountName`; for OpenLDAP, typically their `uid`.

## References

- [Backstage LDAP Org Provider](https://backstage.io/docs/integrations/ldap/org/)
- [Backstage LDAP Auth Provider](https://backstage.io/docs/auth/ldap/provider/)
