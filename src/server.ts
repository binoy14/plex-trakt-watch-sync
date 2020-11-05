import express from "express";
import multer from "multer";
import axios from "axios";

const app = express();
const upload = multer({ dest: "/tmp/" });

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PORT = process.env.PORT || 3000;

export interface Payload {
  event: string;
  user: boolean;
  owner: boolean;
  Account: Account;
  Server: Server;
  Player: Player;
  Metadata: Metadata;
}

export interface Account {
  id: number;
  thumb: string;
  title: string;
}

export interface Metadata {
  librarySectionType: string;
  ratingKey: string;
  key: string;
  guid: string;
  studio: string;
  type: string;
  title: string;
  originalTitle: string;
  summary: string;
  viewCount: number;
  lastViewedAt: number;
  year: number;
  thumb: string;
  art: string;
  duration: number;
  originallyAvailableAt: string;
  addedAt: number;
  updatedAt: number;
  ratingImage: string;
  Genre: Country[];
  Director: Director[];
  Writer: Country[];
  Producer: Country[];
  Country: Country[];
  Role: Role[];
  Similar: Director[];
}

export interface Country {
  id: number;
  tag: string;
  count?: number;
}

export interface Director {
  id: number;
  tag: string;
}

export interface Role {
  id: number;
  tag: string;
  count?: number;
  role: string;
  thumb: string;
}

export interface Player {
  local: boolean;
  publicAddress: string;
  title: string;
  uuid: string;
}

export interface Server {
  title: string;
  uuid: string;
}

const API_URL = "https://api.trakt.tv";

app.post(
  "/",
  upload.single("thumb"),
  async (req: express.Request, res: express.Response) => {
    const payload: Payload = JSON.parse(req.body.payload);

    // Note that the owner ID will always be 1.
    if (payload.event === "media.scrobble" && payload.Account.id === 1) {
      console.log("Finshed episode or movie");

      try {
        const { data } = await axios.get(
          `${API_URL}/search/${payload.Metadata.type}`,
          {
            params: {
              query: payload.Metadata.title,
            },
            headers: {
              "Content-Type": "application/json",
              "trakt-api-version": 2,
              "trakt-api-key": process.env.API_KEY,
            },
          }
        );

        const item = data[0];
        console.log("Found", JSON.stringify(item, null, 2));

        const { movie = {}, episode = {} } = item;
        let body: any = { movies: [], episodes: [] };

        if (Object.keys(movie).length) {
          body = {
            ...body,
            movies: [{ ...movie, watched_at: new Date().toISOString() }],
          };
        }

        if (Object.keys(episode).length) {
          body = {
            ...body,
            episodes: [{ ...episode, watched_at: new Date().toISOString() }],
          };
        }

        await axios.post(`${API_URL}/sync/history`, body, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "trakt-api-version": 2,
            "trakt-api-key": process.env.API_KEY,
          },
        });
      } catch (error) {
        console.log(error);
      }

      res.status(200).send();
    } else {
      res.status(200).send();
    }
  }
);

app.get("/redirect", (req) => {
  console.log(req.query.code);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
