"use client";
import { useForm } from "react-hook-form";
import Input from "@/components/ui/Input";
import { useGetProfileQuery } from "@/src/services/userApi";
import DateSelect from "@/components/ui/user-profile/profile/DateSelect";
import Button from "@/components/ui/Button";

type FormValues = {
  birthDate: {
    day: string;
    month: string;
    year: string;
  };
};

const SettingsProfileChangeForm = () => {
  const { data } = useGetProfileQuery();
  const { control, handleSubmit } = useForm<FormValues>();

  const onSubmit = (data: FormValues) => {
    const { day, month, year } = data.birthDate;
    const isoDate = `${year}-${month}-${day}`;
    console.log("Дата рождения:", isoDate);
  };
  return (
    <div className="w-full p-4 ">
      <form className="gap-3 flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <Input placeholder="" defaultValue={data?.first_name} label="Изменить имя" />
        <Input placeholder="" defaultValue={data?.last_name} label="Изменить фамилию" />
        <Input placeholder="" defaultValue={data?.nickname} label="Изменить никнейм" />
        <DateSelect name="birthDate" control={control} fromYear={1950} />
        <Input placeholder="" label="Напишите пару слов о себе" className="mb-2" />
        <Button
          type="submit"
          className="w-full h-12 bg-(--color-violet) text-white rounded-md hover:bg-(--color-violet-dark) transition-colors"
          variant={"primary"}
          size={"medium"}
        >
          Сохранить
        </Button>
      </form>
    </div>
  );
};

export default SettingsProfileChangeForm;
