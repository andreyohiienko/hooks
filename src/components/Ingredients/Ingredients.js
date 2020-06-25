import React, { useReducer, useEffect, useCallback, useMemo } from 'react'

import IngredientForm from './IngredientForm'
import IngredientList from './IngredientList'
import ErrorModal from '../UI/ErrorModal'
import Search from './Search'
import useHttp from '../../hooks/http'

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

const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientsReducer, [])
  const {
    isLoading,
    error,
    data,
    sendRequest,
    reqExtra,
    reqIdentifier,
    clear,
  } = useHttp()

  // const [userIngredients, setUserIngredients] = useState([])
  // const [isLoading, setIsLoading] = useState(false)
  // const [error, setError] = useState('')

  const filteredIngredientsHandler = useCallback((filteredIngredients) => {
    // setUserIngredients(filteredIngredients)
    dispatch({ type: 'SET', ingredients: filteredIngredients })
  }, [])

  useEffect(() => {
    if (!isLoading && !error && reqIdentifier === 'REMOVE_INGREDIENT') {
      dispatch({ type: 'DELETE', id: reqExtra })
    } else if (!isLoading && !error && reqIdentifier === 'ADD_INGREDIENT') {
      dispatch({
        type: 'ADD',
        ingredient: { id: data.name, ...reqExtra },
      })
    }
  }, [data, reqExtra, reqIdentifier, isLoading, error])

  const addIngredientHandler = useCallback(
    (ingredient) => {
      sendRequest(
        'https://hooks-573e9.firebaseio.com/ingredients.json',
        'POST',
        JSON.stringify(ingredient),
        ingredient,
        'ADD_INGREDIENT',
      )
      // dispatchHttp({ type: 'SEND' })
      // fetch('https://hooks-573e9.firebaseio.com/ingredients.json', {
      //   method: 'POST',
      //   body: JSON.stringify(ingredient),
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      // })
      //   .then((response) => {
      //     dispatchHttp({ type: 'RESPONSE' })
      //     return response.json()
      //   })
      //   .then((responseData) => {
      //     // setUserIngredients((prevIngredients) => [
      //     //   ...prevIngredients,
      //     //   { id: responseData.name, ...ingredient },
      //     // ])
      //     dispatch({
      //       type: 'ADD',
      //       ingredient: { id: responseData.name, ...ingredient },
      //     })
      //   })
      //   .catch((error) => {
      //     dispatchHttp({ type: 'ERROR', errorMessage: error.message })
      //   })
    },
    [sendRequest],
  )

  const removeIngredientHandler = useCallback(
    (ingredientId) => {
      // dispatchHttp({ type: 'SEND' })
      sendRequest(
        `https://hooks-573e9.firebaseio.com/ingredients/${ingredientId}.json`,
        'DELETE',
        null,
        ingredientId,
        'REMOVE_INGREDIENT',
      )
    },
    [sendRequest],
  )

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
      {error && <ErrorModal onClose={clear}>{error}</ErrorModal>}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={isLoading}
      />
      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        {ingredientList}
      </section>
    </div>
  )
}

export default Ingredients
