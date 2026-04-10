import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('qs_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('qs_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (menuItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.menu_item_id === menuItem.id);
      if (existing) {
        return prev.map(i =>
          i.menu_item_id === menuItem.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, {
        menu_item_id: menuItem.id,
        name: menuItem.name,
        price: parseFloat(menuItem.price),
        image_url: menuItem.image_url,
        quantity: 1
      }];
    });
  };

  const removeItem = (menuItemId) => {
    setItems(prev => prev.filter(i => i.menu_item_id !== menuItemId));
  };

  const updateQuantity = (menuItemId, quantity) => {
    if (quantity < 1) {
      removeItem(menuItemId);
      return;
    }
    setItems(prev => prev.map(i =>
      i.menu_item_id === menuItemId ? { ...i, quantity } : i
    ));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('qs_cart');
  };

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
