import React from 'react';
import recipes from './data/recipes';
import RecipeListing from './listing';

class RecipesPage extends React.Component {
  render() {
    return (
      <>
        <div className="bg-washed-yellow black">
          <div className="mw8 pa4 center">
            <h1>Recipes</h1>
          </div>
          <div className="mw8 pa4 center">
            <RecipeListing recipes={recipes} />
          </div>
        </div>
      </>
    );
  }
}

export default RecipesPage;
