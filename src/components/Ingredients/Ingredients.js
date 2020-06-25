import React, { useReducer, useState, useEffect, useCallback } from 'react'

import IngredientForm from './IngredientForm'
import IngredientList from './IngredientList'
import ErrorModal from '../UI/ErrorModal'
import Search from './Search'

const ingredientsReducer = (currentIngredients, action) => {
  console.log(action)
  switch (action.type) {
    case 'SET':
      return action.ingredients
    case 'ADD':
      return [...currentIngredients, action.ingredient]
    case 'DELETE':
      return currentIngredients.filter((ing) => ing.id !== action.id)
    default:
      throw new Error('Should not get there!')
  }
}

const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientsReducer, [])
  // const [userIngredients, setUserIngredients] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const filteredIngredientsHandler = useCallback((filteredIngredients) => {
    // setUserIngredients(filteredIngredients)
    dispatch({ type: 'SET', ingredients: filteredIngredients })
  }, [])

  useEffect(() => {
    console.log('rendering ingredients', userIngredients)
  }, [userIngredients])

  const addIngredientHandler = (ingredient) => {
    setIsLoading(true)
    fetch('https://hooks-573e9.firebaseio.com/ingredients.json', {
      method: 'POST',
      body: JSON.stringify(ingredient),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        setIsLoading(false)
        return response.json()
      })
      .then((responseData) => {
        // setUserIngredients((prevIngredients) => [
        //   ...prevIngredients,
        //   { id: responseData.name, ...ingredient },
        // ])
        dispatch({
          type: 'ADD',
          ingredient: { id: responseData.name, ...ingredient },
        })
      })
      .catch(() => {
        setError('Something went wrong!')
      })
  }

  const removeIngredientHandler = (ingredientId) => {
    setIsLoading(true)
    fetch(
      `https://hooks-573e9.firebaseio.com/ingredients/${ingredientId}.json`,
      {
        method: 'DELETE',
      },
    )
      .then(() => {
        setIsLoading(false)
        // setUserIngredients((prevIngredients) =>
        //   prevIngredients.filter(
        //     (ingredient) => ingredient.id !== ingredientId,
        //   ),
        // )
        dispatch({ type: 'DELETE', id: ingredientId })
      })
      .catch(() => {
        setError('Something went wrong!')
      })
  }

  const clearError = () => {
    setError(null)
  }

  return (
    <div className="App">
      {error && <ErrorModal onClose={clearError}>{error}</ErrorModal>}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={isLoading}
      />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        <IngredientList
          ingredients={userIngredients}
          onRemoveItem={removeIngredientHandler}
        />
      </section>
    </div>
  )
}

export default Ingredients
