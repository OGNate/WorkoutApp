import axios from "axios";
import React, { useState } from "react";
import Form from "react-bootstrap/Form";

function Register() {

    var newFirstName, newLastName, newEmail, newUsername, newPassword, newPassword2;

    const [errors, setErrors] = useState({});

    const attemptRegistration = async (event) => {

        event.preventDefault();

        var obj = {
            firstName: newFirstName.value,
            lastName: newLastName.value,
            email: newEmail.value,
            username: newUsername.value,
            password: newPassword.value,
            password2: newPassword2.value,
        };

        var js = JSON.stringify(obj);
        var bp = require("../../utils/Path.js");
        var config = bp.apiCall("api/register", js);

        axios(config).then(function (response, err) {
            localStorage.setItem("user_data", JSON.stringify({ email: newEmail.value }));
            window.location.href = "/verifyAccount";
        }).catch(function (error) {
            setErrors(error.response.data);
        });
    };

    return (

        <Form onSubmit={attemptRegistration}>

            <h3>Register</h3>

            <Form.Group className="mb-3">
                <label>First name</label>
                <input type="text" className="form-control" placeholder="First name" ref={(c) => newFirstName = c} />
                <span className="text-danger" style={{ fontSize: '9px' }}> {errors.firstName}</span>
            </Form.Group>

            <Form.Group className="mb-3">
                <label>Last name</label>
                <input type="text" className="form-control" placeholder="Last name" ref={(c) => newLastName = c} />
                <span className="text-danger" style={{ fontSize: '9px' }}> {errors.lastName}</span>
            </Form.Group>

            <Form.Group className="mb-3">
                <label>Email address</label>
                <input type="email" className="form-control" placeholder="Enter email" ref={(c) => newEmail = c} />
                <span className="text-danger" style={{ fontSize: '9px' }}> {errors.email}</span>
            </Form.Group>

            <Form.Group className="mb-3">
                <label>Username</label>
                <input type="text" className="form-control" placeholder="Enter username" ref={(c) => newUsername = c} />
                <span className="text-danger" style={{ fontSize: '9px' }}> {errors.userName}</span>
            </Form.Group>

            <Form.Group className="mb-3">
                <label>Password</label>
                <input type="password" className="form-control" placeholder="Enter password" ref={(c) => newPassword = c} />
                <span className="text-danger" style={{ fontSize: '9px' }}> {errors.password}</span>
            </Form.Group>

            <Form.Group className="mb-3">
                <label>Confirm Password</label>
                <input type="password" className="form-control" placeholder="Confirm password" ref={(c) => newPassword2 = c} />
                <span className="text-danger" style={{ fontSize: '9px' }}> {errors.password2}</span>
            </Form.Group>

            <button type="submit" className="btn btn-primary btn-block">Sign Up</button>

            <p className="forgot-password text-right">
                Already registered? <a href="login">Sign in</a>
            </p>

        </Form>
    );
}

export default Register;