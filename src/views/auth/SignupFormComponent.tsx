import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAuthDto } from '../../common/api/.generated';
import { usersClient } from '../../common/api/client';
import { StorageService } from '../../common/services/StorageService';
import { ToastService } from '../../common/services/ToastService';
import { throttle, verifyLabel } from '../../common/utils';
import { useGameStore } from '../game/GameStore';
import { GameView } from '../game/types';
import { sharedConfig } from '../../common/config';

type UserAuthConfirm = UserAuthDto & {
    usernameError?: string;
    passwordError?: string;
    confirmPassword: string;
};

export const SignupFormComponent = () => {
    const [formData, setFormData] = useState<UserAuthConfirm>({
        username: '',
        password: '',
        confirmPassword: '',
    });
    const [formErrors, setFormErrors] = useState<Partial<UserAuthConfirm>>();
    const [offensiveLabelWarning, setOffensiveLabelWarning] = useState<string>();
    const navigate = useNavigate();
    const { setView } = useGameStore();

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = event.target;
        setFormData({ ...formData, [id]: value });
        setFormErrors((errors) => ({
            ...errors,
            [id]: undefined,
        }));
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        throttle(handleSignup)();
    };

    const handleSignup = async () => {
        if (formErrors?.username || formErrors?.password || formErrors?.confirmPassword) {
            return;
        }
        const res = await usersClient.signup({
            username: formData.username,
            password: formData.password,
        });
        StorageService.set({ key: 'user', data: res.data });
        ToastService.success({ message: 'Account created' });
        setView(GameView.Intro);
        navigate('game');
    };

    const validateUsername = () => {
        setOffensiveLabelWarning(undefined);
        if (!formData.username) {
            setFormErrors((errors) => ({
                ...errors,
                username: 'Username required',
            }));
        } else if (
            formData.username.length < sharedConfig.nameLength.min ||
            formData.username.length > sharedConfig.nameLength.max
        ) {
            setFormErrors((errors) => ({
                ...errors,
                username: `Username must be between ${sharedConfig.nameLength.min} and ${sharedConfig.nameLength.max} characters`,
            }));
        } else if (!verifyLabel(formData.username)) {
            setOffensiveLabelWarning(
                'Offensive phrase detected, you will be allowed to create an account but administrator may block it after verification',
            );
        } else {
            setFormErrors((errors) => ({
                ...errors,
                username: undefined,
            }));
        }
    };

    const validatePassword = () => {
        if (!formData.password) {
            setFormErrors((errors) => ({
                ...errors,
                password: 'Password required',
            }));
        } else if (
            formData.password.length < sharedConfig.passwordLength.min ||
            formData.password.length > sharedConfig.passwordLength.max
        ) {
            setFormErrors((errors) => ({
                ...errors,
                password: `Password must be between ${sharedConfig.passwordLength.min} and ${sharedConfig.passwordLength.max} characters`,
            }));
        } else {
            setFormErrors((errors) => ({
                ...errors,
                password: undefined,
            }));
        }
        validateConfirmPassword();
    };

    const validateConfirmPassword = () => {
        if (!formData.confirmPassword) {
            setFormErrors((errors) => ({
                ...errors,
                confirmPassword: 'Confirm password required',
            }));
        } else if (formData.password !== formData.confirmPassword) {
            setFormErrors((errors) => ({
                ...errors,
                confirmPassword: `Passwords don't match`,
            }));
        } else {
            setFormErrors((errors) => ({
                ...errors,
                confirmPassword: undefined,
            }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="formWrapper">
            <fieldset>
                <label className="formLabel">Username:</label>
                <input
                    value={formData.username}
                    onChange={handleInputChange}
                    onBlur={validateUsername}
                    type="text"
                    autoComplete="off"
                    id="username"
                    className="formInput"
                />
                {formErrors?.username && <p className="formError">{formErrors?.username}</p>}
                {offensiveLabelWarning && <p className="formWarning">{offensiveLabelWarning}</p>}
            </fieldset>
            <fieldset>
                <label className="formLabel">Password:</label>
                <input
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={validatePassword}
                    type="password"
                    autoComplete="off"
                    id="password"
                    className="formInput"
                />
                {formErrors?.password && <p className="formError">{formErrors?.password}</p>}
            </fieldset>
            <fieldset>
                <label className="formLabel">Confirm password:</label>
                <input
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onBlur={validateConfirmPassword}
                    type="password"
                    autoComplete="off"
                    id="confirmPassword"
                    className="formInput"
                />
                {formErrors?.confirmPassword && <p className="formError">{formErrors?.confirmPassword}</p>}
            </fieldset>
            <div className="formActionsWrapper">
                <button type="submit" className="formSubmitBtn">
                    Start New Journey
                </button>
            </div>
        </form>
    );
};

export default SignupFormComponent;
