import { parse as parseToml } from '@iarna/toml';

const recipeModules = require.context('!raw-loader!./data', true, /\.toml$/);

const recipeDocs = recipeModules
  .keys()
  .map(key => recipeModules(key) as string)
  .map(raw => parseToml(raw));

export default recipeDocs;
