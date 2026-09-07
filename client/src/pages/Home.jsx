import Button from '@/components/ui/Button';
import Card, { CardBody } from '@/components/ui/Card';
import Container from '@/components/ui/Container';

/**
 * Phase 1 home page. The hero, section rhythm and card grid are real so the
 * design system can be reviewed; every product list is a labelled placeholder
 * until the catalogue API lands.
 */

const sections = [
  { title: 'Shop by category', note: 'Category tiles driven by /api/categories' },
  { title: 'Featured products', note: 'Curated picks from /api/products/featured' },
  { title: 'Best sellers', note: 'Ranked by units sold from /api/products/best-sellers' },
];

const promises = [
  {
    title: 'Curated, not cluttered',
    body: 'Every product is reviewed before it reaches the store, across all categories.',
  },
  {
    title: 'Honest pricing',
    body: 'Clear regular and sale prices, with the discount shown up front. No inflated MRPs.',
  },
  {
    title: 'Pay your way',
    body: 'Secure online payment or Cash on Delivery, on the same order flow.',
  },
  {
    title: 'Dependable delivery',
    body: 'Tracked dispatch with order status you can follow from your account.',
  },
];

export function Home() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ink-950 text-canvas relative overflow-hidden">
        <Container className="grid gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:items-center lg:py-32">
          <div>
            <p className="text-gold-300 text-xs font-semibold tracking-[0.18em] uppercase">
              Multi-category store
            </p>
            <h1 className="text-canvas mt-5 text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
              Considered products,
              <br />
              <span className="text-gold-300">fairly priced.</span>
            </h1>
            <p className="text-ink-300 mt-6 max-w-lg text-base leading-relaxed">
              Gavora is a single, trustworthy store for the things you actually use — selected with
              care, priced transparently and delivered across India.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button to="/shop" variant="accent" size="lg">
                Browse the store
              </Button>
              <Button
                to="/signup"
                size="lg"
                className="border-ink-700 text-canvas hover:bg-ink-900 border bg-transparent"
              >
                Create an account
              </Button>
            </div>
          </div>

          <div className="border-ink-800 bg-ink-900 rounded-card grid aspect-4/3 place-items-center border">
            <p className="text-ink-500 px-6 text-center text-sm">
              Hero product imagery — added with the catalogue in the next phase
            </p>
          </div>
        </Container>
      </section>

      {/* Catalogue-driven sections, stubbed for now */}
      {sections.map((section) => (
        <section key={section.title} className="border-ink-100 border-b py-14 sm:py-20">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-2xl sm:text-3xl">{section.title}</h2>
              <Button to="/shop" variant="ghost" size="sm">
                View all
              </Button>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => (
                <Card key={index} interactive>
                  <div className="bg-canvas-sunken aspect-square rounded-t-[calc(var(--radius-card)-1px)]" />
                  <CardBody className="p-4">
                    <div className="bg-ink-100 h-3 w-3/4 rounded-full" />
                    <div className="bg-ink-100 mt-2.5 h-3 w-1/2 rounded-full" />
                  </CardBody>
                </Card>
              ))}
            </div>

            <p className="text-ink-400 mt-5 text-xs">{section.note}</p>
          </Container>
        </section>
      ))}

      {/* Promotional band */}
      <section className="bg-gold-500 text-ink-950">
        <Container className="flex flex-col items-start justify-between gap-5 py-10 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-ink-950 text-2xl">Free delivery over &#8377;999</h2>
            <p className="mt-1.5 text-sm opacity-80">
              Applies automatically at checkout, on prepaid and Cash on Delivery orders alike.
            </p>
          </div>
          <Button to="/shop" variant="primary" size="lg">
            Start shopping
          </Button>
        </Container>
      </section>

      {/* Why Gavora */}
      <section className="py-14 sm:py-20">
        <Container>
          <p className="gv-eyebrow">Why Gavora</p>
          <h2 className="mt-3 max-w-xl text-2xl sm:text-3xl">
            Built to be the store you recommend to a friend.
          </h2>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {promises.map((promise) => (
              <Card key={promise.title}>
                <CardBody>
                  <span aria-hidden="true" className="bg-gold-500 block h-0.5 w-8" />
                  <h3 className="mt-4 text-lg">{promise.title}</h3>
                  <p className="text-ink-500 mt-2 text-sm leading-relaxed">{promise.body}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Reviews */}
      <section className="bg-canvas-sunken py-14 sm:py-20">
        <Container>
          <p className="gv-eyebrow">Customer reviews</p>
          <h2 className="mt-3 text-2xl sm:text-3xl">What shoppers say</h2>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Card key={index}>
                <CardBody>
                  <div className="bg-ink-100 h-3 w-24 rounded-full" />
                  <div className="mt-5 space-y-2.5">
                    <div className="bg-ink-100 h-3 w-full rounded-full" />
                    <div className="bg-ink-100 h-3 w-11/12 rounded-full" />
                    <div className="bg-ink-100 h-3 w-2/3 rounded-full" />
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          <p className="text-ink-400 mt-5 text-xs">
            Populated from verified order reviews in a later phase.
          </p>
        </Container>
      </section>
    </>
  );
}

export default Home;
