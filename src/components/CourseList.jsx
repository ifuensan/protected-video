import { useState } from "react";

export default function CourseList({ clases }) {
  const [query, setQuery] = useState("");

  const filtered = clases.filter((video) =>
    `${video.title} ${video.description}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="max-w-md mx-auto mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o descripción"
          className="w-full p-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring focus:ring-brand"
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((data, index) => (
          <div
            key={index}
            className="bg-zinc-800 hover:bg-zinc-700 hover:ring-2 hover:ring-brand border border-transparent transition p-4 rounded shadow block"
          >
            <img
              src={data.image}
              alt={data.title}
              className="rounded mb-4 aspect-video object-cover"
            />
            <h2 className="text-lg font-semibold mb-1 text-brand">{data.title}</h2>
            <p className="text-sm text-zinc-400 mb-2">{data.date}</p>
            <p className="text-sm text-zinc-300 mb-2">Duración: {data.duration}</p>
            <p className="text-sm text-zinc-300 mb-4">{data.description}</p>

            {/* Botón para pagar con Lightning */}
            <a
              href={`/watch?file=${data.file}`}
              className="block text-center bg-orange-600 hover:bg-orange-700 text-white text-sm px-4 py-2 rounded mb-2"
            >
              Pagar con Lightning ⚡
            </a>

            {/* Botón para pagar con Hotmart, si existe la URL */}
            {data.hotmartUrl && (
              <a
                href={data.hotmartUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
              >
                Pagar con Hotmart 💳
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}