import React, { useReducer, useEffect, useCallback, useMemo } from 'react'

import IngredientForm from './IngredientForm'
import IngredientList from './IngredientList'
import ErrorModal from '../UI/ErrorModal'
import Search from './Search'

const ingredientsReducer = (currentIngredients, action) => {
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

const httpReducer = (currHttpState, action) => {
  switch (action.type) {
    case 'SEND':
      return {
        loading: true,
        error: null,
      }
    case 'RESPONSE':
      return { ...currHttpState, loading: false }
    case 'ERROR':
      return { loading: false, error: action.errorMessage }
    case 'CLEAR':
      return { ...currHttpState, error: null }
    default:
      throw new Error('Should not get there!')
  }
}

const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientsReducer, [])
  const [httpState, dispatchHttp] = useReducer(httpReducer, {
    loading: false,
    error: null,
  })
  // const [userIngredients, setUserIngredients] = useState([])
  // const [isLoading, setIsLoading] = useState(false)
  // const [error, setError] = useState('')

  const filteredIngredientsHandler = useCallback((filteredIngredients) => {
    // setUserIngredients(filteredIngredients)
    dispatch({ type: 'SET', ingredients: filteredIngredients })
  }, [])

  useEffect(() => {
    console.log('rendering ingredients', userIngredients)
  }, [userIngredients])

  const addIngredientHandler = useCallback((ingredient) => {
    dispatchHttp({ type: 'SEND' })
    fetch('https://hooks-573e9.firebaseio.com/ingredients.json', {
      method: 'POST',
      body: JSON.stringify(ingredient),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        dispatchHttp({ type: 'RESPONSE' })
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
      .catch((error) => {
        dispatchHttp({ type: 'ERROR', errorMessage: error.message })
      })
  }, [])

  const removeIngredientHandler = useCallback((ingredientId) => {
    dispatchHttp({ type: 'SEND' })
    fetch(
      `https://hooks-573e9.firebaseio.com/ingredients/${ingredientId}.json`,
      {
        method: 'DELETE',
      },
    )
      .then(() => {
        dispatchHttp({ type: 'RESPONSE' })
        // setUserIngredients((prevIngredients) =>
        //   prevIngredients.filter(
        //     (ingredient) => ingredient.id !== ingredientId,
        //   ),
        // )
        dispatch({ type: 'DELETE', id: ingredientId })
      })
      .catch((error) => {
        dispatchHttp({ type: 'ERROR', errorMessage: error.message })
      })
  }, [])

  const clearError = useCallback(() => {
    dispatchHttp({ type: 'CLEAR' })
  }, [])

  const ingredientList = useMemo(
    () => (
      <IngredientList
        ingredients={userIngredients}
        onRemoveItem={removeIngredientHandler}
      />
    ),
    [userIngredients, removeIngredientHandler],
  )

  return (
    <div className="App">
      {httpState.error && (
        <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>
      )}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={httpState.loading}
      />
      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        {ingredientList}
      </section>
    </div>
  )
}

export default Ingredients
