/**
 * Local shapes for dummyjson's `/products` resource. The oRPC examples get
 * `Todo`/`TodoPage` from the published `@taman/api-contract`
 * package; there's no equivalent contract for a public third-party API, so
 * these are declared here instead of duplicated across every file that needs
 * them.
 */
export interface Product {
  id: number;
  title: string;
  price: number;
}

export type NewProduct = Pick<Product, 'title' | 'price'>;

export interface ProductPage {
  products: Array<Product>;
  total: number;
  skip: number;
  limit: number;
}
