import { declension } from "@/src/utils/declension";
import ModalBase from "../modal/ModalBase";
import ModalConfirm from "../modal/ModalConfirm";

type ModalDeleteContactsProps = {
  isOpen: boolean;
  handleCloseModal: () => void;
  handleConfirm: () => void;
  selectedContactIds: string[];
};

const ModalDeleteContacts = ({
  isOpen,
  handleCloseModal,
  handleConfirm,
  selectedContactIds,
}: ModalDeleteContactsProps) => {
  if (!isOpen) return null;

  return (
    <ModalBase onClose={handleCloseModal}>
      <ModalConfirm
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
        title="Удалить контакты"
        message={
          selectedContactIds.length === 1
            ? "Вы уверены, что хотите удалить контакт?"
            : `Вы уверены, что хотите удалить ${selectedContactIds.length} ${declension(selectedContactIds.length, ["контакт", "контакта", "контактов"], 1)}?`
        }
        confirmText="Удалить"
        cancelText="Отмена"
      />
    </ModalBase>
  );
};

export default ModalDeleteContacts;
