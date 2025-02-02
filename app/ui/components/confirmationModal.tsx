import clsx from "clsx";

export default function ConfirmationModal({
    title = "",
    message = "",
    cancelText = "Cancel",
    confirmText = "Confirm",
    onConfirm = () => { },
    onCancel = () => { },
    darkMode = false
}: {
    title?: string,
    message?: string,
    cancelText?: string,
    confirmText?: string,
    onConfirm?: () => void,
    onCancel?: () => void,
    darkMode?: boolean
}) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className={clsx(
                "float-container credit-view flex-row gap-2 m-4",
                darkMode && "dark",
            )}>
                <div className="default-header gap-2">
                    <p className="font-bold">{title}</p>
                </div>
                <div className="flex-row gap-2 p-2">
                    <p className="mb-2">{message}</p>
                    <div className="flex gap-2">
                        <button className="text-button" onClick={onCancel}>{cancelText}</button>
                        <button className="text-button" onClick={onConfirm}>{confirmText}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}