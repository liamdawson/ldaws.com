import { parse as parseToml } from '@iarna/toml';
import Recipe from '../recipe';

const recipeModules = require.context('!raw-loader!./', true, /\.toml$/);

const recipeDocs = recipeModules
  .keys()
  .map(key => ({
    value: recipeModules(key) as string,
    key
  }))
  .map(pair => <unknown>{...parseToml(pair.value), id: pair.key} as Recipe);

export default recipeDocs;
