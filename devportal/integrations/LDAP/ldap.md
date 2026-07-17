---
sidebar_position: 1
sidebar_label: LDAP / Active Directory
title: LDAP & Active Directory Auth
---

VeeCode DevPortal provides two LDAP presets:

| Preset | `VEECODE_PRESETS` entry | Use case |
|---|---|---|
| `ldap` | `ldap` | Generic OpenLDAP-compatible directories (uses `uid` as username attribute) |
| `ldap-ad` | `ldap,ldap-ad` | Active Directory / Samba AD — must compose with `ldap` |

Both presets configure the `ldap` auth provider for direct user authentication and the `ldapOrg` catalog provider for org sync.

:::important
`ldap` belongs to the exclusive `identity` group. Only one identity preset can be active per deployment. You cannot combine `ldap` with `github-auth`, `gitlab`, `azure-auth`, or `keycloak`.

`ldap-ad` is an override layer on top of `ldap`, not a standalone identity preset. It has no `exclusive_group`. Always list `ldap` before `ldap-ad`: `VEECODE_PRESETS=recommended,ldap,ldap-ad`.
:::

:::note
LDAP authentication works differently from OAuth/OIDC: the Backstage backend binds directly to the LDAP server using an admin credential, then validates user credentials by attempting a bind as the authenticating user. There is no redirect flow.
:::

## Required environment variables (both presets)

| Variable | Description |
|---|---|
| `LDAP_URL` | LDAP server URL (e.g., `ldap://ldap.example.com:389` or `ldaps://ldap.example.com:636`) |
| `LDAP_DN` | Bind DN for the admin/service account (e.g., `cn=admin,dc=example,dc=com`) |
| `LDAP_SECRET` | Password for the admin bind DN |
| `LDAP_USERS_BASE_DN` | Base DN for user searches (e.g., `ou=users,dc=example,dc=com`) |
| `LDAP_GROUPS_BASE_DN` | Base DN for group searches (e.g., `ou=groups,dc=example,dc=com`) |

`ldap-ad` reuses all variables from `ldap` and adds no new required variables.

## Optional environment variables

| Variable | Default (`ldap`) | Default (`ldap-ad`) | Description |
|---|---|---|---|
| `LDAP_USERS_FILTER` | `(uid=*)` | `(&(objectClass=user)(!(objectClass=computer)))` | LDAP filter for user search |
| `LDAP_GROUPS_FILTER` | `(objectClass=groupOfNames)` | `(objectClass=group)` | LDAP filter for group search |

## `ldap` preset — OpenLDAP

### What the preset configures

The `ldap` preset (`presets/ldap.yaml`) produces the following `app-config` at boot:

```yaml
signInPage: ldap

platform:
  guest:
    enabled: false
  signInProviders:
    - ldap

auth:
  environment: production
  providers:
    ldap:
      production:
        cookies:
          secure: false
          field: backstage-token
        ldapAuthenticationOptions:
          userSearchBase: ${LDAP_USERS_BASE_DN}
          usernameAttribute: uid
          adminDn: ${LDAP_DN}
          adminPassword: ${LDAP_SECRET}
          ldapOpts:
            url: ${LDAP_URL}
            tlsOptions:
              rejectUnauthorized: false

catalog:
  providers:
    ldapOrg:
      default:
        target: ${LDAP_URL}
        bind:
          dn: ${LDAP_DN}
          secret: ${LDAP_SECRET}
        users:
          - dn: ${LDAP_USERS_BASE_DN}
            options:
              filter: ${LDAP_USERS_FILTER:-(uid=*)}
            map:
              description: l
        groups:
          - dn: ${LDAP_GROUPS_BASE_DN}
            options:
              filter: ${LDAP_GROUPS_FILTER:-(objectClass=groupOfNames)}
            map:
              description: l
        schedule:
          frequency: PT1H
          timeout: PT15M
```

### Quick start

```bash
docker run -p 7007:7007 \
  -e VEECODE_PRESETS=recommended,ldap \
  -e LDAP_URL=ldap://ldap.example.com:389 \
  -e LDAP_DN="cn=admin,dc=example,dc=com" \
  -e LDAP_SECRET=<admin-password> \
  -e LDAP_USERS_BASE_DN="ou=users,dc=example,dc=com" \
  -e LDAP_GROUPS_BASE_DN="ou=groups,dc=example,dc=com" \
  veecode/devportal:2.2.0
```

