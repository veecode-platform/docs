---
sidebar_position: 1
sidebar_label: Creating Role
title: Creating Role
---

# How to Create a Role

In a Role-Based Access Control (RBAC) system, a role is a set of permissions that define a user's access level within the system. Instead of assigning permissions directly to individual users, roles are created based on job functions, responsibilities, or titles. Users are then assigned to these roles, inheriting the associated permissions.

### Benefits of RBAC

- **Simplified Permission Management**: Roles allow centralized management of user permissions.
- **Enhanced Security**: Minimizes unauthorized access risks by restricting permissions based on user roles.
- **Efficient User Management**: Assigning roles instead of individual permissions makes managing large teams easier.

### Permission checks are off by default

The chart ships with `permission.enabled: false`. With checks off, the permission API returns 404 and no request is checked against roles. For example, a location registration that a reader's role denies with 403 when checks are on passes the permission check when they are off.

### What enabling RBAC creates

DevPortal 3.x ships no roles. Users and groups in `superUsers` get full access, including role and policy management. The policy list shows their admin policies under `role:default/rbac_admin`, and that role does not appear in the role list. Every other role comes from your own configuration, CSV file, or REST calls. The `viewer` and `developer` roles used in local examples come from that local configuration and CSV file, not from the product.

## Turn on RBAC

Add the following app configuration:

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

`superUsers` lists the users or groups with full access, including role management. `defaultPermissions` sets the default role and the basic permissions every signed-in user keeps. The CSV settings are optional and point at a file mounted into the container.

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

## Create a role with the permission API

An admin creates a role with `POST /api/permission/roles`:

```bash
curl -X POST http://localhost:7007/api/permission/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"memberReferences":["group:default/readers"],"name":"role:default/labreaders"}'
```

The call returns 201 when the role is created.

Add policies to the role with `POST /api/permission/policies`. The body must be a JSON array:

```bash
curl -X POST http://localhost:7007/api/permission/policies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{"entityReference":"role:default/labreaders","permission":"catalog.entity.read","policy":"read","effect":"allow"}]'
```

A single object without the array is rejected with 400. Roles and policies created this way persist across restarts.

A user without a matching policy is denied with 403 on the denied action. For example, a user whose role allows only catalog reads can read catalog entities but gets 403 when registering a location.

## Keep role bindings in a CSV file

Point `policies-csv-file` at a file mounted into the container. Each `p,` line grants a permission to a role, and each `g,` line assigns a user or group to a role:

```csv
p, role:default/developer, catalog.entity.read, read, allow
g, group:default/developers, role:default/developer
```

## Manage roles at /rbac

The RBAC page at `/rbac` sits under **Administration** in the sidebar. The role table has columns **Name**, **Users and groups**, **Accessible plugins** and **Actions**, with **Create**, **Filter** and **Export CSV** controls. **Create** opens a wizard with three steps: "Enter name, description, and owner of role", "Add users and groups", and "Add permission policies". Use the page, the REST calls above, or the CSV file to add and change roles.

## Try roles on the local stack

The devportal-local stack ships an RBAC lab overlay (`docker-compose.rbac-lab.yml` plus `rbac-lab/`) for trying roles locally. It switches the guest identity with `LAB_USER` and `LAB_GROUP` and uses `dangerouslyAllowOutsideDevelopment`, so use it for local testing only.
