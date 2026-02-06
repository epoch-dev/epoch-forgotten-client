import { ReactNode } from 'react';
import style from './ModalOverlay.module.scss';
import { GameWindow } from './GameWindow';
import { GameButton } from './GameButton';

type ModalOverlayProps = {
    title?: string;
    onClose: () => void;
    children: ReactNode;
    showCloseButton?: boolean;
    actions?: ReactNode;
};

export const ModalOverlay = ({
    title,
    onClose,
    children,
    showCloseButton = true,
    actions,
}: ModalOverlayProps) => {
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className={style.backdrop} onClick={handleBackdropClick}>
            <div className={style.modalContainer}>
                <GameWindow title={title} onClose={showCloseButton ? onClose : undefined} size="sm">
                    <div className={style.content}>{children}</div>
                    {actions && <div className={style.actions}>{actions}</div>}
                </GameWindow>
            </div>
        </div>
    );
};

// Convenience component for confirm dialogs
type ConfirmModalProps = {
    title?: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    children: ReactNode;
};

export const ConfirmModal = ({
    title = 'Confirm',
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    children,
}: ConfirmModalProps) => {
    return (
        <ModalOverlay
            title={title}
            onClose={onCancel}
            actions={
                <>
                    <GameButton variant="primary" onClick={onConfirm}>
                        {confirmText}
                    </GameButton>
                    <GameButton variant="secondary" onClick={onCancel}>
                        {cancelText}
                    </GameButton>
                </>
            }>
            {children}
        </ModalOverlay>
    );
};
