import React, { Component } from "react";
import "../../App.css";
import SupportContactPopup from "../SupportContactPopup";
import { connect } from "react-redux";
import { NavLink } from "react-router-dom";

class AppFooter extends Component {
  constructor() {
    super();
    this.state = {
      currentYear: new Date(),
    };
  }

  render() {
    const year = this.state.currentYear;
    return (
      <div className="layout-footer-menu">
        <span className="layout-footer-menu-item">
          <NavLink to="/about-us">About Us</NavLink>
        </span>
        <span className="layout-footer-menu-item">
          <NavLink to="/authors">Authors</NavLink>
        </span>
        <span className="layout-footer-menu-item">
          <span
            onClick={() =>
              this.contactPopup.showContactModal(
                true,
                "Contact",
                this.props.preferences
              )
            }
          >
            Contact Us
          </span>
        </span>
        <span className="layout-footer-menu-item">
          <NavLink to="/faq">FAQs</NavLink>
        </span>
        <span className="layout-footer-menu-item">
          <NavLink to="/terms">Terms and Conditions</NavLink>
        </span>
        <span className="layout-footer-menu-item">
          <NavLink to="/privacy">Privacy Policy</NavLink>
        </span>
        <span className="layout-footer-menu-item">
          <NavLink to="">Sitemap</NavLink>
        </span>
        <span className="layout-footer-menu-item">
          <NavLink to="/careers">Careers</NavLink>
        </span>
        <span className="layout-footer-menu-item">
          <NavLink to="">CareersCloud&copy;{year.getFullYear()}</NavLink>
        </span>
        <SupportContactPopup
          {...this.props}
          ref={(instance) => {
            this.contactPopup = instance;
          }}
        />
      </div>
    );
  }
}

export default connect((state) => {
  return {
    preferences: state.preferences,
    envendpoint: state.envendpoint,
  };
})(AppFooter);
