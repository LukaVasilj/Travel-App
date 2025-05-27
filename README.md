# 🌍 TravelApp  
**Planiraj, podijeli i uživaj u svakom putovanju.**

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Status](https://img.shields.io/badge/status-in%20development-yellow)

TravelApp je moderna web aplikacija osmišljena za jednostavno planiranje i upravljanje putovanjima. Kreiraj svoje avanture, podijeli ih s prijateljima i prati svaki detalj - od smještaja do prijevoza.

---

## ✨ Ključne funkcionalnosti

- 🔐 **Registracija i prijava korisnika**  
  - Verifikacija putem emaila  
- 🧑‍💼 **Upravljanje korisničkim profilom**  
  - Upload slike profila  
  - Promjena lozinke  
- 🗺️ **Kreiranje i uređivanje putovanja**  
  - Datumi, destinacije, transport, smještaj  
- 🤝 **Dijeljenje putovanja s prijateljima**
- 📩 **Pregled i prihvaćanje zahtjeva za prijateljstvo**
- 💬 **Povratne informacije na putovanja**
- 📊 **Prikaz statistika i najnovijih putovanja**
- 🛡️ **Sigurnost**  
  - CSRF zaštita  
  - JWT autentikacija

---

## 🛠️ Tehnologije

| Dio        | Tehnologije |
|------------|-------------|
| **Frontend** | Next.js, React, TypeScript, React-Bootstrap, Tailwind CSS |
| **Backend**  | FastAPI, SQLAlchemy, PostgreSQL |
| **Autentikacija** | JWT, Google OAuth |
| **Ostalo** | Slanje emailova (verifikacija), Upload slika, CSRF zaštita |

---

## 🚀 Pokretanje projekta

### 🔧 Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # ili venv\Scripts\activate na Windowsu
pip install -r requirements.txt
uvicorn main:app --reload
```

### 💻 Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplikacija će biti dostupna na: [http://localhost:3000](http://localhost:3000)

---

## 👨‍💻 Autor

**Luka Vasilj**  

📧 luka.vasilj@email.com  
🌐 [LinkedIn](www.linkedin.com/in/luka-vasilj-905398241) · [GitHub](https://github.com/LukaVasilj)

---


