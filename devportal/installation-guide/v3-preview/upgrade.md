---
sidebar_position: 2
sidebar_label: Upgrade
title: Upgrade DevPortal 3.x
---

# Upgrade DevPortal 3.x

Use this procedure to upgrade a DevPortal 3.x installation managed by the `devportal` Helm chart. It backs up the portal databases before the chart upgrade and restores that backup before returning to the earlier chart version.

The examples assume an installation created by the DevPortal 3.x installation guide, with a separate PostgreSQL deployment named `devportal-db` in the `devportal` namespace. The database user `devportal` must be able to list, dump, drop, create, and restore the portal databases. Adapt the PostgreSQL commands if your database service uses another name or connection method. Do not use the database prefix for another application.

The portal stores plugin data in separate PostgreSQL databases. Back up the database named by `PG_DATABASE` and every database that starts with `backend.database.prefix` (the default is `backstage_plugin_`). A backup of only `PG_DATABASE` can miss plugin data.

Tested with chart `devportal` 0.1.26 and 1.0.0, which install images 3.0.0-beta.10 and 3.0.0, respectively, and PostgreSQL 16.15.

## Before you start

Use a maintenance window. The procedure scales the portal down while it takes and restores the database backup.

Before you upgrade, note one registered catalog location and entity, one installed marketplace package, one Scaffolder task, and one user setting. Sign in after the upgrade and after the restore to check that the same data remains.

Keep the backup directory private. The database archives can contain sensitive data. The examples use the `devportal` database, the default `backstage_plugin_` prefix, and chart version 1.0.0 as the target. If you changed `PG_DATABASE` or `backend.database.prefix`, set `DATABASE_NAME` and `DB_PREFIX` to those values.

## Step 1: Prepare the release and backup directory

Run these commands in one Bash session. They save the values stored for this release. Each chart version supplies its own defaults.

```bash
export NAMESPACE=devportal
export RELEASE=devportal
export DATABASE_NAME=devportal
export DB_PREFIX=backstage_plugin_
export CHART_FROM=0.1.26
export CHART_TO=1.0.0
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

Confirm that `helm list` shows the release on chart 0.1.26 before you continue.

## Step 2: Stop the portal and back up its databases

Stop the portal so it cannot write to the databases while you take the backup. The PostgreSQL deployment remains running.

```bash
kubectl --namespace "$NAMESPACE" scale deployment/devportal-developer-hub --replicas=0
kubectl --namespace "$NAMESPACE" rollout status deployment/devportal-developer-hub --timeout=10m

list_portal_databases > "$BACKUP_DIR/databases.txt"
test -s "$BACKUP_DIR/databases.txt"

while IFS= read -r database; do
  kubectl --namespace "$NAMESPACE" exec deployment/devportal-db -- \
    pg_dump -U devportal --format=custom "$database" \
    > "$BACKUP_DIR/$database.dump"
done < "$BACKUP_DIR/databases.txt"

sha256sum "$BACKUP_DIR"/*.dump > "$BACKUP_DIR/SHA256SUMS"
sha256sum --check "$BACKUP_DIR/SHA256SUMS"
```

Keep `databases.txt`, every `.dump` file, `SHA256SUMS`, and `values.yaml` together. Confirm the checksums pass before you upgrade.

## Step 3: Upgrade the chart

Upgrade the existing Helm release to chart version 1.0.0. The command applies the saved release values and uses the defaults from chart 1.0.0.

```bash
helm upgrade "$RELEASE" veecode/devportal \
  --namespace "$NAMESPACE" --version "$CHART_TO" \
  --values "$BACKUP_DIR/values.yaml" \
  --wait --timeout 20m
```

## Step 4: Verify the upgraded installation

Wait for the portal deployment and confirm Helm reports chart version 1.0.0:

```bash
kubectl --namespace "$NAMESPACE" rollout status deployment/devportal-developer-hub --timeout=20m
helm list --namespace "$NAMESPACE" --filter "^${RELEASE}$"
kubectl --namespace "$NAMESPACE" get deployment/devportal-developer-hub \
  -o jsonpath='{.spec.template.spec.containers[?(@.name=="backstage-backend")].image}{"\n"}'
kubectl --namespace "$NAMESPACE" get pods
```

Confirm that Helm reports chart 1.0.0. The deployment image should be `docker.io/veecode/devportal@sha256:585daa40009ca79988766a717257d592bce0f711b851fa06c200954aeafc6564` (image `3.0.0`).

Check that the portal pods are ready. Sign in with the same account and confirm that the catalog location and entity, installed marketplace package, Scaffolder task, and user setting you noted before the upgrade are still present.

## Step 5: Restore the backup and return to chart 0.1.26

If you need to return to the earlier chart with the pre-upgrade database state, stop the portal and restore every database from the backup before you install chart 0.1.26. The restore removes databases created under the configured portal prefix after the backup.

```bash
kubectl --namespace "$NAMESPACE" scale deployment/devportal-developer-hub --replicas=0
kubectl --namespace "$NAMESPACE" rollout status deployment/devportal-developer-hub --timeout=10m
kubectl --namespace "$NAMESPACE" wait --for=delete pod \
  -l app.kubernetes.io/name=developer-hub --timeout=10m
sha256sum --check "$BACKUP_DIR/SHA256SUMS"

while IFS= read -r database; do
  kubectl --namespace "$NAMESPACE" exec deployment/devportal-db -- \
    dropdb --if-exists -U devportal "$database"
done < <(list_portal_databases)

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
```

## Step 6: Verify the restored installation

Wait for the portal and confirm Helm reports chart version 0.1.26:

```bash
kubectl --namespace "$NAMESPACE" rollout status deployment/devportal-developer-hub --timeout=20m
helm list --namespace "$NAMESPACE" --filter "^${RELEASE}$"
kubectl --namespace "$NAMESPACE" get deployment/devportal-developer-hub \
  -o jsonpath='{.spec.template.spec.containers[?(@.name=="backstage-backend")].image}{"\n"}'
kubectl --namespace "$NAMESPACE" get pods
```

Confirm that Helm reports chart 0.1.26. The deployment image should be `docker.io/veecode/devportal@sha256:28d1bafed0cfa3cdb3ceab1868ccc4a729410e0921b352457e167ab7cbfb3e5a` (image `3.0.0-beta.10`).

Check that the portal pods are ready. Sign in with the same account and confirm that the catalog location and entity, installed marketplace package, Scaffolder task, and user setting match the state you recorded before the upgrade.

## Clean up the backup files

Keep the backup for as long as your retention policy requires. When you have confirmed the restored installation and no longer need the files, remove the directory according to your organization's secure deletion policy:

```bash
rm -r -- "$BACKUP_DIR"
```

This procedure is adapted from the [Red Hat Developer Hub Helm chart upgrade documentation](https://github.com/redhat-developer/red-hat-developers-documentation-rhdh/blob/main/modules/upgrade_upgrade-rhdh/proc-upgrade-the-rhdh-helm-chart.adoc). The source documentation is licensed under [Apache-2.0](https://github.com/redhat-developer/red-hat-developers-documentation-rhdh/blob/main/LICENSE); this page has been modified for DevPortal.
