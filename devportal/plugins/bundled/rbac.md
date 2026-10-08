---
sidebar_position: 1
sidebar_label: RBAC
title: RBAC Plugin
---

# RBAC Plugin

The RBAC plugin provides a page for managing role-based access control policies in DevPortal. It adds a `/rbac` route under the **Administration** menu section.

**Status:** The RBAC screens ship enabled among the default plugins listed in the default plugin file (`dynamic-plugins.veecode.yaml`). The enforcing backend is built in and turns on through configuration. No plugin entry is needed.

---

## Package

`backstage-community-plugin-rbac`

---

## What it does

The RBAC page shows the role table with columns **Name**, **Users and groups**, **Accessible plugins** and **Actions**, with **Create**, **Filter** and **Export CSV** controls. **Create** opens a wizard with three steps: "Enter name, description, and owner of role", "Add users and groups", and "Add permission policies". You can also manage roles through the permission REST API or a CSV policy file.

An admin creates a role with `POST /api/permission/roles` and adds policies with `POST /api/permission/policies`, where the body must be a JSON array. Roles and policies created this way persist across restarts. See [How to Create a Role](../../rbac/creating-role.md) for the full steps.

---

## Access

The RBAC page is available at `/rbac` and sits under **Administration** in the sidebar. Users and groups listed in `superUsers` can open it.

---

## Roles

DevPortal 3.x ships no roles. Users and groups in `superUsers` get full access, including role and policy management. The policy list shows their admin policies under `role:default/rbac_admin`, and that role does not appear in the role list. Every other role is your own. Do not treat example `viewer` or `developer` roles from local samples as product defaults.

---

## App configuration

RBAC is configured in app configuration under `permission.rbac`. The CSV settings are optional and point at a file mounted into the container:

```yaml
permission:
  enabled: true
  rbac:
    admin:
      superUsers:
        - name: group:default/backstage-admins
    defaultPermissions:
      defaultRole: role:default/viewer
      basicPermissions:
        - permission: catalog.entity.read
          action: read
        - permission: catalog-entity
          action: read
    policies-csv-file: /opt/app-root/src/rbac/rbac-policy.csv
    policyFileReload: true
```

On Kubernetes, place the permission settings under `upstream.backstage.appConfig` in the chart values:

```yaml
upstream:
  backstage:
    appConfig:
      permission:
        enabled: true
        rbac:
          admin:
            superUsers:
              - name: group:default/backstage-admins
          defaultPermissions:
            defaultRole: role:default/viewer
            basicPermissions:
              - permission: catalog.entity.read
                action: read
              - permission: catalog-entity
                action: read
```

### Load a CSV policy file on Kubernetes

To load roles and policies from a CSV file, store the file in a ConfigMap and mount it at the path that `policies-csv-file` names. This example file gives a role read access to catalog entities and assigns the role to one user:

```text
p, role:default/catalog-reader, catalog-entity, read, allow
g, user:default/jdoe, role:default/catalog-reader
```

Create the ConfigMap from the file:

```bash
kubectl -n "$NAMESPACE" create configmap rbac-policy-csv --from-file=rbac-policy.csv=rbac-policy.csv
```

Then add the CSV settings and the mount to the chart values. Helm replaces a list in your values instead of merging it with the chart's list, so `extraVolumeMounts` and `extraVolumes` below repeat the chart's own entries for chart 1.0.3 and the release `devportal`, plus the `rbac-policy` entry. Compare them with `helm show values veecode/devportal --version <chart-version>` before you use them with another chart version.

```yaml
upstream:
  backstage:
    appConfig:
      permission:
        enabled: true
        rbac:
          admin:
            superUsers:
              - name: group:default/backstage-admins
          policies-csv-file: /opt/app-root/src/rbac/rbac-policy.csv
          policyFileReload: true
    extraVolumeMounts:
      - name: dynamic-plugins-root
        mountPath: /opt/app-root/src/dynamic-plugins-root
      - name: extensions-catalog
        mountPath: /extensions
      - name: temp
        mountPath: /tmp
      - name: devportal-data
        mountPath: /devportal-data
      - name: rbac-policy
        mountPath: /opt/app-root/src/rbac/rbac-policy.csv
        subPath: rbac-policy.csv
        readOnly: true
    extraVolumes:
      - name: dynamic-plugins-root
        ephemeral:
          volumeClaimTemplate:
            spec:
              accessModes:
                - ReadWriteOnce
              resources:
                requests:
                  storage: 5Gi
      - name: dynamic-plugins
        configMap:
          defaultMode: 420
          name: devportal-dynamic-plugins
          optional: true
      - name: dynamic-plugins-npmrc
        secret:
          defaultMode: 420
          optional: true
          secretName: devportal-dynamic-plugins-npmrc
      - name: dynamic-plugins-registry-auth
        secret:
          defaultMode: 416
          optional: true
          secretName: devportal-dynamic-plugins-registry-auth
      - name: npmcacache
        emptyDir: {}
      - name: extensions-catalog
        emptyDir: {}
      - name: temp
        emptyDir: {}
      - name: devportal-data
        emptyDir: {}
      - name: rbac-policy
        configMap:
          name: rbac-policy-csv
          defaultMode: 420
```

Replace `group:default/backstage-admins` with the users or groups that manage roles and policies in your catalog. A user who is not a super user and has no RBAC policy permissions gets 403 from the RBAC API. With this group alone, the guest identity of the evaluation install, `user:default/admin`, got 403.

After the upgrade, `GET /api/permission/roles` lists the role from the file with `"source": "csv-file"`, and `GET /api/permission/policies` lists its policies.

The chart ships with `permission.enabled: false`. With checks off, the permission API returns 404 and no request is checked against roles. For example, a location registration that a reader's role denies with 403 when checks are on passes the permission check when they are off.

See [RBAC Permissions](../../rbac/permissions.md) for the permission names.
