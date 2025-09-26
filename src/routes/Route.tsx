
import { Router, Route } from '@solidjs/router';
import { createSignal, createEffect } from 'solid-js';
import type { Component } from 'solid-js';
import { useLocation } from '@solidjs/router';
import AdminDashboard from '../pages/admin/dashboard/Dashboard';
import OrganizerDashbaord from '../pages/organizer/dashboard/Dashboard';
import OrganizerProfilePage from '../pages/organizer/dashboard/Profile';
import AdminProfilePage from '../pages/admin/dashboard/Profile';
import AdminLoginPage from '../pages/admin/auth/Login';
import VendorTermsPage from '../pages/organizer/auth/Terms';
import OrganizerLoginPage from '../pages/organizer/auth/Login';
import OrganizerRegisterPage from '../pages/organizer/auth/Register';
import Register from '../pages/AuthPage';
import Dashboard from '../pages/Dashboard';
import UserProfile from '../pages/UserProfile';
import EventDetail from '../pages/EventDetail';
import Checkout from '../pages/Checkout';
import OrderHistory from '../pages/OrderHistory';
import AuthPage from '../pages/AuthPage';
import TicketTest from '../pages/TicketTest';
import TicketTestCreator from '../pages/TicketTestCreator';
import OrganizerEvents from '../pages/organizer/dashboard/Events';
import OrganizerVenues from '../pages/organizer/dashboard/Venues';
import OrganizerOrders from '../pages/organizer/dashboard/Orders';
import OrganizerAttractions from '../pages/organizer/dashboard/Attraction';
import OrganizerStripeConnectPage from '../pages/organizer/dashboard/StripeConnect';
import OrganizerFinancePage from '../pages/organizer/dashboard/Finance';
import AdminCategoriesPage from '../pages/admin/dashboard/Categories';
import AdminEventsPage from '../pages/admin/dashboard/Event';
import AdminVenuesPage from '../pages/admin/dashboard/Venues';
import AdminOrdersPage from '../pages/admin/dashboard/Orders';
import AdminPaymentsPage from '../pages/admin/dashboard/Payments';
import DatePickerModal from '../components/modal/DatePickerModalContent';
import GenericModal from '../components/modal/GenericModal';
import { ModalProvider } from '../context/ModalContext';
import { OrganizerProvider } from '../context/OrganizerContext';
import { AdminProvider } from '../context/AdminContext';
import { UserProvider } from '../context/UserContext';
import { withAuth } from '../middleware/authWrapper';
import BannedPage from '../pages/BannedPage';
import NotFoundPage from '../pages/NotFoundPage';
import { withAdminAuth } from '../middleware/adminWrapper';
import AdminUsersPage from '../pages/admin/dashboard/Users';

const   AppRoute: Component = () => {

  return (
<>
      {/* ======================================================================== */}
      {/* PUBLIC ROUTES - No authentication required                           */}
      {/* ======================================================================== */}
      <Route path="/" component={AuthPage} />
      <Route path="/login" component={AuthPage} />
      <Route path="/register" component={AuthPage} />
      <Route path="/admin/login" component={AdminLoginPage} />

      {/* Public view of an event */}
      <Route path="/event/:id" component={EventDetail} /> 

      <Route path="/organizer/login" component={OrganizerLoginPage} />
      <Route path="/organizer/register" component={OrganizerRegisterPage} />
      


      {/*  BEGONE THOT */}
      <Route path="/banned" component={withAuth(BannedPage)} />


      {/* ======================================================================== */}
      {/* USER PROTECTED ROUTES - Must be logged in as 'user' or 'organizer'    */}
      {/* ======================================================================== */}
      <Route path=""   >
        <Route path="/dashboard" component={withAuth(Dashboard)} />
        <Route path="/profile" component={withAuth(UserProfile)} />
        <Route path="/checkout/:eventId" component={withAuth(Checkout)} />
        <Route path="/orders" component={withAuth(OrderHistory)} />
      </Route>


      {/* ======================================================================== */}
      {/* ORGANIZER PROTECTED ROUTES - Must be logged in as 'organizer'          */}
      {/* ======================================================================== */}
      <Route path="/organizer"  >
        <Route path="/dashboard" component={withAuth(OrganizerDashbaord, { requires: ['organizer'] })}  />
        <Route path="/events" component={withAuth(OrganizerEvents, { requires: ['organizer'] })} />
        <Route path="/venues" component={withAuth(OrganizerVenues, { requires: ['organizer'] })} />
        <Route path="/orders" component={withAuth(OrganizerOrders, { requires: ['organizer'] })} />
        <Route path="/attractions" component={withAuth(OrganizerAttractions, { requires: ['organizer'] })}  />
        <Route path="/stripe" component={withAuth(OrganizerStripeConnectPage, { requires: ['organizer'] })}  />
        <Route path="/finance" component={withAuth(OrganizerFinancePage, { requires: ['organizer'] })} />
        <Route path="/onboarding" component={withAuth(VendorTermsPage, { requires: ['organizer'] })}  />
      </Route>


      {/* ======================================================================== */}
      {/* ADMIN PROTECTED ROUTES - Must be logged in as 'admin'                  */}
      {/* ======================================================================== */}
      <Route path="/admin"  >

        <Route path="/dashboard" component={withAdminAuth(AdminDashboard)} />
        <Route path="/categories" component={withAdminAuth(AdminCategoriesPage)} />
        <Route path="/events" component={withAdminAuth(AdminEventsPage)} />
        <Route path="/venues" component={withAdminAuth(AdminVenuesPage)} />
        <Route path="/users" component={withAdminAuth(AdminUsersPage)} />
        <Route path="/orders" component={withAdminAuth(AdminOrdersPage)} />
        <Route path="/payments" component={withAdminAuth(AdminPaymentsPage)} />
      </Route>

        <Route path="*404" component={NotFoundPage} />

</>
  );
};

export default AppRoute;
