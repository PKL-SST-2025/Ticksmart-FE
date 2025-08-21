
import { Router, Route } from '@solidjs/router';
import { Component } from "solid-js";

import HomePage from '../pages/Home';
import AboutPage from '../pages/About';
import PricingPage from '../pages/Pricing';
import TermsPrivacyPage from '../pages/TermsPrivacy';
import ContactUsPage from '../pages/ContactUs';
import FAQPage from '../pages/FAQ';
import LoginPage from '../pages/Auth/Login';
import RegisterPage from '../pages/Auth/Register'
import DashboardPage from '../pages/Dashboard/Dashboard'
import DashboardSearchPage from '../pages/Dashboard/Search';
import ProjectPage from '../pages/Dashboard/Project/Project';
import ProjectMemberPage from '../pages/Dashboard/Project/ProjectMember'
import ProjectRolesPage from '../pages/Dashboard/Project/ProjectRoles'
import ProjectTasksPage from '../pages/Dashboard/Project/ProjectTask'
import ProjectArchivesPage from '../pages/Dashboard/Project/ProjectArchive'
import ProjectSettingsPage from '../pages/Dashboard/Project/ProjectSettings'
import DashboardGuard from '../components/Guard/DashboardGuard';
import ProjectGuard from '../components/Guard/ProjectGuard';
import { AuthProvider } from '../context/AuthContext';
import NotFoundPage from '../pages/404';
import InvitePage from '../pages/Dashboard/InvitePage';
import InviteGuard from '../components/Guard/InviteGuard';





const AppRoute: Component = () => {
  return (
  <AuthProvider>
      <Router>
            <Route path="/" component={
              HomePage
              } />
            <Route path="/about" component={
              AboutPage
            } />
            <Route path="/terms-privacy" component={
              TermsPrivacyPage
            } />
            <Route path="/contact" component={
              ContactUsPage
              } />
            <Route path="/FAQ" component={
              FAQPage
            } />
            <Route path="/pricing" component={
              PricingPage
            } />

            <Route path="/login" component={
              LoginPage
            } />

            <Route path="/register" component={
              RegisterPage
            } />

        {/* This ensures only authenticated users can attempt to accept an invite */}
        <Route path="/invite/:invite_code" component={InviteGuard}>
            <Route path="/" component={InvitePage} /> {/* InvitePage renders INSIDE the guard */}
        </Route>

              {/* Wrap the entire /dashboard section in the DashboardGuard */}
              <Route path="/dashboard" component={DashboardGuard}>
                  {/* Routes directly under /dashboard */}
                  <Route path="/" component={DashboardPage} />
                  <Route path="/invite" component={InvitePage} />
                  <Route path="/search" component={DashboardSearchPage} />
              
                  {/* --- Protected Project Routes --- */}
                  {/* Wrap the entire /project/:project_id section in the ProjectGuard */}
                  <Route path="/project/:project_id" component={ProjectGuard}>
                      {/* These routes will only render if the user is authenticated AND a project member */}
                      <Route path="/" component={ProjectPage} />
                      <Route path="/members" component={ProjectMemberPage} />
                      <Route path="/roles" component={ProjectRolesPage} />
                      <Route path="/tasks" component={ProjectTasksPage} />
                      <Route path="/archives" component={ProjectArchivesPage} />
                      <Route path="/settings" component={ProjectSettingsPage} />
                  </Route>
              </Route>

          {/* --- Catch-all 404 Not Found Route --- */}
          {/* This MUST be the last route to work correctly */}
          <Route path="*" component={NotFoundPage} /> 
      </Router>
    </AuthProvider>

  );
};

export default AppRoute;
