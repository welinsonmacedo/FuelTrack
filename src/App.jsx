import { Routes, Route } from "react-router-dom";
import Login from "./pages/login/Login";
import "./App.css";
import "./index.css";

import Dashboard from "./pages/dashboard/Dashboard";
import Register from "./pages/travel and supply registration/travelandsupplyregistration";
import GeneralReport from "./pages/general report/generalReport";
import DriverRegister from "./pages/driver register/DriverRegister";
import TruckRegister from "./pages/truck register/TruckRegister";
import PrivateRoute from "./components/PrivateRoute";
import UserRegister from "./pages/userRegister/UserRegister";
import Drivers from "./pages/drivers/Drivers";
import EditDriversRecord from "./pages/editDriversRecord/EditDriversRecord";

import Layout from "./components/Layout";
import EditTruckRegister from "./pages/editTruckRegister/EditTruckRegister";
import Vehicles from "./pages/vehicles/Vehicles";
import SupplyAndTravelList from "./pages/supplyAndTravelList/supplyAndTravelList";
import GeneralRegistration from "./pages/generalRegistration/GeneralRegistration";
import Logout from "./components/Logout";
import SupplierRegister from "./pages/supplierRegister/SupplierRegister";
import Suppliers from "./pages/suppliersList/Suppliers";
import TripsList from "./pages/trips/TripsList";
import TravelRegistration from "./pages/travelRegistration/TravelRegistration";
import SupplyRegistration from "./pages/supplyRegistration/SupplyRegistration";
import LinkRefuelingTravel from "./pages/linkRefuelingTravel/LinkRefuelingTravel";
import EditFuelRegister from "./pages/editFuelRegister/EditFuelRegister";
import EditTravelRegister from "./pages/editTravelRegister/EditTravelRegister";
import EditSupplier from "./pages/editSupplier/EditSupplier";

export default function App() {
  return (
    <Routes>
      {/* Rota pública */}
      <Route path="/" element={<Login />} />

      {/* Rotas privadas com sidebar/layout */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PrivateRoute>
            <Layout>
              <Register />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/report"
        element={
          <PrivateRoute>
            <Layout>
              <GeneralReport />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/drivers/driverregister"
        element={
          <PrivateRoute>
            <Layout>
              <DriverRegister />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/truckregister"
        element={
          <PrivateRoute>
            <Layout>
              <TruckRegister />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/userregister"
        element={
          <PrivateRoute>
            <Layout>
              <UserRegister />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/drivers"
        element={
          <PrivateRoute>
            <Layout>
              <Drivers />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/drivers/driveredit/:id"
        element={
          <PrivateRoute>
            <Layout>
              <EditDriversRecord />
            </Layout>
          </PrivateRoute>
        }
      />
       <Route
        path="/vehicles" element=
        {
          <PrivateRoute>
            <Layout>
              <Vehicles/>
            </Layout>
          </PrivateRoute>
        }
        />
      <Route
        path="/truckregister/edit/:id" element=
        {
          <PrivateRoute>
            <Layout>
              <EditTruckRegister />
            </Layout>
          </PrivateRoute>
        }
        />
        <Route
        path="supplyAndTravelList" element=
        {
          <PrivateRoute>
            <Layout>
              <SupplyAndTravelList/>
            </Layout>
          </PrivateRoute>
        }
        />
         <Route
        path="generalRegistration" element=
        {
          <PrivateRoute>
            <Layout>
              <GeneralRegistration/>
            </Layout>
          </PrivateRoute>
        }
        />
          <Route
        path="logout" element=
        {
          <PrivateRoute>
            <Layout>
              <Logout/>
            </Layout>
          </PrivateRoute>
        }
        />
          <Route
        path="suppliersList/supplierRegister" element=
        {
          <PrivateRoute>
            <Layout>
              <SupplierRegister/>
            </Layout>
          </PrivateRoute>
        }
        />
           <Route
        path="supplierRegister" element=
        {
          <PrivateRoute>
            <Layout>
              <SupplierRegister/>
            </Layout>
          </PrivateRoute>
        }
        />
          <Route
        path="/suppliersList" element=
        {
          <PrivateRoute>
            <Layout>
              <Suppliers/>
            </Layout>
          </PrivateRoute>
        }
        />
           <Route
        path="/tripsList" element=
        {
          <PrivateRoute>
            <Layout>
              <TripsList/>
            </Layout>
          </PrivateRoute>
        }
        />
          <Route
        path="/travelRegistration" element=
        {
          <PrivateRoute>
            <Layout>
              <TravelRegistration/>
            </Layout>
          </PrivateRoute>
        }
        />
         <Route
        path="/supplyRegistration" element=
        {
          <PrivateRoute>
            <Layout>
              <SupplyRegistration/>
            </Layout>
          </PrivateRoute>
        }
        />
         <Route
        path="/linkRefuelingTravel" element=
        {
          <PrivateRoute>
            <Layout>
              <LinkRefuelingTravel/>
            </Layout>
          </PrivateRoute>
        }
        />
          <Route
        path="/editFuelRegister/:id" element=
        {
          <PrivateRoute>
            <Layout>
              <EditFuelRegister/>
            </Layout>
          </PrivateRoute>
        }
        />
           <Route
        path="/editTravelRegister/:id" element=
        {
          <PrivateRoute>
            <Layout>
              <EditTravelRegister/>
            </Layout>
          </PrivateRoute>
        }
        />
            <Route
        path="/editSupplier/:id" element=
        {
          <PrivateRoute>
            <Layout>
              <EditSupplier/>
            </Layout>
          </PrivateRoute>
        }
        />

    </Routes>
  );
}
