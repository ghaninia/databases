import { Link } from 'react-router-dom';

const pages = [
  { key: 'colors', title: 'Colors', description: 'پالت رنگ‌ها با کد HEX، نام فارسی و انگلیسی' },
  { key: 'grades', title: 'Grades', description: 'ساختار رشته‌ها و زیرشاخه‌ها' },
  { key: 'names', title: 'Names', description: 'نام‌ها با جنسیت، ریشه و توضیح' },
  { key: 'proverbs', title: 'Proverbs', description: 'مجموعه ضرب‌المثل‌های فارسی' },
  { key: 'skills', title: 'Skills', description: 'بانک بزرگ مهارت‌ها' },
  { key: 'states', title: 'States', description: 'استان‌ها، شهرها، محله‌ها و همسایه‌ها' },
  { key: 'words', title: 'Words', description: 'متون و دل‌نوشته‌ها همراه تگ' },
];

export default function HomePage() {
  return (
    <section className="space-y-5">
      <div className="animate-fade-up rounded-2xl border border-borderc bg-cover p-6">
        <h2 className="text-2xl font-bold text-secondary">دیتابیس های پرکاربرد</h2>
        <p className="mt-3 leading-8 text-[color:var(--white-light)]">
          این ریپازیتوری شامل مجموعه‌ای از دیتابیس‌های پرکاربرد است که به کاربران کمک می‌کند تا به
          اطلاعات مختلفی از جمله موقعیت جغرافیایی ایران، رنگ‌ها، رشته‌های تحصیلی، ضرب‌المثل‌های فارسی،
          نام‌ها، مهارت‌ها و کلمات و عبارات احساسی دسترسی پیدا کنند. این داده‌ها در پروژه‌های نرم‌افزاری
          و تحقیقاتی قابل استفاده هستند.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {pages.map((page) => (
          <Link
            key={page.key}
            to={`/${page.key}`}
            className="group animate-fade-up rounded-2xl border border-borderc bg-cover p-5 transition hover:-translate-y-1 hover:bg-cover2"
          >
            <h3 className="text-lg font-semibold text-secondary transition group-hover:text-foreground">{page.title}</h3>
            <p className="mt-2 text-sm leading-7 text-[color:var(--white-light)]">{page.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
