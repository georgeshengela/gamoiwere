const Brands = () => {
  const brands = [
    {
      id: 1,
      name: "Apple",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
    },
    {
      id: 2,
      name: "Samsung",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/2560px-Samsung_Logo.svg.png"
    },
    {
      id: 3,
      name: "Sony",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Sony_logo.svg/2560px-Sony_logo.svg.png"
    },
    {
      id: 4,
      name: "Microsoft",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/2560px-Microsoft_logo_%282012%29.svg.png"
    },
    {
      id: 5,
      name: "LG",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/LG_logo_%282015%29.svg/2560px-LG_logo_%282015%29.svg.png"
    },
    {
      id: 6,
      name: "Bose",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Bose_logo.svg/1280px-Bose_logo.svg.png"
    }
  ];

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 caps text-center">ჩვენი ბრენდები</h2>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-center"
          >
            <img
              src={brand.imageUrl}
              alt={brand.name}
              className="h-8 object-contain grayscale hover:grayscale-0 transition-all"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Brands;
