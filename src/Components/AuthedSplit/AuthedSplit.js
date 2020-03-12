import React, { useState, useEffect, useContext } from 'react';
import config from '../../config';
import PropTypes from 'prop-types';
import AuthedContext from '../../AuthedContext';
import AppContext from '../../AppContext';
import Menu from '../Menu/Menu';
import Main from '../Main/Main';
import './AuthedSplit.css';

export default function AuthedSplit({ mainComponent }) {
  const [flyers, setFlyers] = useState([])
  const [total, setTotal] = useState(0)
  const [limit] = useState(5)
  const [fetching, setFetching] = useState(false)
  const [fetchingAdditional, setFetchingAdditional] = useState(false)
  const [serverError, setServerError] = useState(null)
  const { user, setError, error } = useContext(AppContext)

  const addFlyer = (flyer) => {
    setFlyers(prev => ([...prev, { ...flyer }].sort((a, b) => (a.modified > b.modified) ? -1 : 1)))
    setTotal(prev => prev + 1)
  }

  const deleteFlyer = (flyerId) => {
    setFlyers(prev => ([...prev.filter(flyer => flyer.id !== flyerId)]))
    setTotal(prev => prev - 1)
  }

  const updateFlyer = (flyerId, patchBody) => {
    const flyerToUpdate = flyers.find(flyer => flyer.id === flyerId)
    const updatedFlyer = {
      ...flyerToUpdate,
      ...patchBody
    }
    setFlyers(prev => ([updatedFlyer, ...prev.filter(flyer => flyer.id !== flyerId)]))
  }

  const fetchApiData = async (query, abortController) => {

    const options = {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${user.token}`
      },
      signal: abortController.signal
    }

      const response = await fetch(`${config.API_ENDPOINT}/${query}`, options);
      const body = await response.json();
      if (!response.ok) {
        setServerError({ status: response.status, message: body.message })
        return {
          flyers: [],
          count: 0
        }
      } else {
        setServerError(null)
        return body
      }

  }

  const handleClickLoad = async () => {
    setServerError(null)
    setFetchingAdditional(true)
    const pageNum = Math.ceil(flyers.length / limit)
    const offset = pageNum * limit
    const flyersData = await fetchApiData(`flyer?limit=${limit}&offset=${offset}`)
    if (!!serverError) {
      setFetchingAdditional(false)
    } else {
      setTotal(parseInt(flyersData.total))
      setFlyers(prev => ([...prev, ...flyersData.flyers]))
      setFetchingAdditional(false)
    }
  }

  useEffect(() => {
    const abortController = new AbortController();

    const getAll = async () => {
      setError(null)
      setServerError(null)
      setFetching(true)

      try {
        const flyersData = await fetchApiData(`flyer?limit=${limit}&offset=${0}`, abortController)
        if (!!serverError) {
          setFetching(false)
        } else {
          setTotal(parseInt(flyersData.total))
          setFlyers(flyersData.flyers)
          setFetching(false)
        }

      } catch (e) {
        if (!abortController.signal.aborted) {
          console.log('fetch aborted', e)
          setFetching(false)
        }
      }
    }

    getAll()
    return () => {
      abortController.abort();
    }

  }, [user])

  const contextValue = {
    flyers: flyers,
    addFlyer: addFlyer,
    deleteFlyer: deleteFlyer,
    updateFlyer: updateFlyer,
    fetching: fetching,
    fetchingAdditional: fetchingAdditional,
    total: total,
    handleClickLoad: handleClickLoad,
    serverError: serverError
  }

  switch (true) {
    case !error && !!serverError && serverError.status === 401:
      setError(serverError)
      // return (
      //     <NotFound
      //       message="Session expired"
      //       isFetching={fetching}
      //       link={<Link to='/public/signin' >Sign In</Link>}
      //     />
      // )

    default:
      return (
        <div className="AuthedSplit">
          <Menu />
          <AuthedContext.Provider value={contextValue}>
            <Main component={React.cloneElement(mainComponent)} >
            </Main>
          </AuthedContext.Provider>
        </div>
      )
  }
}

AuthedSplit.propTypes = {
  mainComponent: PropTypes.objectOf(function (propValue, key, componentName, location, propFullName) {
    if (!["Dashboard", "Forum", "CreateFlyer", "GetFlyer"].includes(propValue.type.name)) {
      return new Error(`Bad component prop: ${propValue.type.name}. Pass one of the following: "Dashboard", "Forum", "CreateFlyer"`)
    }
  })
}
