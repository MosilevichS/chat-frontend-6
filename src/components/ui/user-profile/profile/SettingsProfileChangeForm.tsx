"use client";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

import Input from "@/components/ui/Input";
import DateSelect from "@/components/ui/user-profile/profile/DateSelect";
import Button from "@/components/ui/Button";

import { useGetProfileQuery, useUpdateProfileMutation } from "@/src/services/userApi";
import {
  dateToUnixTimestamp,
  unixTimestampToDateParts,
} from "@/src/hooks/useDateUtils";

type FormValues = {
  first_name?: string;
  last_name?: string;
  nickname?: string;
  additional_information?: string;
  birthDate: {
    day: string;
    month: string;
    year: string;
  };
};

const SettingsProfileChangeForm = () => {
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const { data, isLoading: isProfileLoading } = useGetProfileQuery();
  const { control, handleSubmit, register, reset, setValue } = useForm<FormValues>({
    defaultValues: {
      first_name: "",
      last_name: "",
      nickname: "",
      birthDate: { day: "", month: "", year: "" },
      additional_information: "",
    },
  });

  // Загрузка данных пользователя при монтировании
  useEffect(() => {
    if (data) {
      reset({
        first_name: data?.first_name || "",
        last_name: data?.last_name || "",
        nickname: data?.nickname || "",
        additional_information: data?.additional_information || "",
      });

      // Преобразуем timestamp из базы данных в DateParts
      if (data?.birthday) {
        const birthDateParts = unixTimestampToDateParts(data.birthday);
        setValue("birthDate", birthDateParts);
      }
    }
  }, [data, reset, setValue]);

  const onSubmit = async (formData: FormValues) => {
    try {
      const dateBirthday = dateToUnixTimestamp(formData.birthDate);
      if (dateBirthday === null) {
        return;
      }

      // Подготавливаем данные для отправки
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        nickname: formData.nickname,
        birthday: dateBirthday, //
        additional_information: formData.additional_information,
      };

      await updateProfile(updateData).unwrap();
    } catch (error) {
      console.error("Ошибка при обновлении профиля:", error);
    }
  };

  if (isProfileLoading) {
    return <div className="p-4">Загрузка профиля...</div>;
  }

  return (
    <div className="w-full p-4">
      <form className="gap-3 flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <Input
          placeholder=""
          {...register("first_name")}
          label="Изменить имя"
          defaultValue={data?.first_name}
        />
        <Input
          placeholder=""
          {...register("last_name")}
          label="Изменить фамилию"
          defaultValue={data?.last_name}
        />
        <Input
          placeholder=""
          {...register("nickname")}
          label="Изменить никнейм"
          defaultValue={data?.nickname}
        />

        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Дата рождения</label>
          <DateSelect
            name="birthDate"
            control={control}
            fromYear={1950}
            toYear={new Date().getFullYear()}
            defaultValue={
              data?.birthday
                ? unixTimestampToDateParts(data.birthday)
                : { day: "", month: "", year: "" }
            }
          />
        </div>

        <Input
          placeholder=""
          {...register("additional_information")}
          label="Напишите пару слов о себе"
          className="mb-2"
          defaultValue={data?.additional_information}
        />

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-[color:var(--color-violet)] text-white rounded-md hover:bg-[color:var(--color-violet-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          variant="primary"
          size="medium"
        >
          {isLoading ? "Сохранение..." : "Сохранить"}
        </Button>
      </form>
    </div>
  );
};

export default SettingsProfileChangeForm;
