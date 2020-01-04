
import React from 'react';
import useForm from './useForm'
import config from '../config'
//import AppContext from '../AppContext'
import ValidationError  from './ValidationError/ValidationError'
function SignInForm(props) {
  const stateSchema = {
    username: { value: '', error: ''},
    password: { value: '', error: ''},
  }

  const validationSchema = {
    username: {
      required: true,
      validator: {
        regEx: /^[a-zA-Z]+$/,
        error: 'Invalid username format'
      },
    },
    password: {
      required: true,
      validator: {
        regEx: /^[a-zA-Z]+$/,
        error: 'Invalid password format'
      },
    },
  }

  const postToAPI = async (state) => {

    const postBody = {
      username: state.username.value,
      password: state.password.value
    }
    const options = {
      method: 'POST',
      body: JSON.stringify(postBody),
      headers: {
        "Content-Type": "application/json",
      }
    }
    const response = await fetch(`${config.API_ENDPOINT}/api/auth/signin`, options)
    const body = await response.json();
    if (!response.ok) {
      console.log('Error upon signin, reason: ', body.message)
      //throw Error(body.message)
    }
    let user = body.token ? body : null
    context.updateAuthenticated(user)
    //props.history.push(`/${user.id}`)
  }

  const { state, disable, handleOnChange, handleOnSubmit, context } = useForm(stateSchema, validationSchema, postToAPI)

  const required = "*"
  return(
    <div>
      <form onSubmit={handleOnSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username{required}</label>
          <input
            type="text"
            id="username"
            name="username"
            onChange={handleOnChange}
            value={state.username.value}
            aria-label="enter your username"
            aria-required="true"
            aria-describedby="usernameError"
            aria-invalid={!!state.username.error}
          />
          {!!state.username.error && <span id="usernameError" className="validation-error">{state.username.error}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="password">Password{required}</label>
          <input
            type="text"
            id="password"
            name="password"
            onChange={handleOnChange}
            value={state.password.value}
            aria-label="enter your password"
            aria-required="true"
            aria-describedby="passwordError"
            aria-invalid={!!state.password.error}
          />
          {!!state.password.error && <span id="passwordError" className="validation-error">{state.password.error}</span>}
        </div>
        <input type="submit" name="submit" disabled={disable} / >
      </form>
    </div>
  );
}
export default SignInForm;
