import React from "react";
import { Route, Routes } from "react-router";
import { NoMatch } from "../screens/NoMatch";
import { Profile } from "../screens/Profile";
import { Calendar } from "../screens/Calendar";
import { Login } from "../screens/Login";
import { Logout } from "../screens/Logout";
import { Layout } from "../screens/Layout";
import { Redirect } from "../screens/Redirect";
import { RequireAuth } from "./RequireAuth";

export const Router: React.FC = () => {
  return <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<Redirect />} />
      <Route path="login" element={<Login />} />
      <Route path="logout" element={<RequireAuth><Logout /></RequireAuth>} />
      <Route path="calendar" element={<RequireAuth><Calendar /></RequireAuth>} />
      <Route path="profile" element={<RequireAuth><Profile /></RequireAuth>} />

      {/* Using path="*"" means "match anything", so this route
        acts like a catch-all for URLs that we don't have explicit
        routes for. */}
      <Route path="*" element={<NoMatch />} />
    </Route>
  </Routes>
}