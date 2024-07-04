import React, { Component } from "react";
import { Result, Button } from "antd";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    // It will update the state so the next render shows the fallback UI.
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service here
    console.error(error, errorInfo);
    this.stateUpdateion();
  }

  stateUpdateion = () => {
    this.setState({ hasError: true });
  };
  render() {
    if (this.state.hasError) {
      // You can render a fallback UI when an error occurs
      return (
        <div style={{ height: "190vh" }}>
          <Result
            status="warning"
            title="There are some problems with your operation."
            extra={
              <Button type="primary" key="console">
                Go Console
              </Button>
            }
          />
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
