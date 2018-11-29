import React from 'react';
import Recipe from './recipe';
import { Link } from 'react-router-dom';

interface IRecipeListingProps {
  recipes: Array<Recipe>
}

interface IRecipeListingItemProps {
  recipe: Recipe
}

const RecipeListingItem: React.SFC<IRecipeListingItemProps> = ({ recipe }) => (
  <Link to={`/adventures/cooking/recipes/${recipe.slug}`} className="no-underline">
    <div className="black">
      <div className="pv2">
        <h3 className="ma0 pa0">{recipe.title}</h3>
        {(recipe.from || recipe.added) && (<p className="ma0 i f5">
          {recipe.from && <>(from {recipe.from}) </>}
          {recipe.added && <>added {new Date(recipe.added).toDateString()}</>}
        </p>)}

        {recipe.description && <p>{recipe.description}</p>}
      </div>
    </div>
  </Link>
)

const RecipeListing: React.SFC<IRecipeListingProps> = ({ recipes }) => (<div>
  {recipes.map((recipe) => <RecipeListingItem key={recipe.id} recipe={recipe} />)}
</div>);

export default RecipeListing;