import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { UsersClient } from '../../common/api/client';
import { isEmpty } from '../../common/utils';
import { UserAuthDto } from '../../common/api/.generated';
import { ToastService } from '../../common/services/ToastService';
import { StorageService } from '../../common/services/StorageService';

export const SigninComponent = () => {
    // TODO - optimize with use-form-hook
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
        UsersClient.signin(formData).then((res) => {
            StorageService.set({ key: 'user', data: res.data });
            ToastService.success({ message: 'Welcome back!' });
            navigate('game');
        });
    };

    const validateForm = () => {
        const errors: Partial<UserAuthDto> = {};
        if (!formData.username) {
            errors.username = 'errors.usernameRequired';
        }
        if (!formData.password) {
            errors.password = 'errors.passwordRequired';
        }
        setFormErrors(errors);
        return isEmpty(errors);
    };

    return (
        <main>
            <h2>Epoch Forgotten</h2>
            <form onSubmit={handleSignin}>
                <label htmlFor="username">Username:</label>
                <input
                    value={formData.username}
                    onChange={handleInputChange}
                    type="text"
                    id="username"
                    autoComplete="username"
                />
                {formErrors?.username}
                <label htmlFor="password">Password:</label>
                <input
                    value={formData.password}
                    onChange={handleInputChange}
                    type="password"
                    id="password"
                    autoComplete="current-password"
                />
                {formErrors?.password}
                <button type="submit">Signin</button>
            </form>
        </main>
    );
};
