import { extractComponentDescription, enhanceArgTypes } from '@storybook/docs-tools';
import { extractArgTypes } from './extractArgTypes';
import { sourceDecorator } from './sourceDecorator';

export const parameters = {
  docs: {
    inlineStories: true,
    extractArgTypes,
    extractComponentDescription,
  },
};

export const decorators = [sourceDecorator];

export const argTypesEnhancers = [enhanceArgTypes];
