import React, { useContext, useState, useEffect } from 'react';
import AppContext from '../../AppContext';
import PropTypes from 'prop-types';
import { Switch, Route, Link } from 'react-router-dom';
import MainHeaderNav from '../MainHeaderNav/MainHeaderNav';
import MainNavLink from '../MainNavLink/MainNavLink';
import SignOutLink from '../SignOutLink/SignOutLink';
import EditProfileForm from '../Forms/EditProfileForm/EditProfileForm';
import Profile from '../Profile/Profile';
import './Dashboard.css'
import NotFound from '../NotFound/NotFound';
import Spinner from '../Spinner/Spinner';
import config from '../../config'

function Dashboard({ match }) {
  const { user } = useContext(AppContext)
  const paramsId = match.params.user_id
  const [flyers, setFlyers] = useState([])
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState('')
  const [foundUser, setFoundUser] = useState(null)

  useEffect(() => {
    const fetchApiData = async (type) => {
      setFetching(true)
      setError('')
      const options = {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        }
      }
      const response = await fetch(`${config.API_ENDPOINT}/flyer?creator=${paramsId}`, options);
      const body = await response.json();
      if (!response.ok) {
        setError(body.message)
        setFetching(false)
      } else {
        setFoundUser(body.creator)
        setFlyers(body.flyers)
        setFetching(false)
      }
    }
    fetchApiData()
  }, [match.url])

  if (fetching) {
    return (
      <div className="Dashboard">
        <Spinner />
      </div>
    )
  }


  // if (Boolean(error) && (/(unauthorized|Unauthorized)/.test(error))) {
  //   return (
  //     <NotFound
  //       message={`Session expired.`}
  //       link={<Link to='/public/signin'>Sign in</Link>}
  //     />
  //   )
  // }
  if (foundUser && user && user.id === paramsId) {
    return(
      <div className="Dashboard">
        <MainHeaderNav links={[
          <MainNavLink to={`/dashboard/${foundUser.id}/edit`}>Edit Profile</MainNavLink>,
          <SignOutLink />
        ]}/>
        <Switch>
          <Route exact path={`/dashboard/${foundUser.id}/edit`} render={({ history }) => {
            return <EditProfileForm history={history}/>
          }}/>
          <Route path={`/dashboard/${foundUser.id}`} render={() => {
            return <Profile user={foundUser} isCurrent={true} userFlyers={flyers} fetching={fetching} />
          }} />
        </Switch>
      </div>
    )
  }
  if(foundUser) {
    return (
      <div className="Dashboard">
        <Profile user={foundUser} isCurrent={false} userFlyers={flyers} fetching={fetching} />
      </div>
    )
  }
  return (
    <div className="Dashboard">
      <NotFound message="User doesn't exist" isFetching={fetching} />
    </div>
  )
}

Dashboard.defaultProps = {
  match: { params: {} },
  fetching: false
}

Dashboard.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.object,
  })
}

export default Dashboard
