import Image from "next/image";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center mt-45 text-center text-(--color-gray) font-normal">
      <Image
        className="mb-6"
        src="/images/not-found.png"
        alt="Ничего не найдено"
        width={200}
        height={200}
      />
      <p className="mb-2 text-lg">Поиск не дал результатов</p>
      <p className="text-[14px]">По вашему запросу ничего не найдено.</p>
      <p className="text-[14px]">Измените запрос и попробуйте снова</p>
    </div>
  );
};

export default NotFound;
