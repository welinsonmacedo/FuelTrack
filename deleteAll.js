import admin from "firebase-admin";
import serviceAccount from "../serviceAccountKey.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function apagarColecao(nomeColecao) {
  const colecaoRef = db.collection(nomeColecao);
  const snapshot = await colecaoRef.get();

  if (snapshot.empty) {
    console.log(`Nenhum documento em ${nomeColecao} para apagar.`);
    return;
  }

  const batch = db.batch();

  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`Apagados ${snapshot.size} documentos da coleção ${nomeColecao}`);
}

async function apagarTudo() {
  try {
    await apagarColecao("motoristas");
    await apagarColecao("veiculos");
    await apagarColecao("viagens");
    await apagarColecao("abastecimentos");
    console.log("Todas as coleções apagadas.");
  } catch (err) {
    console.error("Erro ao apagar dados:", err);
  }
}

apagarTudo();
