import Modal from "../../../components/Modal/Modal";

export default function DeleteConfirmModal({ open, onClose, onConfirm, title = "Silmeyi onaylıyor musunuz?", message }) {
  const handleConfirm = () => {
    onConfirm?.();
    onClose?.();
  };

  return (
    <Modal open={!!open} onClose={onClose} title={title} maxWidth="400px">
      <p style={{ marginBottom: "24px", color: "var(--text-secondary)", fontSize: "14px" }}>
        {message || "Bu işlem geri alınamaz."}
      </p>
      <div className="d-flex justify-content-between align-items-center" style={{ gap: "12px" }}>
        <button type="button" className="btn btn--secondary" onClick={onClose}>
          İptal
        </button>
        <button type="button" className="btn btn--danger" onClick={handleConfirm}>
          Sil
        </button>
      </div>
    </Modal>
  );
}
