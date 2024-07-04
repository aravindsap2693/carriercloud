import React, { Component } from 'react'

class NoRecords extends Component {
    render() {
        return (
            <div style={{minHeight: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <span style={{fontWeight: 500, fontSize: '20px'}}>No Records Found.</span>
            </div>
        )
    }
}

export default NoRecords;
