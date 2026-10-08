---
sidebar_position: 5
sidebar_label: Plugin catalog index
title: Configure the plugin catalog index
---

The plugin catalog index is an image that lists the plugins shown on the **Extensions** page. At each start, the installer reads the plugin list in the index, `dynamic-plugins.default.yaml`, and the extension catalog entities from it. The chart reads the index from `global.catalogIndex.image`. The default is `quay.io/veecode/plugin-catalog-index:bs_1.52.0`.

This page covers how to pin an index tag, add extra indexes, mirror the index in a private registry, and check what the index loaded.

## Pin a timestamped index tag

Index tags with a timestamp, such as `bs_1.52.0_20260820T205531`, exist next to the default tag. Use one when an index update causes a problem and you need the portal to keep the earlier index. Set the tag in a values file:

```yaml
global:
  catalogIndex:
    image:
      tag: bs_1.52.0_20260820T205531
```

Upgrade the release with the file:

```bash
helm upgrade devportal veecode/devportal --version "$CHART_VERSION" \
  -n "$NAMESPACE" -f catalog-index-pin.yaml --reuse-values --wait --timeout 20m
```

Each upgrade took about 2 to 9 minutes to become ready. On the first start after an upgrade, the pod can restart while the plugins install, so keep the `--timeout 20m` headroom.

To return to the default tag, set it back on the command line:

```bash
helm upgrade devportal veecode/devportal --version "$CHART_VERSION" \
  -n "$NAMESPACE" --reuse-values --set global.catalogIndex.image.tag=bs_1.52.0 \
  --wait --timeout 20m
```

## Add extra indexes

`global.catalogIndex.extraImages` adds more indexes next to the default one. Each entry names the index and its image:

```yaml
global:
  catalogIndex:
    extraImages:
      - name: second-copy
        registry: quay.io
        repository: veecode/plugin-catalog-index
        tag: "bs_1.52.0_20260813T182849"
```

An extra index adds its entries to the **Extensions** page only. It does not install plugins or change the installed plugins. With the default index, adding this extra index raised the plugin count on the **Extensions** page from 71 to 87 and the package count from 145 to 158. The number of loaded plugins stayed at 18.

## Mirror the index in a private registry

Use a mirror when the cluster cannot reach `quay.io`. Copy the index to your registry with the `skopeo copy` command in [Install without internet access](./setup.md#install-without-internet-access), then point the chart at the copy:

```yaml
global:
  catalogIndex:
    image:
      registry: registry.example.com
      repository: veecode/plugin-catalog-index
      tag: bs_1.52.0
```

Use the tag you copied. The mirror has to meet three requirements:

- **TLS.** The installer cannot pull over plain HTTP. A mirror that serves HTTP only fails with `http: server gave HTTP response to HTTPS client`. The mirror must serve TLS with a certificate that the installer's system trust store accepts.
- **Trust.** The `caBundle` value, described in [Let the backend reach and trust Keycloak](./setup.md#let-the-backend-reach-and-trust-keycloak), reaches the backend only. The installer does not read it, so chart values do not cover a certificate from a private CA for the mirror.
- **Credentials.** If the mirror requires a login, store it in a Secret named after the release, `<release>-dynamic-plugins-registry-auth`, under the key `auth.json`. For the `devportal` release of the setup guide, the name is `devportal-dynamic-plugins-registry-auth`. The installer reads that key.

Create the Secret with the registry host and the base64 encoding of `user:password`:

```bash
kubectl -n "$NAMESPACE" create secret generic devportal-dynamic-plugins-registry-auth \
  --from-literal=auth.json='{"auths":{"<mirror-host>":{"auth":"<base64 of user:password>"}}}'
```

Use this format exactly. It is the format that `podman login` and `docker login` write to their auth file. A `username` and `password` pair in place of `auth` does not authenticate.

Without the `auth.json` key, the installer log shows an authentication error:

```bash
kubectl -n "$NAMESPACE" logs deployment/devportal-developer-hub -c install-dynamic-plugins
```

```text
skopeo copy failed ... reading manifest ...: authentication required
```

## Check what the index loaded

Read the installer log. The first lines show the index image that the start used:

```bash
kubectl -n "$NAMESPACE" logs deployment/devportal-developer-hub -c install-dynamic-plugins \
  | grep -E 'Extracting catalog index|Extracted dynamic-plugins'
```

The log shows `Extracting catalog index from` followed by the image reference, and then `Extracted dynamic-plugins.default.yaml`. An extra index adds the line `Successfully extracted extensions catalog entities from extra index image`.

Then count the entries that the Extensions API returns. The API needs a token. Guest sign-in provides one, so run this check on an install where guest sign-in is on. The production setup turns guest sign-in off. Forward the portal service first:

```bash
kubectl -n "$NAMESPACE" port-forward svc/devportal-developer-hub 7007:7007
```

In another terminal, request a guest token and count the plugins and packages:

```bash
TOKEN=$(curl -s http://localhost:7007/api/auth/guest/refresh -H 'X-Requested-With: XMLHttpRequest' | python3 -c 'import sys,json; print(json.load(sys.stdin)["backstageIdentity"]["token"])')

curl -s -H "Authorization: Bearer $TOKEN" http://localhost:7007/api/extensions/plugins | python3 -c 'import sys,json; print(json.load(sys.stdin)["totalItems"])'
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:7007/api/extensions/packages | python3 -c 'import sys,json; print(json.load(sys.stdin)["totalItems"])'
```

With the default index on chart 1.0.3 and image 3.0.3, the counts were 71 plugins and 145 packages. Compare the counts before and after a change to the index.
