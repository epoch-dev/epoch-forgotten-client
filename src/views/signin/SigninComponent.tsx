import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { UsersClient } from '../../common/api/client';
import { isEmpty } from '../../common/utils';
import { UserAuthDto } from '../../common/api/.generated';

export const SigninComponent = () => {
    const [formData, setFormData] = useState<UserAuthDto>({
        username: '',
        password: '',
    });
    const [formErrors, setFormErrors] = useState<Partial<UserAuthDto>>();
    const navigate = useNavigate();

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validateForm()) {
            return;
        }
        UsersClient.signin(formData).then((res) => {
            // TODO
            // StorageService.set({ key: 'user', data: res.data });
            // ToastService.success({ text: 'Welcome back!' });
            console.log(res);
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
            <form onSubmit={handleLogin}>
                <label htmlFor="username">Username:</label>
                <input
                    value={formData.username}
                    onChange={handleInputChange}
                    type="text"
                    name="username"
                    id="username"
                    autoComplete="username"
                />
                {formErrors?.username}
                <label htmlFor="password">Password:</label>
                <input
                    value={formData.password}
                    onChange={handleInputChange}
                    type="password"
                    name="password"
                    id="password"
                    autoComplete="current-password"
                />
                {formErrors?.password}
                <button type="submit">Signin</button>
            </form>
        </main>
    );
};
