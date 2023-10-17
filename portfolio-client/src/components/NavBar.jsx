import React from "react";

function NavBar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light" style={{ marginBottom: "12px", padding: "12px 24px 12px 24px", borderBottom: "1px solid #eeeeee" }}>
      <a className="navbar-brand" href="/">Mock Stock Portfolio</a>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <ul className="navbar-nav mr-auto">
          <li className="nav-item active">
            <a className="nav-link" href="/">Portfolios</a>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default NavBar;