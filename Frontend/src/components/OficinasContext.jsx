// OficinasContext.js
import React, { createContext, useState, useEffect } from 'react';

export const OficinasContext = createContext();

export const OficinasProvider = ({ children }) => {
  const [oficinas, setOficinas] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ notif: '', year: '' });

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';


  const fetchOficinas = () => {
    fetch(`${apiBaseUrl}/api/oficinas?${new URLSearchParams({ ...filters, page: currentPage, limit: 10 })}`)
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data.data)) {
          setOficinas(data.data);
          setTotalPages(data.totalPages);
        } else {
          setOficinas([]);
        }
      })
      .catch(error => {
        console.error('Error al obtener las oficinas:', error);
        setOficinas([]);
      });
  };

  useEffect(() => {
    fetchOficinas();
  }, [filters, currentPage]);

  const updateFilters = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  return (
    <OficinasContext.Provider
      value={{ oficinas, fetchOficinas, setOficinas, currentPage, setCurrentPage, totalPages, setTotalPages, updateFilters }}
    >
      {children}
    </OficinasContext.Provider>
  );
};