## `ldap-ad` preset — Active Directory

The `ldap-ad` preset is an **override-only** layer on top of `ldap`. It switches the username attribute to `sAMAccountName` and remaps users/groups to AD's object classes. It must always be composed with `ldap`:

```sh
VEECODE_PRESETS=recommended,ldap,ldap-ad
```

Composition order matters: list `ldap` before `ldap-ad` so the AD overrides win (later `--config` files take precedence in Backstage's config loader).

### What `ldap-ad` overrides

The `ldap-ad` preset (`presets/ldap-ad.yaml`) produces override blocks that replace the `ldap` preset's defaults:

```yaml
auth:
  providers:
    ldap:
      production:
        ldapAuthenticationOptions:
          usernameAttribute: sAMAccountName

catalog:
  providers:
    ldapOrg:
      default:
        users:
          - dn: ${LDAP_USERS_BASE_DN}
            options:
              filter: ${LDAP_USERS_FILTER:-(&(objectClass=user)(!(objectClass=computer)))}
            map:
              rdn: cn
              name: sAMAccountName
              description: description
              displayName: displayName
              email: mail
              memberOf: memberOf
              picture: thumbnailPhoto
        groups:
          - dn: ${LDAP_GROUPS_BASE_DN}
            options:
              filter: ${LDAP_GROUPS_FILTER:-(objectClass=group)}
            map:
              rdn: cn
              name: cn
              description: description
              displayName: displayName
              email: mail
              memberOf: memberOf
              members: member
```

### Quick start

```bash
docker run -p 7007:7007 \
  -e VEECODE_PRESETS=recommended,ldap,ldap-ad \
  -e LDAP_URL=ldaps://ad.example.com:636 \
  -e LDAP_DN="CN=svc-devportal,OU=ServiceAccounts,DC=example,DC=com" \
  -e LDAP_SECRET=<service-account-password> \
  -e LDAP_USERS_BASE_DN="OU=Users,DC=example,DC=com" \
  -e LDAP_GROUPS_BASE_DN="OU=Groups,DC=example,DC=com" \
  veecode/devportal:2.2.0
```

## Choosing between `ldap` and `ldap-ad`

| Concern | `ldap` | `ldap-ad` |
|---|---|---|
| Username attribute | `uid` | `sAMAccountName` |
| Default user filter | `uid=*` | `(&(objectClass=user)(!(objectClass=computer)))` |
| Default group filter | `objectClass=groupOfNames` | `objectClass=group` |
| Group membership attribute | standard LDAP | `member` (DN-based, AD style) |
| TLS rejection | `false` (hardcoded) | Follows `tlsOptions` from `ldap` preset |
| Composition | standalone | requires `ldap` before it |

For Windows Active Directory or Samba AD, always use `ldap,ldap-ad`. For FreeIPA, OpenLDAP, or 389 Directory Server, use `ldap` and adjust filters as needed via `LDAP_USERS_FILTER` / `LDAP_GROUPS_FILTER`.

## Troubleshooting

- **Bind error at startup**: Verify `LDAP_DN` and `LDAP_SECRET` can bind to the server. Test with `ldapsearch -H $LDAP_URL -D "$LDAP_DN" -w "$LDAP_SECRET" -b "$LDAP_USERS_BASE_DN" "(uid=*)"`.
- **TLS certificate error**: For self-signed certs, the `ldap` preset hardcodes `rejectUnauthorized: false`. For stricter TLS control, override via `app-config.local.yaml`.
- **No users ingested**: Check that `LDAP_USERS_FILTER` matches at least one entry under `LDAP_USERS_BASE_DN`. For AD, use `LDAP_USERS_FILTER=(objectClass=user)`.
- **Sign-in fails but user exists in catalog**: The username attribute in the auth options must match what the user types at the login prompt. For AD, users log in with their `sAMAccountName`; for OpenLDAP, typically their `uid`.
- **Exclusive-group conflict at boot**: `ldap` belongs to the `identity` group. Combining it with `github-auth`, `gitlab`, `azure-auth`, or `keycloak` will fail at boot.

## References

- [Backstage LDAP Org Provider](https://backstage.io/docs/integrations/ldap/org/)
- [Backstage LDAP Auth Provider](https://backstage.io/docs/auth/ldap/provider/)
