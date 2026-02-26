import React from "react";
import DepartmentAdminLayout from "./DepartmentAdmin/DepartmentAdminLayout";
import { Routes, Route } from "react-router-dom";
import DepartmentAdminDashboard from "./DepartmentAdmin/DepartmentAdminDashboard";
import ManageDepartments from "./DepartmentAdmin/ManageDepartments";

export default function Dptadmin() {
    return (
        <Routes>
            <Route path="/*" element={<DepartmentAdminLayout />}>
                <Route index element={<DepartmentAdminDashboard />} />
                <Route path="departments" element={<ManageDepartments />} />
            </Route>
        </Routes>
    );
}