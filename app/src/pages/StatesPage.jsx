import { useMemo, useState } from 'react';
import { dataStore } from '../lib/dataStore';

export default function StatesPage() {
  const provinces = dataStore.states.provinces;
  const [provinceId, setProvinceId] = useState(provinces[0]?.id ?? 1);
  const [cityId, setCityId] = useState(null);

  const cities = useMemo(() => {
    return dataStore.states.citiesByProvince[provinceId] ?? [];
  }, [provinceId]);

  const districts = useMemo(() => {
    if (!cityId) {
      return [];
    }
    return dataStore.states.districtsByCity[cityId] ?? [];
  }, [cityId]);

  const neighborNames = useMemo(() => {
    const ids = dataStore.states.neighborsByState[provinceId] ?? [];
    return ids
      .map((id) => dataStore.states.provincesById[id]?.name)
      .filter(Boolean);
  }, [provinceId]);

  return (
    <section className="space-y-4">
      <div className="animate-fade-up flex items-center justify-between rounded-2xl border border-borderc bg-cover px-5 py-4">
        <h2 className="text-xl font-bold text-secondary">States</h2>
        <p className="text-sm text-[color:var(--white-light)]">استان، شهر، محله و همسایه‌ها</p>
      </div>

      <div className="grid gap-3 rounded-2xl border border-borderc bg-cover p-4 sm:grid-cols-2">
        <select
          className="rounded-xl border border-borderc bg-cover2 px-3 py-3 text-sm text-foreground outline-none transition focus:border-secondary"
          value={provinceId}
          onChange={(event) => {
            const nextId = Number(event.target.value);
            setProvinceId(nextId);
            setCityId(null);
          }}
        >
          {provinces.map((province) => (
            <option key={province.id} value={province.id}>
              {province.name}
            </option>
          ))}
        </select>

        <select
          className="rounded-xl border border-borderc bg-cover2 px-3 py-3 text-sm text-foreground outline-none transition focus:border-secondary disabled:cursor-not-allowed disabled:opacity-50"
          value={cityId ?? ''}
          onChange={(event) => setCityId(Number(event.target.value))}
          disabled={cities.length === 0}
        >
          <option value="">انتخاب شهر</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <article className="animate-fade-up rounded-2xl border border-borderc bg-cover p-4">
          <h3 className="text-sm text-[color:var(--white-light)]">تعداد شهرها</h3>
          <p className="mt-2 text-2xl font-bold text-secondary">{cities.length.toLocaleString('fa-IR')}</p>
        </article>
        <article className="animate-fade-up rounded-2xl border border-borderc bg-cover p-4">
          <h3 className="text-sm text-[color:var(--white-light)]">تعداد محله شهر انتخاب‌شده</h3>
          <p className="mt-2 text-2xl font-bold text-secondary">{districts.length.toLocaleString('fa-IR')}</p>
        </article>
        <article className="animate-fade-up rounded-2xl border border-borderc bg-cover p-4">
          <h3 className="text-sm text-[color:var(--white-light)]">استان‌های همسایه</h3>
          <p className="mt-2 text-2xl font-bold text-secondary">{neighborNames.length.toLocaleString('fa-IR')}</p>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-borderc bg-cover p-4">
          <h3 className="text-base font-semibold text-secondary">همسایه‌ها</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {neighborNames.map((name) => (
              <span key={name} className="rounded-full border border-borderc bg-cover2 px-3 py-1 text-xs">
                {name}
              </span>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-borderc bg-cover p-4">
          <h3 className="text-base font-semibold text-secondary">محله‌ها</h3>
          {cityId ? (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {districts.map((district, index) => (
                <li key={`${district.name}-${index}`} className="rounded-lg border border-borderc bg-cover2 px-3 py-2 text-sm">
                  {district.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-[color:var(--white-light)]">برای نمایش محله‌ها یک شهر انتخاب کنید.</p>
          )}
        </article>
      </div>
    </section>
  );
}
