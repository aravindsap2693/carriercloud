import React, { Component } from 'react'
import { Card } from 'antd';
import '../../../assets/css/course-detail.css';

class Description extends Component {

    constructor() {
        super()
        this.state = {
            descriptionShowMore: ''
        };
    }

    render() {
        return (
            <div className='description-container'>
                {Object.keys(this.props).length !== 0 && <div className="inner-container">
                    <Card title="Description" bordered={false} className="card">
                        <div className="content">
                            {this.props.description}
                            {/* {descriptionShowMore === false && <Link target="_blank" onClick={() => this.setState({ descriptionShowMore: true })}>Show more <i class="fas fa-chevron-right course-details-tabs-tab-show-more"></i></Link>}
                            {descriptionShowMore === true && <Link target="_blank" onClick={() => this.setState({ descriptionShowMore: false })}>Show less <i class="fas fa-chevron-up course-details-tabs-tab-show-more"></i></Link>} */}
                        </div>
                    </Card>
                </div>}
            </div>
        )
    }
}

export default Description;
