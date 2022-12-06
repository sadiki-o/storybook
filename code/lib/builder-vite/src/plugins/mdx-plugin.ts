import type { Options, Preset, StorybookConfig } from '@storybook/types';
import type { Plugin } from 'vite';
import { createFilter } from 'vite';

const isStorybookMdx = (id: string) => id.endsWith('stories.mdx') || id.endsWith('story.mdx');

type AddonWithOptions = Exclude<Preset, string>;
function getAddonOptions(addons: StorybookConfig['addons'], name: string): Record<string, any> {
  return (
    addons?.find(
      (addon): addon is AddonWithOptions => typeof addon !== 'string' && addon.name === name
    )?.options ?? {}
  );
}

/**
 * Storybook uses two different loaders when dealing with MDX:
 *
 * - *stories.mdx and *story.mdx are compiled with the CSF compiler
 * - *.mdx are compiled with the MDX compiler directly
 *
 * @see https://github.com/storybookjs/storybook/blob/next/addons/docs/docs/recipes.md#csf-stories-with-arbitrary-mdx
 */
export async function mdxPlugin(options: Options): Promise<Plugin> {
  const include = /\.mdx?$/;
  const filter = createFilter(include);
  const addons = await options.presets.apply<StorybookConfig['addons']>('addons', []);
  const { mdxPluginOptions, jsxOptions } = getAddonOptions(addons, '@storybook/addon-docs');

  return {
    name: 'storybook:mdx-plugin',
    enforce: 'pre',
    async transform(src, id) {
      if (!filter(id)) return undefined;

      const { compile } = await import('@storybook/mdx2-csf');

      const mdxLoaderOptions = await options.presets.apply('mdxLoaderOptions', {
        ...mdxPluginOptions,
        mdxCompileOptions: {
          providerImportSource: '@storybook/addon-docs/mdx-react-shim',
          ...mdxPluginOptions?.mdxCompileOptions,
        },
        jsxOptions,
      });

      const code = String(
        await compile(src, {
          skipCsf: !isStorybookMdx(id),
          ...mdxLoaderOptions,
        })
      );

      return {
        code,
        map: null, // TODO: update mdx2-csf to return the map
      };
    },
  };
}
