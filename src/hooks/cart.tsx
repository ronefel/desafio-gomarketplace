import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // await AsyncStorage.removeItem('@GoMarketPlace:products');
      const productsStored = await AsyncStorage.getItem(
        '@GoMarketPlace:products',
      );
      if (productsStored) {
        setProducts(JSON.parse(productsStored));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const itemInCart = products.find(item => item.id === product.id);

      if (itemInCart) {
        setProducts(
          products.map(item =>
            item.id === product.id
              ? { ...product, quantity: item.quantity + 1 }
              : item,
          ),
        );
      } else {
        setProducts([
          ...products,
          {
            ...product,
            quantity: 1,
          },
        ]);
      }

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async itemId => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART

      const items = products.map(
        ({ id, title, image_url, price, quantity }) => {
          if (id === itemId) {
            return {
              id,
              title,
              image_url,
              price,
              quantity: quantity + 1,
            };
          }
          return { id, title, image_url, price, quantity };
        },
      );

      setProducts(items);

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async itemId => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const items = products.map(
        ({ id, title, image_url, price, quantity }) => {
          if (quantity > 0 && id === itemId) {
            return {
              id,
              title,
              image_url,
              price,
              quantity: quantity - 1,
            };
          }

          return { id, title, image_url, price, quantity };
        },
      );

      const itemsNotQuantityZero = items.filter(item => item.quantity > 0);

      setProducts(itemsNotQuantityZero);

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(itemsNotQuantityZero),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
