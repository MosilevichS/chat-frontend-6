import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import backIcon from "@/assets/icons/back-icon.svg";
import ModalBase from "@/src/components/ui/modal/ModalBase";

interface BlackListTopMenuProps {
  onToggleDeleteMode: () => void;
}
export const BlackListTopMenu = ({ onToggleDeleteMode }: BlackListTopMenuProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleMenuClick = () => {
    setIsModalOpen(true);
  };
  const handleEditList = () => {
    onToggleDeleteMode();
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  return (
    <>
      <div className="flex items-center justify-between mb-6 ">
        <Link href="/settings" className="p-2 -ml-2">
          <Image src={backIcon} width={24} height={24} alt="Назад" />
        </Link>
        <h2 className="text-[1.125rem] font-medium text-[var(--color-black)]">Черный список</h2>
        <button className="kebab-button" onClick={handleMenuClick}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="2" fill="currentColor" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
            <circle cx="12" cy="19" r="2" fill="currentColor" />
          </svg>
        </button>
      </div>
      {isModalOpen && (
        <ModalBase onClose={handleCloseModal}>
          <div className="fixed top-16 right-4 md:top-30 md:right-130 z-50 bg-white rounded-xl w-72 p-3 shadow-lg">
            <div className="flex items-center">
              <span className="text-lg font-semibold">Редактировать список</span>

              <button
                onClick={handleEditList}
                className="ml-auto text-red-500 hover:bg-red-50 rounded-lg transition-colors p-1"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16.4033 10.5233L17.4767 11.5967L6.90667 22.1667H5.83333V21.0933L16.4033 10.5233ZM20.6033 3.5C20.3117 3.5 20.0083 3.61667 19.7867 3.83833L17.6517 5.97333L22.0267 10.3483L24.1617 8.21333C24.2698 8.1054 24.3556 7.9772 24.4142 7.83606C24.4727 7.69493 24.5028 7.54363 24.5028 7.39083C24.5028 7.23804 24.4727 7.08674 24.4142 6.94561C24.3556 6.80447 24.2698 6.67627 24.1617 6.56833L21.4317 3.83833C21.1983 3.605 20.9067 3.5 20.6033 3.5ZM16.4033 7.22167L3.5 20.125V24.5H7.875L20.7783 11.5967L16.4033 7.22167Z"
                    fill="#7769E1"
                  />
                </svg>
              </button>
            </div>
          </div>
        </ModalBase>
      )}
    </>
  );
};
