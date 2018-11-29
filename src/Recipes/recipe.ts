export default interface IRecipe {
  id: string;
  added: string;
  slug: string;
  title: string;
  from?: string;
  description?: string;
  ingredients: Array<IIngredient>;
  procedure: Array<string>;
}

export interface IIngredient {
  name: string;
  measure: string;
  optional?: boolean;
}
