import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAuthDto } from '../../common/api/.generated';
import { UsersClient } from '../../common/api/client';
import { StorageService } from '../../common/services/StorageService';
import { ToastService } from '../../common/services/ToastService';
import { isEmpty } from '../../common/utils';
import { useGameStore } from '../game/GameStore';
import { GameView } from '../game/types';

type UserAuthConfirm = UserAuthDto & { confirmPassword: string };

export const SignupFormComponent = () => {
    const [formData, setFormData] = useState<UserAuthConfirm>({
        username: '',
        password: '',
        confirmPassword: '',
    });
    const [formErrors, setFormErrors] = useState<Partial<UserAuthConfirm>>();
    const navigate = useNavigate();
    const { setView } = useGameStore();

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = event.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validateForm()) {
            return;
        }
        const res = await UsersClient.signup({
            username: formData.username,
            password: formData.password,
        });
        StorageService.set({ key: 'user', data: res.data });
        ToastService.success({ message: 'Account created' });
        setView(GameView.Intro);
        navigate('game');
    };

    const validateForm = () => {
        const newErrors: Partial<UserAuthConfirm> = {};
        if (!formData.username) {
            newErrors.username = 'Username required';
        }
        if (!formData.password) {
            newErrors.password = 'Password required';
        }
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirm password required';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords don't match";
        }
        setFormErrors(newErrors);
        return isEmpty(newErrors);
    };

    return (
        <form onSubmit={handleSignup} className="formWrapper">
            <fieldset>
                <label className="formLabel">Username:</label>
                <input
                    value={formData.username}
                    onChange={handleInputChange}
                    type="text"
                    autoComplete="off"
                    id="username"
                    className="formInput"
                />
                {formErrors?.username && <p className="formError">{formErrors?.username}</p>}
            </fieldset>
            <fieldset>
                <label className="formLabel">Password:</label>
                <input
                    value={formData.password}
                    onChange={handleInputChange}
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
                    type="password"
                    autoComplete="off"
                    id="confirmPassword"
                    className="formInput"
                />
                {formErrors?.confirmPassword && <p className="formError">{formErrors?.confirmPassword}</p>}
            </fieldset>
            <div className="formActionsWrapper">
                <button type="submit" className="formSubmitBtn">
                    Signup
                </button>
            </div>
        </form>
    );
};

export default SignupFormComponent;
