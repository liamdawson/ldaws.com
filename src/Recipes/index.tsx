import React from 'react';
import recipes from './recipes';

class RecipesPage extends React.Component {
  render() {
    return (<>
      {JSON.stringify(recipes)}
    </>);
  }
}

export default RecipesPage;
