import React from "react";
import { Route, Routes } from "react-router";
import { NoMatch } from "../../screens/NoMatch";
import { Profile } from "../../screens/Profile";
import { Calendar } from "../../screens/Calendar";
import { Login } from "../../screens/Login";
import { Layout } from "../../screens/Layout";
import { Redirect } from "../../screens/Redirect";

export const Router: React.FC = () => {
  return <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<Redirect />} />
      <Route path="login" element={<Login />} />
      <Route path="calendar" element={<Calendar />} />
      <Route path="profile" element={<Profile />} />

      {/* Using path="*"" means "match anything", so this route
            acts like a catch-all for URLs that we don't have explicit
            routes for. */}
      <Route path="*" element={<NoMatch />} />
    </Route>
  </Routes>
}