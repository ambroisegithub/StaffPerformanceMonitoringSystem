// @ts-nocheck
import * as React from 'react'
import './App.css'
import AppRoutes from './routes/App.route'
import { ToastContainer } from 'react-toastify'
import { PersistGate } from 'redux-persist/integration/react'
import { Provider } from 'react-redux'
import { store, persistor } from './Redux/store'
import { useEffect } from 'react'
import { useAppDispatch } from './Redux/hooks'
import { restoreAuth } from './Redux/Slices/LoginSlices'

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthStateManager />
        <ToastContainer />
        <AppRoutes />
      </PersistGate>
    </Provider>
  )
}

function AuthStateManager() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(restoreAuth());
  }, [dispatch]);

  return null;
}

export default App;