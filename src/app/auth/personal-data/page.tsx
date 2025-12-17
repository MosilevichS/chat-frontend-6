import { AuthHeader } from "@/src/components/ui/auth/AuthHeader";
import { Input } from "@/src/components/ui/Input";
import Button from "@/components/ui/Button";

const Page = () => {
  return (
    <div className=" h-full flex flex-col w-full">
      <AuthHeader />
      <div className="flex flex-col mb-4 ">
        <div className="flex flex-col items-center justify-center gap-4 py-8 md:gap-8">
          <h3
            className="
            font-medium text-2xl text-black-500 text-center
            md:text-3xl md:font-semibold md:text-black-900
          "
          >
            Личная информация
          </h3>
          <span
            className="
            font-roboto font-normal text-[18px] text-center text-gray-600
            md:text-[20px]
          "
          >
            Пожалуйста, заполните данные
          </span>
        </div>
        <div className="w-full mx-auto">
          <form className="flex flex-col mb-40 md:mb-20 gap-4 md:gap-6">
            <Input name="name" label="Введите имя" placeholder="" />
            <Input name="nickName" label="Придумайте никнейм" placeholder="" />
          </form>
          <div className=" ">
            <p
              className="
              font-roboto font-normal text-[10px] text-gray-500 w-full
              md:text-[14px]
            "
            >
              Нажимая на «Зарегистрироваться», вы соглашаетесь с{" "}
              <a href="#">
                <span className="text-blue-500 underline hover:text-blue-600">
                  Пользовательским соглашением.{" "}
                </span>
              </a>
            </p>
          </div>
        </div>
      </div>
      <div className="w-full pb-6 mx-auto justify-center items-center">
        <Button size="medium" variant="primary" className="w-full ">
          Зарегистрироваться
        </Button>
      </div>
    </div>
  );
};

export default Page;
