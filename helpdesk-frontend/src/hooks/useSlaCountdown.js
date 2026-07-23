import { useState, useEffect } from 'react';

export function useSlaCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState(0);

  return { timeLeft };
}
