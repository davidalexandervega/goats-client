import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import NotFound from './NotFound/NotFound'

class ErrorBoundary extends Component {

  constructor(props) {
    super(props);

    this.state = {
      hasError: false
    }

  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error }
  }

  static defaultProps = {
    history: { listen: () => { } }
  }


  componentDidMount() {
    this.unlisten = this.props.history.listen((location, action) => {
      if (this.state.hasError) {
        this.setState({ hasError: false, error: null });
      }
    });
  }

  componentWillUnmount() {
    this.unlisten();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='ErrorBoundary'>
          <NotFound
            // message={`${Boolean(this.state.error) ? this.state.error : 'Something went wrong.'}`}
            message='Something went wrong.'
            link={<Link to="/public/signin">Sign In</Link>}/>
        </div>
      )
    }

    return this.props.children
  }
}

export default withRouter(ErrorBoundary);
