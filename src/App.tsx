import { type Component } from 'solid-js';
import { Router, Route } from '@solidjs/router';
import MainLayout from './layouts/MainLayout';
import AppRoute from './routes/Route';
import { AuthProvider } from './context/AuthContext';


const App: Component = () => {
  return (
      <AppRoute />
  );
};

export default App;
