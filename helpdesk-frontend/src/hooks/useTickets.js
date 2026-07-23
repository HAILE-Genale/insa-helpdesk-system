import { useState, useEffect } from 'react';

export function useTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  return { tickets, loading };
}
