import React, { Component } from 'react'
import { Card, Collapse } from 'antd';
import collpase_minus from '../../../assets/svg-images/accordion-minus.svg';
import collpase_add from '../../../assets/svg-images/accordion-plus.svg';
import '../../../assets/css/course-detail.css';
import Env from '../../../utilities/services/Env';

const { Panel } = Collapse;

class FAQ extends Component {

    constructor() {
        super()
        this.state = {
            faqData: []
        }
    }

    componentDidMount() {
       this.getFAQ()
    }

    getFAQ() {
        const courseId = this.props.courseId
        const getCoursesList = Env.get(this.props.routingProps.envendpoint+`faqs?course_id=${courseId}`)
        getCoursesList.then(response => {
            let responseData = response.data.response.faqs.data;
            this.setState({ faqData: responseData })
        }, error => {
            console.error(error)
        })
    }

    render() {

        const { faqData } = this.state;

        return (
            <div className='faq-container'>
                {faqData.length !== 0 && <div className="content">
                    <Card title="FAQ" bordered={false} className="card">
                        <Collapse defaultActiveKey={['0']} ghost expandIcon={({ isActive }) => isActive === true ? <img className="collapse-image" alt="collpase_minus" src={collpase_minus} /> : <img className="collapse-image" alt="collpase_add" src={collpase_add} />} accordion>
                            {
                                faqData.map((item, index) => <Panel header={<span className="panel-header" >{item.question}</span>} key={index}> <p dangerouslySetInnerHTML={{ __html: item.answer }} className="panel-answer" /></Panel>)
                            }
                        </Collapse>
                    </Card>
                </div>}
            </div>
        )
    }
}

export default FAQ;
