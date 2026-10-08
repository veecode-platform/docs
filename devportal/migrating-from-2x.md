---
sidebar_label: Migrating from 2.x to 3.x
sidebar_position: 2.6
title: Migrate from DevPortal 2.x to 3.x
---

# Migrate from DevPortal 2.x to 3.x

This guide moves a self-hosted DevPortal **2.x** that you installed with the Helm chart `veecode-devportal-platform` to DevPortal **3.x**. The 2.x chart keeps its data in an external PostgreSQL database by default, or in SQLite if you chose that.

The migration goes to a **fresh database**. Nothing is converted in place:

- The 3.x release gets its own databases. It never opens the 2.x databases.
- The 2.x release stays installed but stopped. Going back to 2.x means removing the 3.x release and restoring the 2.x one, on the data it already has.
- The portal is down from the moment you stop 2.x until the 3.x portal has started for the first time. Plan for about 15 minutes: the first start of 3.x pulls the image and installs the default plugins.

## Tested with

This guide's procedure was followed end to end, command by command, with:

- DevPortal 2.x: chart `veecode-devportal-platform` 0.5.2 (DevPortal 2.2.3), external PostgreSQL 16, the `recommended` and `keycloak` presets, Keycloak 26, one Ingress.
- DevPortal 3.x: chart `devportal` 1.0.3, which installs image 3.0.3.
- Kubernetes: a single-node k3s v1.31.5+k3s1 cluster. The 3.x portal was reached through `kubectl port-forward`.

Two parts were not run:

- **SQLite.** The test used external PostgreSQL only. A 2.x install on SQLite differs in two ways that come from reading the charts, not from a run. The 2.x data lives on a volume that the chart creates, and `helm uninstall` of that release deletes the volume, so never uninstall such a release while you still need it. The 3.x chart always connects to PostgreSQL, so prepare that server before step 2. The data of the SQLite install does not move to it.
- **An Ingress for 3.x.** Step 6 reaches the portal through a port-forward. Exposing 3.x through an Ingress follows the 3.x install guide.

## What comes back and what does not

| | After the migration |
|---|---|
| Catalog entities from the locations in your configuration (`catalog.locations`) | Come back on their own. The catalog reads them again from their sources at first start. |
| Users and groups from your identity provider | Come back on their own. The catalog provider reads them again, and people sign in through the provider as before. |
| Marketplace installs | **Do not carry over.** List them in step 1 and install them again in step 7. |
| Locations registered in the portal, not in your configuration | **Do not carry over.** List them in step 1 and register them again in step 7. |
| Scaffolder task history | **Does not carry over.** |
| User settings, such as the theme | **Do not carry over.** |

