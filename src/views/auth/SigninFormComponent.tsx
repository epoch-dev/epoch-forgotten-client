import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAuthDto } from '../../common/api/.generated';
import { usersClient } from '../../common/api/client';
import { StorageService } from '../../common/services/StorageService';
import { ToastService } from '../../common/services/ToastService';
import { isEmpty } from '../../common/utils';
import { BASE_PATH } from '../../main.tsx';

export const SigninFormComponent = () => {
    const [formData, setFormData] = useState<UserAuthDto>({
        username: '',
        password: '',
    });
    const [formErrors, setFormErrors] = useState<Partial<UserAuthDto>>();
    const navigate = useNavigate();

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = event.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleSignin = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validateForm()) {
            return;
        }
        const res = await usersClient.signin({
            username: formData.username,
            password: formData.password,
        });
        StorageService.set({ key: 'user', data: res.data });
        ToastService.success({ message: 'Welcome back' });
        navigate(`${BASE_PATH}/game`);
    };

    const validateForm = () => {
        const errors: Partial<UserAuthDto> = {};
        if (!formData.username) {
            errors.username = 'Username required';
        }
        if (!formData.password) {
            errors.password = 'Password required';
        }
        setFormErrors(errors);
        return isEmpty(errors);
    };

    return (
        <form onSubmit={handleSignin} className="formWrapper">
            <fieldset>
                <label htmlFor="username" className="formLabel">
                    Username:
                </label>
                <input
                    value={formData.username}
                    onChange={handleInputChange}
                    type="text"
                    id="username"
                    autoComplete="username"
                    className="formInput"
                />
                {formErrors?.username && <p className="formError">{formErrors?.username}</p>}
            </fieldset>
            <fieldset>
                <label htmlFor="password" className="formLabel">
                    Password:
                </label>
                <input
                    value={formData.password}
                    onChange={handleInputChange}
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    className="formInput"
                />
                {formErrors?.password && <p className="formError">{formErrors?.password}</p>}
            </fieldset>
            <div className="formActionsWrapper">
                <button type="submit" className="formSubmitBtn">
                    Signin
                </button>
            </div>
        </form>
    );
};

export default SigninFormComponent;
