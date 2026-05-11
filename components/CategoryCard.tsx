import Image, { StaticImageData } from "next/image";

type CategoryCardProps = {
  title: string;
  icon: StaticImageData;
};

export default function CategoryCard({
  title,
  icon,
}: CategoryCardProps) {
  return (
    <button className="bg-background hover:bg-white border border-gray-200 hover:border-primary transition-all rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md">
      
      <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mb-4">
        <Image
          src={icon}
          alt={title}
          width={34}
          height={34}
        />
      </div>

      <h3 className="font-semibold text-dark text-sm leading-snug">
        {title}
      </h3>

    </button>
  );
}