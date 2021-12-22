import React, { useEffect, lazy, Suspense } from 'react';
// useEffect to handle side-effects in functional components
// lazy & Suspense for lazy loading - only loads page and respective
// components when called or routed

import { Switch, Route, Redirect } from 'react-router-dom';
// Switch is react-router tool for client side routing
// Route works with Switch as defined Routes
// Redirect used in ternary operator to check user state (if signed-in/out)

import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import Header from './components/header/header.component';
//persistant header component maintained at top throughout routes/pages

import Spinner from './components/spinner/spinner.component';
// UI component during fetching phase of routing

import ErrorBoundary from './components/error-boundary/error-boundary.component';
// ErrorBoundary defined to 'Route' user to cleaner error page in event of system crash/
// or connection failure

import { GlobalStyle } from './global.styles';
// global style defined in JS for simplicity in human-reading. Info feeds to index.html

import { selectCurrentUser } from './redux/user/user.selectors';
// from (user.selectors.js) for generating meoized selectors to compensate for expensive operations

import { checkUserSession } from './redux/user/user.actions';
// listener for user state; signed-in/not

/* Lazy Loading constants defined below to load Page Components when routed/selected */
const HomePage = lazy(() => import('./pages/homepage/homepage.components'));
const ShopPage = lazy(() => import('./pages/shop/shop.component'));
const CheckoutPage = lazy(() => import('./pages/checkout/checkout.component'));
const SignInAndSignUpPage = lazy(() => import(
  './pages/sign-in-and-sign-up/sign-in-and-sign-up'
));

// migrated away from class component for use of React Hooks
const App = ({ checkUserSession, currentUser }) => {
  // Effect Hook allows app to perform side effects in functional components
  useEffect(() => {
    // checkUserSession calls functions defined in sagas
    // observer for changes to the user's sign-in state. (firebase.utils : getCurrentUser())
    checkUserSession();
  }, [checkUserSession]);
  // second argument maintains state and resolves errors with sign-in state

  // returns components defined for user interface
    return (
      <div>
        <GlobalStyle />
        <Header />
          <Switch>
            <ErrorBoundary>
              <Suspense fallback={ <Spinner /> } > {/* fallback generates Spinner component for fetching/loadin state */}
                <Route exact path='/' component={HomePage} />
                <Route path='/shop' component={ShopPage} />
                <Route exact path='/checkout' component={CheckoutPage} />
                <Route exact path='/signin' 
                  render={() => 
                    currentUser ? <Redirect to='/' /> : <SignInAndSignUpPage />
                  }
                />
              </Suspense>
            </ErrorBoundary>
          </Switch>
      </div>
    );
}

const mapStateToProps = createStructuredSelector({
  currentUser: selectCurrentUser
});
// selects data from the store needed for the component to provide state
/* 
createStructuredSelector takes an objects with input-selectors properties
and returns a structured selector which returns an object with selectors
*/ 

const mapDispatchToProps = dispatch => ({
  checkUserSession: () => dispatch(checkUserSession())
});

/*
dispatches actions to the store to trigger a state change
connect(paramOne, paramTwo) access the store instead of
the components needing to access the store
mapDispatch allows dev to create functions that dispatch when called
and pass those functions down the component tree as props
REQUIRES 2 parameters: null, or mapState -> mapDispatch
*/

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
