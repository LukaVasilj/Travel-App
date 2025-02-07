import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const loginHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    try {
      const response = await axios.post('http://localhost:8000/auth/login', req.body);
      const { access_token } = response.data;

      // Dekodiraj JWT token kako bi dobio ulogu korisnika
      const payload = JSON.parse(Buffer.from(access_token.split('.')[1], 'base64').toString());
      const role = payload.role;

      // Postavi odgovarajući URL za preusmjeravanje
      const redirectUrl = role === 'admin' ? '/dashboard' : '/';

      // Postavi kolačić s tokenom
      res.setHeader('Set-Cookie', `token=${access_token}; HttpOnly; Path=/`);

      // Preusmjeri korisnika na odgovarajuću stranicu
      res.status(200).json({ redirectUrl });
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(500).json({ detail: 'Internal Server Error' });
      }
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default loginHandler;