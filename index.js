const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const axios = require("axios");
require('dotenv').config();

const githubToken = process.env.GITHUB_TOKEN;
const discordUserId = process.env.DISCORD_USER_ID;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  try {
    const packageName = "disbd";
    const npmResponse = await axios.get(`https://registry.npmjs.org/${packageName}`);
    const packageInfo = npmResponse.data;

    const downloadStatsResponse = await axios.get(`https://api.npmjs.org/downloads/point/last-month/${packageName}`);
    const downloads = downloadStatsResponse.data.downloads;

    const npmPackage = {
      name: packageInfo.name,
      version: packageInfo["dist-tags"].latest,
      description: packageInfo.description,
      author: packageInfo.author,
      repository: packageInfo.repository,
      homepage: packageInfo.homepage,
      license: packageInfo.license,
      dependencies: packageInfo.versions[packageInfo["dist-tags"].latest].dependencies || [],
      downloads: downloads
    };

    const githubUsername = "WraithsDev";
    const githubHeaders = {
      Authorization: `Bearer ${githubToken}`
    };

    const githubResponse = await axios.get(`https://api.github.com/users/${githubUsername}/repos`, { headers: githubHeaders });

    const repositories = githubResponse.data.map(repo => {
      return {
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        url: repo.html_url,
        description: repo.description
      };
    });

    let discordStatus = null;
    try {
      const discordResponse = await axios.get(`https://api.lanyard.rest/v1/users/${discordUserId}`);
      const userData = discordResponse.data.data;
      const avatarUrl = `https://cdn.discordapp.com/avatars/${userData.discord_user.id}/${userData.discord_user.avatar}.png`;
      userData.discord_user.avatar_url = avatarUrl;
      discordStatus = userData;
    } catch (error) {
      console.error("Failed to fetch Discord status:", error);
    }

    res.render("index", { npmPackage, repositories, discordStatus });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred.");
  }
});



app.get("/projects", async (req, res) => {
  res.render("proje");
});

app.get("/hakkimda", (req, res) => {
  res.render("hakkimda");
});

app.get("/sponsorlar", (req, res) => {
  res.render("sponsorlar");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
