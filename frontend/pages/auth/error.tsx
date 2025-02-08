import { useRouter } from "next/router";

const ErrorPage = () => {
  const router = useRouter();
  // Ako NextAuth proslijedi error query parametar, možeš ga prikazati
  const { error } = router.query;

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Authentication Error</h1>
      <p>{error ? error : "Došlo je do greške prilikom prijave."}</p>
    </div>
  );
};

export default ErrorPage;
