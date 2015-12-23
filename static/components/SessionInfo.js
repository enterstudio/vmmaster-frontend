var React = require('react');
var SessionsActions = require('../actions/SessionsActions').SessionsActions;
var StepsActions = require('../actions/StepsActions').StepsActions;
var SubStepsActions = require('../actions/SubStepsActions').SubStepsActions;
var SessionsStore = require('../stores/SessionsStore').SessionsStore;
var StepsStore = require('../stores/StepsStore').StepsStore;
var SubStepsStore = require('../stores/SubStepsStore').SubStepsStore;
var formatDateTime = require('../utils/Utils').formatDateTime;
var calculatePadding = require('../utils/Utils').calculatePadding;
var statusIcon = require('./Session').statusIcon;


var SessionInfo = React.createClass({
    getDefaultProps: function () {
        SessionsActions.session_info();
    },

    getInitialState: function() {
        return {
            session: '',
            first_step: '',
            first_sub_step: ''
        };
    },

    _onChangeSession: function() {
        var _state = SessionsStore.getState(),
            first_step = this.state.first_step;

        this.setState({
            session: _state.session,
            first_step: first_step
        });
    },

    _onChangeSteps: function() {
        var _state = StepsStore.getState(),
            session = this.state.session;

        if (_state.steps.length >= 1) {
            this.setState({
                session: session,
                first_step: _state.steps[0]
            });

            if (!_state.first_sub_step && this.state.first_step) {
                SubStepsActions.get_first_sub_step(this.state.first_step.id);

            }
        }
    },

    _onChangeSubSteps: function() {
        var _state = SubStepsStore.getState(),
            session = this.state.session,
            first_step = this.state.first_step;

        this.setState({
            session: session,
            first_step: first_step,
            first_sub_step: _state.first_sub_step
        });
    },

    componentWillUnmount: function() {
        SessionsStore.removeChangeListener(this._onChangeSession);
        StepsStore.removeChangeListener(this._onChangeSteps);
        SubStepsStore.removeChangeListener(this._onChangeSubSteps);
    },

    componentDidMount: function() {
        SessionsStore.addChangeListener(this._onChangeSession);
        StepsStore.addChangeListener(this._onChangeSteps);
        SubStepsStore.addChangeListener(this._onChangeSubSteps);
    },

    componentDidUpdate: function () {
        calculatePadding();
    },

    render: function () {
        var session = this.state.session,
            first_step = this.state.first_step,
            first_sub_step = this.state.first_sub_step;

        return (
            <div>
                <InfoPanel session={ session } first_step={ first_step } first_sub_step={ first_sub_step }/>
                <SessionTabs session={ session }/>
                <Snippets/>
            </div>
        );
    }
});


var InfoPanel = React.createClass({
    description: function () {
        var desc = {
                "status_message": '',
                "session_error": '',
                "started": '',
                "ended": '',
                "duration": '',
                "username": '',
                "platform": '',
                "java": '',
                "browser": '',
                "selenium": ''
            },
            session = this.props.session,
            first_step = this.props.first_step,
            first_sub_step = this.props.first_sub_step;

        if (session) {
            if (session.endpoint_name) {
                if (session.status == "waiting") {
                    desc.status_message = "Starting on " + session.endpoint_name + " ...";
                } else {
                    desc.status_message = "Started on " + session.endpoint_name;
                }
            } else {
                desc.status_message = "Waiting for endpoint...";
            }

            if (session.deleted) {
                desc.ended = formatDateTime(session.deleted);
            }

            desc.duration = session.duration ? session.duration : '';
            desc.username = session.username ? session.username : '';
            desc.started = formatDateTime(session.created);
            desc.session_error = session.error;
        }

        if (first_step && first_step.response) {
            var dc = JSON.parse(first_step.response.body).value;
            desc.browser = dc.version && dc.browserName ? dc.browserName + " " + dc.version : '';

            if (first_sub_step) {
                var sub_step_dc = JSON.parse(first_sub_step.response.body).value;
                desc.java = sub_step_dc.java.version ? 'Java ' + sub_step_dc.java.version : '';
                desc.platform = dc.platform && sub_step_dc.os.version ? dc.platform + " " + sub_step_dc.os.version : '';
                desc.selenium = sub_step_dc.build.version ? 'Selenium ' + sub_step_dc.build.version : '';
            }
        }

        return desc;
    },

    errorMsg: function (error) {
        if (error) {
            return (
                <div className="row _info_error">
                    <div className="col-lg-12">
                        <pre className="alert alert-danger">{ error }</pre>
                    </div>
                </div>
            );
        }
    },

    render: function () {
        var session = this.props.session,
            session_status_class = "label label-" + statusIcon(session.status),
            description = this.description();

        return (
            <div className="session_info panel">
                <div className="panel-body">
                    <div className="container-fluid">
                        <div className="row _info_title">
                            <ul className="list-inline">
                                <li className="session_column session_status">
                                    <span className={ session_status_class }>{ session.status }</span>
                                </li>
                                <li className="session_column session_name">
                                    <h4>{ session.name } <small>{ session.id }</small></h4>
                                </li>
                            </ul>
                        </div>

                        <div className="row _info_description">
                            <div className="col-xs-5 grey-block">
                                <p><strong>{ description.status_message }</strong></p>
                                <p><strong>{ description.platform }</strong></p>
                                <p><strong>{ description.browser }</strong></p>
                                <p><strong>{ description.java }</strong></p>
                                <p><strong>{ description.selenium }</strong></p>
                            </div>
                            <div className="col-xs-5 grey-block">
                                <p><strong>Owner</strong> { description.username }</p>
                                <p><strong>Started</strong> { description.started }</p>
                                <p><strong>Ended</strong> { description.ended }</p>
                                <p><strong>Duration</strong> { description.duration } sec.</p>
                            </div>
                        </div>

                        { this.errorMsg(description.session_error) }
                    </div>
                </div>
            </div>
        )
    }
});


var SessionTabs = React.createClass({
    screencastTab: function (session) {
        if (!session.closed || session.take_screencast) {
            return (
                <li>
                    <a data-toggle="tab" href="#screencast" className="screencast">Video</a>
                </li>
            );
        }
    },

    render: function () {
        var session = this.props.session;
        return (
            <div className="session_tabs">
                <ul id="mtabs" className="nav nav-tabs">
                    <li className="active"><a data-toggle="tab" href="#steps" className="steps">Steps</a></li>
                    { this.screencastTab(session) }
                </ul>
            </div>
        );
    }
});


var Snippets = React.createClass({
    expandButton: function () {
        return (
            <div className="expand_all_button">
                <a type="button" className="btn btn-default" href="javascript: expand_all()">Expand all tests</a>
            </div>
        );
    },

    render: function () {
        return (
            <div className="step_snippet">
                { document.getElementsByClassName('label_group').length > 0 ? this.expandButton() : '' }
            </div>
        );
    }
});


module.exports.SessionInfo = SessionInfo;