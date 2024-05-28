import { cn } from "@/lib/utils";
import Image from "next/image";

type HomeCardProps = {
  className?: string;
  img: string;
  title: string;
  description: string;
  handleClick: () => void;
};

export const HomeCard = ({
  className,
  img,
  title,
  description,
  handleClick,
}: HomeCardProps) => {
  return (
    <button
      className={cn(
        "p-0 text-left px-4 py-6 flex flex-col justify-between w-full xl:max-w-[270px] min-h-[260px] rounded-[14px] cursor-pointer",
        className
      )}
      onClick={handleClick}
    >
      <div className="flex-center glassmorphism size-12 rounded-[10px]">
        <Image src={img} alt={title} width={27} height={27} />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{title}</h1>

        <p className="text-lg font-normal">{description}</p>
      </div>
    </button>
  );
};
