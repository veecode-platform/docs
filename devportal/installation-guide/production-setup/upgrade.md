---
sidebar_position: 4
sidebar_label: Upgrade
title: Upgrade DevPortal 3.x
---

# Upgrade DevPortal 3.x

Use this procedure to upgrade a DevPortal 3.x installation managed by the `devportal` Helm chart. It backs up the portal databases before the chart upgrade and restores that backup before returning to the earlier chart version.

The examples assume an installation created by the DevPortal 3.x installation guide, with a separate PostgreSQL deployment named `devportal-db` in the `devportal` namespace. The database user `devportal` must be able to list, dump, drop, create, and restore the portal databases. Adapt the PostgreSQL commands if your database service uses another name or connection method. Do not use the database prefix for another application.

The portal stores plugin data in separate PostgreSQL databases. Back up the database named by `PG_DATABASE` and every database that starts with `backend.database.prefix` (the default is `backstage_plugin_`). A backup of only `PG_DATABASE` can miss plugin data.

## Before you start

Use a maintenance window. The procedure scales the portal down while it takes and restores the database backup.

Before you upgrade, note one registered catalog location and entity, one installed marketplace package, one Scaffolder task, and one user setting. Sign in after the upgrade and after the restore to check that the same data remains.

Keep the backup directory private. The database archives can contain sensitive data. The examples use the `devportal` database, the default `backstage_plugin_` prefix, and the releases listed in Step 1. If you changed `PG_DATABASE` or `backend.database.prefix`, set `DATABASE_NAME` and `DB_PREFIX` to those values.

The examples upgrade 3.0.2 (chart 1.0.2) to 3.0.3 (chart 1.0.3). To upgrade from another 3.x release, set `CHART_FROM`, `IMAGE_FROM_VERSION`, and `IMAGE_FROM` in Step 1 to that release. The recorded end-to-end run started with chart 0.1.26 and image 3.0.0-beta.10, upgraded to chart 1.0.0 and image 3.0.0, and used PostgreSQL 16.15. It does not cover the paths from 3.0.0 onward. Charts 1.0.1 to 1.0.3 change only the image tag, digest, and version metadata against the chart before them.

Chart 1.0.4 keeps image 3.0.3 and changes two defaults. Check your stored values before you move to it:

