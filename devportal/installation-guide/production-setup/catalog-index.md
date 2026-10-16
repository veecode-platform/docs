---
sidebar_position: 5
sidebar_label: Plugin catalog index
title: Configure the plugin catalog index
---

The plugin catalog index is an image that lists the plugins shown on the **Extensions** page. At each start, the installer reads the plugin list in the index, `dynamic-plugins.default.yaml`, and the extension catalog entities from it. The chart reads the index from `global.catalogIndex.image`. From chart 1.0.4 the default is pinned by digest, `quay.io/veecode/plugin-catalog-index@sha256:<digest>`, and each chart release re-pins it. Chart 1.0.3 and earlier point at the moving tag `quay.io/veecode/plugin-catalog-index:bs_1.52.0`, so the index a portal loads can change without a chart upgrade.

This page covers how to move to another index, add extra indexes, mirror the index in a private registry, and check what the index loaded.

## Move to another index

To run another index, set both `repository` and `tag` of `global.catalogIndex.image` in a values file. Use one of two forms:

- **Another digest:** keep `repository: veecode/plugin-catalog-index@sha256` and set `tag` to the 64-character digest. The chart passes `quay.io/veecode/plugin-catalog-index@sha256:<digest>` to the installer.
- **A tag:** set `repository: veecode/plugin-catalog-index` and `tag` to a tag. The registry publishes timestamped tags, such as `bs_1.54.9_20261015T183630`, for temporary pinning. Use one to keep an earlier index when an index update causes a problem. From chart 1.1.0, pick a tag of the same Backstage line (`bs_1.54.9_...`): an index built for 3.0.x (`bs_1.52.0_...`) enables none of the default plugins, so the portal starts without them.

Set both keys in either form. A `tag` alone keeps the default `@sha256` repository, and the values schema rejects a tag that is not a 64-character digest there. Helm then stops before it changes the release:

```text
Error: values don't meet the specifications of the schema(s) in the following chart(s):
devportal:
- at '/global/catalogIndex/image/tag': 'bs_1.54.9_20261015T183630' does not match pattern '^[0-9a-f]{64}$'
```

The example below uses the tag form:

```yaml
global:
  catalogIndex:
    image:
      repository: veecode/plugin-catalog-index
      tag: bs_1.54.9_20261015T183630
```

The commands on this page change the index of a release that already runs chart `$CHART_VERSION`. To move to another chart version as well, follow [Upgrade DevPortal 3.x](./upgrade.md) and add the file to the values of its Step 3.

Save the values stored for the release, then upgrade with them and the file:

```bash
helm get values devportal -n "$NAMESPACE" -o yaml > current-values.yaml
helm upgrade devportal veecode/devportal --version "$CHART_VERSION" \
  -n "$NAMESPACE" -f current-values.yaml -f catalog-index-pin.yaml --wait --timeout 20m
```

Each upgrade took about 2 to 9 minutes to become ready. On the first start after an upgrade, the pod can restart while the plugins install, so keep the `--timeout 20m` headroom.

To return to the chart's default index, remove the two keys from the stored values and upgrade with the result:

```bash
helm get values devportal -n "$NAMESPACE" -o yaml \
  | yq 'del(.global.catalogIndex.image.repository, .global.catalogIndex.image.tag)' \
  > current-values.yaml
helm upgrade devportal veecode/devportal --version "$CHART_VERSION" \
  -n "$NAMESPACE" -f current-values.yaml --wait --timeout 20m
```

The values you pass with `-f` replace the values stored for the release, so the release reads the index from the chart again, and each later chart release re-pins it. If you set the chart's current digest explicitly instead, the release keeps that digest after later chart upgrades.

## Add extra indexes

`global.catalogIndex.extraImages` adds more indexes next to the default one. Each entry names the index and its image:

```yaml
global:
  catalogIndex:
    extraImages:
      - name: second-copy
        registry: quay.io
        repository: veecode/plugin-catalog-index
        tag: "bs_1.54.9_20261015T175921"
```

Choose a tag from the same Backstage line as the portal: the packages in an index are built for its line (`bs_<backstage>`). An extra index adds its entries to the **Extensions** page only. It does not install plugins or change the installed plugins, and an entry that the default index already lists shows once. With chart 1.1.0 and image 3.1.0, the example tag `bs_1.54.9_20261015T175921` is an earlier publish of the same line as the default index, so it adds nothing: the **Extensions** page still listed 71 plugins and 146 packages after 30 minutes.

## Mirror the index in a private registry

Use a mirror when the cluster cannot reach `quay.io`. Copy the index to your registry with the `skopeo copy` command in [Install without internet access](./setup.md#install-without-internet-access), then point the chart at the copy:

```yaml
global:
  catalogIndex:
    image:
      registry: registry.example.com
      repository: veecode/plugin-catalog-index@sha256
      tag: "<64-character digest of the copied index>"
```

Use the digest you copied with the `@sha256` repository, as above. It is the hex after `@sha256:` in `CATALOG_INDEX_SOURCE`, and `--preserve-digests` keeps it in the mirror. For a copied tag, set `repository: veecode/plugin-catalog-index` and `tag` to that tag. The mirror has to meet three requirements:

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

Then count the entries that the Extensions API returns. The API needs a token. Guest sign-in provides one, so run this check on an install where guest sign-in is on, such as the [evaluation install](./setup.md#evaluate-without-ingress-or-an-identity-provider). The production setup sets it off, so the check does not work there. Forward the portal service first:

```bash
kubectl -n "$NAMESPACE" port-forward svc/devportal-developer-hub 7007:7007
```

In another terminal, request a guest token and count the plugins and packages:

```bash
TOKEN=$(curl -s http://localhost:7007/api/auth/guest/refresh -H 'X-Requested-With: XMLHttpRequest' | python3 -c 'import sys,json; print(json.load(sys.stdin)["backstageIdentity"]["token"])')

curl -s -H "Authorization: Bearer $TOKEN" http://localhost:7007/api/extensions/plugins | python3 -c 'import sys,json; print(json.load(sys.stdin)["totalItems"])'
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:7007/api/extensions/packages | python3 -c 'import sys,json; print(json.load(sys.stdin)["totalItems"])'
```

With the default index on chart 1.1.0 and image 3.1.0, using `quay.io/veecode/plugin-catalog-index@sha256:26bd062a8fad8c204b1a175e775a4549d599a2a57acd849f083d6591ed2a917d`, the counts were 71 plugins and 146 packages. Compare the counts before and after a change to the index.
