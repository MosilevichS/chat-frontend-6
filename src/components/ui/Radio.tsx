"use client";

interface IRadio {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  name: string;
  value: string;
  className?: string;
}

const Radio = ({ label, description, checked, onChange, name, value, className = "" }: IRadio) => {
  const handleClick = () => {
    onChange();
  };

  return (
    <div
      className={`flex items-start p-4 cursor-pointer hover:bg-gray-50 ${className}`}
      onClick={handleClick}
    >
      <div className="flex-shrink-0 relative mt-0.5">
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
            ${checked ? "border-(--color-violet)" : "border-(--color-button-disabled)"}`}
        >
          {checked && <div className="w-3 h-3 rounded-full bg-(--color-violet)"></div>}
        </div>
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          className="absolute opacity-0 w-0 h-0"
        />
      </div>

      <div className="ml-3">
        <div className="text-base font-normal text-gray-900">{label}</div>
        <div className="text-sm font-normal text-(--color-gray) mt-1">{description}</div>
      </div>
    </div>
  );
};

export default Radio;