- Guest sign-in is off. If the installation relies on guest sign-in and its values do not set `global.veecode.guestAuth.enabled`, set it to `true` before the upgrade, or guest access stops. Guest sign-in maps every visitor to the `admin` user.
- The plugin catalog index is pinned by digest: `repository` is `veecode/plugin-catalog-index@sha256` and `tag` holds the digest. If the values set `global.catalogIndex.image.tag` without `repository`, for example to a timestamped tag, also set `global.catalogIndex.image.repository: veecode/plugin-catalog-index`, or remove the override to use the chart's digest. Fix this before Step 2: with a tag and no repository, the values schema rejects the upgrade in Step 3, after Step 2 has stopped the portal. See [Configure the plugin catalog index](./catalog-index.md).
- If the installer pulls the index from a mirror and the values do not set `tag`, it now asks the mirror for the index by digest. Before Step 2, run `export CHART_VERSION="$CHART_TO" PORTAL_IMAGE_TAG="$IMAGE_TO_VERSION"`, then copy the index of the target chart to the mirror as in [Install without internet access](./setup.md#install-without-internet-access), which keeps the digest. If the values override `global.catalogIndex.image.repository`, keep the `@sha256` suffix on it, or also set `tag` to a tag. A repository without the suffix and no `tag` makes the chart request the digest as a tag, and the installer cannot pull the index. With chart 1.1.0, the values schema rejects that combination. `helm upgrade` in Step 3 stops with a schema error on `global.catalogIndex.image.repository`, after Step 2 has already stopped the portal. Fix the values before Step 2.

If a 3.0.0 deployment outside this chart runs the image with SQLite, change its image reference to 3.0.3 (the digest is on the release sheet). The backup and restore steps in this guide do not apply to it.

## Upgrade to chart 1.1.0

Chart 1.1.0 installs DevPortal 3.1.0. If you upgrade to it from chart 1.0.x or from 3.0.x, read this section before Step 1. The steps stay the same, with the changes below. VeeCode tested this upgrade from chart 1.0.4 only. Also read the [3.1.0 release sheet](../../release-sheets/release-sheet-3-1-0.md).

### What changes for you

The plugins that the portal enables by default now come from the plugin catalog index, which the chart pins by digest. Chart 1.0.x read those plugins from a file in the image, `/opt/app-root/src/dynamic-plugins.veecode.yaml`. Image 3.1.0 no longer has that file. It keeps only a list of the default plugin names, `/opt/app-root/src/factory-plugins.yaml`, which the Marketplace uses to recognize them.

A plugin update now reaches your portal through a new chart release, not a new image.

If your values set `global.catalogIndex.image`, remove that override from the values file for chart 1.1.0, described below, or point it at the index of chart 1.1.0. `helm show values veecode/devportal --version 1.1.0` prints that index's digest under `global.catalogIndex.image.tag`. The index that chart 1.0.4 pins enables none of the default plugins, and image 3.1.0 no longer carries them.

If you upgrade from chart 1.0.3 or earlier, the chart 1.0.4 checks above also apply, because chart 1.1.0 keeps those defaults.

In Step 1, replace the `CHART_TO`, `IMAGE_TO_VERSION`, and `IMAGE_TO` lines with these three lines, and set `CHART_FROM`, `IMAGE_FROM_VERSION`, and `IMAGE_FROM` to your current release:

```bash
export CHART_TO=1.1.0
export IMAGE_TO_VERSION=3.1.0
export IMAGE_TO=docker.io/veecode/devportal@sha256:fe33373b7e5dc536f04d1878519bb53862a769b46869f78f829b198a30e5246b
```

### Update the includes list

Chart 1.1.0 includes only `dynamic-plugins.default.yaml`. Remove `/opt/app-root/src/dynamic-plugins.veecode.yaml` from `global.dynamic.includes`, because image 3.1.0 no longer has that file.

Before:

```yaml
global:
  dynamic:
    includes:
      - dynamic-plugins.default.yaml
      - /opt/app-root/src/dynamic-plugins.veecode.yaml
```

After:

```yaml
global:
  dynamic:
    includes:
      - dynamic-plugins.default.yaml
```

The saved values contain this list only if you set `includes` yourself. `helm get values` shows the values you supplied, not the chart defaults. Check the saved file:

```bash
grep -n 'dynamic-plugins.veecode.yaml' "$BACKUP_DIR/values.yaml"
```

Before you edit anything for chart 1.1.0, copy the saved values. Do this whether or not the grep finds the entry:

1. Copy the saved values: `cp "$BACKUP_DIR/values.yaml" "$BACKUP_DIR/values-1.1.0.yaml"`.
2. If the grep found the entry, remove it from `global.dynamic.includes` in the copy.
3. In Step 3, pass `--values "$BACKUP_DIR/values-1.1.0.yaml"` in place of `values.yaml`.

Keep `values.yaml` unchanged. Step 5 uses it to return to chart 1.0.x, and chart 1.0.x loads its default plugins through the `includes` entry.

### Replace plugins that left the image

The 3.1.0 image has no `dynamic-plugins/` directory. An entry for a former `./dynamic-plugins/dist/...` plugin is skipped during install. The install still ends without an error, and the plugin is missing. Find these entries before Step 2:

```bash
grep -n './dynamic-plugins/dist/' "$BACKUP_DIR/values.yaml"
kubectl --namespace "$NAMESPACE" exec deployment/devportal-db -- \
  psql -U devportal -d "${DB_PREFIX}extensions" -At \
  -c "SELECT package_name, disabled, config_yaml FROM marketplace_installations WHERE package_name LIKE './dynamic-plugins/dist/%';"
```

In `$BACKUP_DIR/values-1.1.0.yaml`, replace each entry in `global.dynamic.plugins` with the plugin's `oci://` reference, or remove it. Search any `dynamic-plugins.yaml` you mount as well. The query lists the Marketplace installations that still point to a former path, with whether each one is disabled and its saved YAML; keep that output. It assumes the default database split. When `pluginDivisionMode` is `schema`, the table is in a schema of the portal's database: run the query there, with the table qualified by the schema that `SELECT table_schema FROM information_schema.tables WHERE table_name = 'marketplace_installations';` returns. For each row it returns, follow the steps in the [3.1.0 release sheet](../../release-sheets/release-sheet-3-1-0.md).

### Do not use `--reuse-values`

Do not add `--reuse-values` to the Step 3 command. It keeps the previous release's values, so the upgrade keeps the previous image and plugin index instead of the ones in chart 1.1.0. Pass the values file, as Step 3 does. If you prefer to reuse stored values, use `--reset-then-reuse-values` (Helm 3.14 or later), and check the includes list in the stored values first.

### Update overrides of default plugins

An override in `global.dynamic.plugins` still matches its plugin after the upgrade. `disabled: true` still removes the plugin, and a full `pluginConfig` still replaces the plugin's index configuration. A digest reference keeps the build of that digest, though, so the plugin does not follow the catalog index. For the RBAC plugin this matters most. The RBAC backend in image 3.1.0 refuses the conditional-policy writes that the 3.0.x frontend build sends.

Change each override of a default plugin that stays enabled, in `$BACKUP_DIR/values-1.1.0.yaml`, as follows:

1. Replace `@sha256:<digest>` with `:{{ "{{inherit}}" }}`, as the example below shows. Keep the `!<path>` suffix. `{{inherit}}` takes the version that the pinned index gives the plugin.
2. Keep `disabled` and `pluginConfig` as they are.
3. If your values replace `upstream.backstage.initContainers`, remove the `DEVPORTAL_FACE_FILE` variable from the `install-dynamic-plugins` container. Chart 1.1.0 no longer sets it. If the variable stays, the install logs a warning that it is no longer read.

The chart renders these values as templates, so write `{{inherit}}` with the escape shown in the example below. A bare `{{inherit}}` makes Helm fail with `function "inherit" not defined`. This form has not been run on a portal with image 3.1.0. After the upgrade, check that each plugin you overrode still loads.

Before (chart 1.0.x):

```yaml
global:
  dynamic:
    plugins:
      - package: oci://quay.io/veecode/backstage-community-plugin-tech-radar@sha256:<digest>!backstage-community-plugin-tech-radar
        disabled: true
```

After (chart 1.1.0):

```yaml
global:
  dynamic:
    plugins:
      - package: oci://quay.io/veecode/backstage-community-plugin-tech-radar:{{ "{{inherit}}" }}!backstage-community-plugin-tech-radar
        disabled: true
```

### Marketplace behavior for default plugins

Four default plugins are protected, and the Marketplace cannot disable them. If you disable one of them in the Marketplace, the portal ignores that change, and the log of the `install-dynamic-plugins` init container shows a warning. The protected plugins are:

- `devportal-marketplace-backend`
- `devportal-marketplace-frontend-dynamic`
- `devportal-pending-changes-dynamic`
- `red-hat-developer-hub-backstage-plugin-catalog-backend-module-extensions`

You can disable the other default plugins from the Marketplace. The change takes effect after the portal restarts.

### Roll back to chart 1.0.4

Step 5 returns the portal to the chart in `CHART_FROM`. VeeCode tested a rollback from chart 1.1.0 with image 3.1.0 to chart 1.0.4. The test stopped the portal, restored the database backup taken before the upgrade, rolled the chart back with `helm rollback` to the revision installed before the upgrade, and checked the plugins after the restart. The test used plain SQL dumps and `helm rollback`. The commands in Step 5, which use the custom dump format from Step 2 and `helm upgrade`, have not been run for this upgrade.

### Upgrade from 3.0.x for a security fix

DevPortal 3.0.x includes `@backstage/plugin-scaffolder-backend` 4.0.1. That version is in the affected range of [GHSA-g2v8-7jhw-pp8p](https://github.com/advisories/GHSA-g2v8-7jhw-pp8p) (CVE-2026-106501), a critical sensitive-information exposure issue in the Scaffolder with a CVSS score of 9.6. DevPortal 3.1.0 includes `@backstage/plugin-scaffolder-backend` 4.1.0, which fixes the issue.

## Step 1: Prepare the release and backup directory

Run these commands in one Bash session. They save the values stored for this release. Each chart version supplies its own defaults.

```bash
export NAMESPACE=devportal
export RELEASE=devportal
export DATABASE_NAME=devportal
export DB_PREFIX=backstage_plugin_
export CHART_FROM=1.0.2
export IMAGE_FROM_VERSION=3.0.2
export IMAGE_FROM=docker.io/veecode/devportal@sha256:48f95e221844db13887b71dd7379a867b338ec1f9601a7ce3882e376aad36706
export CHART_TO=1.0.3
export IMAGE_TO_VERSION=3.0.3
export IMAGE_TO=docker.io/veecode/devportal@sha256:e5c84f744994b30b329e23ff8480857bd4b0be46d63e027b5e87d0428c1df7f5
BACKUP_DIR="$PWD/devportal-backup-$(date +%Y%m%d%H%M%S)"
export BACKUP_DIR

list_portal_databases() {
  kubectl --namespace "$NAMESPACE" exec --stdin deployment/devportal-db -- \
    psql -U devportal -d postgres -At \
    -v database="$DATABASE_NAME" -v prefix="$DB_PREFIX" <<'SQL'
SELECT datname
FROM pg_database
WHERE datname = :'database'
   OR left(datname, length(:'prefix')) = :'prefix'
ORDER BY datname;
SQL
}

umask 077
mkdir -m 700 "$BACKUP_DIR"

helm repo add --force-update veecode https://veecode-platform.github.io/next-charts
helm repo update
helm list --namespace "$NAMESPACE" --filter "^${RELEASE}$"
helm get values "$RELEASE" --namespace "$NAMESPACE" --output yaml \
  > "$BACKUP_DIR/values.yaml"
```

Confirm that `helm list` shows the starting release before you continue.

## Step 2: Stop the portal and back up its databases

Stop the portal so it cannot write to the databases while you take the backup. The PostgreSQL deployment remains running.

```bash
(
  set -euo pipefail

  kubectl --namespace "$NAMESPACE" scale "deployment/$RELEASE-developer-hub" --replicas=0
  kubectl --namespace "$NAMESPACE" rollout status "deployment/$RELEASE-developer-hub" --timeout=10m
  kubectl --namespace "$NAMESPACE" wait --for=delete pod \
    -l app.kubernetes.io/name=developer-hub --timeout=10m

  list_portal_databases > "$BACKUP_DIR/databases.txt"
  test -s "$BACKUP_DIR/databases.txt"

  while IFS= read -r database; do
    kubectl --namespace "$NAMESPACE" exec deployment/devportal-db -- \
      pg_dump -U devportal --format=custom "$database" \
      > "$BACKUP_DIR/$database.dump"
  done < "$BACKUP_DIR/databases.txt"

  sha256sum "$BACKUP_DIR"/*.dump > "$BACKUP_DIR/SHA256SUMS"
  sha256sum --check "$BACKUP_DIR/SHA256SUMS"
)
```

Keep `databases.txt`, every `.dump` file, `SHA256SUMS`, and `values.yaml` together. Confirm the checksums pass before you upgrade.

## Step 3: Upgrade the chart

Upgrade the existing Helm release to the target chart version. The command applies the saved release values and uses the defaults from the target chart.

```bash
helm upgrade "$RELEASE" veecode/devportal \
  --namespace "$NAMESPACE" --version "$CHART_TO" \
  --values "$BACKUP_DIR/values.yaml" \
  --wait --timeout 20m
```

## Step 4: Verify the upgraded installation

Wait for the portal deployment and confirm Helm reports `$CHART_TO`:

```bash
kubectl --namespace "$NAMESPACE" rollout status "deployment/$RELEASE-developer-hub" --timeout=20m
helm list --namespace "$NAMESPACE" --filter "^${RELEASE}$"
image=$(kubectl --namespace "$NAMESPACE" get "deployment/$RELEASE-developer-hub" \
  -o jsonpath='{.spec.template.spec.containers[?(@.name=="backstage-backend")].image}')
printf '%s\n' "$image"
test "$image" = "$IMAGE_TO"
kubectl --namespace "$NAMESPACE" get pods
```

Confirm that Helm reports `$CHART_TO` and the image check passes. The `RESTARTS` column can show 1 or 2 for the portal pod. During its first start after the chart change, the backend can fail its health checks and be restarted before it becomes ready.

Check that the portal pods are ready. Sign in with the same account and confirm that the catalog location and entity, installed marketplace package, Scaffolder task, and user setting you noted before the upgrade are still present. After an upgrade to 3.1.0, the Marketplace can keep listing the packages of the previous catalog index for up to 30 minutes. Wait until it shows the 3.1 versions before you check the installed marketplace package.

## Step 5: Restore the backup and return to the starting chart

If you need to return to the earlier chart with the pre-upgrade database state, stop the portal and restore every database from the backup before you install the starting chart. The restore removes databases created under the configured portal prefix after the backup.

```bash
(
  set -euo pipefail

  kubectl --namespace "$NAMESPACE" scale "deployment/$RELEASE-developer-hub" --replicas=0
  kubectl --namespace "$NAMESPACE" rollout status "deployment/$RELEASE-developer-hub" --timeout=10m
  kubectl --namespace "$NAMESPACE" wait --for=delete pod \
    -l app.kubernetes.io/name=developer-hub --timeout=10m
  sha256sum --check "$BACKUP_DIR/SHA256SUMS"

  list_portal_databases > "$BACKUP_DIR/databases-to-drop.txt"
  test -s "$BACKUP_DIR/databases-to-drop.txt"

  while IFS= read -r database; do
    kubectl --namespace "$NAMESPACE" exec deployment/devportal-db -- \
      dropdb --if-exists -U devportal "$database"
  done < "$BACKUP_DIR/databases-to-drop.txt"

  while IFS= read -r database; do
    kubectl --namespace "$NAMESPACE" exec deployment/devportal-db -- \
      createdb -U devportal "$database"
    kubectl --namespace "$NAMESPACE" exec --stdin deployment/devportal-db -- \
      pg_restore -U devportal --exit-on-error --dbname="$database" \
      < "$BACKUP_DIR/$database.dump"
  done < "$BACKUP_DIR/databases.txt"

  helm upgrade "$RELEASE" veecode/devportal \
    --namespace "$NAMESPACE" --version "$CHART_FROM" \
    --values "$BACKUP_DIR/values.yaml" \
    --wait --timeout 20m
)
```

## Step 6: Verify the restored installation

Wait for the portal and confirm Helm reports `$CHART_FROM`:

```bash
kubectl --namespace "$NAMESPACE" rollout status "deployment/$RELEASE-developer-hub" --timeout=20m
helm list --namespace "$NAMESPACE" --filter "^${RELEASE}$"
image=$(kubectl --namespace "$NAMESPACE" get "deployment/$RELEASE-developer-hub" \
  -o jsonpath='{.spec.template.spec.containers[?(@.name=="backstage-backend")].image}')
printf '%s\n' "$image"
test "$image" = "$IMAGE_FROM"
kubectl --namespace "$NAMESPACE" get pods
```

Confirm that Helm reports `$CHART_FROM` and the image check passes. The `RESTARTS` column can show 1 or 2 for the portal pod. During its first start after the chart change, the backend can fail its health checks and be restarted before it becomes ready.

Check that the portal pods are ready. Sign in with the same account and confirm that the catalog location and entity, installed marketplace package, Scaffolder task, and user setting match the state you recorded before the upgrade.

## Clean up the backup files

Keep the backup for as long as your retention policy requires. When you have confirmed the restored installation and no longer need the files, remove the directory according to your organization's secure deletion policy:

```bash
rm -r -- "$BACKUP_DIR"
```

This procedure is adapted from the [Red Hat Developer Hub Helm chart upgrade documentation](https://github.com/redhat-developer/red-hat-developers-documentation-rhdh/blob/main/modules/upgrade_upgrade-rhdh/proc-upgrade-the-rhdh-helm-chart.adoc). The source documentation is licensed under [Apache-2.0](https://github.com/redhat-developer/red-hat-developers-documentation-rhdh/blob/main/LICENSE); this page has been modified for DevPortal.