Permissions also differ. See [Permissions are off in 3.x](#permissions-are-off-in-3x).

Step 4 translates the settings this guide was tested with: external PostgreSQL, Keycloak sign-in and catalog locations. Any other setting in your 2.x values has no automatic translation. Map it by hand against the `values.yaml` of the 3.x chart.

:::danger Guest sign-in is on by default in 3.x
The 3.x chart turns guest sign-in on and maps every guest to the `admin` user. Anyone who can reach the portal URL gets an administrator identity without a password, even when the sign-in page shows only your identity provider. The values file in step 4 turns guest sign-in off and configures a real identity provider, and step 6 checks that the guest endpoint is gone. Do not expose the portal before both are in place.
:::

## Before you start

You need:

- `kubectl`, `helm` 3 and `jq`, with access to the namespace of the 2.x release;
- a PostgreSQL server and a user with the privilege to create databases (`CREATEDB`). For a PostgreSQL-backed 2.x install, use its server and user. For SQLite, prepare PostgreSQL for 3.x;
- a real identity provider for the 3.x portal. The examples use Keycloak, which is what the 2.x `keycloak` preset configured;
- the 3.x [install guide](./installation-guide/production-setup/setup.md), which covers everything about installing 3.x that this page does not repeat.

Set these variables once. Every command below uses them:

```bash
export NAMESPACE=devportal
export V2_RELEASE=devportal
export V2_SECRET=devportal-credentials
export V3_RELEASE=devportal3
export PG_IMAGE=postgres:16
```

- `NAMESPACE` and `V2_RELEASE` come from `helm list --all-namespaces`.
- `V2_SECRET` is the Secret named by `existingSecret` in your 2.x values (`helm get values "$V2_RELEASE" -n "$NAMESPACE"`). For a PostgreSQL-backed install, it already has the database keys. For SQLite, keep this Secret so it retains any identity-provider keys, then add the PostgreSQL keys (`PG_HOST`, `PG_PORT`, `PG_USER`, `PG_PASSWORD`, `PG_DATABASE`) shown in [Step 5 of the install guide](./installation-guide/production-setup/setup.md#step-5-create-the-runtime-secret). Point those keys at the new 3.x PostgreSQL server. This does not copy SQLite data.
- `V3_RELEASE` is the name of the new release. It must differ from `V2_RELEASE`.
- `PG_IMAGE` is a PostgreSQL client image. Use the major version of your server or a newer one, because `pg_dump` refuses a server newer than itself.

## Step 1: Take stock of the 2.x install

Save the 2.x values, and note the chart version and the current revision of the release. You need both for the way back:

```bash
helm get values "$V2_RELEASE" -n "$NAMESPACE" -o yaml > v2-values.yaml
export V2_CHART_VERSION=$(helm list -n "$NAMESPACE" -o json | jq -r --arg r "$V2_RELEASE" '.[] | select(.name == $r) | .chart | sub("^veecode-devportal-platform-"; "")')
export V2_REVISION=$(helm history "$V2_RELEASE" -n "$NAMESPACE" -o json | jq -r 'map(select(.status == "deployed")) | last | .revision')
echo "2.x chart $V2_CHART_VERSION, revision $V2_REVISION"
export V2_DEPLOYMENT=$(kubectl -n "$NAMESPACE" get deploy -l app.kubernetes.io/instance="$V2_RELEASE" -o name)
```

List the **marketplace installs**. The 2.x portal keeps them in a file that it regenerates from its database at every start:

```bash
kubectl -n "$NAMESPACE" exec "$V2_DEPLOYMENT" -- cat /app/data/extensions-install.yaml | tee marketplace-installs-2x.yaml | grep 'package:'
```

List the **locations registered in the portal**. In the catalog, set the Kind filter to Location and write down the target of each entry. The list also shows the locations from `catalog.locations` in your values. Those need no action: they are in `v2-values.yaml` and come back by themselves.

Count the entities that come from your `catalog.locations` sources, for the check in step 6. Compare only those. The portal also adds entities of its own, such as the marketplace catalog, and their number differs between 2.x and 3.x.

## Step 2: Stop the 2.x release

Scale the 2.x release to zero and remove its Ingress, so that the 3.x release can take over the host name. The release, its Secret, its volumes and its databases stay where they are. Passing `--version` keeps the chart at the version that runs today, because without it Helm upgrades the release to the newest 2.x chart:

```bash
helm upgrade "$V2_RELEASE" veecode-devportal-platform --repo https://veecode-platform.github.io/next-charts --version "$V2_CHART_VERSION" -n "$NAMESPACE" --reuse-values --set replicaCount=0 --set ingress.enabled=false
kubectl -n "$NAMESPACE" wait --for=delete pod -l app.kubernetes.io/instance="$V2_RELEASE" --timeout=180s
```

For a PostgreSQL-backed 2.x install, fingerprint its databases. Start a PostgreSQL client pod that reads the connection settings from `V2_SECRET`, and record a checksum of a dump of every 2.x plugin database. Step 6 and the way back compare against this file to show that 3.x never wrote to them. The `grep` removes the random `\restrict` lines that recent `pg_dump` releases add to every dump, because they would give each dump a different checksum. For SQLite, still create and wait for the client pod for the later 3.x steps, but skip the `fingerprint.sh` creation and execution. The PostgreSQL server in `V2_SECRET` is the new 3.x server, not a source of 2.x data.

```bash
kubectl -n "$NAMESPACE" apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: pg-client
spec:
  restartPolicy: Never
  containers:
    - name: psql
      image: $PG_IMAGE
      command: ["sleep", "infinity"]
      env:
        - {name: PGHOST, valueFrom: {secretKeyRef: {name: $V2_SECRET, key: PG_HOST}}}
        - {name: PGPORT, valueFrom: {secretKeyRef: {name: $V2_SECRET, key: PG_PORT}}}
        - {name: PGUSER, valueFrom: {secretKeyRef: {name: $V2_SECRET, key: PG_USER}}}
        - {name: PGPASSWORD, valueFrom: {secretKeyRef: {name: $V2_SECRET, key: PG_PASSWORD}}}
        - {name: PGDATABASE, valueFrom: {secretKeyRef: {name: $V2_SECRET, key: PG_DATABASE}}}
EOF
kubectl -n "$NAMESPACE" wait --for=condition=Ready pod/pg-client --timeout=180s
cat > fingerprint.sh <<'EOF'
for db in $(psql -At -c "select datname from pg_database where datname like 'backstage\_plugin\_%' order by 1"); do
  echo "$(pg_dump "$db" | grep -v -E '^\\(un)?restrict ' | md5sum | cut -d' ' -f1)  $db"
done
EOF
kubectl -n "$NAMESPACE" exec -i pg-client -- sh -s < fingerprint.sh | tee v2-fingerprint.txt
```

## Step 3: Create the 3.x runtime Secret

The 3.x chart reads its database settings and secrets from a Secret named `veecode-runtime-secrets`. Copy every key of the 2.x Secret, which already holds the `PG_*` keys, and add the `BACKEND_SECRET` key that 3.x requires:

```bash
kubectl -n "$NAMESPACE" get secret "$V2_SECRET" -o json \
  | jq --arg backend "$(openssl rand -hex 16 | base64 -w0)" '{apiVersion: "v1", kind: "Secret", metadata: {name: "veecode-runtime-secrets"}, type: "Opaque", data: (.data + {BACKEND_SECRET: $backend})}' \
  | kubectl -n "$NAMESPACE" apply -f -
```

## Step 4: Write the 3.x values

The 3.x chart has no presets. The features the `recommended` preset enabled in 2.x ship with the 3.x image, and the settings that the `keycloak` preset applied become plain configuration. For the removed 2.x pages, see [Presets](/devportal/v2/concepts/presets) and [Docker local presets](/devportal/v2/installation-guide/docker-local/presets). The file below translates a 2.x install with the `recommended` and `keycloak` presets, external PostgreSQL and one catalog location. Save it as `values-v3.yaml` and replace the example addresses with your own:

```yaml title="values-v3.yaml"
global:
  veecode:
    guestAuth:
      enabled: false
  dynamic:
    plugins:
      - package: ./dynamic-plugins/dist/backstage-community-plugin-catalog-backend-module-keycloak-dynamic
        disabled: false
upstream:
  backstage:
    extraEnvVarsSecrets:
      - veecode-runtime-secrets
    startupProbe:
      failureThreshold: 30
    appConfig:
      app:
        baseUrl: http://localhost:7007
      backend:
        baseUrl: http://localhost:7007
        cors:
          origin: http://localhost:7007
        database:
          prefix: devportal3_plugin_
      signInPage: oidc
      auth:
        environment: production
        session:
          secret: ${AUTH_SESSION_SECRET}
        providers:
          oidc:
            production:
              metadataUrl: ${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}
              clientId: ${KEYCLOAK_CLIENT_ID}
              clientSecret: ${KEYCLOAK_CLIENT_SECRET}
              prompt: auto
              signIn:
                resolvers:
                  - resolver: oidcSubClaimMatchingKeycloakUserId
                  - resolver: preferredUsernameMatchingUserEntityName
                  - resolver: emailMatchingUserEntityProfileEmail
                  - resolver: emailLocalPartMatchingUserEntityName
      catalog:
        providers:
          keycloakOrg:
            default:
              baseUrl: ${KEYCLOAK_BASE_URL}
              loginRealm: ${KEYCLOAK_REALM}
              realm: ${KEYCLOAK_REALM}
              clientId: ${KEYCLOAK_CLIENT_ID}
              clientSecret: ${KEYCLOAK_CLIENT_SECRET}
              schedule:
                frequency: { minutes: 10 }
                initialDelay: { seconds: 15 }
                timeout: { minutes: 10 }
        locations:
          - type: url
            target: https://github.com/example-org/catalog/blob/main/catalog-info.yaml
```

The three `http://localhost:7007` addresses are the address of the port-forward in step 6. When the portal has its own address, put that address in all three keys and add it to the redirect URIs of the Keycloak client.

How the 2.x settings map:

| 2.x | 3.x in `values-v3.yaml` |
|---|---|
| `presets: [recommended]` | Nothing to set. The marketplace, the Tech Radar and the other defaults ship with the image. |
| `presets: [keycloak]` | `signInPage`, `auth` and the `keycloakOrg` catalog provider. They read the same `KEYCLOAK_*` and `AUTH_SESSION_SECRET` variables, which the Secret of step 3 carries over. The Keycloak catalog module is a plugin in 3.x, so the `global.dynamic.plugins` entry enables it. |
| `existingSecret` | `upstream.backstage.extraEnvVarsSecrets`, pointing at the Secret of step 3. |
| `database.external.enabled: true` | Nothing to set. 3.x always uses your PostgreSQL, through the `PG_*` keys of that Secret. |
| `appConfig.app`, `appConfig.backend`, `appConfig.catalog.locations` | The same keys under `upstream.backstage.appConfig`. |
| (new in 3.x) | `global.veecode.guestAuth.enabled: false` turns guest sign-in off. |
| (new in 3.x) | `backend.database.prefix` gives the 3.x release its own databases. |
| (new in 3.x) | `startupProbe.failureThreshold: 30` gives the first start up to 10 minutes. The chart default allows about 90 seconds. |

:::warning Always set `backend.database.prefix`
Backstage does not keep a plugin's data in the database named by `PG_DATABASE`. It creates one database per plugin and names it after a prefix: `backstage_plugin_catalog`, `backstage_plugin_scaffolder` and so on, as on the 2.x server of the test. A new `PG_DATABASE` value isolates nothing. A 3.x release that keeps the default prefix on the same server would use those same databases and could change them in ways you cannot undo. The test did not try that. The value `devportal3_plugin_` above gives 3.x its own set and leaves the 2.x set alone. If you point 3.x at a different PostgreSQL server, you do not need the prefix.
:::

## Step 5: Install 3.x

The Keycloak client of your 2.x install must list the address of the 3.x portal among its redirect URIs. If the address is the same as in 2.x, nothing changes.

Add the chart repository and install the release. The first start pulls the image and installs every default plugin. It took about 10 minutes on the test host, so the command waits for up to 20 minutes:

```bash
helm repo add veecode https://veecode-platform.github.io/next-charts
helm repo update
helm install "$V3_RELEASE" veecode/devportal --version 1.0.3 -n "$NAMESPACE" -f values-v3.yaml --wait --timeout 20m
```

If the command times out and the pod stays at `0/1`, read the backend log with `kubectl -n "$NAMESPACE" logs "deploy/$V3_RELEASE-developer-hub" -c backstage-backend`. On a busy node the first start can fail while it creates the database tables. In an earlier pre-release test, two of three first starts ended with `Plugin 'catalog' startup failed; caused by MigrationLocked`. One pod had been stopped by the startup probe. The other had no restarts, and its log did not establish whether another migrator still held the lock. Do not clear the lock until you have stopped every backend replica and confirmed that no migration is active. The commands below use the catalog database from that test. If the log names another plugin, replace `catalog` in both database commands with that plugin's name. Run the recovery commands in the same terminal so `V3_REPLICAS` remains set.

```bash
V3_REPLICAS=$(kubectl -n "$NAMESPACE" get "deploy/$V3_RELEASE-developer-hub" -o jsonpath='{.spec.replicas}')
if [ -z "$V3_REPLICAS" ] || [ "$V3_REPLICAS" -lt 1 ]; then
  echo "Could not read a positive replica count; stop here." >&2
else
  kubectl -n "$NAMESPACE" scale "deploy/$V3_RELEASE-developer-hub" --replicas=0
  kubectl -n "$NAMESPACE" wait --for=delete pod -l app.kubernetes.io/instance="$V3_RELEASE" --timeout=180s
  PODS=$(kubectl -n "$NAMESPACE" get pods -l app.kubernetes.io/instance="$V3_RELEASE" -o name)
  if [ -n "$PODS" ]; then
    printf 'Backend pods remain; do not clear the lock:\n%s\n' "$PODS" >&2
  else
    echo "No backend pods remain."
  fi
fi
```

Check the database named in the error log for active or open transactions:

```bash
kubectl -n "$NAMESPACE" exec pg-client -- psql -d devportal3_plugin_catalog -c "select pid, usename, application_name, state, query_start from pg_stat_activity where datname = current_database() and pid <> pg_backend_pid() and state <> 'idle'"
```

If this query returns a session, or you cannot establish that no migration is running, leave the Deployment scaled to zero and do not clear the lock. After you confirm that no migration remains active, clear the lock and start one backend replica. Wait for it to become ready before restoring the previous replica count:

```bash
kubectl -n "$NAMESPACE" exec pg-client -- psql -d devportal3_plugin_catalog -c "update knex_migrations_lock set is_locked = 0"
kubectl -n "$NAMESPACE" scale "deploy/$V3_RELEASE-developer-hub" --replicas=1
kubectl -n "$NAMESPACE" rollout status "deploy/$V3_RELEASE-developer-hub" --timeout=20m
if [ "$V3_REPLICAS" -gt 1 ]; then
  kubectl -n "$NAMESPACE" scale "deploy/$V3_RELEASE-developer-hub" --replicas="$V3_REPLICAS"
  kubectl -n "$NAMESPACE" rollout status "deploy/$V3_RELEASE-developer-hub" --timeout=20m
fi
```

## Step 6: Check the result

Open a port-forward to the 3.x portal and leave it running in a second terminal:

```bash
kubectl -n "$NAMESPACE" port-forward "svc/$V3_RELEASE-developer-hub" 7007:7007
```

Then run these checks.

**Own databases.** The 3.x release created its own set of databases. For a PostgreSQL-backed 2.x install, the old set has the same fingerprint as in step 2:

```bash
kubectl -n "$NAMESPACE" exec pg-client -- psql -At -c "select datname from pg_database where datname like 'devportal3\_plugin\_%' order by 1"
kubectl -n "$NAMESPACE" exec -i pg-client -- sh -s < fingerprint.sh | diff v2-fingerprint.txt - && echo "2.x databases unchanged"
```

For a SQLite 2.x install, skip the fingerprint comparison. There are no PostgreSQL 2.x databases to compare, and the SQLite data was not copied.

**Sign-in.** Open `http://localhost:7007`, choose **Sign In** on the OIDC card, and sign in through Keycloak as a user who signed in before. Repeat with a second user. If the sign-in fails right after the first start, wait a minute and try again.

**Users and groups.** They appear in the catalog under Kind: User and Kind: Group, read again from Keycloak.

**Catalog.** The entities from your `catalog.locations` are back, and the count matches the count from step 1.

**Guest sign-in is off.** The sign-in page is not enough for this check, because it lists only OIDC even when guest sign-in is on. Ask the guest endpoint instead. It answers `404` when guest sign-in is off, and it returns the `admin` identity when guest sign-in is on:

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:7007/api/auth/guest/refresh
```

The command must print `404`.

## Step 7: Install the marketplace plugins and locations again

Install again each plugin listed in `marketplace-installs-2x.yaml`: choose **Marketplace** in the sidebar, which opens the **Extensions** page at `/marketplace`, search for the plugin on the **Catalog** tab, and choose **Install**. Leave the two entries that ship disabled with 3.x as they are, the Red Hat dynamic Home page and the theme: enabling the Home entry leaves the portal's pages empty, because it registers the same frontend API as the DevPortal home page. The 3.x chart installs plugins when the pod starts, so restart the deployment:

```bash
kubectl -n "$NAMESPACE" rollout restart "deploy/$V3_RELEASE-developer-hub"
kubectl -n "$NAMESPACE" rollout status "deploy/$V3_RELEASE-developer-hub" --timeout 20m
```

The restart took about 14 minutes on the test host. The `rollout status` command can stop early with `exceeded its progress deadline` while the new pod still installs plugins. Wait until the new pod shows `1/1` in `kubectl -n "$NAMESPACE" get pods`. Then check that the file 3.x regenerates from its database lists the plugins:

```bash
kubectl -n "$NAMESPACE" exec "deploy/$V3_RELEASE-developer-hub" -c backstage-backend -- cat /devportal-data/extensions-install.yaml | grep 'package:'
```

The package references differ from the 2.x file, because 3.x names each plugin image by its digest. Each plugin you listed in step 1 appears again. The restart also ends the port-forward of step 6, so open it again afterwards.

Register again the locations you wrote down in step 1: open **Self-service**, choose **Import an existing Git repository**, enter the target and follow the wizard.

## Permissions are off in 3.x

The 2.x chart runs with the permission framework on. Members of the `admins` group administer permissions, and users in other groups get a limited role. In the test, a user of the `developers` group got HTTP 403 when deleting a catalog entity, and could not list the roles that only an administrator sees.

The 3.x chart ships with `permission.enabled: false`, so nothing is checked. In the test, the same user deleted the same catalog entity with HTTP 204. Any signed-in user can delete catalog entities, which only administrators could do on 2.x.

Roles and policies that you create at run time through the portal's permission API are stored in the 2.x database, so they do not carry over. The test created the role `role:default/d1-reviewers` on 2.x. On 3.x the permission API answers HTTP 404, so the role does not exist there.

If your 2.x install relies on these rules, decide how 3.x enforces them before you expose the portal. Turning the permission framework on in 3.x is outside this guide.

## Going back to 2.x

The 2.x data store was not touched, so going back is a rollback of the 2.x release. Remove 3.x first. For a PostgreSQL-backed 2.x install, compare the fingerprint while no portal is running, because a running 2.x portal writes to its databases as soon as it starts. Skip that comparison for SQLite, which has no PostgreSQL source databases:

```bash
helm uninstall "$V3_RELEASE" -n "$NAMESPACE"
```

For PostgreSQL-backed 2.x installs, run this comparison:

```bash
kubectl -n "$NAMESPACE" exec -i pg-client -- sh -s < fingerprint.sh | diff v2-fingerprint.txt - && echo "2.x databases unchanged"
```

Then restore the 2.x release:

```bash
helm rollback "$V2_RELEASE" "$V2_REVISION" -n "$NAMESPACE" --wait --timeout 10m
```

The rollback restores the replica count and the Ingress of revision `V2_REVISION`. The 2.x portal comes back with its catalog, its marketplace installs, its scaffolder history and its user settings. The 3.x databases stay on the server until you drop them, as the next section shows.

## Clean up

After you went back to 2.x, remove what the attempt left, then start again at step 3 when you are ready to retry:

```bash
kubectl -n "$NAMESPACE" delete secret veecode-runtime-secrets
for db in $(kubectl -n "$NAMESPACE" exec pg-client -- psql -At -c "select datname from pg_database where datname like 'devportal3\_plugin\_%'"); do
  kubectl -n "$NAMESPACE" exec pg-client -- psql -c "drop database \"$db\""
done
```

When 3.x is in production and you will not go back, remove the 2.x release and its databases. This cannot be undone, so take a backup first. On a SQLite install, this also deletes the volume of the release:

```bash
helm uninstall "$V2_RELEASE" -n "$NAMESPACE"
kubectl -n "$NAMESPACE" wait --for=delete pod -l app.kubernetes.io/instance="$V2_RELEASE" --timeout=180s
for db in $(kubectl -n "$NAMESPACE" exec pg-client -- psql -At -c "select datname from pg_database where datname like 'backstage\_plugin\_%'"); do
  kubectl -n "$NAMESPACE" exec pg-client -- psql -c "drop database \"$db\""
done
```

In both cases, finish by deleting the client pod. The files this guide wrote in the current folder (`v2-values.yaml`, `marketplace-installs-2x.yaml`, `fingerprint.sh`, `v2-fingerprint.txt` and `values-v3.yaml`) are yours to keep or delete:

```bash
kubectl -n "$NAMESPACE" delete pod pg-client
```
