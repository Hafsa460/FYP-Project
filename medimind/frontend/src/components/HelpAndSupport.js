import React from "react";
import Navbar from "../components/Navbar";
import hospitalImg from "../images/hospital.jpg"; // placeholder image
import supervisorImg from "../images/female.png"; // placeholder
import teamImg from "../images/female.png"; // placeholder
import maleProfile from "../images/male.png"; // placeholder
import "./HelpAndSupport.css";

export default function HelpAndSupport() {
  return (
    <>
      <Navbar />

      <div className="container py-5">
        <h2 className="text-center text-teal mb-5 mt-5">Help & Support</h2>

        {/* PROJECT DESCRIPTION */}
        <div className="info-card mb-5">
          <h4>About the Project</h4>
          <p>
            The platform is an AI-powered web-based diagnostic and hospital management
  system designed to assist clinicians in differentiating between hemorrhagic
  and ischemic stroke conditions using deep learning-based medical image
  analysis, while providing secure role-based access for patients, doctors, and
  administrators through a user-friendly interface.
          </p>
        </div>

        {/* RESEARCH TEAM */}
        <h4 className="section-title">Researchers / Project Team</h4>
        <div className="row g-4 mb-5">
          {["Areeba Qayyum Khan", "Sirat Sabir", "Syeda Hafsa Shah"].map((name, index) => (
            <div className="col-md-4" key={index}>
              <div className="card custom-card text-center">
                <img src={teamImg} className="card-img-top" alt="Researcher" />
                <div className="card-body">
                  <h5 className="card-title">{name}</h5>
                  <p className="card-text">AIR University, Islamabad</p>
                </div>
              </div>
            </div>
          ))}
        </div>

{/* SUPERVISORS */}
<h4 className="section-title">Supervisors</h4>
<div className="row justify-content-center mb-5 g-4">
  
  <div className="col-md-4 col-sm-6">
    <div className="card custom-card icon-card text-center">
      <img
        src={supervisorImg}
        className="card-img-top"
        alt="Supervisor 1"
      />
      <div className="card-body">
        <h5 className="card-title">Miss Warda Aslam</h5>
        <p className="card-text">Project Supervisor</p>
      </div>
    </div>
  </div>

  <div className="col-md-4 col-sm-6">
    <div className="card custom-card icon-card text-center">
      <img
        src={maleProfile}
        className="card-img-top"
        alt="Supervisor 2"
      />
      <div className="card-body">
        <h5 className="card-title">Mr Daniyal</h5>
        <p className="card-text">Industrial Supervisor</p>
      </div>
    </div>
  </div>

</div>
{/* COMPANY / COLLABORATOR */}
       <h4 className="section-title">Collaborating Company</h4>
<div className="row justify-content-center mb-5 g-4">
   <div className="card custom-card hospital-card mb-5 text-center">
  <img
    src={hospitalImg}
    className="card-img-top hospital-img"
    alt="Hospital"
  />
  <div className="card-body text-center">
    <h5 className="card-title">K-Soft</h5>
    <p className="card-text">
      Strategic partner providing technical and research collaboration.
    </p>
  </div>
</div>
</div>


        {/* HOSPITAL */}
        <h4 className="section-title">Hospital</h4>
<div className="row justify-content-center mb-5 g-4">
   <div className="card custom-card hospital-card mb-5 text-center">
  <img
    src={hospitalImg}
    className="card-img-top hospital-img"
    alt="Hospital"
  />
  <div className="card-body text-center">
    <h5 className="card-title">KRL-Hospital</h5>
    <p className="card-text">
      Clinical collaboration and medical validation partner.
    </p>
  </div>
</div>
</div>

        <h4 className="section-title">Contact & Support</h4>
        <div className="info-card">
          <p><strong>Phone:</strong> +92 300000000</p>
          <p>
            <strong>Email:</strong>{" "}   
              syedahafsashah2004@gmail.com
          </p>
        </div>
      </div>
    </>
  );
}
