import React, { Component } from "react";
import { ToastContainer } from "react-toastify";
import AppRouter from "./routes/Router";
import { collection } from "firebase/firestore";
import { db } from "./firebase-config";

class App extends Component {
  constructor() {
    super();
    this.state = {
      users: [],
    };
    this.userCollectionsRef = collection(db, "users");
  }

  render() {
    return (
      <div>
        <AppRouter />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          closeButton={true}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          icon={true}
          toastStyle={{ background: "#0B649D", color: "#fff", fontWeight: 500 }}
          theme="colored"
        />
      </div>
    );
  }
}

export default App;
