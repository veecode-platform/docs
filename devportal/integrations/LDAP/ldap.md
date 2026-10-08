---
sidebar_position: 1
sidebar_label: LDAP Organization Sync
title: Import users and groups from LDAP
---

This page imports users and groups from an LDAP directory, including Active Directory, into the DevPortal 3.x catalog. It covers organization sync only.

The 3.x backend registers no LDAP sign-in provider, so there is no LDAP username-and-password sign-in to configure. Users sign in through an OIDC provider such as [Keycloak](../Keycloak/keycloak-auth.md), which can connect to an existing LDAP or Active Directory server itself and federate its users. The Keycloak module documentation states this directly: Keycloak has built-in support for connecting to existing LDAP or Active Directory servers.

## Import users and groups

The `ldap-catalog-integration` module reads users and groups from your directory on a schedule and creates User and Group entities. Install it from the Marketplace Extensions page, or add this entry to an operator plugin file (see [Configure dynamic plugins for the local stack](../../installation-guide/docker-local/custom-plugins.md)):

```yaml
plugins:
  - package: oci://quay.io/veecode/backstage-plugin-catalog-backend-module-ldap@sha256:47c85ef8d6433137d3ecce2606f3630832e1d72db608987f826f9971b154919a
    disabled: false
    pluginConfig:
      catalog:
        providers:
          ldapOrg:
            default:
              target: ${LDAP_TARGET_URL}
              bind:
                dn: ${LDAP_BIND_DN}
                secret: ${LDAP_BIND_SECRET}
              users:
                - dn: ${LDAP_USERS_DN}
                  options:
                    filter: (uid=*)
              groups:
                - dn: ${LDAP_GROUPS_DN}
                  options:
                    filter: (cn=*)
              schedule:
                frequency:
                  minutes: 60
                initialDelay:
                  seconds: 15
                timeout:
                  minutes: 15
```

What the keys do:

- `target` is the LDAP server URL, for example `ldap://directory.example.com:389`.
- `bind.dn` and `bind.secret` are the credentials of a service account that can read the directory. Pass the secret as an environment variable, not in the file.
- `users` and `groups` list the search bases (`dn`) and filters for user and group entries. Adjust them to your directory schema. See the [Backstage LDAP module documentation](https://github.com/backstage/backstage/blob/master/plugins/catalog-backend-module-ldap/README.md) for the full set of mapping options.

For Active Directory, point the search bases at your domain components and match the directory attributes. The user search typically filters on the account name attribute (`sAMAccountName`) and the group search on the group name (`cn`). Adapt the distinguished names and filters to your domain before enabling the module.

After the first sync runs, open the catalog and check that the expected User and Group entities are present.

## Sign-in for LDAP users

Since the backend has no LDAP sign-in provider, point your users at the OIDC sign-in configured in [Sign in with Keycloak](../Keycloak/keycloak-auth.md), with Keycloak federating the same LDAP directory. The OIDC default resolvers match imported users through their annotations, so users imported by the LDAP module resolve once their User entities exist in the catalog.

## Troubleshooting

- No users appear after the sync: check the `devportal` service logs for bind or search errors. Confirm the bind DN and secret, the target URL, and that the search base DNs exist in your directory.
- Users import but sign-in fails: the User entity must exist before sign-in resolves. Confirm the user is in the catalog, and that the OIDC provider configuration matches the [Keycloak sign-in settings](../Keycloak/keycloak-auth.md).
