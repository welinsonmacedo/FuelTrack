import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";

export function useFetchCollection(colName) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const snapshot = await getDocs(collection(db, colName));
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setData(lista);
      } catch (err) {
        console.error("Erro ao buscar coleção:", err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [colName]);

  return { data, loading };
}
