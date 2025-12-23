"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthHeader } from "@/components/ui/auth/AuthHeader";
import Input from "@/src/components/ui/Input";
import Button from "@/components/ui/Button";
import ModalBase from "@/src/components/ui/modal/ModalBase";
import ModalConfirm from "@/components/ui/modal/ModalConfirm";
import Logo from "@/components/ui/Logo";

const formSchema = z.object({
  phone: z.string().min(16, "Некорректный номер"),
  // .regex(/^\+7 \d{3} \d{3} \d{2} \d{2}$/, {
  //   message: "Используйте формат: +7 900 000 00 00",
  // }),
});
type FormData = z.infer<typeof formSchema>;

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phoneValue, setPhoneValue] = useState("");
  console.log(isModalOpen);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting, isValid, errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    criteriaMode: "firstError",
    reValidateMode: "onChange",
  });
  const handleOpenModal = (data: FormData) => {
    setPhoneValue(data.phone);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirm = () => {
    setIsModalOpen(false);
    console.log("click confirm");
  };
  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    const allDigits = input.replace(/\D/g, "");

    let phoneDigits = allDigits.startsWith("7") ? allDigits.slice(1) : allDigits;

    phoneDigits = phoneDigits.slice(0, 10);

    let formatted = "+7";

    if (phoneDigits.length > 0) formatted += " " + phoneDigits.slice(0, 3);
    if (phoneDigits.length > 3) formatted += " " + phoneDigits.slice(3, 6);
    if (phoneDigits.length > 6) formatted += " " + phoneDigits.slice(6, 8);
    if (phoneDigits.length > 8) formatted += " " + phoneDigits.slice(8, 10);

    setValue("phone", formatted, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <div className="h-full flex items-center flex-col pb-10 md:pb-20 pt-[4.5rem] md:pt-20">
      <AuthHeader className="hidden relative md:flex md:mb-8" />
      <div className="text-center md:hidden ">
        <Logo size="small" />
        <h3 className="mb-8 md:mb-6 text-(--color-text) font-medium md:font-semibold text-[2rem] md:text-[3rem] leading-[120%] tracking-normal">
          А-Чат
        </h3>
      </div>

      <h3 className="mb-5 md:mb-6 text-(--color-text) font-medium text-[1.5rem] leading-[120%] md:font-semibold md:text-[2rem] md:leading-[100%] tracking-normal">
        Вход/регистрация
      </h3>

      <form
        onSubmit={handleSubmit(handleOpenModal)}
        className="flex flex-col h-full w-full max-w-[360px]"
      >
        <Input
          register={register("phone", {
            onChange: e => handleChangeInput(e),
          })}
          name="phone"
          label="Введите номер телефона"
          placeholder="+7 900 000 00 00"
          className="mb-4"
          error={errors.phone?.message}
        />

        <Button
          type="submit"
          size="medium"
          variant="primary"
          className="md:mt-auto"
          disabled={isSubmitting || !isValid}
        >
          {isSubmitting ? "Отправка..." : "Далее"}
        </Button>
      </form>

      {isModalOpen && (
        <ModalBase onClose={handleCloseModal}>
          <ModalConfirm
            onClose={handleCloseModal}
            onConfirm={handleConfirm}
            title={phoneValue}
            message="Номер телефона указан верно?"
            confirmText="Верно"
            cancelText="Изменить"
          />
        </ModalBase>
      )}
    </div>
  );
}
