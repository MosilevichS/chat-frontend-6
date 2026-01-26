interface ILoaderProps {
  text?: string;
  className?: string;
}

const Loader = ({ text = "", className = "" }: ILoaderProps) => (
  <div className={`flex flex-col items-center justify-center gap-3 min-h-20 ${className}`}>
    <div className="w-12 h-12">
      <div
        className="w-full h-full border-4 border-(--color-violet) border-t-transparent 
      rounded-full animate-spin"
      ></div>
    </div>
    {text && <p className="text-primary">Загрузка {text}...</p>}
  </div>
);
export default Loader;
