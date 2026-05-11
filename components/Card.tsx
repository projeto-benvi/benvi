type Props = {
  title: string;
};

export default function CategoryCard({ title }: Props) {
  return (
    <div className="bg-white border rounded-2xl p-6 text-center hover:shadow-lg transition cursor-pointer">

      <div className="w-14 h-14 rounded-full bg-blue-100 mx-auto mb-4" />

      <h3 className="font-semibold">
        {title}
      </h3>

    </div>
  );
}