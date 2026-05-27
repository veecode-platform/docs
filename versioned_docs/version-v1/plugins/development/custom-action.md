---
sidebar_position: 8
sidebar_label: Custom Action
title: "Example: Custom Action"
---

A custom action for Backstage scaffolder can be bootstrapped with the command below:

```bash
# create a new custom action module
yarn new --select scaffolder-backend-module --option moduleId=my-custom-action
```

This creates the folder `plugins/scaffolder-backend-module-my-custom-action`, as well as an example action in `src/actions`.

:::note
You can delete or rename the example action file to `dummy.ts`.
:::

## Create the action file

Create the action file `dummy.ts` under `src/actions` and write this code:

```ts
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';

export function createDummyAction() {
  // For more information on how to define custom actions, see
  //   https://backstage.io/docs/features/software-templates/writing-custom-actions
  return createTemplateAction({
    id: 'acme:dummy',
    description: 'Runs a dummy action',
    schema: {
      input: {
        message: z =>
          z.string({
            description:
              "This is an example message parameter, it just cannot be 'foo'",
          }),
      },
    },
    async handler(ctx) {
      ctx.logger.info(
        `Running example dummy action with parameters: ${ctx.input.message}`,
      );

      if (ctx.input.message === 'foo') {
        throw new Error(`message cannot be 'foo'`);
      }
    },
  });
}
```

Notice the plugin's `module.ts` file that registers the custom action:

```ts
import { createBackendModule } from "@backstage/backend-plugin-api";
import { scaffolderActionsExtensionPoint  } from '@backstage/plugin-scaffolder-node/alpha';
import { createDummyAction } from "./actions/dummy";

/**
 * A backend module that registers the action into the scaffolder
 */
export const scaffolderModule = createBackendModule({
  moduleId: 'dummy-action',
  pluginId: 'scaffolder',
  register({ registerInit }) {
    registerInit({
      deps: {
        scaffolderActions: scaffolderActionsExtensionPoint
      },
      async init({ scaffolderActions}) {
        scaffolderActions.addActions(createDummyAction());
      }
    });
  },
})
```

Notice that this module was also automatically added to backend initialization in `packages/backend/src/index.ts`:

```ts
// ...
backend.add(import('@internal/plugin-scaffolder-backend-module-my-custom-action'));
// ...
backend.start();
```

## Test the action

Start Backstage development normally:

```bash
yarn start
```

Open the action list at http://localhost:3000/create/actions to check if it is currently loaded:

![Custom Action](/img/assets/custom-action.png)

