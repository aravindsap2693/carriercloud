import React, { Component } from 'react'
import { Button, Input, Carousel } from 'antd';
import '../../assets/css/common.css'
import Env from '../../utilities/services/Env';
import StorageConfiguration from '../../utilities/services/StorageConfiguration';
import { GoogleLogin } from 'react-google-login';
import learn_banner from '../../assets/images/learn_banner.png'
import crack_banner from '../../assets/images/crack_banner.png'
import lead_banner from '../../assets/images/lead_banner.png'
import EditProfile from '../Profile/Profile'
import Preference from '../Profile/Preference';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';

const learnStyle = {
    height: '100vh',
    color: '#ffffff',
    lineHeight: '1420px',
    textAlign: 'center',
    background: '#0B649D',
    fontWeight: 'bold',
    fontSize: '18px',
    backgroundImage: `url(${learn_banner})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center top',
    // backgroundSize: '550px 100%'
};

const crackStyle = {
    height: '100vh',
    color: '#ffffff',
    lineHeight: '1420px',
    textAlign: 'center',
    background: '#0B649D',
    fontWeight: 'bold',
    fontSize: '18px',
    backgroundImage: `url(${crack_banner})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center top',
    // backgroundSize: '550px 100%'
};

const leadStyle = {
    height: '100vh',
    color: '#ffffff',
    lineHeight: '1420px',
    textAlign: 'center',
    background: '#0B649D',
    fontWeight: 'bold',
    fontSize: '18px',
    backgroundImage: `url(${lead_banner})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center top',
    // backgroundSize: '550px 100%'
};

class Loginpage extends Component {

    constructor() {
        super()
        this.state = {
            email_id: '',
            social_token: '',
            profile_image: '',
            device_id: '',
            app_version: '',
            login_type: '',
            device_token: '',
            social_user_auth_id: '',
            last_name: '',
            first_name: ''
        }
        this.submitForm = this.submitForm.bind(this);
    }

    componentDidMount() {

    }

    async submitForm() {
        let encryptedData = StorageConfiguration.encryptWithAES(JSON.stringify(this.state))
        const requestBody = {
            "mobile_login": "9677501509",
            "login_type": this.state.login_type,
            "encrypted_data": encryptedData
        }
        const postData = Env.post(this.props.envendpoint+`login?current_app_version=${this.state.app_version}&platform=web`, requestBody)
        await postData.then(response => {
            const data = response.data.response.user;
            StorageConfiguration.sessionSetItem('is_logged_in', true)
            StorageConfiguration.sessionSetItem('user_id', data.id)
            StorageConfiguration.sessionSetItem('user_name', data.first_name + ' ' + data.last_name)
            StorageConfiguration.sessionSetItem('user_token', response.data.response.access_token)
            StorageConfiguration.sessionSetItem('email_id', data.email_id)
            StorageConfiguration.sessionSetItem('profile_image', data.profile_image)
            const payload = {
                first_name: data.first_name,
                last_name: data.last_name,
                user_name: data.first_name + " " + data.last_name,
                profile_image: data.profile_image,
                level_points: data.level_points,
                role_id: data.role_permission_id,
                email_id: data.email_id,
                user_id: data.id,
                doubts_banner: response.data.response.doubt_banner,
                support_banner: response.data.response.support_banner,
            };
              this.props.dispatch(profileUpdate(payload));
            if(data.is_mobile_verified === 0) {
                // this.profilePopup.getUserDetails(true)
                this.props.history.push('/profile')
            }
            else {
                if(data.preference_count === 0) {
                    // this.profilePopup.getUserDetails(true)
                    this.props.history.push('/profile')
                }
                else {
                    this.props.history.push('/all-courses')
                }
            }
        }, error => {
            toast('Please enter the valid email ID')
        })

    }

    // requestBody = {
    //     "email_id": this.state.email_id,
    //     "social_token": "100804736905684677148",
    //     "profile_image": "",
    //     "device_id": "dc1fa89f46fd9aa6",
    //     "app_version": "1.34",
    //     "login_type": "google",
    //     "device_token": "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9. eyJhcHBJZCI6IjE6NzU4MTY2Njc4NTU2OmFuZHJvaWQ6YzJiNTcwMmJkMThlNWE3NiIsImV4cCI6MTYzMTUyNjY2NSwiZmlkIjoiY3EtQzFyazBTR1dGWVVvUlJ4WG1tMCIsInByb2plY3ROdW1iZXIiOjc1ODE2NjY3ODU1Nn0.AB2LPV8wRgIhAP6bARzU54Xj0fjvHFPp5ZVT4_eoxFcvT2QE9DYaFT4oAiEA6pvYp9bXnfHtrBfr8Osa0ydUv8HADq9k08Rv3Kci52E&hashcode=pSTmdPMyzZ4",
    //     "social_user_auth_id": this.state.email_id,
    //     "last_name": "P",
    //     "first_name": "Venkat"
    // }

    responseGoogle = (response) => {
        // console.log('GOOGLE RESPONSE', JSON.stringify(response))
        this.setState({
            email_id: response.profileObj.email,
            social_token: response.profileObj.googleId,
            profile_image: response.profileObj.imageUrl,
            device_id: 'dc1fa89f46fd9aa6',
            app_version: '1.34',
            login_type: response.tokenObj.idpId,
            device_token: response.tokenObj.id_token,
            social_user_auth_id: response.profileObj.email,
            last_name: response.profileObj.familyName,
            first_name: response.profileObj.givenName
        })
        // console.log('STATE RESPONSE', this.state)
        this.submitForm()
    }

    render() {
        return (
            //className="login-content"
            <div>
                {/* <Input placeholder="careerscloud@gmail.com" style={{width: '350px', margin: '0px 10px'}} name="email_id" value={this.state.email_id} onChange={(e) => this.setState({email_id: e.target.value})} autoFocus />
                <Button type="primary" onClick={this.submitForm}>Login</Button><br /> */}
                <Carousel autoplay>
                    <div >
                        <div style={learnStyle}>Learn Anytime Anywhere</div>
                    </div>
                    <div>
                        <div style={crackStyle}>Crack Way to reach your Goal</div>
                    </div>
                    <div>
                        <div style={leadStyle}>Lead Whatever you Are</div>
                    </div>
                </Carousel>

                <div style={{ position: 'absolute', bottom: '160px', left: '0px', right: '0px', textAlign: 'center'}}>
                    <GoogleLogin
                        // clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                        clientId={this.props.envupdate.react_app_google_client_id}
                        buttonText="Login with Google Account"
                        onSuccess={this.responseGoogle}
                        onFailure={this.responseGoogle}
                        cookiePolicy={'single_host_origin'}
                        theme="dark"
                        disabledStyle={false}
                        style={{ borderRadius: '10px', cursor: 'pointer' }}
                        uxMode="popup"
                        isSignedIn={false}
                    />
                </div>

                <EditProfile ref={(instance) => { this.profilePopup = instance }} routingProps={this.props} />

                <div style={{ position: 'absolute', bottom: '30px', padding: '20px 0px', textAlign: 'center', left: 0, right: 0 }}>
                    {/* <div style={{ padding: '10px 0px' }}>
                        <span style={{ color: '#ffffff', cursor: 'pointer' }}>Dedicated to APJ Abdul Kalam</span>
                    </div> */}
                    <div style={{ padding: '10px 0px', color: '#ffffff' }}>
                        <span style={{cursor: 'pointer', textDecoration: 'underline', fontWeight: 400}}>Terms</span> and <span style={{cursor: 'pointer', textDecoration: 'underline', fontWeight: 400}} >Privacy Policy</span>
                    </div>
                </div>
            </div>
        )
    }
}

export default connect((state) => {
    return {
      envupdate: state.envupdate,
      envendpoint: state.envendpoint,
    };
  })(Loginpage);