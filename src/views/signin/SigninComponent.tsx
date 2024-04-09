import style from './SigninComponent.module.scss';
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
    const particlesCount = Array.from({ length: 125 }, (_, index) => index + 1);

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
        <>
            <main className={style.signinWrapper}>
                <h2 className="title">Epoch Forgotten</h2>
                <figure className={style.logoWrapper}>
                    <img src="./images/brand/brand.png" alt="logo" />
                </figure>
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
            </main>
            <div style={{ position: 'absolute', zIndex: 1 }}>
                {particlesCount.map((index) => (
                    <div className={style.particleWrapper} key={index}>
                        <div className={style.particleItem}></div>
                    </div>
                ))}
            </div>
        </>
    );
};
