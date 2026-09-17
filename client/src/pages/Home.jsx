import CategoryGrid from '@/components/category/CategoryGrid';
import BestSellers from '@/components/home/BestSellers';
import FinalCta from '@/components/home/FinalCta';
import Hero from '@/components/home/Hero';
import PromoBanner from '@/components/home/PromoBanner';
import WhyGavora from '@/components/home/WhyGavora';
import ProductGrid from '@/components/product/ProductGrid';
import Container from '@/components/ui/Container';
import Reveal from '@/components/ui/Reveal';
import SectionEmpty from '@/components/ui/SectionEmpty';
import SectionError from '@/components/ui/SectionError';
import SectionHeading from '@/components/ui/SectionHeading';
import useAsyncData from '@/hooks/useAsyncData';
import useDocumentMeta from '@/hooks/useDocumentMeta';
import { getBestSellers, getFeaturedProducts, listCategories } from '@/lib/catalog';

/**
 * Home page.
 *
 * Each section loads its own slice of data so a slow or failing section cannot
 * hold up the rest of the page. A request always ends in data, an empty state,
 * or an error with retry — never a stuck skeleton.
 */
export function Home() {
  useDocumentMeta({
    title: 'Gavora',
    description:
      'Shop fashion, home, kitchen, jewellery, beauty, toys, bags, stationery and gifts at Gavora. Cash on Delivery and delivery across India.',
  });

  const {
    data: categories,
    isLoading: loadingCategories,
    error: categoriesError,
    reload: reloadCategories,
  } = useAsyncData(listCategories, []);
  const {
    data: featured,
    isLoading: loadingFeatured,
    error: featuredError,
    reload: reloadFeatured,
  } = useAsyncData(() => getFeaturedProducts(8), []);
  const {
    data: bestSellers,
    isLoading: loadingBestSellers,
    error: bestSellersError,
    reload: reloadBestSellers,
  } = useAsyncData(() => getBestSellers(5), []);

  const categoryList = categories ?? [];
  const featuredList = featured ?? [];
  const bestSellerList = bestSellers ?? [];

  const heroProducts = featuredList.slice(0, 4);
  const featuredGrid = featuredList;
  const promoProducts = featuredList.slice(2, 6);
  const closingProducts = featuredList.slice(4, 8).length
    ? featuredList.slice(4, 8)
    : featuredList.slice(0, 4);

  return (
    <>
      <Hero featured={heroProducts} />

      <section id="categories" className="scroll-mt-28 gv-section">
        <Container>
          <SectionHeading
            eyebrow="Categories"
            title="Shop by category"
            description="Fashion, home, jewellery, beauty and the rest of the house."
            action="Browse all"
            actionTo="/shop"
          />
          {categoriesError ? (
            <SectionError
              title="Could not load categories"
              error={categoriesError}
              onRetry={reloadCategories}
            />
          ) : !loadingCategories && categoryList.length === 0 ? (
            <SectionEmpty>No categories to show yet.</SectionEmpty>
          ) : (
            <CategoryGrid
              categories={categoryList}
              isLoading={loadingCategories}
              className="mt-8"
            />
          )}
        </Container>
      </section>

      <section className="bg-canvas-sunken gv-section">
        <Container>
          <SectionHeading
            eyebrow="Featured products"
            title="From across the catalogue"
            description="A short selection to start with. The full store is one click away."
            action="View all"
            actionTo="/shop"
          />
          <Reveal>
            {featuredError ? (
              <SectionError
                title="Could not load products"
                error={featuredError}
                onRetry={reloadFeatured}
              />
            ) : !loadingFeatured && featuredGrid.length === 0 ? (
              <SectionEmpty>No featured products to show yet.</SectionEmpty>
            ) : (
              <ProductGrid
                products={featuredGrid}
                isLoading={loadingFeatured}
                columns={4}
                skeletonCount={8}
                eagerCount={4}
                label="Featured products"
                className="mt-8"
              />
            )}
          </Reveal>
        </Container>
      </section>

      <PromoBanner products={promoProducts} />

      <section className="gv-section">
        <Container>
          <SectionHeading
            eyebrow="Best sellers"
            title="Most ordered in the store"
            description="Ranked by units sold. No invented popularity scores."
            action="Shop this order"
            actionTo="/shop?sort=best-selling"
          />
          {bestSellersError ? (
            <SectionError
              title="Could not load best sellers"
              error={bestSellersError}
              onRetry={reloadBestSellers}
            />
          ) : !loadingBestSellers && bestSellerList.length === 0 ? (
            <SectionEmpty>No best sellers to show yet.</SectionEmpty>
          ) : (
            <BestSellers
              products={bestSellerList}
              isLoading={loadingBestSellers}
              className="mt-8"
            />
          )}
        </Container>
      </section>

      <WhyGavora />

      <FinalCta products={closingProducts} />
    </>
  );
}

export default Home;
