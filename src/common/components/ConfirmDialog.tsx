import { ReactNode } from 'react';
import style from './ConfirmDialog.module.scss';

export const ConfirmDialog = ({
    children,
    onConfirm,
    onCancel,
}: {
    children: ReactNode;
    onConfirm: () => void;
    onCancel: () => void;
}) => {
    return (
        <div className={style.modalBackdrop}>
            <section className={style.modalWrapper}>
                <p>{children}</p>
                <button onClick={onConfirm} className="btn">
                    Confirm
                </button>
                <button onClick={onCancel} className="btn">
                    Cancel
                </button>
            </section>
        </div>
    );
};
