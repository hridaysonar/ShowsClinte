import { createBrowserRouter, Navigate } from 'react-router'
import Home from '../pages/Home/Home'
import ErrorPage from '../pages/ErrorPage'
import Login from '../pages/Login/Login'
import SignUp from '../pages/SignUp/SignUp'
import PrivateRoute from './PrivateRoute'
import DashboardLayout from '../layouts/DashboardLayout'
import MainLayout from '../layouts/MainLayout'
import ProfileComponent from '../components/Profile/Profile'
import AllPolicies from '../pages/AllPolicies/AllPolicies'
import PolicyDetails from '../pages/AllPolicies/PolicyDetails'
import QuotePage from '../pages/QuotePage/QuotePage'
import ApplicationFormPage from '../pages/ApplicationFormm/ApplicationForm'
import AdminRoute from './AdminRoute'

import ManageUsers from '../pages/AdminPage/ManageUsers'
import DashboardHomeRedirect from '../components/DashboardHomeRedirect/DashboardHomeRedirect'
import Blogs from '../pages/Blogs/Blogs'
import MyPolicies from '../pages/CustomerPage/MyOrders'
import CustomerRoute from './CustomerRoute'
import PaymentStatus from '../pages/CustomerPage/PaymentStatus'
import ManagePolicies from '../pages/AdminPage/ManagePolicies'
import ManageApplications from '../pages/AdminPage/ManageApplications'
import AssignedCustomers from '../pages/AgentPage/AssignedCustomers'
import AgentRoute from './AgentRoute'
import CustomerPaymentStatusPage from '../pages/CustomerPage/CustomerPaymentStatusPage'
import PaymentPage from '../pages/CustomerPage/PaymentPage'
import ManageTransactions from '../pages/AdminPage/ManageTransactions'
import ClaimRequestPage from '../pages/CustomerPage/ClaimRequestPage'
import PolicyClearance from '../pages/AgentPage/PolicyClearance'
import ManageBlogsPage from '../pages/ManageBlogsPage/ManageBlogsPage'
import AdminAgentRoute from './AdminAgentRoute'
import Forbidden from '../pages/ErrorPage'
import About from '../components/Sidebar/About'
import CartPage from '../pages/AllPolicies/CartPage'
import Orders from '../pages/AdminPage/Orders'
import MyOrders from '../pages/CustomerPage/MyOrders'


export const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: '/',
                element: <Home />,
            },
            {
  path: '/cart',
  element: <CartPage />,
},
            {
                path: '/about',
                element: <About/>
            },
            {
                path: '/blogs',
                element: <Blogs></Blogs>
            },
            {
                path: '/profile',
                element: <PrivateRoute>
                    <ProfileComponent></ProfileComponent>
                </PrivateRoute>
            },
            {
                path: '/policies',
                element: <AllPolicies></AllPolicies>
            },
            {
                path: '/policyDetails/:id',
                element: <PolicyDetails></PolicyDetails>
            },
            {
                path: '/quote/:id',
                element: <PrivateRoute>
                    <QuotePage></QuotePage>
                </PrivateRoute>
            }, {
                path: '/apply/:id',
                element: <PrivateRoute>
                    <ApplicationFormPage></ApplicationFormPage>
                </PrivateRoute>
            },
            { path: '/login', Component: Login },
            { path: '/signup', element: <SignUp /> },

            {
                path: "/payment/:applicationId",
                element: <PaymentPage></PaymentPage>
            }



        ],
    },
    {
        path: 'dashboard',
        element: <PrivateRoute><DashboardLayout /></PrivateRoute>,
        children: [
            // { path: 'profile', element: <ProfilePage /> },
            //admin routes
            {
                index: true,
                element: <DashboardHomeRedirect />,
            },
            {
                index: true,
                path: 'manage-applications',
                element: <AdminRoute><ManageApplications /></AdminRoute>
            },

            { path: 'manage-users', element: <AdminRoute><ManageUsers /></AdminRoute> },
            { path: 'manage-policies', element: <AdminRoute><ManagePolicies /></AdminRoute> },
            { path: 'manage-transactions', element: <AdminRoute><ManageTransactions /></AdminRoute> },
            { path: 'orders', 
            element: <AdminRoute><Orders/>
            </AdminRoute> },
            // Agent Routes
            { path: 'assigned-customers', element: <AgentRoute><AssignedCustomers /></AgentRoute> },
            // { path: 'manage-blogs', element: <AgentRoute><ManageBlogs /></AgentRoute> },
            {
                path: 'policy-clearance', element: <AgentRoute>

                    <PolicyClearance></PolicyClearance>
                </AgentRoute>
            },
            // Customer routes

            { path: 'my-policies', element: <CustomerRoute><MyPolicies /></CustomerRoute> },
            { path: 'my-orders', element: <CustomerRoute><MyOrders/></CustomerRoute> },

            { path: 'payment-status', element: <CustomerRoute><CustomerPaymentStatusPage></CustomerPaymentStatusPage></CustomerRoute> },
            {


            },
            {
                path: 'claim-request', element: <CustomerRoute>
                    <ClaimRequestPage></ClaimRequestPage>
                </CustomerRoute>
            },
            // { path: '', element: <Navigate to="profile" /> }, // Default route
            {
                path: 'manage-blogs',
                element: <PrivateRoute>
                    <AdminAgentRoute>

                        <ManageBlogsPage></ManageBlogsPage>
                    </AdminAgentRoute>
                </PrivateRoute>


            },
            {
                path: "forbidden",
                element: <Forbidden></Forbidden>
            }
        ],


    },





])
