"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/src/hooks/useTypedSelector";
import AuthHeader from "@/components/ui/auth/AuthHeader";
import Input from "@/src/components/ui/Input";
import Button from "@/components/ui/Button";
import ModalBase from "@/src/components/ui/modal/ModalBase";
import ModalConfirm from "@/components/ui/modal/ModalConfirm";
import Logo from "@/components/ui/Logo";

import { setPhone } from "@/src/store/slices/authSlice";
import { useSendCodeMutation } from "@/src/services/authApi";
import { parseApiError } from "@/src/services/apiError";

interface FormValues {
  phone: string;
}

const formSchema = z.object({
  phone: z.string().min(16, "Некорректный номер"),
});
type FormData = z.infer<typeof formSchema>;

export default function Page() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phone, setPhoneLocal] = useState("");

  const dispatch = useAppDispatch();
  const [sendCode] = useSendCodeMutation();

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { isSubmitting, isValid, errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    criteriaMode: "firstError",
    reValidateMode: "onChange",
  });
  const handleOpenModal = (data: FormData) => {
    setPhoneLocal(data.phone);
    dispatch(setPhone(phone));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirm = async () => {
    try {
      await sendCode({ phone_number: phone.replace(/\s+/g, "") }).unwrap();
      router.push("/auth/phone-code");
    } catch (err) {
      const { fieldErrors, message } = parseApiError(err);

      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, messages]) => {
          setError(field as keyof FormValues, {
            type: "server",
            message: messages[0],
          });
        });
      }

      if (message) {
        setError("root", {
          type: "server",
          message,
        });
      }
    }
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

        {errors.root && <p className="text-center text-(--color-error)">{errors.root.message}</p>}

        <Button
          type="submit"
          size="medium"
          variant="primary"
          className="md:mt-auto"
          disabled={isSubmitting || !isValid}
        >
          Далее
        </Button>
      </form>

      {isModalOpen && (
        <ModalBase onClose={handleCloseModal}>
          <ModalConfirm
            onClose={handleCloseModal}
            onConfirm={handleConfirm}
            title={phone || ""}
            message="Номер телефона указан верно?"
            confirmText="Верно"
            cancelText="Изменить"
          />
        </ModalBase>
      )}
    </div>
  );
}
