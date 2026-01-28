"use client";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

import DateSelect from "@/components/ui/user-profile/profile/DateSelect";
import Button from "@/components/ui/Button";

import { useGetProfileQuery, useUpdateProfileMutation } from "@/src/services/userApi";
import { dateToUnixTimestamp, unixTimestampToDateParts } from "@/src/hooks/useDateUtils";
import { arrayOfInputs } from "@/components/ui/user-profile/profile/modal/arrayOfInputs";

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

  useEffect(() => {
    if (!data) return;

    reset({
      first_name: data.first_name ?? "",
      last_name: data.last_name ?? "",
      nickname: data.nickname ?? "",
      additional_information: data.additional_information ?? "",
    });

    if (data.birthday) {
      setValue("birthDate", unixTimestampToDateParts(data.birthday));
    }
  }, [data, reset, setValue]);

  const onSubmit = async (formData: FormValues) => {
    console.log("formData", formData);
    try {
      const dateBirthday = dateToUnixTimestamp(formData.birthDate);
      if (dateBirthday === null) {
        return;
      }

      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        nickname: formData.nickname,
        birthday: dateBirthday,
        additional_information: formData.additional_information,
      };
      console.log("updateData", updateData);
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
        {arrayOfInputs.map(el => (
          <div key={el.name} >
            <label className="text-(--color-gray) text-[0.875rem] leading-[120%] tracking-[0.01em] mb-1 block">
              {el.label}
            </label>
            <input
              className="w-full h-14
            text-lg
            border border-(--color-gray) rounded-md
            py-4 px-3 md:py-4 md:px-5
            focus:outline-none focus:border-(--color-violet)
            bg-white text-(--color-text) placeholder:text-gray-500
            transition-all duration-200"
              {...register(el.name)}
            />
          </div>
        ))}
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Введите дату своего рождения</label>
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
        <div>
          <label className="text-(--color-gray) text-[0.875rem] leading-[120%] tracking-[0.01em] mb-1 block">
            Напишите пару слов о себе
          </label>
          <input
            className="w-full h-14
            text-lg
            border border-(--color-gray) rounded-md
            py-4 px-3 md:py-4 md:px-5
            focus:outline-none focus:border-(--color-violet)
            bg-white text-(--color-text) placeholder:text-gray-500
            transition-all duration-200"
            {...register("additional_information")}
          />
        </div>

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
