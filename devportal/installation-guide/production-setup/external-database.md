---
sidebar_position: 6
sidebar_label: External PostgreSQL
title: Use an external PostgreSQL database
---

Use an external PostgreSQL server when the database runs outside the cluster or under a database service you operate. [Install DevPortal on Kubernetes](./setup.md#step-3-start-postgresql) starts a disposable PostgreSQL in the cluster, which is not meant for production.

The portal needs a database role that can create databases, connection settings in the runtime Secret, and optionally a database name prefix and TLS.

## Create a role for the portal

The portal creates one database for each plugin. A role with `LOGIN` and `CREATEDB` is enough. The role does not need `SUPERUSER`. Run this statement on the server, with your own role name and password:

```sql
CREATE ROLE <runtime-role> LOGIN CREATEDB NOSUPERUSER PASSWORD '<password>';
```

On a default install, the portal creates 20 databases, one for each plugin. The role owns all of them. Use the same password in the runtime Secret.

## Set the database keys in the runtime Secret

The runtime Secret, `veecode-runtime-secrets`, is the Secret from [Step 5](./setup.md#step-5-create-the-runtime-secret). Set these keys to your server's values:

- `PG_HOST`: the host name or address of the server.
- `PG_PORT`: the port of the server, usually `5432`.
- `PG_USER`: the role from the previous section.
- `PG_PASSWORD`: the password of that role.
- `PG_DATABASE`: the name of a database on the server. In DevPortal 3.0.3, the portal does not open a session on this database, but the key is required.

The chart derives the `POSTGRES_*` variables from these `PG_*` keys. Keep the other keys of the Secret, such as `BACKEND_SECRET`.

The portal keeps its data in the per-plugin databases, not in the database named by `PG_DATABASE`. Back up the per-plugin databases as the [upgrade guide](./upgrade.md) describes. A backup of only `PG_DATABASE` misses plugin data.

## Change the database name prefix

By default, the portal names its databases `backstage_plugin_<plugin>`. To change the prefix, set `backend.database.prefix` under `upstream.backstage.appConfig`:

```yaml
upstream:
  backstage:
    appConfig:
      backend:
        database:
          prefix: devportal3_plugin_
```

Use a different prefix when a 2.x installation shares the same server, so the 3.x databases stay apart from the 2.x ones. With this prefix, the portal creates 20 new databases named `devportal3_plugin_<plugin>`. The existing `backstage_plugin_` databases stay in place. For the differences between 2.x and 3.x, see [Migrating from 2.x to 3.x](../../migrating-from-2x.md).

If you change the prefix, set `DB_PREFIX` to the new value when you follow the [upgrade guide](./upgrade.md).

## Connect over TLS

To verify the server certificate, the portal needs the CA that signed it. Store the CA certificate in a ConfigMap and point the chart at it. The [note on `caBundle` in the setup guide](./setup.md#let-the-backend-reach-and-trust-keycloak) explains the value. Store the CA's certificate, not the server's:

```bash
kubectl -n "$NAMESPACE" create configmap devportal-ca --from-file=ca.crt=<path-to-ca-certificate>
```

```yaml
global:
  veecode:
    deployment:
      caBundle:
        kind: ConfigMap
        name: devportal-ca
        key: ca.crt
```

Then add the key `PGSSLMODE` with the value `verify-full` to the runtime Secret.

To check that the portal connects over TLS, run this query on the server:

```sql
SELECT usename, ssl, count(*)
FROM pg_stat_ssl JOIN pg_stat_activity USING (pid)
WHERE usename = '<runtime-role>'
GROUP BY usename, ssl;
```

Each row shows the role, the `ssl` value, and the number of sessions. The `ssl` column shows `t` for every portal session.

Without the CA, the backend cannot start. Its log shows a line such as `Failed to connect to the database ... Error: unable to verify the first certificate` for each plugin database.

This procedure does not need an `ssl` key under `backend.database.connection`. The `caBundle` value and the `PGSSLMODE` key are enough.
