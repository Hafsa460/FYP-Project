import React, { useState } from "react";
import axios from "axios";
import "./Login.css"; // your provided CSS

const SignupForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    age: "",
    mrNo: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Valid email required.";
    }
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.age || isNaN(formData.age))
      newErrors.age = "Valid age required.";
    if (!/^\d+$/.test(formData.mrNo))
      newErrors.mrNo = "MR No must be a number.";
    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({});
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const { email, name, age, mrNo, password } = formData;
      const res = await axios.post("http://localhost:5000/api/users/register", {
        email,
        name,
        age,
        mrNo,
        password,
      });

      setMessage(res.data.message);
      setFormData({
        email: "",
        name: "",
        age: "",
        mrNo: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      setMessage(error.response?.data?.error || "Registration failed.");
    }
  };

  return (
    <div className="login-page d-flex justify-content-center align-items-center">
      <div className="login-container row shadow">
        <div className="col-md-6 image-section p-4 d-flex align-items-center justify-content-center">
          <h2 className="text-teal">Create Account</h2>
        </div>
        <div className="col-md-6 form-section p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
              />
              <div className="text-danger">{errors.email}</div>
            </div>

            <div className="mb-3">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
              />
              <div className="text-danger">{errors.name}</div>
            </div>

            <div className="mb-3">
              <label>Age:</label>
              <input
                type="text"
                name="age"
                className="form-control"
                value={formData.age}
                onChange={handleChange}
              />
              <div className="text-danger">{errors.age}</div>
            </div>

            <div className="mb-3">
              <label>MR No:</label>
              <input
                type="text"
                name="mrNo"
                className="form-control"
                value={formData.mrNo}
                onChange={handleChange}
              />
              <div className="text-danger">{errors.mrNo}</div>
            </div>

            <div className="mb-3">
              <label>Password:</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
              />
              <div className="text-danger">{errors.password}</div>
            </div>

            <div className="mb-3">
              <label>Re-type Password:</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <div className="text-danger">{errors.confirmPassword}</div>
            </div>

            <button type="submit" className="btn btn-teal w-100">
              Register
            </button>
            {message && (
              <div className="mt-3 text-center text-success">{message}</div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
