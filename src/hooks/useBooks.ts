import { useState, useEffect } from 'react';
import type { Book } from '../types/book';

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    fetch('/books.json')
      .then(response => (response.ok ? response.json() : []))
      .then(setBooks)
      .catch(err => console.error('Error loading books:', err));
  }, []);

  return books;
}
