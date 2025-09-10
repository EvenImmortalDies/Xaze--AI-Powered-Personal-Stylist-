import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { createClient } from '@supabase/supabase-js';

// 🔑 Supabase credentials
const supabaseUrl = "https://xetomtmbtiqwfisynrrl.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldG9tdG1idGlxd2Zpc3lucnJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDg5NDMsImV4cCI6MjA3MjkyNDk0M30.eJNpLnTwzLyCIEVjwSzh3K1N4Y0mA9HV914pY6q3nRo";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");
    if (error) {
      console.error("Fetch error:", error);
    } else {
      setProducts(data);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 15 }}>Products</Text>
      {products.length === 0 ? (
        <Text>No products found</Text>
      ) : (
        products.map((p) => (
          <View
            key={p.id}
            style={{
              marginBottom: 15,
              padding: 10,
              borderWidth: 1,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontWeight: 'bold', color:'white' }}>{p.name}</Text>
            <Text>Category: {p.category}</Text>
            <Text>Price: ₹{p.price}</Text>
            <Text>Brand: {p.brand}</Text>
            <Text>Style: {p.style}</Text>
            <Text>Gender: {p.gender_target}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
