---
sidebar_position: 2
sidebar_label: Permissions
title: RBAC Permissions
---

Role-Based Access Control (RBAC) is a method of managing access to system resources based on user roles. Instead of assigning permissions directly to individual users, roles are created with predefined permissions, and users are assigned to these roles. This approach simplifies permission management and enhances security by reducing the risk of unauthorized access.

Each plugin defines its own permissions. The tables below list the permissions in the default install, grouped by plugin. Each entry shows the permission name, the policy action, and the resource type. A dash means the permission has no resource type.

A policy can also name a resource type, such as `catalog-entity`, to cover every permission of that type. The documented `basicPermissions` example uses `catalog-entity`.

---

## 1. RBAC policy permissions

These permissions control who can read and change roles and policies. Users and groups in `superUsers` get full access, including role and policy management. The policy list shows their admin policies under `role:default/rbac_admin`, and that role does not appear in the role list.

| Permission | Policy action | Resource type | What it allows |
| --- | --- | --- | --- |
| `policy.entity.read` | `read` | `policy-entity` | Read roles and policies |
| `policy.entity.create` | `create` | — | Create roles and policies |
| `policy.entity.delete` | `delete` | `policy-entity` | Delete roles and policies |
| `policy.entity.update` | `update` | `policy-entity` | Update roles and policies |

---

## 2. Scaffolder permissions

| Permission | Policy action | Resource type | What it allows |
| --- | --- | --- | --- |
| `scaffolder.template.parameter.read` | `read` | `scaffolder-template` | Read template parameters |
| `scaffolder.template.step.read` | `read` | `scaffolder-template` | Read template steps |
| `scaffolder.action.execute` | `use` | `scaffolder-action` | Run scaffolder actions |
| `scaffolder.task.cancel` | `use` | `scaffolder-task` | Cancel scaffolder tasks |
| `scaffolder.task.create` | `create` | — | Create scaffolder tasks |
| `scaffolder.task.read` | `read` | `scaffolder-task` | Read scaffolder tasks |
| `scaffolder.template.management` | `use` | — | Manage scaffolder templates |

---

## 3. Catalog permissions

| Permission | Policy action | Resource type | What it allows |
| --- | --- | --- | --- |
| `catalog.entity.read` | `read` | `catalog-entity` | Read catalog entities |
| `catalog.entity.create` | `create` | — | Create catalog entities |
| `catalog.entity.delete` | `delete` | `catalog-entity` | Delete catalog entities |
| `catalog.entity.refresh` | `update` | `catalog-entity` | Refresh catalog entities |
| `catalog.entity.validate` | `use` | — | Validate catalog entities |
| `catalog.location.read` | `read` | — | Read catalog locations |
| `catalog.location.create` | `create` | — | Create catalog locations |
| `catalog.location.delete` | `delete` | — | Delete catalog locations |
| `catalog.location.analyze` | `use` | — | Analyze catalog locations |

The Notifications plugin registers no permissions.

An admin can list the registered set with `GET /api/permission/plugins/policies`:

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:7007/api/permission/plugins/policies
```

If you install a plugin that registers its own permissions, those permission names come from that plugin. Grant them to a role with the same REST or CSV method described in [How to Create a Role](./creating-role.md).
