import React from "react";
import {
	Button,
	Input,
	Col,
	Label,
	FormGroup,
	Form,
	Collapse,
	Card,
	Row,
	InputGroupButton,
	InputGroup,
	UncontrolledTooltip
} from "reactstrap";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { connect } from "react-redux";
import { createPassword, createSeed, templates } from "masterpassx-core";
import { removeUser, setCurrentUser } from "../../redux/users";
import { Footer } from "../../components/Footer";
import { DeleteUserModel } from "../../components/DeleteUserModal";
import { PasswordDisplay } from "../../components/PasswordDisplay/index";
import { Header } from "./Header";
import { HelpText } from "../../components/HelpText";

export const Generate = connect(
	state => ({
		users: state.users.users,
		currentUser: state.users.currentUser,
		domain: state.session.domain
	}),
	dispatch => ({
		setCurrentUser(key) {
			dispatch(setCurrentUser(key));
		},
		removeUser(key) {
			dispatch(removeUser(key));
		}
	})
)(
	class Generate extends React.Component {
		initialState = {
			password: "",
			site: "",
			counter: 1,
			type: "long",
			showOptions: false,
			copied: false,
			showHelp: false,
			deleteUserModalOpen: false
		};

		state = { ...this.initialState };

		componentDidMount() {
			// Load site stored in session from /generate
			this.setState({ site: this.props.domain }, this.generate);
		}

		onSiteChange(event) {
			const site = event.target.value;
			this.setState({ site }, this.generate);
		}

		onTypeChange(event) {
			const type = event.target.value;
			this.setState({ type }, this.generate);
		}

		onCounterChange(event) {
			const counter = parseInt(event.target.value, 10) || 1;
			this.setState({ counter }, this.generate);
		}

		onIncrement(increment) {
			return () =>
				this.setState(
					state => ({ counter: state.counter + increment }),
					this.generate
				);
		}

		onToggleShowOptions() {
			this.setState(state => ({ showOptions: !state.showOptions }));
		}

		onToggleHelp() {
			this.setState(state => ({ showHelp: !state.showHelp }));
		}

		onToggleDeleteUserModal() {
			this.setState(state => ({
				deleteUserModalOpen: !state.deleteUserModalOpen
			}));
		}

		generate() {
			const { site, type, counter } = this.state;

			let password;
			if (site !== "") {
				const seed = createSeed(this.props.currentUser, site, counter);
				password = createPassword(seed, type);
			} else {
				password = "";
			}

			this.setState(state => ({
				password,
				copied: password !== "" && state.password === password
			}));
		}

		onReset() {
			this.setState(state => ({
				...this.initialState,
				showOptions: state.showOptions
			}));
		}

		onCopy() {
			this.setState({ copied: true });
		}

		onSwitchUser(key) {
			this.props.setCurrentUser(key);
			this.onReset();
		}

		get currentUser() {
			return this.props.users[this.props.currentUser];
		}

		render() {
			return (
				<div>
					<Header
						onToggleHelp={this.onToggleHelp.bind(this)}
						onSwitchUser={this.onSwitchUser.bind(this)}
						addUser={() => this.props.history.push("/add")}
						onToggleDeleteUserModal={this.onToggleDeleteUserModal.bind(
							this
						)}
						users={this.props.users}
						currentUser={this.props.currentUser}
					/>

					<DeleteUserModel
						open={this.state.deleteUserModalOpen}
						onToggle={this.onToggleDeleteUserModal.bind(this)}
						onDelete={() => {
							this.props.removeUser(this.props.currentUser);
							this.onReset();
						}}
						name={this.currentUser.name}
					/>

					<div className="normal-container content-navbar">
						<HelpText isOpen={this.state.showHelp}>
							Generate a password based off a site URL/domain or
							it's name. Password generated are{" "}
							<strong>
								never stored and never sent over the network
							</strong>. It generates secure passwords with
							different templates (lengths/variations of
							characters), which are always the same based off the
							same site and options.
						</HelpText>

						<Form noValidate>
							<Card body className="m-1">
								<FormGroup row className="">
									<Label
										for="site"
										sm={2}
										className="text-sm-right text-center"
									>
										Site
									</Label>
									<Col sm={10}>
										<Input
											name="site"
											id="site"
											type="url"
											className="site"
											noValidate
											value={this.state.site}
											onChange={this.onSiteChange.bind(
												this
											)}
											placeholder="example.com"
										/>
									</Col>
								</FormGroup>
								<PasswordDisplay
									password={this.state.password}
								/>
							</Card>
							<Row noGutters className="pt-2">
								<Col className="p-1" xs={6} sm={4}>
									<CopyToClipboard
										text={this.state.password}
										onCopy={this.onCopy.bind(this)}
									>
										<Button
											block
											color="primary"
											disabled={
												!this.state.password ||
												this.state.copied
											}
										>
											Copy {this.state.copied && "✓"}
										</Button>
									</CopyToClipboard>
								</Col>
								<Col className="p-1" xs={6} sm={4}>
									<Button
										block
										color="danger"
										onClick={this.onReset.bind(this)}
										disabled={
											this.state.site ===
												this.initialState.site &&
											this.state.type ===
												this.initialState.type &&
											this.state.counter ===
												this.initialState.counter
										}
									>
										Reset
									</Button>
								</Col>
								<Col className="p-1" xs={12} sm={4}>
									<Button
										block
										onClick={this.onToggleShowOptions.bind(
											this
										)}
									>
										{this.state.showOptions
											? "Hide"
											: "Show"}{" "}
										Options
									</Button>
								</Col>
							</Row>

							<Collapse isOpen={this.state.showOptions}>
								<div className="m-1 mt-3">
									<Card body>
										<FormGroup row className="p-1">
											<Label
												for="type"
												sm={3}
												className="text-sm-right text-center"
											>
												Type
											</Label>
											<Col sm={9}>
												<Input
													name="type"
													id="type"
													type="select"
													value={this.state.type}
													onChange={this.onTypeChange.bind(
														this
													)}
												>
													{Object.keys(templates).map(
														type => {
															const name =
																templates[type];
															return (
																<option
																	key={
																		"type-" +
																		type
																	}
																	value={type}
																>
																	{name}
																</option>
															);
														}
													)}
												</Input>
											</Col>
										</FormGroup>
										<FormGroup row className="p-1">
											<Label
												for="counter"
												sm={3}
												className="text-sm-right text-center"
											>
												<a
													id="counterLabel"
													className="tooltip-label"
												>
													Counter
												</a>
												<UncontrolledTooltip
													placement="top"
													target="counterLabel"
												>
													Increment this when needing
													a new password for the same
													site
												</UncontrolledTooltip>
											</Label>
											<Col sm={9}>
												<InputGroup>
													<Input
														name="counter"
														id="counter"
														type="number"
														min="1"
														value={
															this.state.counter
														}
														onChange={this.onCounterChange.bind(
															this
														)}
													/>
													<InputGroupButton>
														<Button
															color="success"
															onClick={this.onIncrement(
																1
															).bind(this)}
														>
															+
														</Button>
														<Button
															color="danger"
															disabled={
																this.state
																	.counter <=
																1
															}
															onClick={this.onIncrement(
																-1
															).bind(this)}
														>
															-
														</Button>
													</InputGroupButton>
												</InputGroup>
											</Col>
										</FormGroup>
									</Card>
								</div>
							</Collapse>
						</Form>
						<Footer />
					</div>
				</div>
			);
		}
	}
);
