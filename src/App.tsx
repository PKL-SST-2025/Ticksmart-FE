import { createEffect, createSignal, type Component } from 'solid-js';
import { Router, Route, useLocation } from '@solidjs/router';
import AppRoute from './routes/Route';
import { ModalProvider } from './context/ModalContext';
import GenericModal from './components/modal/GenericModal';
// Import your context providers
import { UserProvider } from "./context/UserContext";
import { AdminProvider } from "./context/AdminContext";
import { OrganizerProvider } from "./context/OrganizerContext";
import DatePickerModal from './components/modal/DatePickerModalContent';
import { UIProvider } from './context/UIContext';
import { StripeConnectProvider } from './context/StripeConnectContext';


const App: Component = () => {
  return (
    <UserProvider>
        <AdminProvider>
          <OrganizerProvider>
    <ModalProvider>
            <UIProvider>
              <StripeConnectProvider>
      <Router 
 
        >
       <AppRoute />
      </Router>
      </StripeConnectProvider>
        <DatePickerModal />

      <GenericModal />
</UIProvider>
    </ModalProvider>
              </OrganizerProvider>
        </AdminProvider>
      </UserProvider>
  );
};

export default App;
